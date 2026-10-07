from fastapi import APIRouter, Depends, HTTPException
from app.core.dependencies import get_current_user
from app.db.mongo import resumes_collection
from app.services.skill_gap import analyze_skill_gap

router = APIRouter(prefix="/api/skill-gap", tags=["skill-gap"])

@router.get("/analyze")
async def get_skill_gap(current_user: dict = Depends(get_current_user)):
    resume = await resumes_collection.find_one({"user_id": current_user["_id"]})
    if not resume:
        raise HTTPException(status_code=404, detail="Upload a resume first")

    career_goal = current_user.get("career_goal")
    dream_company = current_user.get("dream_company")

    if not career_goal or not dream_company:
        raise HTTPException(status_code=400, detail="Complete your profile first")

    result = await analyze_skill_gap(
        student_skills=resume["extracted_skills"],
        career_goal=career_goal,
        dream_company=dream_company,
    )
    return result