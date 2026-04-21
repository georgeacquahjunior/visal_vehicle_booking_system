import pytest
import json
from unittest.mock import patch, MagicMock
from flask_jwt_extended import create_access_token
from app import db
from app.models.bookings import Booking
from app.models.notifications import Notification


class TestBookingNotifications:
    """Test cases for booking approval/decline notifications."""

    def test_approve_booking_creates_notification(self, client, test_admin, test_booking):
        """Test that approving a booking creates an in-app notification."""
        with client.application.app_context():
            # Create access token for admin
            access_token = create_access_token(identity=test_admin.staff_id, additional_claims={'role': 'admin'})

            # Approve the booking
            response = client.patch(
                f'/bookings/{test_booking.id}/approve',
                headers={'Authorization': f'Bearer {access_token}'},
                json={'admin_comment': 'Approved for testing'}
            )

            assert response.status_code == 200

            # Check that notification was created
            notification = Notification.query.filter_by(user_id=test_booking.user_id).first()
            assert notification is not None
            assert notification.title == 'Booking Approved'
            assert 'approved' in notification.message
            assert 'Approved for testing' in notification.message
            assert notification.type == 'approved'
            assert notification.booking_id == test_booking.id

            # Check that booking status was updated
            updated_booking = Booking.query.get(test_booking.id)
            assert updated_booking.status == 'Approved'
            assert updated_booking.admin_comment == 'Approved for testing'

    def test_decline_booking_creates_notification(self, client, test_admin, test_booking):
        """Test that declining a booking creates an in-app notification."""
        with client.application.app_context():
            # Create access token for admin
            access_token = create_access_token(identity=test_admin.staff_id, additional_claims={'role': 'admin'})

            # Decline the booking
            response = client.patch(
                f'/bookings/{test_booking.id}/decline',
                headers={'Authorization': f'Bearer {access_token}'},
                json={'admin_comment': 'Declined for testing'}
            )

            assert response.status_code == 200

            # Check that notification was created
            notification = Notification.query.filter_by(user_id=test_booking.user_id).first()
            assert notification is not None
            assert notification.title == 'Booking Declined'
            assert 'declined' in notification.message
            assert 'Declined for testing' in notification.message
            assert notification.type == 'declined'
            assert notification.booking_id == test_booking.id

            # Check that booking status was updated
            updated_booking = Booking.query.get(test_booking.id)
            assert updated_booking.status == 'Declined'
            assert updated_booking.admin_comment == 'Declined for testing'

    @patch('app.routes.bookings.send_booking_notification')
    def test_approve_booking_sends_email(self, mock_send_email, client, test_admin, test_booking):
        """Test that approving a booking sends an email notification."""
        with client.application.app_context():
            # Create access token for admin
            access_token = create_access_token(identity=test_admin.staff_id, additional_claims={'role': 'admin'})

            # Approve the booking
            response = client.patch(
                f'/bookings/{test_booking.id}/approve',
                headers={'Authorization': f'Bearer {access_token}'},
                json={'admin_comment': 'Approved for testing'}
            )

            assert response.status_code == 200

            # Check that email was sent
            mock_send_email.assert_called_once()
            call_args = mock_send_email.call_args
            assert call_args[0][0] == 'test@example.com'  # user_email
            assert 'Booking Approved' in call_args[0][1]  # subject
            assert 'Approved for testing' in call_args[0][2]  # body

    @patch('app.routes.bookings.send_booking_notification')
    def test_decline_booking_sends_email(self, mock_send_email, client, test_admin, test_booking):
        """Test that declining a booking sends an email notification."""
        with client.application.app_context():
            # Create access token for admin
            access_token = create_access_token(identity=test_admin.staff_id, additional_claims={'role': 'admin'})

            # Decline the booking
            response = client.patch(
                f'/bookings/{test_booking.id}/decline',
                headers={'Authorization': f'Bearer {access_token}'},
                json={'admin_comment': 'Declined for testing'}
            )

            assert response.status_code == 200

            # Check that email was sent
            mock_send_email.assert_called_once()
            call_args = mock_send_email.call_args
            assert call_args[0][0] == 'test@example.com'  # user_email
            assert 'Booking Declined' in call_args[0][1]  # subject
            assert 'Declined for testing' in call_args[0][2]  # body

    def test_approve_booking_without_comment(self, client, test_admin, test_booking):
        """Test approving a booking without admin comment."""
        with client.application.app_context():
            # Create access token for admin
            access_token = create_access_token(identity=test_admin.staff_id, additional_claims={'role': 'admin'})

            # Approve the booking without comment
            response = client.patch(
                f'/bookings/{test_booking.id}/approve',
                headers={'Authorization': f'Bearer {access_token}'},
                json={}
            )

            assert response.status_code == 200

            # Check that notification was created without comment
            notification = Notification.query.filter_by(user_id=test_booking.user_id).first()
            assert notification is not None
            assert 'has been approved' in notification.message
            # Should not contain comment since none was provided
            assert 'Comment:' not in notification.message

    def test_decline_booking_without_comment(self, client, test_admin, test_booking):
        """Test declining a booking without admin comment."""
        with client.application.app_context():
            # Create access token for admin
            access_token = create_access_token(identity=test_admin.staff_id, additional_claims={'role': 'admin'})

            # Decline the booking without comment
            response = client.patch(
                f'/bookings/{test_booking.id}/decline',
                headers={'Authorization': f'Bearer {access_token}'},
                json={}
            )

            assert response.status_code == 200

            # Check that notification was created without comment
            notification = Notification.query.filter_by(user_id=test_booking.user_id).first()
            assert notification is not None
            assert 'has been declined' in notification.message
            # Should not contain reason since none was provided
            assert 'Reason:' not in notification.message

    def test_approve_already_approved_booking_fails(self, client, test_admin, test_booking):
        """Test that approving an already approved booking fails."""
        with client.application.app_context():
            # First approve the booking
            access_token = create_access_token(identity=test_admin.staff_id, additional_claims={'role': 'admin'})
            client.patch(
                f'/bookings/{test_booking.id}/approve',
                headers={'Authorization': f'Bearer {access_token}'},
                json={}
            )

            # Try to approve again
            response = client.patch(
                f'/bookings/{test_booking.id}/approve',
                headers={'Authorization': f'Bearer {access_token}'},
                json={}
            )

            assert response.status_code == 400
            data = json.loads(response.data)
            assert 'already Approved' in data['error']

    def test_staff_cannot_approve_booking(self, client, test_user, test_booking):
        """Test that regular staff cannot approve bookings."""
        with client.application.app_context():
            # Create access token for regular staff
            access_token = create_access_token(identity=test_user.staff_id, additional_claims={'role': 'staff'})

            # Try to approve the booking
            response = client.patch(
                f'/bookings/{test_booking.id}/approve',
                headers={'Authorization': f'Bearer {access_token}'},
                json={}
            )

            assert response.status_code == 403
            data = json.loads(response.data)
            assert 'Only admins can approve bookings' in data['error']

    def test_staff_cannot_decline_booking(self, client, test_user, test_booking):
        """Test that regular staff cannot decline bookings."""
        with client.application.app_context():
            # Create access token for regular staff
            access_token = create_access_token(identity=test_user.staff_id, additional_claims={'role': 'staff'})

            # Try to decline the booking
            response = client.patch(
                f'/bookings/{test_booking.id}/decline',
                headers={'Authorization': f'Bearer {access_token}'},
                json={}
            )

            assert response.status_code == 403
            data = json.loads(response.data)
            assert 'Only admins can decline bookings' in data['error']

    def test_decline_already_declined_booking_fails(self, client, test_admin, test_booking):
        """Test that declining an already declined booking fails."""
        with client.application.app_context():
            # First decline the booking
            access_token = create_access_token(identity=test_admin.staff_id, additional_claims={'role': 'admin'})
            client.patch(
                f'/bookings/{test_booking.id}/decline',
                headers={'Authorization': f'Bearer {access_token}'},
                json={}
            )

            # Try to decline again
            response = client.patch(
                f'/bookings/{test_booking.id}/decline',
                headers={'Authorization': f'Bearer {access_token}'},
                json={}
            )

            assert response.status_code == 400
            data = json.loads(response.data)
            assert 'already Declined' in data['error']

    def test_approve_nonexistent_booking_fails(self, client, test_admin):
        """Test that approving a nonexistent booking fails."""
        with client.application.app_context():
            access_token = create_access_token(identity=test_admin.staff_id, additional_claims={'role': 'admin'})

            response = client.patch(
                '/bookings/99999/approve',
                headers={'Authorization': f'Bearer {access_token}'},
                json={}
            )

            assert response.status_code == 404
            data = json.loads(response.data)
            assert 'Booking not found' in data['error']

    def test_decline_nonexistent_booking_fails(self, client, test_admin):
        """Test that declining a nonexistent booking fails."""
        with client.application.app_context():
            access_token = create_access_token(identity=test_admin.staff_id, additional_claims={'role': 'admin'})

            response = client.patch(
                '/bookings/99999/decline',
                headers={'Authorization': f'Bearer {access_token}'},
                json={}
            )

            assert response.status_code == 404
            data = json.loads(response.data)
            assert 'Booking not found' in data['error']

    def test_approve_booking_updates_timestamp(self, client, test_admin, test_booking):
        """Test that approving a booking updates the updated_at timestamp."""
        with client.application.app_context():
            original_updated_at = test_booking.updated_at

            access_token = create_access_token(identity=test_admin.staff_id, additional_claims={'role': 'admin'})

            response = client.patch(
                f'/bookings/{test_booking.id}/approve',
                headers={'Authorization': f'Bearer {access_token}'},
                json={}
            )

            assert response.status_code == 200

            # Check that updated_at was changed
            updated_booking = Booking.query.get(test_booking.id)
            assert updated_booking.updated_at > original_updated_at

    def test_decline_booking_updates_timestamp(self, client, test_admin, test_booking):
        """Test that declining a booking updates the updated_at timestamp."""
        with client.application.app_context():
            original_updated_at = test_booking.updated_at

            access_token = create_access_token(identity=test_admin.staff_id, additional_claims={'role': 'admin'})

            response = client.patch(
                f'/bookings/{test_booking.id}/decline',
                headers={'Authorization': f'Bearer {access_token}'},
                json={}
            )

            assert response.status_code == 200

            # Check that updated_at was changed
            updated_booking = Booking.query.get(test_booking.id)
            assert updated_booking.updated_at > original_updated_at