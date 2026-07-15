from .. import db
from datetime import datetime


class AuditLog(db.Model):
    __tablename__ = "audit_logs"

    id = db.Column(db.Integer, primary_key=True)
    actor_id = db.Column(db.String(20), db.ForeignKey("users.staff_id", ondelete="SET NULL", onupdate="CASCADE"), nullable=True)
    actor_name = db.Column(db.String(100), nullable=True)
    action = db.Column(db.String(50), nullable=False)
    target_type = db.Column(db.String(50), nullable=True)
    target_id = db.Column(db.String(50), nullable=True)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)

    actor = db.relationship("User", backref=db.backref("audit_logs", lazy=True))

    def __repr__(self):
        return f"<AuditLog {self.id} | {self.action} | actor {self.actor_id}>"
