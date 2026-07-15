from datetime import datetime

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt, get_jwt_identity, jwt_required

from .. import db
from ..models.notifications import Notification
from ..models.support_message import SupportMessage
from ..models.users import Roles, User
from ..services.audit_service import log_action

support_bp = Blueprint("support", __name__, url_prefix="/support")

VALID_STATUSES = {"open", "resolved"}


def serialize_message(message):
    return {
        "id": message.id,
        "staff_id": message.staff_id,
        "staff_name": message.requester.full_name if message.requester else message.staff_id,
        "subject": message.subject,
        "message": message.message,
        "status": message.status,
        "admin_reply": message.admin_reply,
        "replied_by": message.replied_by,
        "replied_by_name": message.replier.full_name if message.replier else None,
        "replied_at": message.replied_at.isoformat() if message.replied_at else None,
        "created_at": message.created_at.isoformat(),
        "updated_at": message.updated_at.isoformat(),
    }


@support_bp.route("", methods=["POST"])
@jwt_required()
def create_support_message():
    staff_id = get_jwt_identity()
    claims = get_jwt()

    data = request.get_json(silent=True) or {}
    subject = str(data.get("subject", "")).strip()
    message_text = str(data.get("message", "")).strip()

    if not subject or not message_text:
        return jsonify({"error": "subject and message are required"}), 400
    if len(subject) > 150:
        return jsonify({"error": "subject must be 150 characters or fewer"}), 400
    if len(message_text) > 2000:
        return jsonify({"error": "message must be 2000 characters or fewer"}), 400

    user = User.query.get(staff_id)
    if not user:
        return jsonify({"error": "User does not exist"}), 404

    support_message = SupportMessage(staff_id=staff_id, subject=subject, message=message_text, status="open")
    db.session.add(support_message)
    db.session.commit()

    log_action(
        actor_id=staff_id,
        actor_name=claims.get("full_name"),
        action="support_message_created",
        target_type="support_message",
        target_id=support_message.id,
        description=f"{user.full_name} sent a support message: {subject}",
    )

    admin_users = User.query.filter_by(role=Roles.ADMIN).all()
    for admin_user in admin_users:
        db.session.add(Notification(
            user_id=admin_user.staff_id,
            title="New Support Message",
            message=f"{user.full_name} sent a message: {subject}",
            type="support_update",
        ))
    if admin_users:
        db.session.commit()

    return jsonify({"success": True, "message": serialize_message(support_message)}), 201


@support_bp.route("", methods=["GET"])
@jwt_required()
def list_support_messages():
    claims = get_jwt()
    staff_id = get_jwt_identity()
    is_admin = claims.get("role") == "admin"

    status_filter = request.args.get("status")

    if is_admin:
        query = SupportMessage.query.order_by(SupportMessage.created_at.desc())
        if status_filter in VALID_STATUSES:
            query = query.filter(SupportMessage.status == status_filter)

        page = max(1, request.args.get("page", default=1, type=int))
        page_size = min(100, max(1, request.args.get("page_size", default=10, type=int)))
        total = query.count()
        entries = query.offset((page - 1) * page_size).limit(page_size).all()

        return jsonify({
            "success": True,
            "total": total,
            "page": page,
            "page_size": page_size,
            "messages": [serialize_message(m) for m in entries],
        }), 200

    query = SupportMessage.query.filter_by(staff_id=staff_id).order_by(SupportMessage.created_at.desc())
    if status_filter in VALID_STATUSES:
        query = query.filter(SupportMessage.status == status_filter)
    entries = query.all()

    return jsonify({
        "success": True,
        "total": len(entries),
        "messages": [serialize_message(m) for m in entries],
    }), 200


@support_bp.route("/<int:message_id>", methods=["PATCH"])
@jwt_required()
def update_support_message(message_id):
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"error": "Only admins can reply to support messages"}), 403

    support_message = SupportMessage.query.get(message_id)
    if not support_message:
        return jsonify({"error": "Support message not found"}), 404

    data = request.get_json(silent=True) or {}
    changes = []

    if "admin_reply" in data:
        reply_text = str(data.get("admin_reply", "")).strip()
        if not reply_text:
            return jsonify({"error": "admin_reply cannot be empty"}), 400
        if len(reply_text) > 2000:
            return jsonify({"error": "admin_reply must be 2000 characters or fewer"}), 400
        support_message.admin_reply = reply_text
        support_message.replied_by = get_jwt_identity()
        support_message.replied_at = datetime.utcnow()
        changes.append("reply")

    if "status" in data:
        new_status = str(data.get("status", "")).strip().lower()
        if new_status not in VALID_STATUSES:
            return jsonify({"error": f"status must be one of {sorted(VALID_STATUSES)}"}), 400
        if new_status != support_message.status:
            support_message.status = new_status
            changes.append("status")

    if not changes:
        return jsonify({"error": "Nothing to update"}), 400

    db.session.commit()

    action = "support_message_resolved" if "status" in data and support_message.status == "resolved" else "support_message_replied"
    log_action(
        actor_id=get_jwt_identity(),
        actor_name=claims.get("full_name"),
        action=action,
        target_type="support_message",
        target_id=support_message.id,
        description=f"Updated {', '.join(changes)} on support message #{support_message.id} ({support_message.subject})",
    )

    if "reply" in changes or "status" in changes:
        note_message = "An admin replied to your support message." if "reply" in changes else "Your support message was marked resolved."
        db.session.add(Notification(
            user_id=support_message.staff_id,
            title="Support Message Update",
            message=f"{note_message} Subject: {support_message.subject}",
            type="support_update",
        ))
        db.session.commit()

    return jsonify({"success": True, "message": serialize_message(support_message)}), 200
