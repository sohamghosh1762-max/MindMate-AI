from flask import Blueprint, jsonify, request
from controllers.emotion_controller import detect_emotion

emotion_bp = Blueprint("emotion_bp", __name__)

# Test Route
@emotion_bp.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "Emotion Routes Working"
    })

# Real Emotion Detection Route
@emotion_bp.route("/detect", methods=["POST"])
def detect():
    return detect_emotion()