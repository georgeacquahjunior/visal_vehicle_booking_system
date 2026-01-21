import os

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "mysecretkey")
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:brainstorm@localhost:5432/vehicle_booking"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
