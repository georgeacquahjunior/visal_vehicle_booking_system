# app/__init__.py
from flask import Flask, make_response
from .extensions import db, migrate, mail
from flask_cors import CORS
from flask_jwt_extended import JWTManager

def create_app(config_class=None):
    app = Flask(__name__)

    # Load config
    if config_class is None:
        from config import Config
        app.config.from_object(Config)
    else:
        app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    mail.init_app(app)

    # Import models from models folder
    from .models.users import User
    from .models.bookings import Booking
    from .models.notifications import Notification
    from .models.changelog import Changelog

    # Register blueprints
    from .routes.auth import auth_bp
    from .routes.bookings import bookings_bp
    from .routes.notifications import notifications_bp
    from .routes.changelog import changelog_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(bookings_bp)
    app.register_blueprint(notifications_bp)
    app.register_blueprint(changelog_bp)

    # JWT token initialization
    jwt = JWTManager(app)

    # Enable CORS with configuration from config
    CORS(app,
         origins=app.config['CORS_ORIGINS'],
         methods=app.config['CORS_METHODS'],
         allow_headers=app.config['CORS_HEADERS'],
         supports_credentials=app.config['CORS_SUPPORTS_CREDENTIALS'])

    if app.config.get('START_EMAIL_SCHEDULER', False) and not app.config.get('TESTING', False):
        from .services.summary_scheduler import start_daily_summary_scheduler
        start_daily_summary_scheduler(app)

    return app
