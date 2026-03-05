import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()  # add this


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        hours=float(os.getenv("JWT_ACCESS_TOKEN_EXPIRES_HOURS", "4.0"))
    )

    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")

    SQLALCHEMY_ENGINE_OPTIONS = {
        "connect_args": {"sslmode": "require"}
    }

    SQLALCHEMY_TRACK_MODIFICATIONS = False