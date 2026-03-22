"""
Application configuration using Pydantic Settings.
Reads from .env file automatically.
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "sqlite:///./lexisure.db"

    # JWT Security
    SECRET_KEY: str = "change-this-in-production-secret-key-32chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # AI
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""

    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    # File upload
    UPLOAD_DIR: str = "./app/uploads"
    MAX_FILE_SIZE_MB: int = 20

    @property
    def get_allowed_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
