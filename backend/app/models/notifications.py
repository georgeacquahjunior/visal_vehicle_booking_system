from .. import db
from datetime import datetime

class Notification(db.Model):
    __tablename__ = "notifications"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.String(20),
        db.ForeignKey("users.staff_id", ondelete="CASCADE"),
        nullable=False
    )
    title = db.Column(db.String(150))  
    message = db.Column(db.String(255), nullable=False)
    type = db.Column(db.String(255), nullable=False)
    booking_id = db.Column(db.Integer, db.ForeignKey("bookings.id"), nullable=True)
    is_read = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # relationship back to user (and optionally booking if needed)
    user = db.relationship("User", backref=db.backref("notifications", lazy=True))

    def __repr__(self):
        return f"<Notification {self.id} | User {self.user_id} | Read {self.is_read}>"