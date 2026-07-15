from flask import Blueprint, request, jsonify, current_app
from datetime import datetime, timedelta
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from .. import db
from ..models.bookings import Booking
from ..models.users import User, Roles
from ..models.notifications import Notification
from ..services.email_service import send_booking_notification
from ..services.audit_service import log_action
from ..services.settings_service import get_settings

bookings_bp = Blueprint("bookings", __name__, url_prefix="/bookings")

#  CREATE BOOKINGS
@bookings_bp.route("/create_booking", methods=["POST"])
@jwt_required()
def create_booking():
    user_id = get_jwt_identity()  # string staff_id from JWT
    claims = get_jwt()

    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    booking_date = data.get("booking_date")
    start_time = data.get("start_time")
    end_time = data.get("end_time")
    location = data.get("location")
    purpose = data.get("purpose")
    notes = data.get("notes")

    # Validate required fields
    if not all([booking_date, start_time, end_time, location, purpose]):
        return jsonify({"error": "booking_date, start_time, end_time, location, and purpose are required"}), 400

    # Convert date & time
    try:
        booking_date = datetime.strptime(booking_date, "%Y-%m-%d").date()
        start_time = datetime.strptime(start_time, "%H:%M").time()
        end_time = datetime.strptime(end_time, "%H:%M").time()
    except ValueError:
        return jsonify({"error": "Invalid date or time format"}), 400

    if start_time >= end_time:
        return jsonify({"error": "start_time must be earlier than end_time"}), 400

    settings = get_settings()

    if start_time < settings.booking_start_time or end_time > settings.booking_end_time:
        return jsonify({
            "error": f"Bookings must fall between {settings.booking_start_time.strftime('%H:%M')} and {settings.booking_end_time.strftime('%H:%M')}"
        }), 400

    if not settings.allow_weekend_bookings and booking_date.weekday() >= 5:
        return jsonify({"error": "Weekend bookings are not allowed"}), 400

    if settings.max_booking_duration_minutes is not None:
        duration_minutes = (datetime.combine(booking_date, end_time) - datetime.combine(booking_date, start_time)).seconds // 60
        if duration_minutes > settings.max_booking_duration_minutes:
            return jsonify({"error": f"Bookings cannot exceed {settings.max_booking_duration_minutes} minutes"}), 400

    if settings.min_lead_time_minutes:
        earliest_allowed = datetime.now() + timedelta(minutes=settings.min_lead_time_minutes)
        if datetime.combine(booking_date, start_time) < earliest_allowed:
            return jsonify({"error": f"Bookings require at least {settings.min_lead_time_minutes} minutes advance notice"}), 400

    if settings.max_advance_days is not None:
        latest_allowed = datetime.now().date() + timedelta(days=settings.max_advance_days)
        if booking_date > latest_allowed:
            return jsonify({"error": f"Bookings cannot be made more than {settings.max_advance_days} days in advance"}), 400

    # Ensure user exists
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User does not exist"}), 404

    # Create booking
    booking = Booking(
        user_id=user_id,
        booking_date=booking_date,
        start_time=start_time,
        end_time=end_time,
        location=location,
        purpose=purpose,
        notes=notes
    )

    db.session.add(booking)
    db.session.commit()

    log_action(
        actor_id=user_id,
        actor_name=user.full_name,
        action="booking_created",
        target_type="booking",
        target_id=booking.id,
        description=f"{user.full_name} requested a booking on {booking.booking_date.isoformat()} for {location}",
    )

    # notify admins in-app of the new pending request
    admin_users = User.query.filter_by(role=Roles.ADMIN).all()
    for admin_user in admin_users:
        db.session.add(Notification(
            user_id=admin_user.staff_id,
            title="New Booking Request",
            message=f"{user.full_name} requested a booking on {booking.booking_date.isoformat()} for {location}.",
            type="submitted",
            booking_id=booking.id,
        ))
    if admin_users:
        db.session.commit()

    return jsonify({
        "message": "Booking created successfully",
        "booking": {
            "booking_id": booking.id,
            "staff_id": booking.user_id,
            "booking_date": booking.booking_date.isoformat(),
            "start_time": booking.start_time.strftime("%H:%M"),
            "end_time": booking.end_time.strftime("%H:%M"),
            "location": booking.location,
            "purpose": booking.purpose,
            "notes": booking.notes,
            "status": booking.status,
            "admin_comment": booking.admin_comment,
            "created_at": booking.created_at.isoformat()
        }
    }), 201


