import cv2
import mediapipe as mp
from deepface import DeepFace
import math

# =========================
# MediaPipe Face Mesh Setup
# =========================

mp_face_mesh = mp.solutions.face_mesh

face_mesh = mp_face_mesh.FaceMesh(
    static_image_mode=False,
    max_num_faces=1,
    refine_landmarks=True,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

# =========================
# Eye Landmark Points
# =========================

LEFT_EYE = [33, 160, 158, 133, 153, 144]
RIGHT_EYE = [362, 385, 387, 263, 373, 380]


# =========================
# Eye Aspect Ratio Function
# =========================

def calculate_eye_aspect_ratio(landmarks, eye_indexes, w, h):

    points = []

    for idx in eye_indexes:

        x = int(landmarks[idx].x * w)
        y = int(landmarks[idx].y * h)

        points.append((x, y))

    # Vertical distances
    v1 = math.dist(points[1], points[5])
    v2 = math.dist(points[2], points[4])

    # Horizontal distance
    h1 = math.dist(points[0], points[3])

    if h1 == 0:
        return 0

    ear = (v1 + v2) / (2.0 * h1)

    return ear


# =========================
# Head Direction Detection
# =========================

def detect_head_direction(nose_x, frame_center_x):

    diff = nose_x - frame_center_x

    if diff > 40:
        return "Looking Right"

    elif diff < -40:
        return "Looking Left"

    else:
        return "Looking Center"


# =========================
# Main AI Detection Function
# =========================

def detect_emotion_from_frame(frame):

    try:

        # Frame Size
        h, w, _ = frame.shape

        # RGB Conversion
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # ====================================
        # DeepFace Emotion Detection
        # ====================================

        result = DeepFace.analyze(
            frame,
            actions=['emotion'],
            enforce_detection=False
        )

        dominant_emotion = result[0]['dominant_emotion']

        confidence = max(
            result[0]['emotion'].values()
        )

        # ====================================
        # MediaPipe Face Mesh
        # ====================================

        results = face_mesh.process(rgb_frame)

        face_detected = False

        left_ear = 0
        right_ear = 0
        avg_ear = 0

        blink_detected = False

        attention_level = 0

        fatigue_level = 0

        head_direction = "Unknown"

        # ====================================
        # Face Landmark Detection
        # ====================================

        if results.multi_face_landmarks:

            face_detected = True

            for face_landmarks in results.multi_face_landmarks:

                landmarks = face_landmarks.landmark

                # ====================================
                # Eye Tracking
                # ====================================

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

                if avg_ear < 0.12:
                    blink_detected = True
                else:
                    blink_detected = False

                # ====================================
                # Fatigue Detection
                # ====================================

                if avg_ear < 0.14:
                    fatigue_level = 80
                else:
                    fatigue_level = 20

                # ====================================
                # Attention Level
                # ====================================

                if avg_ear > 0.15:
                    attention_level = 90
                else:
                    attention_level = 55

                # ====================================
                # Head Direction
                # ====================================

                nose_tip = landmarks[1]

                nose_x = int(nose_tip.x * w)

                frame_center_x = w // 2

                head_direction = detect_head_direction(
                    nose_x,
                    frame_center_x
                )

        # ====================================
        # DEBUG TERMINAL OUTPUT
        # ====================================

        print("===================================")
        print("Emotion:", dominant_emotion)

        print("LEFT EAR:", round(left_ear, 2))
        print("RIGHT EAR:", round(right_ear, 2))
        print("AVG EAR:", round(avg_ear, 2))

        print("Attention:", attention_level)
        print("Fatigue:", fatigue_level)

        print("Head Direction:", head_direction)

        print("Blink:", blink_detected)

        print("Face Detected:", face_detected)
        print("===================================")

        # ====================================
        # Return Response
        # ====================================

        return {

            "status": "success",

            "emotion": dominant_emotion,

            "confidence": round(confidence, 2),

            "face_detected": face_detected,

            "blink_detected": blink_detected,

            "attention_level": attention_level,

            "fatigue_level": fatigue_level,

            "head_direction": head_direction,

            "left_eye_ratio": round(left_ear, 2),

            "right_eye_ratio": round(right_ear, 2),

            "avg_eye_ratio": round(avg_ear, 2)
        }

    except Exception as e:

        print("Emotion Service Error:", str(e))

        return {

            "status": "error",

            "message": str(e)
        }