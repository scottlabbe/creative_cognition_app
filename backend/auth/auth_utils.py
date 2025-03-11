# backend/auth/auth_utils.py

import jwt as pyjwt
import bcrypt
import datetime
import os
from flask import current_app

# In a production app, this would come from environment variables or a secure config
JWT_SECRET = os.environ.get('JWT_SECRET', 'your_jwt_secret_key')
# Admin credentials would also come from environment variables in production
ADMIN_USERNAME = os.environ.get('ADMIN_USERNAME', 'admin')
ADMIN_PASSWORD_HASH = os.environ.get('ADMIN_PASSWORD_HASH', 
                                    bcrypt.hashpw('admin123'.encode('utf-8'), 
                                                  bcrypt.gensalt()).decode('utf-8'))

def verify_password(plain_password, hashed_password):
    """Verify a password against a hash."""
    return bcrypt.checkpw(plain_password.encode('utf-8'), 
                         hashed_password.encode('utf-8'))

def generate_token(username):
    """Generate a JWT token for the admin user."""
    expiration = datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    payload = {
        'sub': username,
        'iat': datetime.datetime.utcnow(),
        'exp': expiration
    }
    token = pyjwt.encode(payload, JWT_SECRET, algorithm='HS256')
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