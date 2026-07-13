from .. import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class Roles:
    STAFF = "staff"
    ADMIN = "admin"

class User(db.Model):
    """
    Represents a system user.
    Handles authentication and role-based access.
    """

    __tablename__ = "users"

    # staff_id is now a string, max length 20
    staff_id = db.Column(db.String(20), primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.Text, nullable=False)
    phone_number = db.Column(db.String(20))
    department = db.Column(db.String(50))
    role = db.Column(db.String(20), nullable=False, default=Roles.STAFF)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_active = db.Column(db.DateTime, nullable=True)

    # Constructor to hash password automatically
    def __init__(self, staff_id, full_name, email, password, phone_number=None, department=None, role=Roles.STAFF):
        self.staff_id = str(staff_id).strip()  # Ensure string
        self.full_name = full_name
        self.email = email.lower().strip()
        self.set_password(password)
        self.phone_number = phone_number
        self.department = department
        self.role = role
    
    def set_password(self, password):
        """Hash and set the password."""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Verify a plaintext password against stored hash."""
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f"<User {self.staff_id} | {self.full_name} | {self.role}>"