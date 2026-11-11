from flask import Blueprint, request, jsonify, g, current_app
from app.auth import generate_token, admin_required, AdminUser

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    username = data.get("username", "").strip()
    password = data.get("password", "")

    if not username or not password:
        return jsonify({"error": "Zadejte uživatelské jméno a heslo"}), 400

    admin_username = current_app.config.get("ADMIN_USERNAME", "admin")
    admin_password = current_app.config.get("ADMIN_PASSWORD", "admin123")

    if username != admin_username or password != admin_password:
        return jsonify({"error": "Neplatné přihlašovací údaje"}), 401

    admin_user = AdminUser(username=admin_username)
    token = generate_token(admin_username)
    return jsonify({
        "message": "Přihlášení úspěšné",
        "token": token,
        "user": admin_user.to_dict(),
    })


@auth_bp.route("/me", methods=["GET"])
@admin_required
def me():
    return jsonify({
        "user": g.current_user.to_dict()
    })
