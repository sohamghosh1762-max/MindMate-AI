from flask import Blueprint

from controllers.analytics_controller import (
    get_dashboard_data
)

analytics_bp = Blueprint(

    "analytics_bp",

    __name__
)

# =========================
# Analytics Dashboard
# =========================

@analytics_bp.route(
    "/",
    methods=["GET"]
)
def analytics_dashboard():

    return get_dashboard_data()