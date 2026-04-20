"""
Quick test to verify email service functionality.
Run with: python test_email_manual.py
"""
from flask import Flask
from flask_mail import Mail, Message
from config import Config

# Setup minimal Flask app using Config
app = Flask(__name__)
app.config.from_object(Config)

mail = Mail(app)

def test_email_configuration():
    """Test email configuration."""
    print("Testing Email Configuration...")
    print(f"MAIL_SERVER: {app.config['MAIL_SERVER']}")
    print(f"MAIL_PORT: {app.config['MAIL_PORT']}")
    print(f"MAIL_USE_TLS: {app.config['MAIL_USE_TLS']}")
    print(f"MAIL_USERNAME: {app.config['MAIL_USERNAME']}")
    print(f"MAIL_DEFAULT_SENDER: {app.config['MAIL_DEFAULT_SENDER']}")
    
    if not app.config['MAIL_USERNAME'] or not app.config['MAIL_PASSWORD']:
        print("\n❌ Email credentials not configured!")
        print("Please check the Config class in config.py for MAIL_USERNAME and MAIL_PASSWORD.")
        return False
    
    print("\n✓ Email is properly configured!")
    return True

def test_send_test_email():
    """Test sending an actual email."""
    print("\nTesting email sending...")
    
    test_email = 'test@example.com'
    
    with app.app_context():
        try:
            msg = Message(
                subject='Test Email from Vehicle Booking System',
                recipients=[test_email],
                body='This is a test email to verify the email service is working correctly.'
            )
            mail.send(msg)
            print(f"✓ Test email sent successfully to {test_email}!")
            return True
        except Exception as e:
            print(f"❌ Failed to send email: {str(e)}")
            return False

if __name__ == "__main__":
    # Test configuration
    if test_email_configuration():
        # Try to send test email
        test_send_test_email()
    else:
        print("\n⚠️  Skipping send test - email not configured")
