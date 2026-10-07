async def build_skill_passport(
    resume_skills: list[str],
    roadmap_topics: list[str],
    foundation_modules: list[str],
    passport_entries: dict,
) -> list[dict]:
    """
    Combines all known skills (from resume, roadmap, foundation track) with
    whatever real status we've recorded in the skill_passport collection.
    Any skill with no recorded status defaults to 'discovered'.
    """
    all_skills = set(resume_skills) | set(roadmap_topics) | set(foundation_modules)

    result = []
    for skill in sorted(all_skills):
        status = passport_entries.get(skill, "discovered")
        result.append({"skill_name": skill, "status": status})

    return result