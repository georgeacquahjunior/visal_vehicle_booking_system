from flask import Blueprint, request, jsonify
from .. import db
from ..models.users import User

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

# ----------------------
# Staff Registration (Admin only)
# ----------------------
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    staff_id = data.get("staff_id")  
    full_name = data.get("full_name")
    email = data.get("email")
    password = data.get("password")
    phone_number = data.get("phone_number")
    department = data.get("department")
    role = data.get("role", "staff")

    # Validate required fields
    if not staff_id or not full_name or not email or not password:
        return jsonify({"error": "staff_id, full_name, email, and password are required"}), 400

    # Check if staff_id already exists
    if User.query.get(staff_id):
        return jsonify({"error": "Staff ID already exists"}), 400

    # Check if email already exists
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already exists"}), 400

    # Create user with manual staff_id
    new_user = User(
        full_name=full_name,
        email=email,
        password=password,
        phone_number=phone_number,
        department=department,
        role=role
    )
    new_user.staff_id = staff_id  # manually set ID

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": f"{role} {full_name} registered successfully", "staff_id": staff_id}), 201

    
# ----------------------
# Login (Staff or Admin)
# ----------------------
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    staff_id = data.get("staff_id")
    password = data.get("password")

    if not staff_id or not password:
        return jsonify({"error": "Staff ID and password are required"}), 400

    # Look up the user
    user = User.query.get(staff_id)
    if not user:
        return jsonify({"message": "Invalid Staff ID"}), 404

    # Verify password
    if not user.check_password(password):
        return jsonify({"error": "Incorrect password"}), 401

    return jsonify({
        "message": f"Welcome {user.full_name}!",
        "staff_id": user.staff_id,
        "role": user.role
    }), 200
