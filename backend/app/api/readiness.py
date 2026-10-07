from fastapi import APIRouter, Depends, HTTPException
from app.core.dependencies import get_current_user
from app.db.mongo import resumes_collection, database
from app.services.readiness_engine import calculate_readiness
from app.data.foundation_track import FOUNDATION_TRACK_MODULES

router = APIRouter(prefix="/api/readiness", tags=["readiness"])

skill_passport_collection = database["skill_passport"]
foundation_progress_collection = database["foundation_track_progress"]


@router.get("/score")
async def get_readiness_score(current_user: dict = Depends(get_current_user)):
    resume = await resumes_collection.find_one({"user_id": current_user["_id"]})
    if not resume:
        raise HTTPException(status_code=404, detail="Upload a resume first")

    total_skills = len(resume["extracted_skills"])

    verified_count = await skill_passport_collection.count_documents({
        "user_id": current_user["_id"],
        "status": "verified",
    })

    progress_doc = await foundation_progress_collection.find_one({"user_id": current_user["_id"]})
    foundation_modules = []
    for module in FOUNDATION_TRACK_MODULES:
        progress = 0
        if progress_doc and module["id"] in progress_doc.get("modules", {}):
            progress = progress_doc["modules"][module["id"]].get("progress", 0)
        foundation_modules.append({"progress": progress})

    result = await calculate_readiness(
        resume_ats_score=resume["ats_score"],
        total_skills_count=max(total_skills, 1),
        verified_skills_count=verified_count,
        foundation_modules=foundation_modules,
    )

    return result