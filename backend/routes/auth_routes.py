# backend/routes/auth_routes.py

from flask import Blueprint, request, jsonify
from auth.auth_utils import verify_password, generate_token, ADMIN_USERNAME, ADMIN_PASSWORD_HASH

auth_bp = Blueprint('auth', __name__, url_prefix="/api/admin/auth")

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400
        
    # Check if credentials match
    if username != ADMIN_USERNAME or not verify_password(password, ADMIN_PASSWORD_HASH):
        return jsonify({"error": "Invalid credentials"}), 401
        
    # Generate token
    token = generate_token(username)
    
    return jsonify({
        "token": token,
        "username": username
    })

@auth_bp.route('/verify', methods=['GET'])
def verify_token():
    auth_header = request.headers.get('Authorization')
    
    if not auth_header:
        return jsonify({"valid": False}), 401
        
    try:
        # Extract token
        token_type, token = auth_header.split()
        if token_type.lower() != 'bearer':
            return jsonify({"valid": False}), 401
            
        # Use the validation function from auth_utils
        from ..auth.auth_utils import validate_token
        payload = validate_token(token)
        
        if payload:
            return jsonify({"valid": True, "username": payload.get('sub')})
        else:
            return jsonify({"valid": False}), 401
    except Exception:
        return jsonify({"valid": False}), 401