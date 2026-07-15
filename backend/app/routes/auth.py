from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from .. import db
from ..models.users import User
from ..services.audit_service import log_action

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

ONLINE_THRESHOLD_MINUTES = 5


@auth_bp.route("/", methods=["GET"])
def home():
    return jsonify({"status": "Flask is working 🚀"}), 200


# Health check endpoint for Render
@auth_bp.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy", "service": "vehicle-booking-backend"}), 200


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

    log_action(
        actor_id=get_jwt_identity(),
        actor_name=claims.get("full_name"),
        action="staff_registered",
        target_type="user",
        target_id=staff_id,
        description=f"Registered {role} account for {full_name} ({staff_id})",
    )

    return jsonify({"message": f"{role} {full_name} registered successfully", "staff_id": staff_id}), 201

    
# Login (Staff or Admin)
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    staff_id = str(data.get("staff_id", "")).strip()
    password = data.get("password")

    if not staff_id or not password:
        return jsonify({"error": "Staff ID and password are required"}), 400

    # Look up the user
    user = User.query.get(staff_id)

    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    if not user.check_password(password):
        return jsonify({"error": "Invalid credentials"}), 401

    if user.status != "active":
        return jsonify({"error": "This account has been deactivated. Contact an administrator."}), 403

    user.last_active = datetime.utcnow()
    db.session.commit()

    access_token = create_access_token(
        identity=str(user.staff_id),
        additional_claims={
            "role": user.role,
            "full_name": user.full_name
        }
    )

    log_action(
        actor_id=user.staff_id,
        actor_name=user.full_name,
        action="login",
        target_type="user",
        target_id=user.staff_id,
        description=f"{user.full_name} logged in",
    )

    return jsonify({
        "message": f"Welcome {user.full_name}!",
        "staff_id": user.staff_id,
        "full_name": user.full_name,
        "role": user.role,
        "access_token": access_token
    }), 200


# Logout - client calls this before discarding its token so the event is recorded
@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    claims = get_jwt()
    staff_id = get_jwt_identity()

    log_action(
        actor_id=staff_id,
        actor_name=claims.get("full_name"),
        action="logout",
        target_type="user",
        target_id=staff_id,
        description=f"{claims.get('full_name', staff_id)} logged out",
    )

    return jsonify({"success": True}), 200


# Get my own profile
@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_me():
    staff_id = get_jwt_identity()
    user = User.query.get(staff_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "success": True,
        "user": {
            "staff_id": user.staff_id,
            "full_name": user.full_name,
            "email": user.email,
            "phone_number": user.phone_number,
            "department": user.department,
            "role": user.role,
            "status": user.status,
        },
    }), 200


# Update my own profile — name and phone number only (email/department/role/staff_id stay admin-managed)
@auth_bp.route("/me", methods=["PUT"])
@jwt_required()
def update_me():
    staff_id = get_jwt_identity()
    claims = get_jwt()
    user = User.query.get(staff_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json() or {}
    full_name = str(data.get("full_name", user.full_name)).strip()
    phone_number = data.get("phone_number", user.phone_number)

    if not full_name:
        return jsonify({"error": "full_name is required"}), 400

    changes = []
    if full_name != user.full_name:
        changes.append("name")
    if phone_number != user.phone_number:
        changes.append("phone")

    user.full_name = full_name
    user.phone_number = phone_number
    db.session.commit()

    if changes:
        log_action(
            actor_id=staff_id,
            actor_name=full_name,
            action="profile_updated",
            target_type="user",
            target_id=staff_id,
            description=f"{full_name} updated their {', '.join(changes)}",
        )

    return jsonify({
        "success": True,
        "user": {
            "staff_id": user.staff_id,
            "full_name": user.full_name,
            "email": user.email,
            "phone_number": user.phone_number,
            "department": user.department,
            "role": user.role,
            "status": user.status,
        },
    }), 200


# Change my own password
@auth_bp.route("/me/password", methods=["PATCH"])
@jwt_required()
def change_my_password():
    staff_id = get_jwt_identity()
    claims = get_jwt()
    user = User.query.get(staff_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json() or {}
    current_password = data.get("current_password", "")
    new_password = data.get("new_password", "")

    if not current_password or not new_password:
        return jsonify({"error": "current_password and new_password are required"}), 400

    if not user.check_password(current_password):
        return jsonify({"error": "Current password is incorrect"}), 401

    if len(new_password) < 8:
        return jsonify({"error": "New password must be at least 8 characters"}), 400

    if user.check_password(new_password):
        return jsonify({"error": "New password must be different from the current password"}), 400

    user.set_password(new_password)
    db.session.commit()

    log_action(
        actor_id=staff_id,
        actor_name=claims.get("full_name"),
        action="password_changed",
        target_type="user",
        target_id=staff_id,
        description=f"{claims.get('full_name', staff_id)} changed their password",
    )

    return jsonify({"success": True, "message": "Password updated successfully"}), 200


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
            "role": user.role,
            "status": user.status
        })

    return jsonify({
        "success": True,
        "count": len(users_data),
        "users": users_data
    }), 200


