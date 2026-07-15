import re

from flask import Blueprint, current_app, jsonify, request
from flask_jwt_extended import get_jwt, get_jwt_identity, jwt_required
from flask_mail import Message

from ..extensions import mail
from ..models.users import Roles, User
from ..services.audit_service import log_action

broadcast_bp = Blueprint("broadcast", __name__, url_prefix="/broadcast")

GROUP_AUDIENCE_ROLE_FILTERS = {
    "all": None,
    "staff": Roles.STAFF,
    "admin": Roles.ADMIN,
}

VALID_AUDIENCES = set(GROUP_AUDIENCE_ROLE_FILTERS) | {"user", "self"}

AUDIENCE_LABELS = {
    "all": "all users",
    "staff": "requesters only",
    "admin": "admins only",
    "user": "a single user",
    "self": "themselves (test send)",
}

TEMPLATE_VARIABLES = ("full_name", "first_name", "staff_id", "email", "department", "role")


def _strip_tags(html):
    return re.sub(r"<[^>]+>", " ", html).strip()


def _render(text, user):
    values = {
        "full_name": user.full_name or "",
        "first_name": (user.full_name or "").split(" ")[0],
        "staff_id": user.staff_id or "",
        "email": user.email or "",
        "department": user.department or "",
        "role": (user.role or "").capitalize(),
    }
    rendered = text
    for key in TEMPLATE_VARIABLES:
        rendered = rendered.replace(f"{{{{{key}}}}}", values[key])
    return rendered


def _parse_senders():
    raw = current_app.config.get("BROADCAST_SENDERS", "") or ""
    senders = []
    for entry in raw.split(","):
        entry = entry.strip()
        if not entry:
            continue
        label, _, email = entry.partition("|")
        email = (email or label).strip()
        senders.append({"label": label.strip(), "email": email})
    return senders


@broadcast_bp.route("/senders", methods=["GET"])
@jwt_required()
def list_senders():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"error": "Only admins can view sender addresses"}), 403

    return jsonify({
        "success": True,
        "default_sender": current_app.config.get("MAIL_DEFAULT_SENDER"),
        "senders": _parse_senders(),
        "variables": list(TEMPLATE_VARIABLES),
    }), 200


@broadcast_bp.route("/email", methods=["POST"])
@jwt_required()
def send_broadcast_email():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"error": "Only admins can send broadcast emails"}), 403

    data = request.get_json(silent=True) or {}
    subject = str(data.get("subject", "")).strip()
    html_body = str(data.get("html_body", "")).strip()
    audience = str(data.get("audience", "")).strip().lower()
    target_staff_id = str(data.get("target_staff_id", "")).strip()
    sender_email = str(data.get("sender", "")).strip()

    if not subject or not html_body:
        return jsonify({"error": "subject and html_body are required"}), 400
    if len(subject) > 200:
        return jsonify({"error": "subject must be 200 characters or fewer"}), 400
    if len(html_body) > 50000:
        return jsonify({"error": "html_body must be 50000 characters or fewer"}), 400
    if audience not in VALID_AUDIENCES:
        return jsonify({"error": f"audience must be one of: {', '.join(sorted(VALID_AUDIENCES))}"}), 400

    if sender_email:
        allowed_senders = {s["email"] for s in _parse_senders()}
        default_sender = current_app.config.get("MAIL_DEFAULT_SENDER")
        if sender_email not in allowed_senders and sender_email != default_sender:
            return jsonify({"error": "sender is not an allowed address"}), 400
    else:
        sender_email = None

    if audience == "self":
        me = User.query.get(get_jwt_identity())
        if not me or not me.email:
            return jsonify({"error": "Your account has no email on file"}), 400
        recipients = [me]
    elif audience == "user":
        if not target_staff_id:
            return jsonify({"error": "target_staff_id is required for the user audience"}), 400
        target_user = User.query.get(target_staff_id)
        if not target_user or target_user.status != "active" or not target_user.email:
            return jsonify({"error": "Selected user was not found, is inactive, or has no email on file"}), 404
        recipients = [target_user]
    else:
        query = User.query.filter_by(status="active")
        role_filter = GROUP_AUDIENCE_ROLE_FILTERS[audience]
        if role_filter:
            query = query.filter_by(role=role_filter)
        recipients = [user for user in query.all() if user.email]

    if not recipients:
        return jsonify({"error": "No recipients found for the selected audience"}), 400

    sent = 0
    failed = 0
    for user in recipients:
        try:
            rendered_subject = _render(subject, user)
            rendered_html = _render(html_body, user)
            plain_text = _strip_tags(rendered_html) or rendered_subject
            msg = Message(
                subject=rendered_subject,
                recipients=[user.email],
                body=plain_text,
                html=rendered_html,
                sender=sender_email,
            )
            mail.send(msg)
            sent += 1
        except Exception as exc:
            current_app.logger.error(f"Broadcast email failed to send to {user.email}: {exc}")
            failed += 1

    if sent == 0:
        return jsonify({"error": "Failed to send the email to any recipients"}), 502

    audience_label = AUDIENCE_LABELS[audience]
    if audience == "user":
        audience_label = f"{recipients[0].full_name} ({audience_label})"

    log_action(
        actor_id=get_jwt_identity(),
        actor_name=claims.get("full_name"),
        action="broadcast_email_sent",
        target_type="broadcast",
        target_id=None,
        description=(
            f"Sent broadcast email \"{subject}\" to {sent} recipient(s) ({audience_label})"
            + (f", {failed} failed" if failed else "")
        ),
    )

    return jsonify({"success": True, "sent": sent, "failed": failed, "audience": audience}), 200
