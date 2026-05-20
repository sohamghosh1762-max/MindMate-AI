from flask import request, jsonify

from models.user_model import (
    create_user,
    find_user_by_email
)

# =========================
# SIGNUP
# =========================

def signup():

    data = request.json

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    # Check existing user
    existing_user = find_user_by_email(email)

    if existing_user:

        return jsonify({
            "status": "error",
            "message": "User already exists"
        }), 400

    # Create user
    user_id = create_user(
        name,
        email,
        password
    )

    return jsonify({
        "status": "success",
        "message": "Signup successful",
        "user_id": user_id
    })

# =========================
# LOGIN
# =========================

def login():

    data = request.json

    email = data.get("email")
    password = data.get("password")

    user = find_user_by_email(email)

    if not user:

        return jsonify({
            "status": "error",
            "message": "User not found"
        }), 404

    if user["password"] != password:

        return jsonify({
            "status": "error",
            "message": "Invalid password"
        }), 401

    return jsonify({
        "status": "success",
        "message": "Login successful",
        "user": {
            "name": user["name"],
            "email": user["email"]
        }
    })