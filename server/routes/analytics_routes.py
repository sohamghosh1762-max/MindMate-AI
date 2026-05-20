from flask import Blueprint

from controllers.analytics_controller import (
    get_dashboard_data
)

analytics_bp = Blueprint(
    "analytics_bp",
    __name__
)

@analytics_bp.route(
    "/dashboard",
    methods=["GET"]
)
def dashboard():

    return get_dashboard_data()