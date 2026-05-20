from flask import request, jsonify
from services.chatbot_service import generate_mental_health_reply


def chatbot_response():

    try:

        data = request.json

        message = data.get(
            "message",
            ""
        )

        emotion = data.get(
            "emotion",
            "neutral"
        )

        if not message:

            return jsonify({
                "status": "error",
                "message": "Message is required"
            }), 400

        result = generate_mental_health_reply(
            message,
            emotion
        )

        return jsonify(result)

    except Exception as e:

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500