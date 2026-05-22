from flask import request, jsonify

from models.user_model import (
    create_user,
    find_user_by_email
)

# =========================
# SIGNUP
# =========================

def signup():

    try:

        data = request.json

        # =========================
        # Validate Request Data
        # =========================

        if not data:

            return jsonify({

                "status": "error",

                "message": "No data received"
            }), 400

        name = data.get("name")

        email = data.get("email")

        password = data.get("password")

        # =========================
        # Validate Fields
        # =========================

        if not name or not email or not password:

            return jsonify({

                "status": "error",

                "message": "All fields are required"
            }), 400

        # =========================
        # Existing User Check
        # =========================

        existing_user = find_user_by_email(
            email
        )

        if existing_user:

            return jsonify({

                "status": "error",

                "message": "User already exists"
            }), 400

        # =========================
        # Create User
        # =========================

        user_id = create_user(

            name,

            email,

            password
        )

        return jsonify({

            "status": "success",

            "message": "Signup successful",

            "user_id": str(user_id)
        })

    except Exception as e:

        print("Signup Error:", str(e))

        return jsonify({

            "status": "error",

            "message": str(e)
        }), 500

# =========================
# LOGIN
# =========================

def login():

    try:

        data = request.json

        # =========================
        # Validate Request Data
        # =========================

        if not data:

            return jsonify({

                "status": "error",

                "message": "No data received"
            }), 400

        email = data.get("email")

        password = data.get("password")

        # =========================
        # Validate Fields
        # =========================

        if not email or not password:

            return jsonify({

                "status": "error",

                "message": "Email and password required"
            }), 400

        # =========================
        # Find User
        # =========================

        user = find_user_by_email(
            email
        )

        if not user:

            return jsonify({

                "status": "error",

                "message": "User not found"
            }), 404

        # =========================
        # Password Validation
        # =========================

        if user["password"] != password:

            return jsonify({

                "status": "error",

                "message": "Invalid password"
            }), 401

        # =========================
        # Success Response
        # =========================

        return jsonify({

            "status": "success",

            "message": "Login successful",

            "user": {

                "name": user["name"],

                "email": user["email"]
            }
        })

    except Exception as e:

        print("Login Error:", str(e))

        return jsonify({

            "status": "error",

            "message": str(e)
        }), 500