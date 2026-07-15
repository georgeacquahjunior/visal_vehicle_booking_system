from .. import db
from ..models.audit_log import AuditLog


def log_action(actor_id=None, actor_name=None, action=None, target_type=None, target_id=None, description=None):
    """Record an audit trail entry. Never raises — a logging failure should not break the calling request."""
    try:
        entry = AuditLog(
            actor_id=actor_id,
            actor_name=actor_name,
            action=action,
            target_type=target_type,
            target_id=str(target_id) if target_id is not None else None,
            description=description,
        )
        db.session.add(entry)
        db.session.commit()
    except Exception:
        db.session.rollback()
