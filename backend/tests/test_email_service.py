import logging
from datetime import date, time
import pytest
from unittest.mock import patch
from app.services.email_service import send_booking_notification, send_daily_booking_summary
from app.models.bookings import Booking


class TestEmailService:
    """Test cases for email notification service."""

    @patch('app.services.email_service.mail')
    def test_send_booking_notification_success(self, mock_mail, app):
        """Test successful email sending."""
        with app.app_context():
            # Mock the mail.send method
            mock_mail.send.return_value = None

            result = send_booking_notification(
                user_email='test@example.com',
                subject='Test Subject',
                body='Test Body'
            )

            assert result is True
            mock_mail.send.assert_called_once()

            # Check the message that was sent
            call_args = mock_mail.send.call_args[0][0]
            assert call_args.subject == 'Test Subject'
            assert call_args.recipients == ['test@example.com']
            assert call_args.body == 'Test Body'

    @patch('app.services.email_service.mail')
    def test_send_booking_notification_failure(self, mock_mail, app):
        """Test email sending failure."""
        with app.app_context():
            # Mock the mail.send method to raise an exception
            mock_mail.send.side_effect = Exception("SMTP Error")

            result = send_booking_notification(
                user_email='test@example.com',
                subject='Test Subject',
                body='Test Body'
            )

            assert result is False
            mock_mail.send.assert_called_once()

    @patch('app.services.email_service.mail')
    def test_send_booking_notification_with_app_logger(self, mock_mail, app, caplog):
        """Test that logging works correctly."""
        caplog.set_level(logging.INFO)
        with app.app_context():
            # Mock successful send
            mock_mail.send.return_value = None

            result = send_booking_notification(
                user_email='test@example.com',
                subject='Test Subject',
                body='Test Body'
            )

            assert result is True
            assert "Email sent successfully to test@example.com" in caplog.text

    @patch('app.services.email_service.mail')
    def test_send_booking_notification_error_logging(self, mock_mail, app, caplog):
        """Test that error logging works correctly."""
        caplog.set_level(logging.ERROR)
        with app.app_context():
            # Mock failed send
            mock_mail.send.side_effect = Exception("SMTP Error")

            result = send_booking_notification(
                user_email='test@example.com',
                subject='Test Subject',
                body='Test Body'
            )

            assert result is False
            assert "Failed to send email to test@example.com" in caplog.text
            assert "SMTP Error" in caplog.text

    @patch('app.services.email_service.mail')
    def test_send_daily_booking_summary(self, mock_mail, app, test_admin):
        """Test the daily late booking summary sends email to admins."""
        with app.app_context():
            mock_mail.send.return_value = None

            booking = Booking(
                user_id=test_admin.staff_id,
                booking_date=date.today(),
                start_time=time(17, 30),
                end_time=time(18, 30),
                location='Office',
                purpose='Evening site visit',
                status='Pending'
            )
            from app.extensions import db
            db.session.add(booking)
            db.session.commit()

            result = send_daily_booking_summary()

            assert result is True
            assert mock_mail.send.call_count == 1
            call_args = mock_mail.send.call_args[0][0]
            assert 'Late Booking Summary' in call_args.subject
            assert 'Evening site visit' in call_args.html
