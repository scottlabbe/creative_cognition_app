# backend/auth/auth_middleware.py

from functools import wraps
from flask import request, jsonify
from .auth_utils import validate_token

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return jsonify({"error": "Authorization header is required"}), 401
        
        try:
            # Extract token from "Bearer <token>"
            token_type, token = auth_header.split()
            if token_type.lower() != 'bearer':
                return jsonify({"error": "Invalid authorization format"}), 401
                
            # Validate the token
            payload = validate_token(token)
            if not payload:
                return jsonify({"error": "Invalid or expired token"}), 401
                
            # Add the admin info to the request context
            request.admin = payload
            
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({"error": str(e)}), 401
            
    return decorated_function