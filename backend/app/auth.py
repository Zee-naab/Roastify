from flask import Blueprint, request, jsonify
from app.models import create_user, create_otp, verify_user_otp, verify_password
from app.utils.email import send_verification_email
import jwt as pyjwt
import datetime
import os

auth_bp = Blueprint('auth', __name__)
SECRET_KEY = os.environ.get('SECRET_KEY', 'roastify-secret')


@auth_bp.route('/send-otp', methods=['POST'])
def send_otp():
    """Works for both new and existing users — sends OTP via email."""
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({'error': 'Email is required'}), 400

    # Create user if not exists (ignore if already registered)
    create_user(email, 'roastify-otp-user')

    # Always generate and send OTP
    otp_code = create_otp(email)
    email_sent = send_verification_email(email, otp_code)

    if not email_sent:
        return jsonify({'error': 'Failed to send OTP email. Please try again.'}), 500

    return jsonify({'message': 'OTP sent successfully! Check your email.'}), 200


@auth_bp.route('/login', methods=['POST'])
def login():
    """Authenticates existing user with email and password, returning JWT."""
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400
        
    if verify_password(email, password):
        token = pyjwt.encode(
            {'email': email, 'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)},
            SECRET_KEY,
            algorithm='HS256'
        )
        return jsonify({'token': token, 'email': email}), 200
    else:
        return jsonify({'error': 'Invalid email or password.'}), 401


@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    """Verifies the OTP and returns a JWT token on success."""
    data = request.get_json()
    email = data.get('email')
    code = data.get('otp')

    if not email or not code:
        return jsonify({'error': 'Email and OTP code are required'}), 400

    is_valid = verify_user_otp(email, code)

    if is_valid:
        token = pyjwt.encode(
            {'email': email, 'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)},
            SECRET_KEY,
            algorithm='HS256'
        )
        return jsonify({'token': token, 'email': email}), 200
    else:
        return jsonify({'error': 'Invalid or expired OTP. Please try again.'}), 400


@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400

    # 1. Create the user (this handles hashing the password)
    # create_user will return None if the user already exists
    user_id = create_user(email, password)
    
    if not user_id:
        return jsonify({'error': 'User already exists'}), 409

    # Generate OTP and send email
    otp_code = create_otp(email)
    email_sent = send_verification_email(email, otp_code)

    if not email_sent:
        return jsonify({'error': 'User created but failed to send verification email.'}), 500

    return jsonify({'message': 'User created successfully! Please check your email for the OTP.'}), 201

@auth_bp.route('/verify', methods=['POST'])
def verify():
    data = request.get_json()
    email = data.get('email')
    code = data.get('code')

    if not email or not code:
        return jsonify({'error': 'Email and OTP code required'}), 400

    is_valid = verify_user_otp(email, code)

    if is_valid:
        return jsonify({'message': 'Email verified successfully!'}), 200
    else:
        return jsonify({'error': 'Invalid or expired OTP.'}), 400