# GET USER BOOKINGS BY ID
@bookings_bp.route("/staff/<staff_id>", methods=["GET"])
def get_bookings_by_staff(staff_id):

    # staff_id is now a string
    user = User.query.filter_by(staff_id=staff_id).first()
    if not user:
        return jsonify({"error": "Staff not found"}), 404

    bookings = Booking.query.filter_by(user_id=staff_id).order_by(Booking.booking_date.desc()).all()

    result = []
    for booking in bookings:
        result.append({
            "booking_id": booking.id,
            "staff_id": booking.user_id,
            "booking_date": booking.booking_date.isoformat(),
            "start_time": booking.start_time.strftime("%H:%M"),
            "end_time": booking.end_time.strftime("%H:%M"),
            "location": booking.location,
            "purpose": booking.purpose,
            "notes": booking.notes,
            "status": booking.status,
            "admin_comment": booking.admin_comment,
            "created_at": booking.created_at.isoformat()
        })

    return jsonify({
        "staff": {
            "staff_id": user.staff_id,
            "full_name": user.full_name,
            "department": user.department,
            "role": user.role
        },
        "total_bookings": len(result),
        "bookings": result
    }), 200

# Get all user bookings
@bookings_bp.route("/schedule_view", methods=["GET"])
def get_all_bookings():
    """
    Admin / Schedule view:
    Returns all bookings with staff details
    """

    bookings = (
        Booking.query
        .join(User, Booking.user_id == User.staff_id)
        .order_by(Booking.booking_date, Booking.start_time)
        .all()
    )

    results = []

    for booking in bookings:
        results.append({
            "booking_id": booking.id,
            "staff_id": booking.user_id,
            "staff_name": booking.user.full_name,
            "department": booking.user.department,
            "booking_date": booking.booking_date.isoformat(),
            "start_time": booking.start_time.strftime("%H:%M"),
            "end_time": booking.end_time.strftime("%H:%M"),
            "location": booking.location,
            "purpose": booking.purpose,
            "notes": booking.notes,
            "status": booking.status,
            "admin_comment": booking.admin_comment
        })

    return jsonify({
        "total_bookings": len(results),
        "bookings": results
    }), 200

    # Fetch all Pending bookings

@bookings_bp.route("/pending", methods=["GET"])
def get_pending_bookings():
    """
    Admin approval view:
    Fetch all pending bookings
    """

    pending_bookings = (
        Booking.query
        .join(User, Booking.user_id == User.staff_id)
        .filter(Booking.status == "Pending")
        .order_by(Booking.booking_date, Booking.start_time)
        .all()
    )

    results = []

    for booking in pending_bookings:
        results.append({
            "booking_id": booking.id,
            "staff_id": booking.user.staff_id,
            "staff_name": booking.user.full_name,
            "department": booking.user.department,
            "booking_date": booking.booking_date.isoformat(),
            "start_time": booking.start_time.strftime("%H:%M"),
            "end_time": booking.end_time.strftime("%H:%M"),
            "location": booking.location,
            "purpose": booking.purpose,
            "notes": booking.notes,
            "status": booking.status,
            "created_at": booking.created_at.isoformat()
        })

    return jsonify({
        "total_pending": len(results),
        "pending_bookings": results
    }), 200


# Approve bookings
@bookings_bp.route("/<int:booking_id>/approve", methods=["PATCH"])
@jwt_required()
def approve_booking(booking_id):
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"error": "Only admins can approve bookings"}), 403
    """
    Admin approves a booking
    """

    booking = Booking.query.get(booking_id)

    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    if booking.status != "Pending":
        return jsonify({
            "error": f"Booking already {booking.status}"
        }), 400

    data = request.get_json(silent=True) or {}
    admin_comment = data.get("admin_comment")

    booking.status = "Approved"
    booking.admin_comment = admin_comment
    booking.updated_at = datetime.utcnow()

    # generate in-app notification for the requesting user
    from ..models.notifications import Notification
    msg = f"Your booking on {booking.booking_date.isoformat()} has been approved. "
    if admin_comment:
        msg += f" Comment: {admin_comment}"
    
    note = Notification(
        user_id=booking.user_id,
        title="Booking Approved",
        message=msg,
        type="approved",          
        booking_id=booking.id
    )

    db.session.add(note)
    db.session.commit()

    log_action(
        actor_id=get_jwt_identity(),
        actor_name=claims.get("full_name"),
        action="booking_approved",
        target_type="booking",
        target_id=booking.id,
        description=f"Approved booking #{booking.id} for {booking.booking_date.isoformat()}" + (f" — {admin_comment}" if admin_comment else ""),
    )

    # Send email notification
    user = User.query.get(booking.user_id)
    if user and user.email:
        email_subject = "Booking Approved - Vehicle Booking System"
        email_body = f"Dear {user.full_name},\n\nYour vehicle booking has been approved!"
        if admin_comment:
            email_body += f"\n\nAdmin comment: {admin_comment}"
        email_body += "\n\nPlease ensure you have all necessary documents and follow the booking guidelines."
        
        booking_details = {
            'purpose': booking.purpose,
            'userName': user.full_name,
            'date': booking.booking_date.isoformat(),
            'startTime': booking.start_time.strftime('%H:%M'),
            'endTime': booking.end_time.strftime('%H:%M'),
            'location': booking.location,
            'adminComment': admin_comment
        }
        
        send_booking_notification(user.email, email_subject, email_body, is_approved=True, booking_details=booking_details)

    return jsonify({
        "message": "Booking approved successfully",
        "booking_id": booking.id,
        "status": booking.status
    }), 200


