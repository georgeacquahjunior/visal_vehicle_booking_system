import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()  # add this


class Config:
    # Flask application settings
    SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-jwt-secret")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES_HOURS", "8")))

    # Database configuration - uses environment variable, falls back to local dev
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:brainstorm@localhost:5432/vehicle_booking"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Flask-Mail configuration for Gmail SMTP
    MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    MAIL_PORT = int(os.getenv("MAIL_PORT", "587"))
    MAIL_USE_TLS = os.getenv("MAIL_USE_TLS", "True").lower() == "true"
    MAIL_USE_SSL = os.getenv("MAIL_USE_SSL", "False").lower() == "true"
    MAIL_USERNAME = os.getenv("MAIL_USERNAME")
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
    MAIL_DEFAULT_SENDER = os.getenv("MAIL_DEFAULT_SENDER", MAIL_USERNAME)

    # Optional extra "from" addresses selectable when sending a broadcast email.
    # Format: "Label|email,Label2|email2" — each address must be an alias your
    # SMTP account is authorized to send as (e.g. a Gmail "Send mail as" alias).
    BROADCAST_SENDERS = os.getenv("BROADCAST_SENDERS", "")

    # Daily booking summary settings
    BOOKING_SUMMARY_HOUR = int(os.getenv("BOOKING_SUMMARY_HOUR", "17"))
    START_EMAIL_SCHEDULER = os.getenv("START_EMAIL_SCHEDULER", "True").lower() == "true"

    # CORS configuration - production ready
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "https://book-beta.vaarde.com,http://localhost:5173,http://127.0.0.1:5173").split(",")
    CORS_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    CORS_HEADERS = ["Content-Type", "Authorization", "X-Requested-With"]
    CORS_SUPPORTS_CREDENTIALS = True


class TestConfig:
    # Test configuration
    TESTING = True
    SECRET_KEY = "test-secret-key"
    JWT_SECRET_KEY = "test-jwt-secret"
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=8)

    # Use in-memory SQLite for tests
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Suppress actual email sending in tests
    MAIL_SUPPRESS_SEND = True
    MAIL_USERNAME = 'test@example.com'
    MAIL_PASSWORD = 'test-password'
    MAIL_DEFAULT_SENDER = 'test@example.com'
    # CORS configuration for tests
    CORS_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"]
    CORS_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    CORS_HEADERS = ["Content-Type", "Authorization", "X-Requested-With"]
    CORS_SUPPORTS_CREDENTIALS = True