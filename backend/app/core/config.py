import os
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(
            os.path.abspath(__file__)
        )
    )
)

ENV_FILE = os.path.join(BASE_DIR, ".env")

load_dotenv(ENV_FILE, override=True)


# -----------------------------
# MongoDB
# -----------------------------

MONGO_URI = os.getenv(
    "MONGO_URI",
    "mongodb://localhost:27017"
)

DATABASE_NAME = os.getenv(
    "DATABASE_NAME",
    "prepsphere"
)


# -----------------------------
# JWT Authentication
# -----------------------------

JWT_SECRET_KEY = os.getenv(
    "JWT_SECRET_KEY",
    "your-new-random-secret"
)

JWT_ALGORITHM = os.getenv(
    "JWT_ALGORITHM",
    "HS256"
)

ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv(
        "ACCESS_TOKEN_EXPIRE_MINUTES",
        "60"
    )
)


# -----------------------------
# Groq
# -----------------------------

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

GROQ_MODEL = os.getenv(
    "GROQ_MODEL",
    "openai/gpt-oss-120b"
)


# -----------------------------
# Admin
# -----------------------------

ADMIN_SIGNUP_CODE = os.getenv(
    "ADMIN_SIGNUP_CODE"
)


# -----------------------------
# LiveAvatar
# -----------------------------

LIVEAVATAR_API_KEY = os.getenv(
    "LIVEAVATAR_API_KEY"
)

LIVEAVATAR_AVATAR_ID = os.getenv(
    "LIVEAVATAR_AVATAR_ID"
)

LIVEAVATAR_IS_SANDBOX = (
    os.getenv(
        "LIVEAVATAR_IS_SANDBOX",
        "false"
    ).lower()
    == "true"
)