# Decline Bookings
@bookings_bp.route("/<int:booking_id>/decline", methods=["PATCH"])
@jwt_required()
def decline_booking(booking_id):
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"error": "Only admins can decline bookings"}), 403
    """
    Admin declines a booking
    """

    booking = Booking.query.get(booking_id)

    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    if booking.status != "Pending":
        return jsonify({
            "error": f"Booking already {booking.status}"
        }), 400

    data = request.get_json(silent=True) or {}
    admin_comment = data.get("admin_comment")

    settings = get_settings()
    if settings.require_decline_reason and not (admin_comment and admin_comment.strip()):
        return jsonify({"error": "A decline reason is required"}), 400

    booking.status = "Declined"
    booking.admin_comment = admin_comment
    booking.updated_at = datetime.utcnow()

    # create in-app notification so staff knows their booking was declined
    from ..models.notifications import Notification
    msg = f"Your booking on {booking.booking_date.isoformat()} has been declined."
    if admin_comment:
        msg += f" Reason: {admin_comment}"
    note = Notification(
        user_id=booking.user_id,
        title="Booking Declined",
        message=msg,
        type="declined",          
        booking_id=booking.id
    )
    db.session.add(note)

    db.session.commit()

    log_action(
        actor_id=get_jwt_identity(),
        actor_name=claims.get("full_name"),
        action="booking_declined",
        target_type="booking",
        target_id=booking.id,
        description=f"Declined booking #{booking.id} for {booking.booking_date.isoformat()}" + (f" — {admin_comment}" if admin_comment else ""),
    )

    # Send email notification
    user = User.query.get(booking.user_id)
    if user and user.email:
        email_subject = "Booking Declined - Vehicle Booking System"
        email_body = f"Dear {user.full_name},\n\nUnfortunately, your vehicle booking request has been declined."
        if admin_comment:
            email_body += f"\n\nAdmin comment: {admin_comment}"
        email_body += "\n\nIf you have any questions or need to make another booking request, please contact your administrator."
        
        booking_details = {
            'purpose': booking.purpose,
            'userName': user.full_name,
            'date': booking.booking_date.isoformat(),
            'startTime': booking.start_time.strftime('%H:%M'),
            'endTime': booking.end_time.strftime('%H:%M'),
            'location': booking.location,
            'adminComment': admin_comment
        }
        
        send_booking_notification(user.email, email_subject, email_body, is_approved=False, booking_details=booking_details)

    return jsonify({
        "message": "Booking declined successfully",
        "booking_id": booking.id,
        "status": booking.status
    }), 200


# Cancel a booking (the requester who owns it)
@bookings_bp.route("/<int:booking_id>/cancel", methods=["PATCH"])
@jwt_required()
def cancel_booking(booking_id):
    user_id = get_jwt_identity()
    claims = get_jwt()

    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    if booking.user_id != user_id and claims.get("role") != "admin":
        return jsonify({"error": "You can only cancel your own bookings"}), 403

    if booking.status not in ("Pending", "Approved"):
        return jsonify({"error": f"Booking already {booking.status}"}), 400

    if booking.booking_date < datetime.now().date():
        return jsonify({"error": "Past bookings cannot be cancelled"}), 400

    booking.status = "Cancelled"
    booking.updated_at = datetime.utcnow()
    db.session.commit()

    user = User.query.get(user_id)
    log_action(
        actor_id=user_id,
        actor_name=claims.get("full_name"),
        action="booking_cancelled",
        target_type="booking",
        target_id=booking.id,
        description=f"{claims.get('full_name', user_id)} cancelled the booking for {booking.booking_date.isoformat()} at {booking.location}",
    )

    # notify admins in-app that a booking was cancelled
    admin_users = User.query.filter_by(role=Roles.ADMIN).all()
    for admin_user in admin_users:
        db.session.add(Notification(
            user_id=admin_user.staff_id,
            title="Booking Cancelled",
            message=f"{user.full_name if user else user_id} cancelled their booking for {booking.booking_date.isoformat()}.",
            type="cancelled",
            booking_id=booking.id,
        ))
    if admin_users:
        db.session.commit()

    return jsonify({
        "message": "Booking cancelled successfully",
        "booking_id": booking.id,
        "status": booking.status,
    }), 200

