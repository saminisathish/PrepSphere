import json
import os

from groq import Groq
from app.core.config import GROQ_API_KEY


client = Groq(api_key=GROQ_API_KEY)

# Groq model
# You can override this in your .env file using GROQ_MODEL
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")


def generate_roadmap(
    missing_skills: list[str],
    career_goal: str,
    dream_company: str
) -> dict:

    if not missing_skills:
        return {
            "weekly_plan": [],
            "note": "No missing skills detected — you're already well matched!"
        }

    skills_text = ", ".join(missing_skills)

    prompt = f"""You are a placement preparation planner for a student targeting a {career_goal} role at {dream_company}.

The student is missing these skills:
{skills_text}

Create a week-by-week study roadmap covering ONLY these missing skills, in a sensible learning order (foundational skills first, advanced skills later).

Respond ONLY with valid JSON in this exact format, nothing else, no markdown formatting:

{{
  "weekly_plan": [
    {{
      "week": 1,
      "topic": "skill name",
      "focus": "one short sentence on what to focus on this week"
    }}
  ]
}}

Keep it to a maximum of {len(missing_skills)} weeks, one skill per week.
"""

    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.3,
    )

    raw_content = response.choices[0].message.content.strip()

    # Remove markdown code fences if the model returns them
    if raw_content.startswith("```"):
        lines = raw_content.split("\n")

        # Remove ```json or ```
        lines = lines[1:]

        # Remove closing ```
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]

        raw_content = "\n".join(lines).strip()

    try:
        parsed = json.loads(raw_content)

        # Make sure weekly_plan exists
        if "weekly_plan" not in parsed:
            return {
                "weekly_plan": [],
                "note": "Invalid roadmap response."
            }

        return parsed

    except json.JSONDecodeError:
        return {
            "weekly_plan": [],
            "note": "Could not generate roadmap, please try again."
        }