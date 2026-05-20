from flask import jsonify
import random

def get_dashboard_data():

    emotions = {
        "Happy": random.randint(15, 40),
        "Calm": random.randint(20, 50),
        "Stress": random.randint(10, 35),
        "Sad": random.randint(5, 20),
        "Anxious": random.randint(5, 25)
    }

    return jsonify({

        "average_mood":
            random.randint(65, 95),

        "average_stress":
            random.randint(20, 70),

        "average_attention":
            random.randint(50, 100),

        "average_fatigue":
            random.randint(10, 60),

        "emotion_distribution":
            emotions
    })