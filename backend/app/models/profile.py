from pydantic import BaseModel
from typing import Optional

class ProfileUpdateRequest(BaseModel):
    college: Optional[str] = None
    degree: Optional[str] = None
    year: Optional[int] = None
    cgpa: Optional[float] = None
    career_goal: Optional[str] = None
    dream_company: Optional[str] = None
    preferred_domain: Optional[str] = None
    experience_level: Optional[str] = None