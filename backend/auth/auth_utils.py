# backend/auth/auth_utils.py

import jwt as pyjwt
import bcrypt
import datetime
import os
from flask import current_app, request, jsonify
from functools import wraps

# In a production app, this would come from environment variables or a secure config
JWT_SECRET = os.environ.get(
    'SECRET_KEY'
)  # Changed from JWT_SECRET to SECRET_KEY to match what you added
# Admin credentials would also come from environment variables in production
ADMIN_USERNAME = os.environ.get('ADMIN_USERNAME')
ADMIN_PASSWORD_HASH = os.environ.get('ADMIN_PASSWORD_HASH')


def hash_password(plain_password):
    """Generate a bcrypt hash from a plain password."""
    return bcrypt.hashpw(plain_password.encode('utf-8'),
                         bcrypt.gensalt()).decode('utf-8')


def verify_password(plain_password, hashed_password):
    """Verify a password against a hash."""
    return bcrypt.checkpw(plain_password.encode('utf-8'),
                          hashed_password.encode('utf-8'))


def generate_token(username):
    """Generate a JWT token for the admin user."""
    # Reduce token expiration to 4 hours for better security
    expiration = datetime.datetime.now(
        datetime.UTC) + datetime.timedelta(hours=4)

    payload = {
        'sub': username,
        'iat': datetime.datetime.now(datetime.UTC),
        'exp': expiration,
        'role': 'admin',  # Add role claim for additional validation
        'jti':
        os.urandom(8).hex()  # Add unique token ID to prevent replay attacks
    }

    token = pyjwt.encode(payload, JWT_SECRET, algorithm='HS256')
    print(f"Generated token: {token[:20]}...")  # Print first 20 chars
    return token


def validate_token(token):
    """Validate a JWT token."""
    try:
        payload = pyjwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        return payload
    except pyjwt.ExpiredSignatureError:
        return None  # Token has expired
    except pyjwt.InvalidTokenError:
        return None  # Invalid token


print(f"SECRET_KEY exists: {JWT_SECRET is not None}")
print(f"ADMIN_USERNAME exists: {ADMIN_USERNAME is not None}")
print(f"ADMIN_PASSWORD_HASH exists: {ADMIN_PASSWORD_HASH is not None}")
