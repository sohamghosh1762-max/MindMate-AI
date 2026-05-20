from flask import Blueprint

from controllers.auth_controller import (
    signup,
    login
)

auth_bp = Blueprint(
    "auth_bp",
    __name__
)

# =========================
# SIGNUP ROUTE
# =========================

@auth_bp.route(
    "/signup",
    methods=["POST"]
)
def signup_route():

    return signup()

# =========================
# LOGIN ROUTE
# =========================

@auth_bp.route(
    "/login",
    methods=["POST"]
)
def login_route():

    return login()