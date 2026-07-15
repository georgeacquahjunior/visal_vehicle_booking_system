from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from ..models.audit_log import AuditLog

audit_bp = Blueprint("audit", __name__, url_prefix="/audit-log")


@audit_bp.route("", methods=["GET"])
@jwt_required()
def get_audit_log():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"error": "Only admins can view the audit log"}), 403

    action = request.args.get("action")
    page = max(1, request.args.get("page", default=1, type=int))
    page_size = min(100, max(1, request.args.get("page_size", default=25, type=int)))

    query = AuditLog.query.order_by(AuditLog.created_at.desc())
    if action:
        query = query.filter(AuditLog.action == action)

    total = query.count()
    entries = query.offset((page - 1) * page_size).limit(page_size).all()

    logs = [
        {
            "id": entry.id,
            "actor_id": entry.actor_id,
            "actor_name": entry.actor_name,
            "action": entry.action,
            "target_type": entry.target_type,
            "target_id": entry.target_id,
            "description": entry.description,
            "created_at": entry.created_at.isoformat(),
        }
        for entry in entries
    ]

    return jsonify({
        "success": True,
        "total": total,
        "page": page,
        "page_size": page_size,
        "logs": logs,
    }), 200
