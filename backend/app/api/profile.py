from fastapi import APIRouter, Depends
from app.core.dependencies import get_current_user
from app.models.profile import ProfileUpdateRequest
from app.db.mongo import users_collection

router = APIRouter(prefix="/api/profile", tags=["profile"])

@router.get("/me")
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    return {
        "name": current_user.get("name"),
        "email": current_user.get("email"),
        "college": current_user.get("college"),
        "degree": current_user.get("degree"),
        "year": current_user.get("year"),
        "cgpa": current_user.get("cgpa"),
        "career_goal": current_user.get("career_goal"),
        "dream_company": current_user.get("dream_company"),
        "preferred_domain": current_user.get("preferred_domain"),
        "experience_level": current_user.get("experience_level"),
    }

@router.put("/me")
async def update_my_profile(data: ProfileUpdateRequest, current_user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    await users_collection.update_one(
        {"_id": current_user["_id"]},
        {"$set": update_data}
    )
    return {"status": "profile updated"}