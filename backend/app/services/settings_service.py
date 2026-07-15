from .. import db
from ..models.app_settings import AppSettings


def get_settings():
    """Return the single AppSettings row, creating it with defaults if missing."""
    settings = AppSettings.query.get(1)
    if settings is None:
        settings = AppSettings(id=1)
        db.session.add(settings)
        db.session.commit()
    return settings


def serialize_settings(settings):
    return {
        "booking_start_time": settings.booking_start_time.strftime("%H:%M"),
        "booking_end_time": settings.booking_end_time.strftime("%H:%M"),
        "max_booking_duration_minutes": settings.max_booking_duration_minutes,
        "min_lead_time_minutes": settings.min_lead_time_minutes,
        "max_advance_days": settings.max_advance_days,
        "allow_weekend_bookings": settings.allow_weekend_bookings,
        "default_schedule_view": settings.default_schedule_view,
        "week_start_day": settings.week_start_day,
        "show_current_time_indicator": settings.show_current_time_indicator,
        "email_notifications_enabled": settings.email_notifications_enabled,
        "daily_summary_enabled": settings.daily_summary_enabled,
        "daily_summary_hour": settings.daily_summary_hour,
        "audit_log_retention_days": settings.audit_log_retention_days,
        "require_decline_reason": settings.require_decline_reason,
        "org_name": settings.org_name,
        "support_email": settings.support_email,
        "updated_at": settings.updated_at.isoformat() if settings.updated_at else None,
        "updated_by": settings.updated_by,
    }
