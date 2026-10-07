import asyncio
from app.db.mongo import database
from app.data.skills_list import KNOWN_SKILLS
from app.data.company_requirements import COMPANY_REQUIREMENTS, GENERIC_ROLE_SKILLS

skills_collection = database["skills"]
companies_collection = database["companies"]
generic_roles_collection = database["generic_roles"]


async def seed():
    existing_skills = await skills_collection.count_documents({})
    if existing_skills == 0:
        await skills_collection.insert_many([{"skill_name": s} for s in KNOWN_SKILLS])
        print(f"Seeded {len(KNOWN_SKILLS)} skills")
    else:
        print("Skills already seeded, skipping")

    existing_companies = await companies_collection.count_documents({})
    if existing_companies == 0:
        docs = [
            {"company_name": name, "role": data["role"], "required_skills": data["required_skills"]}
            for name, data in COMPANY_REQUIREMENTS.items()
        ]
        await companies_collection.insert_many(docs)
        print(f"Seeded {len(docs)} companies")
    else:
        print("Companies already seeded, skipping")

    existing_roles = await generic_roles_collection.count_documents({})
    if existing_roles == 0:
        docs = [{"role": role, "required_skills": skills} for role, skills in GENERIC_ROLE_SKILLS.items()]
        await generic_roles_collection.insert_many(docs)
        print(f"Seeded {len(docs)} generic roles")
    else:
        print("Generic roles already seeded, skipping")


if __name__ == "__main__":
    asyncio.run(seed())