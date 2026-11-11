import os
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables from .env file in the project root
root_env = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))
if os.path.exists(root_env):
    load_dotenv(root_env)
load_dotenv()


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-orienteering-2026")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt-secret-key-orienteering-2026")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=8)

    # Database
    db_url = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/orienteering")
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)

    # If generic postgresql:// is used and psycopg (v3) is not available, fallback to psycopg2 if present
    if db_url.startswith("postgresql://") and not (
        db_url.startswith("postgresql+psycopg://") or db_url.startswith("postgresql+psycopg2://")
    ):
        try:
            import psycopg  # noqa: F401
        except ImportError:
            try:
                import psycopg2  # noqa: F401
                db_url = db_url.replace("postgresql://", "postgresql+psycopg2://", 1)
            except ImportError:
                pass

    SQLALCHEMY_DATABASE_URI = db_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Default admin credentials
    ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
    ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")
