from flask import jsonify, request
import base64
import numpy as np
import cv2

from services.emotion_service import detect_emotion_from_frame

# =========================
# Emotion Detection Route
# =========================

def detect_emotion():

    try:

        # ====================================
        # Validate Request
        # ====================================

        data = request.json

        if not data:

            return jsonify({

                "status": "error",

                "message": "No request data received"
            })

        # ====================================
        # Validate Image
        # ====================================

        image_data = data.get("image")

        if not image_data:

            return jsonify({

                "status": "error",

                "message": "No image provided"
            })

        # ====================================
        # Remove Base64 Header
        # ====================================

        image_data = image_data.split(",")[1]

        # ====================================
        # Decode Base64 Image
        # ====================================

        image_bytes = base64.b64decode(
            image_data
        )

        np_arr = np.frombuffer(
            image_bytes,
            np.uint8
        )

        frame = cv2.imdecode(
            np_arr,
            cv2.IMREAD_COLOR
        )

        # ====================================
        # Validate Frame
        # ====================================

        if frame is None:

            return jsonify({

                "status": "error",

                "message": "Invalid image frame"
            })

        # ====================================
        # Detect Emotion
        # ====================================

        result = detect_emotion_from_frame(
            frame
        )

        return jsonify(result)

    except Exception as e:

        print(
            "Emotion Controller Error:",
            str(e)
        )

        return jsonify({

            "status": "error",

            "message": str(e)
        })