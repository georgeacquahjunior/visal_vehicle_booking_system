from .. import db
from datetime import datetime, time


class AppSettings(db.Model):
    __tablename__ = "app_settings"

    id = db.Column(db.Integer, primary_key=True)

    # Booking rules
    booking_start_time = db.Column(db.Time, nullable=False, default=time(6, 0))
    booking_end_time = db.Column(db.Time, nullable=False, default=time(18, 0))
    max_booking_duration_minutes = db.Column(db.Integer, nullable=True)
    min_lead_time_minutes = db.Column(db.Integer, nullable=False, default=0)
    max_advance_days = db.Column(db.Integer, nullable=True)
    allow_weekend_bookings = db.Column(db.Boolean, nullable=False, default=True)

    # Schedule view defaults
    default_schedule_view = db.Column(db.String(10), nullable=False, default="week")
    week_start_day = db.Column(db.String(10), nullable=False, default="monday")
    show_current_time_indicator = db.Column(db.Boolean, nullable=False, default=True)

    # Notifications
    email_notifications_enabled = db.Column(db.Boolean, nullable=False, default=True)
    daily_summary_enabled = db.Column(db.Boolean, nullable=False, default=True)
    daily_summary_hour = db.Column(db.Integer, nullable=False, default=17)

    # Audit log (stored only — not enforced yet)
    audit_log_retention_days = db.Column(db.Integer, nullable=True)

    # Approval workflow
    require_decline_reason = db.Column(db.Boolean, nullable=False, default=True)

    # Branding
    org_name = db.Column(db.String(150), nullable=False, default="Vaarde Consult Ltd.")
    support_email = db.Column(db.String(150), nullable=False, default="admin@visalbrokers.com")

    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    updated_by = db.Column(db.String(20), db.ForeignKey("users.staff_id", ondelete="SET NULL", onupdate="CASCADE"), nullable=True)

    def __repr__(self):
        return f"<AppSettings id={self.id}>"
