from app.db.mongo import database

companies_collection = database["companies"]
generic_roles_collection = database["generic_roles"]


async def analyze_skill_gap(student_skills: list[str], career_goal: str, dream_company: str) -> dict:
    student_skills_lower = {s.lower() for s in student_skills}

    generic_doc = await generic_roles_collection.find_one({"role": career_goal})
    generic_required = generic_doc["required_skills"] if generic_doc else []
    generic_missing = [s for s in generic_required if s.lower() not in student_skills_lower]
    generic_matched = [s for s in generic_required if s.lower() in student_skills_lower]

    company_doc = await companies_collection.find_one({"company_name": dream_company})
    if company_doc:
        company_required = company_doc["required_skills"]
        company_role = company_doc["role"]
        company_missing = [s for s in company_required if s.lower() not in student_skills_lower]
        company_matched = [s for s in company_required if s.lower() in student_skills_lower]
        company_found = True
    else:
        company_required = []
        company_role = None
        company_missing = []
        company_matched = []
        company_found = False

    return {
        "generic": {
            "role": career_goal,
            "required_skills": generic_required,
            "matched_skills": generic_matched,
            "missing_skills": generic_missing,
        },
        "company_specific": {
            "company": dream_company,
            "role": company_role,
            "found": company_found,
            "required_skills": company_required,
            "matched_skills": company_matched,
            "missing_skills": company_missing,
        },
    }