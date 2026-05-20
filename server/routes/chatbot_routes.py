from flask import Blueprint, jsonify
from controllers.chatbot_controller import chatbot_response

# =========================
# Blueprint Setup
# =========================

chatbot_bp = Blueprint(
    "chatbot_bp",
    __name__
)

# =========================
# Health Check Route
# =========================

@chatbot_bp.route(
    "/",
    methods=["GET"]
)
def home():

    return jsonify({
        "status": "success",
        "message": "MindMate AI Chatbot Routes Working"
    })


# =========================
# Gemini AI Chat Route
# =========================

@chatbot_bp.route(
    "/chat",
    methods=["POST"]
)
def chat():

    return chatbot_response()