from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    # Database
    database_url: Optional[str] = None

    # Security
    secret_key: str = "your-super-secret-key-change-this-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # Application
    app_name: str = "Sweet Shop API"
    app_version: str = "1.0.0"
    debug: bool = True
    host: str = "0.0.0.0"
    port: int = 8000

    # Admin
    admin_email: str = "admin@sweetshop.com"
    admin_password: str = "admin123"

    model_config = {"extra": "ignore", "env_file": ".env"}


def _build_database_url_from_env() -> Optional[str]:
    user = os.environ.get("POSTGRES_USER")
    password = os.environ.get("POSTGRES_PASSWORD")
    db = os.environ.get("POSTGRES_DB")
    host = os.environ.get("POSTGRES_HOST", "db")
    port = os.environ.get("POSTGRES_PORT", "5432")
    if user and password and db:
        return f"postgresql://{user}:{password}@{host}:{port}/{db}"
    return None


# Prefer explicit DATABASE_URL; otherwise build from POSTGRES_* vars
env_db = os.environ.get("DATABASE_URL") or _build_database_url_from_env()
if env_db:
    os.environ["DATABASE_URL"] = env_db

# Instantiate settings (pydantic will load DATABASE_URL from env)
settings = Settings()

# Final fallback: if pydantic didn't pick up database_url, set it from env
if not settings.database_url and os.environ.get("DATABASE_URL"):
    settings.database_url = os.environ.get("DATABASE_URL")
