import jwt
from datetime import datetime, timezone, timedelta
from functools import wraps
from flask import request, jsonify, g, current_app


class AdminUser:
    """Admin user representation for authentication purposes. Configured via environment variables."""
    def __init__(self, username: str):
        self.id = 1
        self.username = username
        self.is_admin = True

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
        }


def generate_token(username: str) -> str:
    secret = current_app.config["JWT_SECRET_KEY"]
    expires_delta = current_app.config.get("JWT_ACCESS_TOKEN_EXPIRES", timedelta(hours=8))
    now = datetime.now(timezone.utc)
    payload = {
        "sub": "admin",
        "username": username,
        "is_admin": True,
        "iat": now,
        "exp": now + expires_delta,
    }
    return jwt.encode(payload, secret, algorithm="HS256")


def decode_token(token: str) -> dict | None:
    secret = current_app.config["JWT_SECRET_KEY"]
    try:
        return jwt.decode(token, secret, algorithms=["HS256"])
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None


def get_token_from_header() -> str | None:
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return None
    parts = auth_header.split()
    if len(parts) == 2 and parts[0].lower() == "bearer":
        return parts[1]
    return None


def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = get_token_from_header()
        if not token:
            return jsonify({"error": "Chybí autorizační token (Authorization: Bearer <token>)"}), 401

        payload = decode_token(token)
        if not payload:
            return jsonify({"error": "Neplatný nebo vypršelý token"}), 401

        token_username = payload.get("username")
        admin_username = current_app.config.get("ADMIN_USERNAME", "admin")
        if not token_username or token_username != admin_username:
            return jsonify({"error": "Neplatná autorizace administrátora"}), 401

        g.current_user = AdminUser(username=admin_username)
        return f(*args, **kwargs)

    return decorated_function


def optional_admin(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = get_token_from_header()
        g.current_user = None
        if token:
            payload = decode_token(token)
            if payload:
                token_username = payload.get("username")
                admin_username = current_app.config.get("ADMIN_USERNAME", "admin")
                if token_username and token_username == admin_username:
                    g.current_user = AdminUser(username=admin_username)
        return f(*args, **kwargs)

    return decorated_function
