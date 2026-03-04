from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from .. import db
from ..models.users import User

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")


# Staff Registration (Admin only)
@auth_bp.route("/register", methods=["POST"])
@jwt_required()
def register():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"error": "Only admins can register staff"}), 403
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
        staff_id=staff_id,
        full_name=full_name,
        email=email,
        password=password,
        phone_number=phone_number,
        department=department,
        role=role
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": f"{role} {full_name} registered successfully", "staff_id": staff_id}), 201

    
# Login (Staff or Admin)
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
        return jsonify({"error": "Invalid credentials"}), 401

    if not user.check_password(password):
        return jsonify({"error": "Invalid credentials"}), 401
    
    access_token = create_access_token(
        identity=user.staff_id,
        additional_claims={
            "role": user.role,
            "full_name": user.full_name
        }
    )

    return jsonify({
        "message": f"Welcome {user.full_name}!",
        "staff_id": user.staff_id,
        "role": user.role,
        "access_token": access_token
    }), 200


# Get all staffs
@auth_bp.route("/users", methods=["GET"])
@jwt_required()
def get_all_users():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"error": "Only admins can view all users"}), 403
    users = User.query.order_by(User.staff_id.asc()).all()

    users_data = []
    for user in users:
        users_data.append({
            "staff_id": user.staff_id,
            "full_name": user.full_name,
            "email": user.email,
            "phone_number": user.phone_number,
            "department": user.department,
            "role": user.role
        })

    return jsonify({
        "success": True,
        "count": len(users_data),
        "users": users_data
    }), 200
