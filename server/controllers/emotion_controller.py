from flask import jsonify, request
import base64
import numpy as np
import cv2

from services.emotion_service import detect_emotion_from_frame

def detect_emotion():

    try:
        data = request.json

        image_data = data["image"]

        # Remove base64 header
        image_data = image_data.split(",")[1]

        # Decode image
        image_bytes = base64.b64decode(image_data)

        np_arr = np.frombuffer(image_bytes, np.uint8)

        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        result = detect_emotion_from_frame(frame)

        return jsonify(result)

    except Exception as e:

        return jsonify({
            "status": "error",
            "message": str(e)
        })