from flask import Blueprint, request, jsonify, current_app
from datetime import datetime
from .. import db
from ..models.bookings import Booking
from ..models.users import User
from ..extensions import mail
from flask_mail import Message

bookings_bp = Blueprint("bookings", __name__, url_prefix="/bookings")

#  CREATE BOOKINGS
@bookings_bp.route("/create_booking", methods=["POST"])
def create_booking():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No input data provided"}), 400

    user_id = data.get("user_id")
    booking_date = data.get("booking_date")
    start_time = data.get("start_time")
    end_time = data.get("end_time")
    location = data.get("location")
    purpose = data.get("purpose")
    notes = data.get("notes")

    # Validate required fields
    if not all([user_id, booking_date, start_time, end_time, location, purpose]):
        return jsonify({
            "error": "user_id, booking_date, start_time, end_time, location, and purpose are required"
        }), 400

    # Check if user exists
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User does not exist"}), 404

    # Convert date & time strings to Python objects
    try:
        booking_date = datetime.strptime(booking_date, "%Y-%m-%d").date()
        start_time = datetime.strptime(start_time, "%H:%M").time()
        end_time = datetime.strptime(end_time, "%H:%M").time()
    except ValueError:
        return jsonify({
            "error": "Invalid date or time format. Use YYYY-MM-DD and HH:MM"
        }), 400

    # Validate time range
    if start_time >= end_time:
        return jsonify({
            "error": "start_time must be earlier than end_time"
        }), 400

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

    # Send email notification (non-blocking for booking success)
    try:
        admin_email = current_app.config.get("ADMIN_EMAIL")
        recipients = [user.email]
        if admin_email:
            recipients.append(admin_email)

        msg = Message(
            subject="Booking request submitted",
            recipients=recipients,
        )
        msg.body = (
            f"Hi {user.full_name},\n\n"
            f"Your booking request was submitted successfully and is pending approval.\n\n"
            f"Date: {booking.booking_date.isoformat()}\n"
            f"Start: {booking.start_time.strftime('%H:%M')}\n"
            f"End: {booking.end_time.strftime('%H:%M')}\n"
            f"Destination: {booking.location}\n"
            f"Purpose: {booking.purpose}\n"
            f"Notes: {booking.notes or 'N/A'}\n\n"
            "Thanks,\n"
            "Visal Vehicle System"
        )
        mail.send(msg)
    except Exception as exc:
        current_app.logger.warning("Booking email failed: %s", exc)

    return jsonify({
        "message": "Booking created successfully",
        "booking_id": booking.id,
        "status": booking.status
    }), 201


# GET USER BOOKINGS BY ID
@bookings_bp.route("/staff/<int:staff_id>", methods=["GET"])
def get_bookings_by_staff(staff_id):

    #  Check if staff exists
    user = User.query.filter_by(staff_id=staff_id).first()
    if not user:
        return jsonify({"error": "Staff not found"}), 404

    # Fetch bookings
    bookings = (
        Booking.query
        .filter_by(user_id=staff_id)
        .order_by(Booking.booking_date.desc())
        .all()
    )

    # Serialize response
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
def approve_booking(booking_id):
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

    db.session.commit()

    return jsonify({
        "message": "Booking approved successfully",
        "booking_id": booking.id,
        "status": booking.status
    }), 200


# Decline Bookings
@bookings_bp.route("/<int:booking_id>/decline", methods=["PATCH"])
def decline_booking(booking_id):
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

    booking.status = "Declined"
    booking.admin_comment = admin_comment
    booking.updated_at = datetime.utcnow()

    db.session.commit()

    return jsonify({
        "message": "Booking declined successfully",
        "booking_id": booking.id,
        "status": booking.status
    }), 200

