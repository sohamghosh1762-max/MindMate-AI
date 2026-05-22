from flask import jsonify
from database.db import db

# =========================
# Dashboard Analytics
# =========================

def get_dashboard_data():

    try:

        # ====================================
        # Fetch Emotion History
        # ====================================

        emotions = list(
            db.emotion_history.find()
        )

        # ====================================
        # No Data Case
        # ====================================

        if len(emotions) == 0:

            return jsonify({

                "average_mood": 0,

                "average_stress": 0,

                "average_attention": 0,

                "average_fatigue": 0,

                "emotion_distribution": {}
            })

        # ====================================
        # Variables
        # ====================================

        emotion_counts = {}

        total_attention = 0

        total_fatigue = 0

        total_confidence = 0

        total_records = len(emotions)

        # ====================================
        # Process Records
        # ====================================

        for item in emotions:

            emotion = item.get(
                "emotion",
                "Unknown"
            )

            confidence = item.get(
                "confidence",
                0
            )

            attention = item.get(
                "attention_level",
                0
            )

            fatigue = item.get(
                "fatigue_level",
                0
            )

            # ====================================
            # Emotion Count
            # ====================================

            emotion_counts[emotion] = \
                emotion_counts.get(
                    emotion,
                    0
                ) + 1

            # ====================================
            # Totals
            # ====================================

            total_confidence += confidence

            total_attention += attention

            total_fatigue += fatigue

        # ====================================
        # Convert Counts To Percentages
        # ====================================

        emotion_distribution = {}

        for emotion, count in emotion_counts.items():

            percentage = (
                count / total_records
            ) * 100

            emotion_distribution[emotion] = round(
                percentage,
                1
            )

        # ====================================
        # Average Calculations
        # ====================================

        average_mood = round(
            total_confidence / total_records,
            1
        )

        average_attention = round(
            total_attention / total_records,
            1
        )

        average_fatigue = round(
            total_fatigue / total_records,
            1
        )

        average_stress = round(
            total_fatigue / total_records,
            1
        )

        # ====================================
        # Final Response
        # ====================================

        return jsonify({

            "average_mood":
                average_mood,

            "average_stress":
                average_stress,

            "average_attention":
                average_attention,

            "average_fatigue":
                average_fatigue,

            "emotion_distribution":
                emotion_distribution
        })

    except Exception as e:

        print(
            "Analytics Error:",
            str(e)
        )

        return jsonify({

            "status": "error",

            "message": str(e)
        })