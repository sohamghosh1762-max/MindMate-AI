from transformers import pipeline, Conversation
import random

# =========================
# Load BlenderBot Model
# =========================

chatbot_pipeline = pipeline(
    "conversational",
    model="facebook/blenderbot-400M-distill"
)

# =========================
# Conversation Memory
# =========================

conversation_memory = []

# =========================
# Wellness Knowledge Base
# =========================

RESPONSES = {

    "exam_stress": [

        "Exams can feel overwhelming, but try focusing on one chapter at a time instead of everything together. Small consistent progress is much more effective than overworking yourself 💙",

        "When exam pressure builds up, your mind can become overloaded. Try the 25-minute Pomodoro study method with short breaks 🌟",

        "You don’t need to be perfect to succeed. Stay hydrated, breathe slowly, and remember your health matters too."
    ],

    "anxiety": [

        "Anxiety can make your thoughts feel heavy, but you are not alone 💙 Try breathing in slowly for 4 seconds and out for 6 seconds.",

        "Focus only on what you can control today. Your future is built one small step at a time 🌸",

        "Relax your shoulders and unclench your jaw. Your body deserves calm too."
    ],

    "motivation": [

        "Motivation often comes after starting 🌟 Try completing one tiny task first.",

        "You’ve already survived difficult days before, and that proves your strength 💙",

        "Progress is still progress, even when it feels slow."
    ],

    "burnout": [

        "Burnout happens when your mind stays under pressure for too long 💙 Rest is productive too.",

        "Your brain needs recovery just like your body. Take breaks without guilt 🌸",

        "Try sleeping properly tonight and reducing pressure on yourself for a while."
    ],

    "sleep": [

        "Avoid screens before bed and try calming music or deep breathing 🌙",

        "A peaceful bedtime routine can help your brain relax naturally 💙",

        "Your body and mind heal during sleep. Proper rest matters greatly."
    ],

    "lonely": [

        "Feeling lonely does not mean you are unwanted 💙 Many people silently struggle too.",

        "Even sending a small message to someone you trust can help 🌸"
    ],

    "study_tips": [

        "Study in focused short sessions instead of exhausting marathon hours 📚",

        "Active recall and spaced repetition improve memory significantly 🌟",

        "Keep your phone away while studying to improve concentration."
    ],

    "panic": [

        "You are safe right now 💙 Place one hand on your chest and breathe slowly.",

        "Panic attacks feel scary, but they pass 🌸 Focus on slow breathing."
    ],

    "sad": [

        "I’m really sorry you’re feeling this way 💙 Difficult emotions do not define your worth.",

        "Be patient and kind to yourself 🌸 You deserve support too."
    ],

    "breathing": [

        "Let’s breathe together 💙 Inhale slowly for 4 seconds… hold for 4… exhale for 6 seconds 🌸",

        "Close your eyes gently and focus only on your breathing 🌙"
    ],

    "meditation": [

        "Find a comfortable position 🌸 Close your eyes and slowly focus on your breath 💙",

        "Allow every breath to release stress and tension from your body 🌙"
    ],

    "confidence": [

        "You are more capable than you think 💙 Self-doubt hides your strengths sometimes.",

        "Confidence grows slowly through small achievements 🌟"
    ],

    "relationship": [

        "Relationship stress can feel emotionally exhausting 💙 Give yourself time to heal.",

        "Heartbreak takes time, but emotional pain does become lighter 🌸"
    ],

    "productivity": [

        "Try the Pomodoro technique 🍅 Study for 25 minutes, then rest for 5 minutes.",

        "Set one achievable target today instead of pressuring yourself with everything 🌟"
    ],

    "emergency": [

        "I’m really concerned about how you’re feeling 💙 Please contact a trusted person or mental health professional immediately.",

        "You are not alone 🌸 Please reach out to someone you trust right now."
    ],

    "default": [

        "I’m here for you 💙 Tell me more about what’s on your mind.",

        "You don’t have to handle everything alone 🌸",

        "Take a deep breath 🌟 One small step at a time is enough."
    ]
}

# =========================
# Stress Severity Detection
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
# Advanced Intent Detection
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
        "insomnia",
        "can't sleep"
    ]):
        return "sleep"

    elif any(word in text for word in [
        "alone",
        "lonely"
    ]):
        return "lonely"

    elif any(word in text for word in [
        "focus",
        "concentration",
        "study tips",
        "distracted"
    ]):
        return "study_tips"

    elif any(word in text for word in [
        "panic",
        "panic attack"
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
        "calm me"
    ]):
        return "breathing"

    elif any(word in text for word in [
        "meditation",
        "mindfulness",
        "peace"
    ]):
        return "meditation"

    elif any(word in text for word in [
        "confidence",
        "self esteem",
        "insecure"
    ]):
        return "confidence"

    elif any(word in text for word in [
        "relationship",
        "breakup",
        "heartbroken"
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
        "die",
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

        # Save memory
        conversation_memory.append({
            "message": user_message,
            "emotion": emotion
        })

        # Detect severity
        stress_level = detect_stress_level(
            user_message
        )

        # Emergency support
        if stress_level == "severe":

            return {
                "status": "success",
                "reply":
                "I’m really concerned about how you’re feeling right now 💙 Please reach out to someone you trust or a mental health professional immediately. You deserve support and safety."
            }

        # Detect intent
        intent = detect_intent(
            user_message
        )

        # Smart predefined replies
        if intent in RESPONSES:

            return {
                "status": "success",
                "reply": random.choice(
                    RESPONSES[intent]
                )
            }

        # =========================
        # AI Conversation Fallback
        # =========================

        conversation = Conversation(
            user_message
        )

        result = chatbot_pipeline(
            conversation
        )

        reply = result.generated_responses[-1]

        # Short reply fix
        if len(reply.split()) < 6:

            reply = random.choice(
                RESPONSES["default"]
            )

        return {

            "status": "success",

            "reply": reply
        }

    except Exception as e:

        print("CHATBOT ERROR:", str(e))

        return {

            "status": "error",

            "reply":
                "I’m here for you 💙 Please take a deep breath and try again."
        }