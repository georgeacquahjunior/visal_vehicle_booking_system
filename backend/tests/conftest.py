import pytest
from app import create_app, db
from app.models.users import User
from app.models.bookings import Booking
from app.models.notifications import Notification
from config import TestConfig


@pytest.fixture
def app():
    """Create and configure a test app instance."""
    app = create_app(TestConfig)

    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    """A test client for the app."""
    return app.test_client()


@pytest.fixture
def test_user(app):
    """Create a test user."""
    user = User(
        staff_id='TEST001',
        full_name='Test User',
        email='test@example.com',
        password='password123',
        department='IT',
        role='staff'
    )
    db.session.add(user)
    db.session.commit()
    return user


@pytest.fixture
def test_admin(app):
    """Create a test admin user."""
    admin = User(
        staff_id='ADMIN001',
        full_name='Test Admin',
        email='admin@example.com',
        password='password123',
        department='Admin',
        role='admin'
    )
    db.session.add(admin)
    db.session.commit()
    return admin


@pytest.fixture
def test_booking(app, test_user):
    """Create a test booking."""
    from datetime import date, time
    booking = Booking(
        user_id=test_user.staff_id,
        booking_date=date.today(),
        start_time=time(10, 0),
        end_time=time(12, 0),
        location='Test Location',
        purpose='Test Purpose',
        status='Pending'
    )
    db.session.add(booking)
    db.session.commit()
    return booking