from flask import Flask, jsonify
from flask_cors import CORS
from app.config import Config
from app.extensions import db
from app.routes import blueprints


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Enable CORS for frontend integration
    CORS(
        app,
        resources={r"/api/*": {"origins": "*"}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    )

    # Init database
    db.init_app(app)

    # Register API blueprints
    for bp in blueprints:
        app.register_blueprint(bp)

    @app.route("/api/health", methods=["GET"])
    def health_check():
        return jsonify({"status": "ok", "app": "Orienteering Management API"})

    return app
