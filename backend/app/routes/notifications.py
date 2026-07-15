from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from .. import db
from ..models.notifications import Notification

notifications_bp = Blueprint("notifications", __name__, url_prefix="/notifications")

@notifications_bp.route("", methods=["GET"])
@jwt_required()
def get_notifications():
    """Return all notifications for the current user, newest first."""
    user_id = get_jwt_identity()
    notes = (
        Notification.query
        .filter_by(user_id=user_id)
        .order_by(Notification.created_at.desc())
        .all()
    )

    results = []
    for n in notes:
        results.append({
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "type": n.type,
            "is_read": n.is_read,
            "created_at": n.created_at.isoformat(),
            "booking_id": n.booking_id,
        })

    return jsonify({"notifications": results}), 200

@notifications_bp.route("/<int:note_id>/read", methods=["PATCH"])
@jwt_required()
def mark_read(note_id):
    user_id = get_jwt_identity()
    note = Notification.query.get(note_id)
    if not note or note.user_id != user_id:
        return jsonify({"error": "Notification not found"}), 404

    note.is_read = True
    db.session.commit()
    return jsonify({"message": "Notification marked read"}), 200

@notifications_bp.route("/mark_all_read", methods=["PATCH"])
@jwt_required()
def mark_all_read():
    user_id = get_jwt_identity()
    Notification.query.filter_by(user_id=user_id, is_read=False).update({"is_read": True})
    db.session.commit()
    return jsonify({"message": "All notifications marked read"}), 200
