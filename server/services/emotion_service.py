import cv2
import mediapipe as mp
from deepface import DeepFace
import math
import numpy as np
from collections import deque
from database.db import db
import gc

# =========================
# MediaPipe Setup
# =========================

mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(

    static_image_mode=False,

    max_num_faces=1,

    refine_landmarks=True,

    min_detection_confidence=0.45,

    min_tracking_confidence=0.45,
)

# =========================
# Global State
# =========================

last_emotion        = "neutral"
last_confidence     = 0
frame_skip          = 0
emotion_history     = deque(maxlen=6)   # rolling window — auto-drops oldest
consecutive_neutral = 0                  # tracks repeated neutral to force re-eval

# =========================
# Emotion Label Mapping
# DeepFace returns lowercase; we normalise here
# =========================

DEEPFACE_TO_APP = {
    "happy":     "happy",
    "sad":       "sad",
    "angry":     "angry",
    "fear":      "anxious",
    "disgust":   "stressed",
    "surprise":  "confused",
    "neutral":   "neutral",
}

# Weight multipliers — boosts under-detected positive emotions
EMOTION_WEIGHTS = {
    "happy":    1.75,   # smiles often under-scored
    "sad":      1.20,
    "angry":    1.30,
    "fear":     1.25,
    "disgust":  1.20,
    "surprise": 1.25,
    "neutral":  0.75,   # dampen runaway neutral
}

# =========================
# Eye Landmark Points
# =========================

LEFT_EYE  = [33,  160, 158, 133, 153, 144]
RIGHT_EYE = [362, 385, 387, 263, 373, 380]

# =========================
# Eye Aspect Ratio
# =========================

def calculate_eye_aspect_ratio(landmarks, eye_indexes, w, h):

    points = [
        (int(landmarks[idx].x * w), int(landmarks[idx].y * h))
        for idx in eye_indexes
    ]

    v1 = math.dist(points[1], points[5])
    v2 = math.dist(points[2], points[4])
    h1 = math.dist(points[0], points[3])

    if h1 == 0:
        return 0.0

    return (v1 + v2) / (2.0 * h1)

# =========================
# Mouth Openness Ratio
# Used to reinforce surprise / happy detection
# =========================

MOUTH_TOP    = 13
MOUTH_BOTTOM = 14
MOUTH_LEFT   = 78
MOUTH_RIGHT  = 308

def calculate_mouth_openness(landmarks, w, h):

    top    = (int(landmarks[MOUTH_TOP].x    * w), int(landmarks[MOUTH_TOP].y    * h))
    bottom = (int(landmarks[MOUTH_BOTTOM].x * w), int(landmarks[MOUTH_BOTTOM].y * h))
    left   = (int(landmarks[MOUTH_LEFT].x   * w), int(landmarks[MOUTH_LEFT].y   * h))
    right  = (int(landmarks[MOUTH_RIGHT].x  * w), int(landmarks[MOUTH_RIGHT].y  * h))

    vertical   = math.dist(top, bottom)
    horizontal = math.dist(left, right)

    if horizontal == 0:
        return 0.0

    return vertical / horizontal

# =========================
# Improved Head Direction
# Uses proportional offset instead of fixed pixel thresholds
# =========================

def detect_head_direction(nose_x, nose_y, frame_center_x, frame_center_y, w, h):

    # Normalise offset as a fraction of frame dimensions
    h_ratio = (nose_x - frame_center_x) / w   # negative = left
    v_ratio = (nose_y - frame_center_y) / h   # negative = up

    # Diagonal compound directions
    if h_ratio >  0.04 and v_ratio >  0.035:
        return "Looking Down-Right"
    if h_ratio < -0.04 and v_ratio >  0.035:
        return "Looking Down-Left"
    if h_ratio >  0.04 and v_ratio < -0.035:
        return "Looking Up-Right"
    if h_ratio < -0.04 and v_ratio < -0.035:
        return "Looking Up-Left"

    # Cardinal directions
    if h_ratio >  0.04:
        return "Looking Right"
    if h_ratio < -0.04:
        return "Looking Left"
    if v_ratio >  0.035:
        return "Looking Down"
    if v_ratio < -0.035:
        return "Looking Up"

    return "Looking Center"

