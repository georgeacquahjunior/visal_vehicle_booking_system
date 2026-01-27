from .. import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = "users"

    staff_id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.Text, nullable=False)
    phone_number = db.Column(db.String(20))
    department = db.Column(db.String(50))
    role = db.Column(db.String(20), nullable=False, default="staff")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Constructor to hash password automatically
    def __init__(self, full_name, email, password, phone_number=None, department=None, role="staff"):
        self.full_name = full_name
        self.email = email
        self.password_hash = generate_password_hash(password)
        self.phone_number = phone_number
        self.department = department
        self.role = role

    # Verify password
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f"<User {self.full_name} | {self.email} | {self.role}>"
