from flask import current_app
from flask_mail import Message

from app import mail


def send_verification_email(to_email, otp_code):
    """
    Sends an OTP verification email using Flask-Mail.
    Returns True if successful, False otherwise.
    """
    try:
        msg = Message("Verify Your Account - Roastify", recipients=[to_email])

        msg.body = f"""Hello!

Please verify your Roastify account using the following OTP code:
{otp_code}

This code will expire in 5 minutes.
"""
        msg.html = f"""<html>
  <body>
    <h2>Verify Your Account</h2>
    <p>Hello! Please verify your Roastify account using the following OTP code:</p>
    <h1>{otp_code}</h1>
    <p>This code will expire in 5 minutes.</p>
  </body>
</html>
"""
        # Send using the global mail instance
        mail.send(msg)
        return True
    except Exception as e:
        print(f"Error sending email to {to_email}: {e}")
        return False
