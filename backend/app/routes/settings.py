from datetime import datetime

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt, get_jwt_identity, jwt_required

from .. import db
from ..services.audit_service import log_action
from ..services.settings_service import get_settings, serialize_settings

settings_bp = Blueprint("settings", __name__, url_prefix="/settings")

VALID_SCHEDULE_VIEWS = {"month", "week", "day", "list"}
VALID_WEEK_START_DAYS = {"monday", "sunday"}


@settings_bp.route("", methods=["GET"])
@jwt_required()
def get_app_settings():
    settings = get_settings()
    return jsonify({"success": True, "settings": serialize_settings(settings)}), 200


@settings_bp.route("", methods=["PUT"])
@jwt_required()
def update_app_settings():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"error": "Only admins can update settings"}), 403

    data = request.get_json(silent=True) or {}
    settings = get_settings()
    changes = []

    def set_field(field, value):
        if value != getattr(settings, field):
            changes.append(field)
            setattr(settings, field, value)

    if "booking_start_time" in data or "booking_end_time" in data:
        start_raw = data.get("booking_start_time", settings.booking_start_time.strftime("%H:%M"))
        end_raw = data.get("booking_end_time", settings.booking_end_time.strftime("%H:%M"))
        try:
            start_time = datetime.strptime(start_raw, "%H:%M").time()
            end_time = datetime.strptime(end_raw, "%H:%M").time()
        except (ValueError, TypeError):
            return jsonify({"error": "booking_start_time/booking_end_time must be 'HH:MM'"}), 400
        if start_time >= end_time:
            return jsonify({"error": "booking_start_time must be earlier than booking_end_time"}), 400
        set_field("booking_start_time", start_time)
        set_field("booking_end_time", end_time)

    for field in ("max_booking_duration_minutes", "min_lead_time_minutes", "max_advance_days", "audit_log_retention_days"):
        if field in data:
            value = data.get(field)
            if value is not None:
                try:
                    value = int(value)
                except (TypeError, ValueError):
                    return jsonify({"error": f"{field} must be a positive integer or null"}), 400
                if value < 0:
                    return jsonify({"error": f"{field} must be a positive integer or null"}), 400
            set_field(field, value)

    if "daily_summary_hour" in data:
        try:
            hour = int(data.get("daily_summary_hour"))
        except (TypeError, ValueError):
            return jsonify({"error": "daily_summary_hour must be an integer between 0 and 23"}), 400
        if hour < 0 or hour > 23:
            return jsonify({"error": "daily_summary_hour must be an integer between 0 and 23"}), 400
        set_field("daily_summary_hour", hour)

    if "default_schedule_view" in data:
        value = str(data.get("default_schedule_view", "")).strip().lower()
        if value not in VALID_SCHEDULE_VIEWS:
            return jsonify({"error": f"default_schedule_view must be one of {sorted(VALID_SCHEDULE_VIEWS)}"}), 400
        set_field("default_schedule_view", value)

    if "week_start_day" in data:
        value = str(data.get("week_start_day", "")).strip().lower()
        if value not in VALID_WEEK_START_DAYS:
            return jsonify({"error": f"week_start_day must be one of {sorted(VALID_WEEK_START_DAYS)}"}), 400
        set_field("week_start_day", value)

    if "support_email" in data:
        value = str(data.get("support_email", "")).strip()
        if not value or "@" not in value:
            return jsonify({"error": "support_email must be a valid email address"}), 400
        set_field("support_email", value)

    if "org_name" in data:
        value = str(data.get("org_name", "")).strip()
        if not value:
            return jsonify({"error": "org_name cannot be empty"}), 400
        set_field("org_name", value[:150])

    for field in (
        "allow_weekend_bookings",
        "show_current_time_indicator",
        "email_notifications_enabled",
        "daily_summary_enabled",
        "require_decline_reason",
    ):
        if field in data:
            set_field(field, bool(data.get(field)))

    if changes:
        settings.updated_by = get_jwt_identity()
        db.session.commit()
        log_action(
            actor_id=get_jwt_identity(),
            actor_name=claims.get("full_name"),
            action="settings_updated",
            target_type="app_settings",
            target_id=1,
            description=f"Updated {', '.join(changes)}",
        )

    return jsonify({"success": True, "settings": serialize_settings(settings)}), 200
