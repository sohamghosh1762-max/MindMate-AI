from flask import request, jsonify

from services.chatbot_service import (
    generate_mental_health_reply
)

# =========================
# Mental Health Chatbot API
# =========================

def chatbot_response():

    try:

        # ====================================
        # Get JSON Data
        # ====================================

        data = request.get_json()

        if not data:

            return jsonify({

                "status": "error",

                "message":
                    "No request data received"
            }), 400

        # ====================================
        # User Message
        # ====================================

        message = data.get(
            "message",
            ""
        ).strip()

        # ====================================
        # Emotion Input
        # ====================================

        emotion = data.get(
            "emotion",
            "neutral"
        )

        # ====================================
        # Validate Message
        # ====================================

        if not message:

            return jsonify({

                "status": "error",

                "message":
                    "Message is required"
            }), 400

        # ====================================
        # Generate AI Reply
        # ====================================

        result = generate_mental_health_reply(
            message,
            emotion
        )

        # ====================================
        # Return Final Response
        # ====================================

        return jsonify(result)

    except Exception as e:

        print(
            "Chatbot Controller Error:",
            str(e)
        )

        return jsonify({

            "status": "error",

            "message":
                "Chatbot service temporarily unavailable"
        }), 500