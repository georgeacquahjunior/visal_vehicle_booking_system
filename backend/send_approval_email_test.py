import argparse
from dotenv import load_dotenv
from app import create_app
from app.services.email_service import send_booking_notification

load_dotenv()

app = create_app()


def build_approval_email(full_name, booking_date, start_time, end_time, location, purpose, admin_comment):
    subject = "Booking Approved - Vehicle Booking System"
    body = f"""Dear {full_name},

Your vehicle booking has been approved!

Booking Details:
- Date: {booking_date}
- Time: {start_time} - {end_time}
- Location: {location}
- Purpose: {purpose}
{f'- Admin Comment: {admin_comment}' if admin_comment else ''}

Please ensure you have all necessary documents and follow the booking guidelines.

Best regards,
Vehicle Booking System Admin
"""
    return subject, body


def main():
    parser = argparse.ArgumentParser(description="Send a test approval email using the booking notification template.")
    parser.add_argument("email", help="Recipient email address")
    parser.add_argument("--name", default="Test User", help="Recipient full name")
    parser.add_argument("--date", default="2026-04-18", help="Booking date")
    parser.add_argument("--start", default="10:00", help="Booking start time")
    parser.add_argument("--end", default="12:00", help="Booking end time")
    parser.add_argument("--location", default="Test Location", help="Booking location")
    parser.add_argument("--purpose", default="Test Purpose", help="Booking purpose")
    parser.add_argument("--comment", default="Approved for testing", help="Admin comment to include")
    args = parser.parse_args()

    subject, body = build_approval_email(
        full_name=args.name,
        booking_date=args.date,
        start_time=args.start,
        end_time=args.end,
        location=args.location,
        purpose=args.purpose,
        admin_comment=args.comment,
    )

    with app.app_context():
        print(f"Sending approval email to: {args.email}")
        success = send_booking_notification(args.email, subject, body)
        if success:
            print("✅ Test approval email sent successfully.")
        else:
            print("❌ Failed to send test approval email. Check backend logs and SMTP configuration.")


if __name__ == "__main__":
    main()
