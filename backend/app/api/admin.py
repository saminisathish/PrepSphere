from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.core.dependencies import require_admin
from app.db.mongo import database
from app.data.quiz_bank import QUIZ_BANK

router = APIRouter(prefix="/api/admin", tags=["admin"])

skills_collection = database["skills"]
companies_collection = database["companies"]


class NewCompanyRequirement(BaseModel):
    company_name: str
    role: str
    required_skills: list[str]


class NewSkill(BaseModel):
    skill_name: str


@router.get("/overview")
async def get_admin_overview(current_user: dict = Depends(require_admin)):
    total_skills = await skills_collection.count_documents({})
    total_companies = await companies_collection.count_documents({})

    return {
        "built_in_companies": total_companies,
        "custom_companies_added": 0,
        "built_in_skills": total_skills,
        "custom_skills_added": 0,
        "quiz_topics": len(QUIZ_BANK),
    }


@router.get("/companies")
async def list_companies(current_user: dict = Depends(require_admin)):
    companies = []
    async for doc in companies_collection.find({}):
        companies.append({
            "company_name": doc["company_name"],
            "role": doc["role"],
            "required_skills": doc["required_skills"],
            "source": "database",
        })
    return {"companies": companies}


@router.post("/companies")
async def add_company(data: NewCompanyRequirement, current_user: dict = Depends(require_admin)):
    existing = await companies_collection.find_one({"company_name": data.company_name})
    if existing:
        raise HTTPException(status_code=400, detail="This company already exists")

    await companies_collection.insert_one({
        "company_name": data.company_name,
        "role": data.role,
        "required_skills": data.required_skills,
    })
    return {"status": "company added"}


@router.get("/skills")
async def list_skills(current_user: dict = Depends(require_admin)):
    skills = []
    async for doc in skills_collection.find({}):
        skills.append(doc["skill_name"])
    return {"built_in_skills": skills, "custom_skills": []}


@router.post("/skills")
async def add_skill(data: NewSkill, current_user: dict = Depends(require_admin)):
    existing = await skills_collection.find_one({"skill_name": data.skill_name})
    if existing:
        raise HTTPException(status_code=400, detail="This skill already exists")

    await skills_collection.insert_one({"skill_name": data.skill_name})
    return {"status": "skill added"}