from pydantic import BaseModel, EmailStr
from typing import Optional

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[str] = "student"
    admin_code: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str