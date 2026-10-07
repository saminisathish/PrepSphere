from fastapi import APIRouter, Depends, HTTPException
from app.core.dependencies import get_current_user
from app.db.mongo import resumes_collection, database
from app.services.skill_gap import analyze_skill_gap
from app.services.learning_engine import generate_roadmap
from app.data.foundation_track import FOUNDATION_TRACK_MODULES

router = APIRouter(prefix="/api/placement-hub", tags=["placement-hub"])

roadmaps_collection = database["roadmaps"]
foundation_progress_collection = database["foundation_track_progress"]


@router.get("/roadmap")
async def get_roadmap(current_user: dict = Depends(get_current_user)):
    # Return cached roadmap if one already exists for this user
    existing = await roadmaps_collection.find_one({"user_id": current_user["_id"]})
    if existing:
        return {"weekly_plan": existing["weekly_plan"]}

    resume = await resumes_collection.find_one({"user_id": current_user["_id"]})
    if not resume:
        raise HTTPException(status_code=404, detail="Upload a resume first")

    career_goal = current_user.get("career_goal")
    dream_company = current_user.get("dream_company")
    if not career_goal or not dream_company:
        raise HTTPException(status_code=400, detail="Complete your profile first")

    gap = await analyze_skill_gap(resume["extracted_skills"], career_goal, dream_company)
    missing = gap["company_specific"]["missing_skills"] or gap["generic"]["missing_skills"]

    roadmap = generate_roadmap(missing, career_goal, dream_company)

    await roadmaps_collection.insert_one({
        "user_id": current_user["_id"],
        "weekly_plan": roadmap.get("weekly_plan", []),
    })

    return roadmap


@router.get("/foundation-track")
async def get_foundation_track(current_user: dict = Depends(get_current_user)):
    progress_doc = await foundation_progress_collection.find_one({"user_id": current_user["_id"]})

    modules = []
    for module in FOUNDATION_TRACK_MODULES:
        progress = 0
        verified = False
        if progress_doc and module["id"] in progress_doc.get("modules", {}):
            progress = progress_doc["modules"][module["id"]].get("progress", 0)
            verified = progress_doc["modules"][module["id"]].get("verified", False)
        modules.append({**module, "progress": progress, "verified": verified})

    return {"modules": modules}