# =========================
# Frame Enhancement
# Adaptive CLAHE + denoise for low-light webcams
# =========================

def enhance_frame(frame):

    # Convert to LAB colour space for luminance-only enhancement
    lab   = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)

    clahe    = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))
    l_clahe  = clahe.apply(l)

    enhanced = cv2.merge([l_clahe, a, b])
    enhanced = cv2.cvtColor(enhanced, cv2.COLOR_LAB2BGR)

    # Light denoising — preserves edges better than GaussianBlur alone
    enhanced = cv2.fastNlMeansDenoisingColored(enhanced, None, 5, 5, 7, 15)

    return enhanced

# =========================
# Weighted Emotion Selector
# Applies per-emotion multipliers before picking dominant
# =========================

def pick_weighted_dominant(emotion_scores):

    weighted = {
        emotion: score * EMOTION_WEIGHTS.get(emotion, 1.0)
        for emotion, score in emotion_scores.items()
    }

    return max(weighted, key=weighted.get)

# =========================
# Smoothed Emotion via History
# Uses weighted-vote: recent frames count more
# =========================

def smooth_emotion(new_emotion):

    emotion_history.append(new_emotion)

    # Weighted vote — later entries get higher weight
    history_list = list(emotion_history)
    total        = len(history_list)

    vote_scores = {}
    for i, em in enumerate(history_list):
        weight = (i + 1) / total          # linear ramp 1/n … 1
        vote_scores[em] = vote_scores.get(em, 0) + weight

    return max(vote_scores, key=vote_scores.get)

# =========================
# Main Emotion Detection
# =========================

