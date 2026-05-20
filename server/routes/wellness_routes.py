from flask import Blueprint, jsonify

wellness_bp = Blueprint("wellness_bp", __name__)

@wellness_bp.route("/", methods=["GET"])
def wellness_home():
    return jsonify({
        "message": "Wellness Routes Working"
    })

@wellness_bp.route("/exercises", methods=["GET"])
def exercises():

    data = [
        {
            "title": "Box Breathing",
            "duration": "4 min"
        },
        {
            "title": "Meditation",
            "duration": "5 min"
        },
        {
            "title": "Neck Stretch",
            "duration": "2 min"
        }
    ]

    return jsonify(data)