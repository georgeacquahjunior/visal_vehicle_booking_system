from app import create_app, db
from sqlalchemy import text  # import text

app = create_app()

with app.app_context():
    try:
        db.session.execute(text("SELECT 1"))  # wrap SQL in text()
        print("Database connection OK ✅")
    except Exception as e:
        print("Database connection failed ❌", e)
