from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from app.core.dependencies import get_current_user
from app.db.mongo import resumes_collection
from app.services.resume_intelligence import analyze_resume
from datetime import datetime

router = APIRouter(prefix="/api/resume", tags=["resume"])

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    file_bytes = await file.read()
    result = await analyze_resume(file_bytes)

    resume_doc = {
        "user_id": current_user["_id"],
        "raw_text": result["raw_text"],
        "ats_score": result["ats_score"],
        "extracted_skills": result["extracted_skills"],
        "missing_sections": result["missing_sections"],
        "uploaded_at": datetime.utcnow(),
    }

    await resumes_collection.delete_many({"user_id": current_user["_id"]})
    insert_result = await resumes_collection.insert_one(resume_doc)

    return {
        "resume_id": str(insert_result.inserted_id),
        "ats_score": result["ats_score"],
        "extracted_skills": result["extracted_skills"],
        "missing_sections": result["missing_sections"],
    }


@router.get("/me")
async def get_my_resume(current_user: dict = Depends(get_current_user)):
    resume = await resumes_collection.find_one({"user_id": current_user["_id"]})
    if not resume:
        raise HTTPException(status_code=404, detail="No resume uploaded yet")

    return {
        "ats_score": resume["ats_score"],
        "extracted_skills": resume["extracted_skills"],
        "missing_sections": resume["missing_sections"],
        "uploaded_at": resume["uploaded_at"],
    }