def detect_emotion_from_frame(frame):

    global last_emotion
    global last_confidence
    global frame_skip
    global consecutive_neutral

    try:

        # ====================================
        # Adaptive Frame Skipping
        # Every 3rd frame is analysed fully;
        # skipped frames return cached result
        # instantly (no lag).
        # ====================================

        frame_skip += 1

        if frame_skip % 15 != 0:
            return {
                "status":       "success",
                "emotion":      last_emotion,
                "confidence":   last_confidence,
                "face_detected": True,
                "cached":       True,
            }

        # ====================================
        # Resize — balance speed vs accuracy
        # ====================================

        small_frame = cv2.resize(frame, (320, 240))

        # ====================================
        # Enhance for low-light / blur
        # ====================================

        small_frame = enhance_frame(small_frame)

        h, w, _ = small_frame.shape

        # ====================================
        # RGB for MediaPipe
        # ====================================

        rgb_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)

        # ====================================
        # MediaPipe FaceMesh
        # Re-use single instance per call to
        # avoid repeated initialisation cost
        # ====================================

        results = face_mesh.process(rgb_frame)

        if not results.multi_face_landmarks:
            return {
                "status":        "success",
                "emotion":       last_emotion,
                "confidence":    last_confidence,
                "face_detected": False,
            }

        # ====================================
        # DeepFace Analysis
        # ====================================

        result = DeepFace.analyze(
            small_frame,
            actions           = ["emotion"],
            enforce_detection = False,
            detector_backend="opencv",
            silent            = True,
        )

        raw_scores        = result[0]["emotion"]
        raw_dominant      = result[0]["dominant_emotion"]
        raw_confidence    = max(raw_scores.values())

        # ====================================
        # Weighted dominant — fixes neutral bias
        # and boosts smile / surprise detection
        # ====================================

        weighted_dominant = pick_weighted_dominant(raw_scores)

        # ====================================
        # Mouth-open reinforcement
        # If mouth is clearly open → push toward
        # happy or surprise over neutral
        # ====================================

        face_landmarks_obj = results.multi_face_landmarks[0]
        mouth_ratio        = calculate_mouth_openness(
                                 face_landmarks_obj.landmark, w, h
                             )

        if mouth_ratio > 0.25 and weighted_dominant == "neutral":
            weighted_dominant = "happy" if raw_scores.get("happy", 0) > raw_scores.get("surprise", 0) else "surprise"

        # ====================================
        # Confidence gate
        # Only update if reasonably confident
        # ====================================

        if raw_confidence < 30:
            weighted_dominant = last_emotion
        else:
            consecutive_neutral = (consecutive_neutral + 1) if weighted_dominant == "neutral" else 0

        # Force re-evaluation after 8 consecutive neutrals
        # (prevents the system getting stuck)
        if consecutive_neutral >= 8:
            consecutive_neutral = 0
            weighted_dominant   = pick_weighted_dominant(raw_scores)

        # ====================================
        # Temporal smoothing
        # ====================================

        smoothed_emotion = smooth_emotion(weighted_dominant)

        # Map to app emotion labels
        app_emotion = DEEPFACE_TO_APP.get(smoothed_emotion, smoothed_emotion)

        last_emotion    = app_emotion
        last_confidence = round(raw_confidence, 2)

        # ====================================
        # Landmark Analysis
        # ====================================

        face_detected   = True
        left_ear        = 0.0
        right_ear       = 0.0
        avg_ear         = 0.0
        blink_detected  = False
        attention_level = 75
        fatigue_level   = 20
        head_direction  = "Looking Center"

        for face_lm in results.multi_face_landmarks:

            lm = face_lm.landmark

            # ── Eye aspect ratios ──────────────────
            left_ear  = calculate_eye_aspect_ratio(lm, LEFT_EYE,  w, h)
            right_ear = calculate_eye_aspect_ratio(lm, RIGHT_EYE, w, h)
            avg_ear   = (left_ear + right_ear) / 2.0

            # ── Blink ──────────────────────────────
            blink_detected = avg_ear < 0.14

            # ── Fatigue — graduated scale ──────────
            if avg_ear < 0.13:
                fatigue_level = 90
            elif avg_ear < 0.16:
                fatigue_level = 65
            elif avg_ear < 0.20:
                fatigue_level = 40
            else:
                fatigue_level = 15

            # ── Attention — graduated scale ────────
            if avg_ear > 0.22:
                attention_level = 95
            elif avg_ear > 0.18:
                attention_level = 80
            elif avg_ear > 0.14:
                attention_level = 60
            else:
                attention_level = 35

            # ── Head direction — proportional ──────
            nose_tip        = lm[1]
            nose_x          = int(nose_tip.x * w)
            nose_y          = int(nose_tip.y * h)
            frame_center_x  = w // 2
            frame_center_y  = h // 2

            head_direction  = detect_head_direction(
                nose_x, nose_y,
                frame_center_x, frame_center_y,
                w, h
            )

            # ── Attention penalty for off-centre ───
            if head_direction != "Looking Center":
                attention_level = max(attention_level - 30, 10)

        # ====================================
        # Persist to MongoDB
        # ====================================

        if frame_skip % 30 == 0:

            db.emotion_history.insert_one({

        "emotion": app_emotion,

        "raw_emotion": smoothed_emotion,

        "confidence": round(raw_confidence, 2),

        "attention_level": attention_level,

        "fatigue_level": fatigue_level,

        "head_direction": head_direction,

        "mouth_ratio": round(mouth_ratio, 3),

        "avg_eye_ratio": round(avg_ear, 3),
    })

        # ====================================
        # Response
        # ====================================
        gc.collect()
        return {
            "status":          "success",
            "emotion":         app_emotion,
            "confidence":      round(raw_confidence, 2),
            "emotion_scores":  raw_scores,
            "face_detected":   face_detected,
            "blink_detected":  blink_detected,
            "attention_level": attention_level,
            "fatigue_level":   fatigue_level,
            "head_direction":  head_direction,
            "mouth_ratio":     round(mouth_ratio, 3),
            "left_eye_ratio":  round(left_ear,  3),
            "right_eye_ratio": round(right_ear, 3),
            "avg_eye_ratio":   round(avg_ear,   3),
        }

    except Exception as e:

        print("Emotion Service Error:", str(e))

        return {
            "status":  "error",
            "message": str(e),
        }