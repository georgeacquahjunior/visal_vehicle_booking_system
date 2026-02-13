# app/__init__.py
from flask import Flask
from .extensions import db, migrate, mail
from flask_cors import CORS
from flask_jwt_extended import JWTManager

def create_app(config_class=None):
    app = Flask(__name__)
    CORS(app)


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

    # Register blueprints
    from .routes.auth import auth_bp
    from .routes.bookings import bookings_bp
    app.register_blueprint(auth_bp)
    app.register_blueprint(bookings_bp)

    # JWT token initialization
    jwt = JWTManager(app)

    return app
