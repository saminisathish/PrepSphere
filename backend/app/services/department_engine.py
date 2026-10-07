from app.db.mongo import database, users_collection, resumes_collection

skill_passport_collection = database["skill_passport"]
foundation_progress_collection = database["foundation_track_progress"]


async def get_department_overview() -> dict:
    total_students = await users_collection.count_documents({"role": "student"})

    resumes = resumes_collection.find({})
    ats_scores = []
    async for r in resumes:
        ats_scores.append(r.get("ats_score", 0))
    avg_ats = round(sum(ats_scores) / len(ats_scores)) if ats_scores else 0

    total_verified = await skill_passport_collection.count_documents({"status": "verified"})

    # Skill frequency across all resumes, to find common weak/strong skills
    all_skills = {}
    resumes2 = resumes_collection.find({})
    async for r in resumes2:
        for skill in r.get("extracted_skills", []):
            all_skills[skill] = all_skills.get(skill, 0) + 1

    top_skills = sorted(all_skills.items(), key=lambda x: -x[1])[:5]

    students_with_resume = await resumes_collection.count_documents({})
    engagement_percent = round((students_with_resume / total_students) * 100) if total_students else 0

    return {
        "total_students": total_students,
        "average_ats_score": avg_ats,
        "total_verified_skills": total_verified,
        "engagement_percent": engagement_percent,
        "top_skills": [{"skill": s, "count": c} for s, c in top_skills],
    }