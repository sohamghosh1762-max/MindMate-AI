import random

# =========================
# Conversation Memory
# =========================

conversation_memory = []

# =========================
# Wellness Knowledge Base
# =========================

RESPONSES = {

    "exam_stress": [

        "Exams can feel overwhelming, but try focusing on one chapter at a time instead of everything together 💙",

        "Try the Pomodoro study method 🌟 Study for 25 minutes and take short breaks.",

        "Remember to stay hydrated and avoid overworking yourself 🌸"
    ],

    "anxiety": [

        "Anxiety can feel heavy 💙 Try slow breathing for a few moments.",

        "Focus only on what you can control today 🌸",

        "Relax your shoulders and unclench your jaw 🌙"
    ],

    "motivation": [

        "Motivation often comes after starting 🌟 Try one tiny task first.",

        "You’ve survived difficult days before 💙",

        "Progress matters even when it feels slow 🌸"
    ],

    "burnout": [

        "Burnout happens when stress builds for too long 💙",

        "Rest is productive too 🌸",

        "Your mind deserves recovery and peace 🌙"
    ],

    "sleep": [

        "Avoid screens before bed 🌙",

        "Deep breathing and calming music may help 💙",

        "Your body heals during sleep 🌸"
    ],

    "lonely": [

        "Feeling lonely does not mean you are unwanted 💙",

        "Even a small conversation with someone trusted can help 🌸"
    ],

    "study_tips": [

        "Short focused sessions improve concentration 📚",

        "Active recall and spaced repetition work very well 🌟",

        "Keep distractions away while studying 💙"
    ],

    "panic": [

        "You are safe right now 💙",

        "Slow breathing helps panic pass more gently 🌸"
    ],

    "sad": [

        "I’m sorry you’re feeling this way 💙",

        "Be patient and kind to yourself 🌸"
    ],

    "breathing": [

        "Inhale slowly for 4 seconds… hold… exhale slowly 🌙",

        "Focus only on your breathing 💙"
    ],

    "meditation": [

        "Close your eyes gently and focus on your breath 🌸",

        "Allow every breath to release tension 💙"
    ],

    "confidence": [

        "You are more capable than you think 💙",

        "Confidence grows through small achievements 🌟"
    ],

    "relationship": [

        "Relationship stress can feel emotionally exhausting 💙",

        "Healing takes time 🌸"
    ],

    "productivity": [

        "Set one achievable target today 🌟",

        "Small progress every day matters 💙"
    ],

    "emergency": [

        "I’m concerned about how you’re feeling 💙 Please contact someone you trust or a mental health professional immediately.",

        "You are not alone 🌸 Please seek support from someone nearby."
    ],

    "default": [

        "I’m here for you 💙 Tell me more about what’s on your mind.",

        "You don’t have to handle everything alone 🌸",

        "Take a deep breath 🌙 One small step at a time."
    ]
}

# =========================
# Stress Detection
# =========================

def detect_stress_level(message):

    text = message.lower()

    severe_words = [
        "suicide",
        "kill myself",
        "die",
        "self harm",
        "hopeless"
    ]

    moderate_words = [
        "panic",
        "burnout",
        "anxiety",
        "crying",
        "depressed"
    ]

    if any(word in text for word in severe_words):

        return "severe"

    elif any(word in text for word in moderate_words):

        return "moderate"

    return "low"

# =========================
# Intent Detection
# =========================

def detect_intent(message):

    text = message.lower()

    if any(word in text for word in [
        "exam",
        "marks",
        "test",
        "assignment",
        "results"
    ]):
        return "exam_stress"

    elif any(word in text for word in [
        "anxiety",
        "anxious",
        "overthinking",
        "fear",
        "worried"
    ]):
        return "anxiety"

    elif any(word in text for word in [
        "motivation",
        "lazy",
        "unmotivated"
    ]):
        return "motivation"

    elif any(word in text for word in [
        "burnout",
        "exhausted",
        "drained",
        "tired"
    ]):
        return "burnout"

    elif any(word in text for word in [
        "sleep",
        "insomnia"
    ]):
        return "sleep"

    elif any(word in text for word in [
        "alone",
        "lonely"
    ]):
        return "lonely"

    elif any(word in text for word in [
        "study",
        "focus",
        "concentration"
    ]):
        return "study_tips"

    elif any(word in text for word in [
        "panic"
    ]):
        return "panic"

    elif any(word in text for word in [
        "sad",
        "crying",
        "depressed"
    ]):
        return "sad"

    elif any(word in text for word in [
        "breathing",
        "relax",
        "calm"
    ]):
        return "breathing"

    elif any(word in text for word in [
        "meditation",
        "mindfulness"
    ]):
        return "meditation"

    elif any(word in text for word in [
        "confidence",
        "insecure"
    ]):
        return "confidence"

    elif any(word in text for word in [
        "relationship",
        "breakup"
    ]):
        return "relationship"

    elif any(word in text for word in [
        "productive",
        "productivity"
    ]):
        return "productivity"

    elif any(word in text for word in [
        "suicide",
        "kill myself",
        "self harm"
    ]):
        return "emergency"

    return "default"

# =========================
# Main Chatbot Function
# =========================

def generate_mental_health_reply(
    user_message,
    emotion
):

    try:

        conversation_memory.append({

            "message": user_message,

            "emotion": emotion
        })

        stress_level = detect_stress_level(
            user_message
        )

        # ====================================
        # Emergency Support
        # ====================================

        if stress_level == "severe":

            return {

                "status": "success",

                "reply":
                random.choice(
                    RESPONSES["emergency"]
                )
            }

        # ====================================
        # Intent Detection
        # ====================================

        intent = detect_intent(
            user_message
        )

        # ====================================
        # Smart Response
        # ====================================

        return {

            "status": "success",

            "reply":
            random.choice(
                RESPONSES[intent]
            )
        }

    except Exception as e:

        print(
            "CHATBOT ERROR:",
            str(e)
        )

        return {

            "status": "error",

            "reply":
            "I’m here for you 💙 Please try again."
        }