# Update staff details (Admin only)
@auth_bp.route("/users/<staff_id>", methods=["PUT"])
@jwt_required()
def update_user(staff_id):
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"error": "Only admins can update staff details"}), 403

    user = User.query.get(staff_id)
    if not user:
        return jsonify({"error": "Staff member not found"}), 404

    data = request.get_json() or {}

    full_name = data.get("full_name", user.full_name)
    email = str(data.get("email", user.email)).lower().strip()
    phone_number = data.get("phone_number", user.phone_number)
    department = data.get("department", user.department)
    role = data.get("role", user.role)
    new_staff_id = str(data.get("staff_id", user.staff_id)).strip()

    if not full_name or not email:
        return jsonify({"error": "full_name and email are required"}), 400

    if not new_staff_id:
        return jsonify({"error": "staff_id cannot be empty"}), 400

    existing = User.query.filter_by(email=email).first()
    if existing and existing.staff_id != user.staff_id:
        return jsonify({"error": "Email already in use by another account"}), 400

    old_staff_id = user.staff_id
    changing_staff_id = new_staff_id != old_staff_id

    if changing_staff_id:
        if old_staff_id == get_jwt_identity():
            return jsonify({"error": "You cannot change your own staff ID. Ask another admin to do this."}), 400
        if User.query.get(new_staff_id):
            return jsonify({"error": "Staff ID already in use by another account"}), 400

    changes = []
    if full_name != user.full_name:
        changes.append("name")
    if email != user.email:
        changes.append("email")
    if phone_number != user.phone_number:
        changes.append("phone")
    if department != user.department:
        changes.append("department")
    if role != user.role:
        changes.append("role")
    if changing_staff_id:
        changes.append("staff ID")

    user.full_name = full_name
    user.email = email
    user.phone_number = phone_number
    user.department = department
    user.role = role
    if changing_staff_id:
        user.staff_id = new_staff_id

    db.session.commit()

    if changes:
        log_action(
            actor_id=get_jwt_identity(),
            actor_name=claims.get("full_name"),
            action="staff_updated",
            target_type="user",
            target_id=user.staff_id,
            description=(
                f"Updated {', '.join(changes)} for {user.full_name} "
                f"({f'{old_staff_id} → {user.staff_id}' if changing_staff_id else user.staff_id})"
            ),
        )

    return jsonify({"success": True, "message": f"{user.full_name} updated successfully", "staff_id": user.staff_id}), 200


# Activate/deactivate a staff account (Admin only)
@auth_bp.route("/users/<staff_id>/status", methods=["PATCH"])
@jwt_required()
def update_user_status(staff_id):
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"error": "Only admins can change account status"}), 403

    actor_id = get_jwt_identity()
    if staff_id == actor_id:
        return jsonify({"error": "You cannot change the status of your own account"}), 400

    user = User.query.get(staff_id)
    if not user:
        return jsonify({"error": "Staff member not found"}), 404

    data = request.get_json() or {}
    new_status = str(data.get("status", "")).strip().lower()
    if new_status not in ("active", "inactive"):
        return jsonify({"error": "status must be 'active' or 'inactive'"}), 400

    user.status = new_status
    db.session.commit()

    log_action(
        actor_id=actor_id,
        actor_name=claims.get("full_name"),
        action="staff_activated" if new_status == "active" else "staff_deactivated",
        target_type="user",
        target_id=user.staff_id,
        description=f"{'Activated' if new_status == 'active' else 'Deactivated'} account for {user.full_name} ({user.staff_id})",
    )

    return jsonify({"success": True, "status": user.status}), 200


# Heartbeat - called periodically by logged-in clients to mark themselves active
@auth_bp.route("/heartbeat", methods=["POST"])
@jwt_required()
def heartbeat():
    staff_id = get_jwt_identity()
    user = User.query.get(staff_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    user.last_active = datetime.utcnow()
    db.session.commit()

    return jsonify({"success": True, "last_active": user.last_active.isoformat()}), 200


# Who's currently online (active within the last few minutes)
@auth_bp.route("/online-users", methods=["GET"])
@jwt_required()
def online_users():
    cutoff = datetime.utcnow() - timedelta(minutes=ONLINE_THRESHOLD_MINUTES)
    users = (
        User.query.filter(User.last_active.isnot(None), User.last_active >= cutoff)
        .order_by(User.full_name.asc())
        .all()
    )

    users_data = [
        {
            "staff_id": user.staff_id,
            "full_name": user.full_name,
            "role": user.role,
            "department": user.department,
            "last_active": user.last_active.isoformat(),
        }
        for user in users
    ]

    return jsonify({"success": True, "count": len(users_data), "users": users_data}), 200
