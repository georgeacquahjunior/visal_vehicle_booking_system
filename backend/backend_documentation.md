# Backend Documentation

## Overview
This document describes the backend API for the `visal_vehicle_booking_system` project. It focuses on the Flask/Python application under `backend/` and is intended to be updated over time as the API evolves.

## Purpose
- Capture the current API structure, endpoints, models, and key services.
- Help developers, testers, and maintainers understand the backend architecture and flows.
- Provide an easy place to record API changes and update notes.

## Application Structure
- `app/app.py` — main Flask application factory.
- `app/__init__.py` — app initialization and extensions.
- `app/extensions.py` — Flask extensions (DB, JWT, Mail, CORS).
- `app/models/` — SQLAlchemy models (users.py, bookings.py, notifications.py, changelog.py).
- `app/routes/` — API blueprints (auth.py, bookings.py, notifications.py, changelog.py).
- `app/services/` — business logic services (email_service.py, summary_scheduler.py).
- `config.py` — configuration classes for different environments.
- `alembic/` — database migrations.
- `tests/` — pytest test files.
- `requirements.txt` — Python dependencies.

## API Endpoints Map
- `/auth/login` — POST: User login, returns JWT token with user details.
- `/auth/register` — POST: Admin-only staff registration (requires JWT admin role).
- `/bookings/create_booking` — POST: Create new booking request (JWT required).
- `/bookings/my_bookings` — GET: Get authenticated user's bookings (JWT required).
- `/bookings/schedule_view` — GET: Get schedule view for all bookings (JWT required).
- `/bookings/approve/<id>` — PUT: Admin approve booking (JWT admin required).
- `/bookings/decline/<id>` — PUT: Admin decline booking (JWT admin required).
- `/notifications/` — GET: Get user notifications (JWT required).
- `/notifications/mark_read/<id>` — PUT: Mark notification as read (JWT required).
- `/changelog/` — GET: Get changelog entries.

## Core Models

### User Model
File: `app/models/users.py`
- **Fields**:
  - `staff_id` (String, PK): Unique staff identifier.
  - `full_name` (String): User's full name.
  - `email` (String, unique): User's email address.
  - `password_hash` (Text): Hashed password.
  - `phone_number` (String): Optional phone number.
  - `department` (String): Optional department.
  - `role` (String): 'staff' or 'admin'.
  - `created_at` (DateTime): Account creation timestamp.
- **Roles**: 'staff' (default), 'admin'.
- **Methods**: `set_password()`, `check_password()`.

### Booking Model
File: `app/models/bookings.py`
- **Fields**:
  - `id` (Integer, PK): Auto-incrementing booking ID.
  - `user_id` (String, FK): References users.staff_id.
  - `booking_date` (Date): Booking date.
  - `start_time` (Time): Start time.
  - `end_time` (Time): End time.
  - `location` (String): Booking location.
  - `purpose` (Text): Purpose of booking.
  - `notes` (Text): Optional notes.
  - `status` (String): 'Pending', 'Approved', 'Declined', 'Cancelled'.
  - `admin_comment` (Text): Optional admin comment.
  - `created_at` (DateTime): Creation timestamp.
  - `updated_at` (DateTime): Last update timestamp.
- **Relationships**: `user` (backref to User model).

### Notification Model
File: `app/models/notifications.py`
- **Fields**:
  - `id` (Integer, PK): Auto-incrementing notification ID.
  - `user_id` (String, FK): References users.staff_id.
  - `title` (String): Notification title.
  - `message` (Text): Notification message.
  - `is_read` (Boolean): Read status.
  - `created_at` (DateTime): Creation timestamp.

### Changelog Model
File: `app/models/changelog.py`
- **Fields**:
  - `id` (Integer, PK): Auto-incrementing entry ID.
  - `version` (String): Version number.
  - `changes` (Text): Change description.
  - `release_date` (Date): Release date.

## Services

### Email Service
File: `app/services/email_service.py`
- `send_booking_notification(user_email, subject, body, is_approved=True, booking_details=None)`: Sends professional HTML email for booking approval/decline notifications.
- `send_daily_late_booking_summary()`: Generates and sends daily summary email at 5pm for bookings starting at or after 5pm.

### Summary Scheduler
File: `app/services/summary_scheduler.py`
- Implements a daemon thread that runs the daily late booking summary email service.
- Configured to trigger at `BOOKING_SUMMARY_HOUR` (default 17:00).

## Configuration
- **Config Class**: Production settings using environment variables.
  - Database: `DATABASE_URL` (PostgreSQL).
  - JWT: `JWT_SECRET_KEY`, `JWT_ACCESS_TOKEN_EXPIRES`.
  - Email: `MAIL_SERVER`, `MAIL_USERNAME`, `MAIL_PASSWORD`, etc.
  - CORS: Origins, methods, headers.
- **TestConfig Class**: Test settings with in-memory SQLite and suppressed email sending.
- Environment variables control all sensitive settings.

## Testing
- Framework: pytest.
- Test files:
  - `test_email_service.py`: Email sending tests.
  - `test_booking_notifications.py`: Booking notification logic.
  - `test_notification_routes.py`: Notification API endpoints.
- Fixtures: Defined in `conftest.py` for database setup and teardown.

## API Integration Patterns
- **Authentication**: JWT tokens required for protected routes. Token includes user `staff_id` and `role`.
- **CORS**: Enabled for frontend origins (default: localhost:5173).
- **Error Handling**: JSON responses with `{"error": "message"}` for failures.
- **Success Responses**: JSON with data or `{"message": "success"}`.
- **Validation**: Server-side validation for required fields, date/time formats, and business rules.
- **Email Notifications**: Automatic emails on booking approval/decline and daily summaries.

## Database
- **Production**: PostgreSQL via `DATABASE_URL` env var.
- **Development**: Local PostgreSQL instance.
- **Testing**: In-memory SQLite.
- **Migrations**: Managed with Alembic in `alembic/` directory.

## Future Update Guidelines
Use this section to keep the backend doc accurate as the API evolves.

1. Update endpoint changes immediately.
   - Add new routes to the `API Endpoints Map`.
   - Document request/response formats.
2. Add or remove models/services.
   - Include new database models or business logic services.
3. Keep descriptions in sync.
   - Add details for new API endpoints, validation rules, or email flows.
4. Track configuration changes.
   - Note new environment variables or config options.
5. Refresh the `Last updated` date below.

## Change Log / Notes
- `2026-04-19`: Initial backend documentation created.

---

> This file is kept as the single source of truth for the backend API structure and major component flows. Update it whenever an endpoint, model, or service changes.