from flask import Flask
from flask_cors import CORS
from database.db import db

# =========================
# Import Routes
# =========================

from routes.emotion_routes import emotion_bp
from routes.chatbot_routes import chatbot_bp
from routes.wellness_routes import wellness_bp
from routes.analytics_routes import analytics_bp
from routes.auth_routes import auth_bp

# =========================
# Flask App Setup
# =========================

app = Flask(__name__)

# Enable CORS
CORS(app)

# =========================
# Register Blueprints
# =========================

app.register_blueprint(
    emotion_bp,
    url_prefix="/api/emotion"
)

app.register_blueprint(
    chatbot_bp,
    url_prefix="/api/chatbot"
)

app.register_blueprint(
    wellness_bp,
    url_prefix="/api/wellness"
)

app.register_blueprint(
    analytics_bp,
    url_prefix="/api/analytics"
)

app.register_blueprint(
    auth_bp,
    url_prefix="/api/auth"
)
# =========================
# Home Route
# =========================

@app.route("/")
def home():

    return {
        "status": "success",
        "message": "MindMate AI Backend Running"
    }

# =========================
# Run Server
# =========================

import os

if __name__ == "__main__":

    port = int(os.environ.get("PORT", 10000))

    app.run(
        host="0.0.0.0",
        port=port,
        debug=False
    )