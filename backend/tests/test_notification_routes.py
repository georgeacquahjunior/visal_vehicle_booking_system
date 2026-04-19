import pytest
import json
from flask_jwt_extended import create_access_token
from app import db
from app.models.notifications import Notification


class TestNotificationRoutes:
    """Test cases for notification API routes."""

    def test_get_notifications(self, client, test_user):
        """Test getting notifications for a user."""
        with client.application.app_context():
            # Create some test notifications
            notification1 = Notification(
                user_id=test_user.staff_id,
                title='Test Notification 1',
                message='This is test notification 1',
                type='info'
            )
            db.session.add(notification1)
            db.session.commit()  # Commit first one

            import time
            time.sleep(0.01)  # Small delay to ensure different timestamps

            notification2 = Notification(
                user_id=test_user.staff_id,
                title='Test Notification 2',
                message='This is test notification 2',
                type='warning',
                is_read=True
            )
            db.session.add(notification2)
            db.session.commit()  # Commit second one

            # Create access token
            access_token = create_access_token(identity=test_user.staff_id)

            # Get notifications
            response = client.get(
                '/notifications',
                headers={'Authorization': f'Bearer {access_token}'}
            )

            assert response.status_code == 200
            data = json.loads(response.data)
            assert 'notifications' in data
            assert len(data['notifications']) == 2

            # Check that notifications are ordered by created_at desc
            assert data['notifications'][0]['message'] == 'This is test notification 2'
            assert data['notifications'][1]['message'] == 'This is test notification 1'

    def test_get_notifications_empty(self, client, test_user):
        """Test getting notifications when user has none."""
        with client.application.app_context():
            # Create access token
            access_token = create_access_token(identity=test_user.staff_id)

            # Get notifications
            response = client.get(
                '/notifications',
                headers={'Authorization': f'Bearer {access_token}'}
            )

            assert response.status_code == 200
            data = json.loads(response.data)
            assert data['notifications'] == []

    def test_mark_notification_read(self, client, test_user):
        """Test marking a notification as read."""
        with client.application.app_context():
            # Create a test notification
            notification = Notification(
                user_id=test_user.staff_id,
                title='Test Notification',
                message='This is a test notification',
                type='info',
                is_read=False
            )
            db.session.add(notification)
            db.session.commit()

            # Create access token
            access_token = create_access_token(identity=test_user.staff_id)

            # Mark notification as read
            response = client.patch(
                f'/notifications/{notification.id}/read',
                headers={'Authorization': f'Bearer {access_token}'}
            )

            assert response.status_code == 200
            data = json.loads(response.data)
            assert 'Notification marked read' in data['message']

            # Check that notification was marked as read
            updated_notification = Notification.query.get(notification.id)
            assert updated_notification.is_read is True

    def test_mark_notification_read_not_found(self, client, test_user):
        """Test marking a non-existent notification as read."""
        with client.application.app_context():
            # Create access token
            access_token = create_access_token(identity=test_user.staff_id)

            # Try to mark non-existent notification as read
            response = client.patch(
                '/notifications/999/read',
                headers={'Authorization': f'Bearer {access_token}'}
            )

            assert response.status_code == 404
            data = json.loads(response.data)
            assert 'Notification not found' in data['error']

    def test_mark_notification_read_wrong_user(self, client, test_user, test_admin):
        """Test that users can only mark their own notifications as read."""
        with client.application.app_context():
            # Create a notification for admin
            notification = Notification(
                user_id=test_admin.staff_id,
                title='Admin Notification',
                message='This is an admin notification',
                type='info'
            )
            db.session.add(notification)
            db.session.commit()

            # Create access token for regular user
            access_token = create_access_token(identity=test_user.staff_id)

            # Try to mark admin's notification as read
            response = client.patch(
                f'/notifications/{notification.id}/read',
                headers={'Authorization': f'Bearer {access_token}'}
            )

            assert response.status_code == 404
            data = json.loads(response.data)
            assert 'Notification not found' in data['error']

    def test_mark_all_notifications_read(self, client, test_user):
        """Test marking all notifications as read."""
        with client.application.app_context():
            # Create multiple unread notifications
            notification1 = Notification(
                user_id=test_user.staff_id,
                title='Notification 1',
                message='Message 1',
                type='info',
                is_read=False
            )
            notification2 = Notification(
                user_id=test_user.staff_id,
                title='Notification 2',
                message='Message 2',
                type='info',
                is_read=False
            )
            notification3 = Notification(
                user_id=test_user.staff_id,
                title='Notification 3',
                message='Message 3',
                type='info',
                is_read=True  # Already read
            )
            db.session.add(notification1)
            db.session.add(notification2)
            db.session.add(notification3)
            db.session.commit()

            # Create access token
            access_token = create_access_token(identity=test_user.staff_id)

            # Mark all notifications as read
            response = client.patch(
                '/notifications/mark_all_read',
                headers={'Authorization': f'Bearer {access_token}'}
            )

            assert response.status_code == 200

            # Check that all notifications are now read
            notifications = Notification.query.filter_by(user_id=test_user.staff_id).all()
            for notification in notifications:
                assert notification.is_read is True