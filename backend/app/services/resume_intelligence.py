import fitz  # PyMuPDF
from app.db.mongo import database

skills_collection = database["skills"]


async def get_known_skills() -> list[str]:
    skills = []
    async for doc in skills_collection.find({}):
        skills.append(doc["skill_name"])
    return skills


def extract_text_from_pdf(file_bytes: bytes) -> str:
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    doc.close()
    return text


def extract_skills(text: str, known_skills: list[str]) -> list[str]:
    text_lower = text.lower()
    found_skills = []
    for skill in known_skills:
        if skill.lower() in text_lower:
            found_skills.append(skill)
    return found_skills


def calculate_ats_score(text: str, found_skills: list[str]) -> int:
    score = 0
    if len(text) > 500:
        score += 20
    if len(found_skills) >= 5:
        score += 30
    elif len(found_skills) >= 2:
        score += 15
    section_keywords = ["experience", "education", "project", "skill"]
    sections_found = sum(1 for kw in section_keywords if kw in text.lower())
    score += sections_found * 10
    return min(score, 100)


def find_missing_sections(text: str) -> list[str]:
    text_lower = text.lower()
    required_sections = ["experience", "education", "project", "skill", "certification"]
    missing = [s.capitalize() for s in required_sections if s not in text_lower]
    return missing


async def analyze_resume(file_bytes: bytes) -> dict:
    text = extract_text_from_pdf(file_bytes)
    known_skills = await get_known_skills()
    skills = extract_skills(text, known_skills)
    ats_score = calculate_ats_score(text, skills)
    missing_sections = find_missing_sections(text)

    return {
        "raw_text": text,
        "extracted_skills": skills,
        "ats_score": ats_score,
        "missing_sections": missing_sections,
    }