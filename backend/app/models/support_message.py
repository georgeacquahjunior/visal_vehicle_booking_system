from .. import db
from datetime import datetime


class SupportMessage(db.Model):
    __tablename__ = "support_messages"

    id = db.Column(db.Integer, primary_key=True)
    staff_id = db.Column(
        db.String(20),
        db.ForeignKey("users.staff_id", ondelete="CASCADE", onupdate="CASCADE"),
        nullable=False,
        index=True,
    )
    subject = db.Column(db.String(150), nullable=False)
    message = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), nullable=False, default="open")
    admin_reply = db.Column(db.Text, nullable=True)
    replied_by = db.Column(
        db.String(20),
        db.ForeignKey("users.staff_id", ondelete="SET NULL", onupdate="CASCADE"),
        nullable=True,
    )
    replied_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    requester = db.relationship("User", foreign_keys=[staff_id], backref=db.backref("support_messages", lazy=True))
    replier = db.relationship("User", foreign_keys=[replied_by])

    def __repr__(self):
        return f"<SupportMessage {self.id} | {self.staff_id} | {self.status}>"
