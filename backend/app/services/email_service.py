from flask_mail import Message
from flask import current_app
from ..extensions import mail
from datetime import datetime
from ..models.bookings import Booking
from ..models.users import User, Roles


def send_booking_notification(user_email, subject, body, is_approved=True, booking_details=None):
    try:
        # Create professional HTML email template
        html_body = _create_email_template(
            body, is_approved, booking_details
        )

        msg = Message(
            subject=subject,
            recipients=[user_email],
            body=body,
            html=html_body
        )
        mail.send(msg)
        current_app.logger.info(f"Email sent successfully to {user_email}")
        return True
    except Exception as e:
        current_app.logger.error(f"Failed to send email to {user_email}: {str(e)}")
        return False


def send_daily_booking_summary():
    """
    Send a daily summary email at 5pm for today's and future bookings.
    """
    
    today = datetime.now().date()

    upcoming_bookings = (
        Booking.query
        .filter(Booking.booking_date >= today)
        .order_by(Booking.booking_date, Booking.start_time)
        .all()
    )

    admin_users = User.query.filter_by(role=Roles.ADMIN).all()
    admin_emails = [admin.email for admin in admin_users if admin.email]

    if not admin_emails:
        current_app.logger.warning("Daily booking summary skipped: no admin email addresses found.")
        return False

    subject = f"Late Booking Summary"
    if not upcoming_bookings:
        body = f"There are no bookings scheduled for {today.strftime('%B %d')} or future dates."
        html_body = _create_summary_email_template(body, [])
    else:
        body = f"The summary below lists all bookings for {today.strftime('%B %d')} and upcoming dates."
        html_body = _create_summary_email_template(body, upcoming_bookings)

    success = True
    for admin_email in admin_emails:
        try:
            msg = Message(
                subject=subject,
                recipients=[admin_email],
                body=body,
                html=html_body
            )
            mail.send(msg)
            current_app.logger.info(f"Daily summary email sent successfully to {admin_email}")
        except Exception as exc:
            current_app.logger.error(
                f"Failed to send daily summary email to {admin_email}: {exc}"
            )
            success = False

    return success


