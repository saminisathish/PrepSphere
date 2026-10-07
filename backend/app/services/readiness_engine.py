async def calculate_readiness(
    resume_ats_score: int,
    total_skills_count: int,
    verified_skills_count: int,
    foundation_modules: list[dict],
) -> dict:
    # Resume component (25%)
    resume_component = resume_ats_score

    # Verified skills component (25%)
    verified_percent = round((verified_skills_count / total_skills_count) * 100) if total_skills_count > 0 else 0

    # Foundation track component (20%)
    foundation_percent = (
        round(sum(m["progress"] for m in foundation_modules) / len(foundation_modules))
        if foundation_modules else 0
    )

    # Interview component (15%) — placeholder until Mock Interview module exists
    interview_percent = 0

    # Consistency component (15%) — placeholder until we track login streaks
    consistency_percent = 50  # neutral baseline for now

    final_score = round(
        (0.25 * resume_component)
        + (0.25 * verified_percent)
        + (0.20 * foundation_percent)
        + (0.15 * interview_percent)
        + (0.15 * consistency_percent)
    )

    return {
        "final_score": final_score,
        "breakdown": {
            "resume_score": resume_component,
            "verified_skills_percent": verified_percent,
            "foundation_percent": foundation_percent,
            "interview_percent": interview_percent,
            "consistency_percent": consistency_percent,
        },
    }