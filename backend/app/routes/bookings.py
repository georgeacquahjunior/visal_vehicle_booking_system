from flask import Blueprint, request, jsonify
from datetime import datetime
from .. import db
from ..models.bookings import Booking
from ..models.users import User

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

    return jsonify({
        "message": "Booking created successfully",
        "booking_id": booking.id,
        "status": booking.status
    }), 201


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

