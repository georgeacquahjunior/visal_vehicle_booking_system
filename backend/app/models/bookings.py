from .. import db
from datetime import datetime

class Booking(db.Model):
    __tablename__ = "bookings"

    id = db.Column(db.Integer, primary_key=True)  # SERIAL PRIMARY KEY
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )  # Foreign key to users
    booking_date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    location = db.Column(db.String(100), nullable=False)
    purpose = db.Column(db.Text, nullable=False)
    notes = db.Column(db.Text)
    status = db.Column(
        db.String(20),
        nullable=False,
        default="Pending"
    )  # Status field, will enforce allowed values manually
    admin_comment = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, onupdate=datetime.utcnow)

    # Relationship to User
    user = db.relationship("User", backref=db.backref("bookings", lazy=True))

    def __init__(self, user_id, booking_date, start_time, end_time, location, purpose, notes=None, status="Pending", admin_comment=None):
        self.user_id = user_id
        self.booking_date = booking_date
        self.start_time = start_time
        self.end_time = end_time
        self.location = location
        self.purpose = purpose
        self.notes = notes
        self.admin_comment = admin_comment

        if status not in ('Pending', 'Approved', 'Declined', 'Cancelled'):
            raise ValueError("Status must be 'Pending', 'Approved', 'Declined', or 'Cancelled'")
        self.status = status

    def __repr__(self):
        return f"<Booking {self.id} | User {self.user_id} | Status {self.status}>"