def _create_summary_email_template(body, bookings, summary_date=None):
    """
    Create a modern HTML template for the daily booking summary.
    """
    summary_date = summary_date or "today"
    rows_html = ""

    if bookings:
        for booking in bookings:
            requester = booking.user.full_name if getattr(booking, 'user', None) else booking.user_id
            booking_date = booking.booking_date.strftime("%B %d")
            start_time = booking.start_time.strftime("%I:%M %p").lstrip("0")
            end_time = booking.end_time.strftime("%I:%M %p").lstrip("0")
            rows_html += f"""
                <tr>
                    <td style="padding: 12px 10px; border-bottom: 1px solid #e5e7eb;">{requester}</td>
                    <td style="padding: 12px 10px; border-bottom: 1px solid #e5e7eb;">{booking_date}</td>
                    <td style="padding: 12px 10px; border-bottom: 1px solid #e5e7eb;">{booking.purpose}</td>
                    <td style="padding: 12px 10px; border-bottom: 1px solid #e5e7eb;">{booking.location}</td>
                    <td style="padding: 12px 10px; border-bottom: 1px solid #e5e7eb;">{start_time} - {end_time}</td>
                    <td style="padding: 12px 10px; border-bottom: 1px solid #e5e7eb;">{booking.status}</td>
                </tr>
            """
    else:
        rows_html = "<tr><td colspan=6 style=\"padding: 16px 10px; text-align:center; color:#6b7280;\">No bookings found for today or future dates.</td></tr>"

    html = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Daily Booking Summary</title>
        <style>
            body {{
                margin: 0;
                padding: 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                background-color: #f3f4f6;
                color: #1f2937;
            }}
            .container {{
                max-width: 680px;
                margin: 24px auto;
                background: #ffffff;
                border-radius: 18px;
                overflow: hidden;
                box-shadow: 0 24px 80px rgba(15, 23, 42, 0.08);
            }}
            .hero {{
                padding: 36px 32px;
                background: linear-gradient(135deg, #0f4fff 0%, #7c3aed 100%);
                color: #ffffff;
                text-align: center;
            }}
            .hero h1 {{
                margin: 0 0 12px;
                font-size: 28px;
                letter-spacing: -0.04em;
            }}
            .hero p {{
                margin: 0;
                color: rgba(255, 255, 255, 0.88);
                font-size: 15px;
                line-height: 1.7;
            }}
            .content {{
                padding: 32px;
            }}
            .content p {{
                margin: 0 0 20px;
                font-size: 15px;
                line-height: 1.7;
                color: #475569;
            }}
            .summary-table {{
                width: 100%;
                border-collapse: collapse;
                margin-top: 16px;
            }}
            .summary-table th,
            .summary-table td {{
                text-align: left;
                padding: 14px 12px;
                font-size: 14px;
                color: #334155;
            }}
            .summary-table th {{
                background: #f8fafc;
                color: #0f172a;
                font-weight: 700;
            }}
            .summary-table tr:nth-child(even) {{
                background: #f8fafc;
            }}
            .footer {{
                padding: 24px 32px;
                background: #f8fafc;
                color: #64748b;
                font-size: 13px;
                text-align: center;
            }}
            .footer p {{
                margin: 0;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="hero">
                <h1>Daily Booking Summary</h1>
                <p>{body}</p>
            </div>
            <div class="content">
                <table class="summary-table">
                    <thead>
                        <tr>
                            <th>Requester</th>
                            <th>Date</th>
                            <th>Purpose</th>
                            <th>Location</th>
                            <th>Time</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows_html}
                    </tbody>
                </table>
            </div>
            <div class="footer">
                <p>&copy; 2026 Vehicle Booking System. This email was generated automatically by the daily summary service.</p>
            </div>
        </div>
    </body>
    </html>
    """
    return html


def _create_email_template(body, is_approved=True, booking_details=None):
    """
    Create a professional HTML email template.
    """
    status_color = "#10b981" if is_approved else "#ef4444"
    status_text = "APPROVED" if is_approved else "DECLINED"
    status_bg = "#d1fae5" if is_approved else "#fee2e2"
    icon_emoji = "✓" if is_approved else "✕"
    
    # Build booking details section if provided
    booking_section = ""
    if booking_details:
        booking_section = f"""
        <tr>
            <td style="padding: 24px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
                <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Booking Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 13px; font-weight: 500;">Purpose:</td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 13px; font-weight: 600; text-align: right;">{booking_details.get('purpose', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 13px; font-weight: 500;">Requester:</td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 13px; font-weight: 600; text-align: right;">{booking_details.get('userName', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 13px; font-weight: 500;">Date:</td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 13px; font-weight: 600; text-align: right;">{booking_details.get('date', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 13px; font-weight: 500;">Time:</td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 13px; font-weight: 600; text-align: right;">{booking_details.get('startTime', 'N/A')} - {booking_details.get('endTime', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 13px; font-weight: 500;">Location:</td>
                        <td style="padding: 8px 0; color: #1f2937; font-size: 13px; font-weight: 600; text-align: right;">{booking_details.get('location', 'N/A')}</td>
                    </tr>
                    {f'<tr><td style="padding: 8px 0; color: #6b7280; font-size: 13px; font-weight: 500; vertical-align: top;">Comment:</td><td style="padding: 8px 0; color: #1f2937; font-size: 13px; font-weight: 600; text-align: right;">{booking_details.get("adminComment", "")}</td></tr>' if booking_details.get('adminComment') else ''}
                </table>
            </td>
        </tr>
        """
    
    html = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking {status_text}</title>
        <style>
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #1f2937;
                background-color: #f3f4f6;
                margin: 0;
                padding: 0;
            }}
            .email-container {{
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }}
            .header {{
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 40px 24px;
                text-align: center;
            }}
            .status-badge {{
                display: inline-block;
                background-color: {status_bg};
                color: {status_color};
                padding: 8px 16px;
                border-radius: 6px;
                font-weight: 600;
                font-size: 14px;
                margin-bottom: 16px;
            }}
            .header h1 {{
                margin: 12px 0 0 0;
                font-size: 28px;
                font-weight: 700;
                letter-spacing: -0.5px;
            }}
            .content {{
                padding: 40px 24px;
            }}
            .content p {{
                margin: 0 0 16px 0;
                font-size: 15px;
                line-height: 1.6;
                color: #374151;
            }}
            .content p:last-child {{
                margin-bottom: 0;
            }}
            .cta-button {{
                display: inline-block;
                background-color: {status_color};
                color: white;
                padding: 12px 28px;
                border-radius: 6px;
                text-decoration: none;
                font-weight: 600;
                font-size: 14px;
                margin: 24px 0;
                transition: opacity 0.2s ease;
            }}
            .cta-button:hover {{
                opacity: 0.9;
            }}
            .footer {{
                background-color: #f9fafb;
                color: #6b7280;
                padding: 24px;
                text-align: center;
                font-size: 12px;
                border-top: 1px solid #e5e7eb;
            }}
            .footer p {{
                margin: 0;
            }}
            table {{
                width: 100%;
                border-collapse: collapse;
            }}
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <div class="status-badge">{status_text}</div>
                <h1>BOOKING {status_text}</h1>
            </div>
            <div class="content">
                <p>{body}</p>
            </div>
            {booking_section}
            <div class="footer">
                <p>&copy; 2026 Visal Vehicle Booking System. All rights reserved.</p>
                <p>This is an automated notification. Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return html
