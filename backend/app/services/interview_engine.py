import json

from groq import Groq

from app.core.config import GROQ_API_KEY, GROQ_MODEL
from app.data.interview_types import INTERVIEW_TYPES


# ---------------------------------------------------------
# GROQ CLIENT
# ---------------------------------------------------------

if not GROQ_API_KEY:
    raise RuntimeError(
        "GROQ_API_KEY is missing. "
        "Check D:\\PrepSphere\\backend\\.env"
    )


client = Groq(
    api_key=GROQ_API_KEY
)


# ---------------------------------------------------------
# HELPER FUNCTION
# ---------------------------------------------------------

def _strip_code_fence(raw_content: str) -> str:
    """
    Removes ```json ... ``` if Groq returns JSON
    inside a code block.
    """

    content = raw_content.strip()

    if content.startswith("```"):
        lines = content.split("\n")[1:]

        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]

        content = "\n".join(lines)

    return content.strip()


# ---------------------------------------------------------
# GET INTERVIEW CONFIG
# ---------------------------------------------------------

def _get_interview_config(interview_type: str) -> dict:
    """
    Returns the configuration for the selected
    interview type.
    """

    config = INTERVIEW_TYPES.get(interview_type)

    if not config:
        raise ValueError(
            f"Invalid interview type: {interview_type}"
        )

    return config


# ---------------------------------------------------------
# GENERATE FIRST QUESTION
# ---------------------------------------------------------

def generate_first_question(
    interview_type: str,
    verified_skills: list[str]
) -> str:

    config = _get_interview_config(interview_type)

    skills_text = (
        ", ".join(verified_skills)
        if verified_skills
        else "general software engineering topics"
    )

    prompt = f"""
{config['system_prompt']}

The candidate has verified knowledge in:

{skills_text}

This is the beginning of the interview.

Ask ONE suitable first interview question.

Rules:
- Ask only one question.
- Keep it clear and concise.
- Do not provide the answer.
- Do not provide explanations.
- Do not ask multiple questions.
- Make the question appropriate for the selected interview type.

Respond with ONLY the question text.
"""

    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.6,
    )

    return response.choices[0].message.content.strip()


# ---------------------------------------------------------
# EVALUATE ANSWER + GENERATE NEXT QUESTION
# ---------------------------------------------------------

def evaluate_answer_and_get_next(
    interview_type: str,
    conversation_history: list[dict],
    latest_answer: str,
    question_number: int,
    total_questions: int
) -> dict:

    config = _get_interview_config(interview_type)

    history_text = "\n".join(
        f"{'Interviewer' if turn['role'] == 'ai' else 'Candidate'}: "
        f"{turn['text']}"
        for turn in conversation_history
    )

    is_last = question_number >= total_questions

    if is_last:

        next_instruction = """
This was the final interview question.

Do not generate another question.
Set "next_question" to null.
"""

    else:

        next_instruction = """
Generate the next interview question.

The next question must:
- Be only ONE question.
- Be relevant to the selected interview type.
- Be different from previous questions.
- Be clear and concise.
- Not reveal the answer.
"""

    prompt = f"""
{config['system_prompt']}

Conversation so far:

{history_text}

Candidate's latest answer:

{latest_answer}

Evaluate the candidate's latest answer.

Give a brief evaluation in 1-2 sentences.

The evaluation should mention:
- whether the answer was correct or appropriate
- whether it was relevant
- what could be improved or was missing

{next_instruction}

Respond ONLY with valid JSON.

Use exactly this structure:

{{
    "evaluation": "brief evaluation of the candidate answer",
    "next_question": "next interview question or null"
}}
"""

    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.5,
    )

    raw_content = _strip_code_fence(
        response.choices[0].message.content
    )

    try:

        parsed = json.loads(raw_content)

        evaluation = parsed.get(
            "evaluation",
            "Answer recorded."
        )

        next_question = parsed.get(
            "next_question"
        )

        # Final question should never have another question
        if is_last:
            next_question = None

        return {
            "evaluation": evaluation,
            "next_question": next_question,
        }

    except json.JSONDecodeError:

        return {
            "evaluation": "Answer recorded.",
            "next_question": None,
        }


# ---------------------------------------------------------
# GENERATE FINAL INTERVIEW FEEDBACK
# ---------------------------------------------------------

def generate_final_feedback(
    interview_type: str,
    conversation_history: list[dict]
) -> dict:

    config = _get_interview_config(interview_type)

    history_text = "\n".join(
        f"{'Interviewer' if turn['role'] == 'ai' else 'Candidate'}: "
        f"{turn['text']}"
        for turn in conversation_history
    )

    prompt = f"""
You are evaluating a completed {config['label']}.

Review the complete interview transcript below:

{history_text}

Provide a final assessment of the candidate.

Consider the requirements of this interview type:

{config['system_prompt']}

Score the candidate from 0 to 100 for:

1. Technical correctness
2. Communication
3. Confidence

For a Communication Interview, focus more strongly on:
- clarity
- fluency
- grammar
- confidence
- ability to express ideas

For an HR Interview, focus more strongly on:
- relevance
- professionalism
- confidence
- communication
- behavioral responses

For a Technical Interview, focus more strongly on:
- technical correctness
- problem solving
- understanding of concepts
- communication

Also provide exactly 3 useful improvement tips.

Respond ONLY with valid JSON.

Use exactly this structure:

{{
    "technical_correctness": 0,
    "communication_score": 0,
    "confidence_score": 0,
    "improvement_tips": [
        "tip 1",
        "tip 2",
        "tip 3"
    ]
}}
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

    raw_content = _strip_code_fence(
        response.choices[0].message.content
    )

    try:

        parsed = json.loads(raw_content)

        return {
            "technical_correctness": int(
                parsed.get("technical_correctness", 50)
            ),
            "communication_score": int(
                parsed.get("communication_score", 50)
            ),
            "confidence_score": int(
                parsed.get("confidence_score", 50)
            ),
            "improvement_tips": parsed.get(
                "improvement_tips",
                [
                    "Improve the clarity of your answers.",
                    "Give more specific examples.",
                    "Practice answering interview questions confidently."
                ]
            ),
        }

    except (json.JSONDecodeError, ValueError, TypeError):

        return {
            "technical_correctness": 50,
            "communication_score": 50,
            "confidence_score": 50,
            "improvement_tips": [
                "Improve the clarity of your answers.",
                "Give more specific examples.",
                "Practice answering interview questions confidently."
            ],
        }