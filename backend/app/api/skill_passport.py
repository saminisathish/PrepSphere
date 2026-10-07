from fastapi import APIRouter, Depends, HTTPException
from app.core.dependencies import get_current_user
from app.db.mongo import resumes_collection, database
from app.services.skill_passport_engine import build_skill_passport
from app.data.foundation_track import FOUNDATION_TRACK_MODULES

router = APIRouter(prefix="/api/skill-passport", tags=["skill-passport"])

roadmaps_collection = database["roadmaps"]
skill_passport_collection = database["skill_passport"]


@router.get("")
async def get_skill_passport(current_user: dict = Depends(get_current_user)):
    resume = await resumes_collection.find_one({"user_id": current_user["_id"]})
    if not resume:
        raise HTTPException(status_code=404, detail="Upload a resume first")

    resume_skills = resume["extracted_skills"]

    roadmap = await roadmaps_collection.find_one({"user_id": current_user["_id"]})
    roadmap_topics = [w["topic"] for w in roadmap["weekly_plan"]] if roadmap else []

    foundation_names = [m["name"] for m in FOUNDATION_TRACK_MODULES]

    passport_docs = skill_passport_collection.find({"user_id": current_user["_id"]})
    passport_entries = {}
    async for doc in passport_docs:
        passport_entries[doc["skill_name"]] = doc["status"]

    passport = await build_skill_passport(
        resume_skills=resume_skills,
        roadmap_topics=roadmap_topics,
        foundation_modules=foundation_names,
        passport_entries=passport_entries,
    )

    verified_count = sum(1 for p in passport if p["status"] == "verified")

    return {"skills": passport, "verified_count": verified_count, "total_count": len(passport)}