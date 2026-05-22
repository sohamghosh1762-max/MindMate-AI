import cv2
import mediapipe as mp
from deepface import DeepFace
import math
from database.db import db

# =========================
# MediaPipe Setup
# =========================

mp_face_mesh = mp.solutions.face_mesh

# =========================
# Global State
# =========================

last_emotion = "Neutral"

last_confidence = 0

frame_skip = 0

# =========================
# Eye Landmark Points
# =========================

LEFT_EYE = [33, 160, 158, 133, 153, 144]

RIGHT_EYE = [362, 385, 387, 263, 373, 380]

# =========================
# Eye Aspect Ratio
# =========================

def calculate_eye_aspect_ratio(
    landmarks,
    eye_indexes,
    w,
    h
):

    points = []

    for idx in eye_indexes:

        x = int(landmarks[idx].x * w)

        y = int(landmarks[idx].y * h)

        points.append((x, y))

    v1 = math.dist(points[1], points[5])

    v2 = math.dist(points[2], points[4])

    h1 = math.dist(points[0], points[3])

    if h1 == 0:

        return 0

    ear = (v1 + v2) / (2.0 * h1)

    return ear

# =========================
# Head Direction
# =========================

def detect_head_direction(
    nose_x,
    frame_center_x
):

    diff = nose_x - frame_center_x

    if diff > 40:

        return "Looking Right"

    elif diff < -40:

        return "Looking Left"

    else:

        return "Looking Center"

# =========================
# Main Emotion Detection
# =========================

def detect_emotion_from_frame(frame):

    global last_emotion

    global last_confidence

    global frame_skip

    try:

        # ====================================
        # Skip Frames For Better Performance
        # ====================================

        frame_skip += 1

        if frame_skip % 15 != 0:

            return {

                "status": "success",

                "emotion": last_emotion,

                "confidence": last_confidence,

                "face_detected": True
            }

        # ====================================
        # Initialize FaceMesh
        # ====================================

        face_mesh = mp_face_mesh.FaceMesh(
            static_image_mode=False,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )

        # ====================================
        # Resize Frame
        # ====================================

        small_frame = cv2.resize(
            frame,
            (320, 240)
        )

        h, w, _ = small_frame.shape

        # ====================================
        # Convert to RGB
        # ====================================

        rgb_frame = cv2.cvtColor(
            small_frame,
            cv2.COLOR_BGR2RGB
        )

        # ====================================
        # DeepFace Emotion Detection
        # ====================================

        result = DeepFace.analyze(
            small_frame,
            actions=['emotion'],
            enforce_detection=False
        )

        dominant_emotion = result[0]['dominant_emotion']

        confidence = max(
            result[0]['emotion'].values()
        )

        emotion_scores = result[0]['emotion']

        # ====================================
        # Save Latest Emotion
        # ====================================

        last_emotion = dominant_emotion

        last_confidence = round(
            confidence,
            2
        )

        # ====================================
        # FaceMesh Processing
        # ====================================

        results = face_mesh.process(
            rgb_frame
        )

        face_detected = False

        left_ear = 0

        right_ear = 0

        avg_ear = 0

        blink_detected = False

        attention_level = 0

        fatigue_level = 0

        head_direction = "Unknown"

        # ====================================
        # Landmark Analysis
        # ====================================

        if results.multi_face_landmarks:

            face_detected = True

            for face_landmarks in results.multi_face_landmarks:

                landmarks = face_landmarks.landmark

                left_ear = calculate_eye_aspect_ratio(
                    landmarks,
                    LEFT_EYE,
                    w,
                    h
                )

                right_ear = calculate_eye_aspect_ratio(
                    landmarks,
                    RIGHT_EYE,
                    w,
                    h
                )

                avg_ear = (
                    left_ear + right_ear
                ) / 2

                # ====================================
                # Blink Detection
                # ====================================

                blink_detected = avg_ear < 0.12

                # ====================================
                # Fatigue
                # ====================================

                fatigue_level = 80 if avg_ear < 0.14 else 20

                # ====================================
                # Attention
                # ====================================

                attention_level = 90 if avg_ear > 0.15 else 55

                # ====================================
                # Head Direction
                # ====================================

                nose_tip = landmarks[1]

                nose_x = int(
                    nose_tip.x * w
                )

                frame_center_x = w // 2

                head_direction = detect_head_direction(
                    nose_x,
                    frame_center_x
                )

        # ====================================
        # Store Analytics in MongoDB
        # ====================================

        db.emotion_history.insert_one({

            "emotion": dominant_emotion,

            "confidence": round(
                confidence,
                2
            ),

            "attention_level": attention_level,

            "fatigue_level": fatigue_level
        })

        # ====================================
        # Final Response
        # ====================================

        return {

            "status": "success",

            "emotion": dominant_emotion,

            "confidence": round(
                confidence,
                2
            ),

            "emotion_scores": emotion_scores,

            "face_detected": face_detected,

            "blink_detected": blink_detected,

            "attention_level": attention_level,

            "fatigue_level": fatigue_level,

            "head_direction": head_direction,

            "left_eye_ratio": round(
                left_ear,
                2
            ),

            "right_eye_ratio": round(
                right_ear,
                2
            ),

            "avg_eye_ratio": round(
                avg_ear,
                2
            )
        }

    except Exception as e:

        print(
            "Emotion Service Error:",
            str(e)
        )

        return {

            "status": "error",

            "message": str(e)
        }