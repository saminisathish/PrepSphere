import os

import httpx
from dotenv import load_dotenv
from fastapi import HTTPException


# ============================================================
# LOAD ENVIRONMENT VARIABLES
# ============================================================

load_dotenv(override=True)


# ============================================================
# TAVUS API
# ============================================================

TAVUS_API_URL = "https://tavusapi.com/v2/conversations"


# ============================================================
# TAVUS SETTINGS
# ============================================================

def tavus_enabled() -> bool:
    """
    Safety switch.

    If TAVUS_ENABLED=true in .env:
        Tavus is enabled.

    If missing:
        Tavus stays disabled.
    """

    return os.getenv(
        "TAVUS_ENABLED",
        "false",
    ).strip().lower() == "true"


def tavus_test_mode() -> bool:
    """
    Test mode is safe by default.

    Set TAVUS_TEST_MODE=false
    only when you want a real Tavus conversation.
    """

    return os.getenv(
        "TAVUS_TEST_MODE",
        "true",
    ).strip().lower() == "true"


# ============================================================
# FALLBACK RESPONSE
# ============================================================

def fallback_response(
    interview_type: str,
    message: str,
):
    return {
        "success": False,
        "available": False,
        "fallback": True,
        "message": message,
        "interview_type": interview_type,
        "conversation_id": None,
        "conversation_url": None,
        "status": None,
        "test_mode": tavus_test_mode(),
    }


# ============================================================
# CREATE TAVUS CONVERSATION
# ============================================================

async def create_tavus_conversation(
    interview_type: str,
):

    print("\n==============================")
    print("TAVUS SESSION REQUEST")
    print("==============================")

    print(
        "Interview type:",
        interview_type,
    )

    print(
        "Tavus enabled:",
        tavus_enabled(),
    )

    print(
        "Tavus test mode:",
        tavus_test_mode(),
    )


    # ========================================================
    # SAFETY SWITCH
    # ========================================================

    if not tavus_enabled():

        print("Tavus is disabled.")

        return fallback_response(
            interview_type,
            "Tavus is currently disabled.",
        )


    # ========================================================
    # ENVIRONMENT VARIABLES
    # ========================================================

    api_key = os.getenv(
        "TAVUS_API_KEY",
    )

    pal_id = os.getenv(
        "TAVUS_PAL_ID",
    )


    if not api_key:

        raise HTTPException(
            status_code=500,
            detail=(
                "TAVUS_API_KEY is not configured "
                "in backend .env"
            ),
        )


    if not pal_id:

        raise HTTPException(
            status_code=500,
            detail=(
                "TAVUS_PAL_ID is not configured "
                "in backend .env"
            ),
        )


    # ========================================================
    # INTERVIEW TYPES
    # ========================================================

    interview_types = {
        "technical": "Technical Interview",
        "hr": "HR Interview",
        "communication": "Communication Interview",
    }


    if interview_type not in interview_types:

        raise HTTPException(
            status_code=400,
            detail="Invalid interview type.",
        )


    interview_name = interview_types[
        interview_type
    ]


    # ========================================================
    # CONVERSATIONAL CONTEXT
    # ========================================================

    contexts = {

        "technical": """
You are the Technical AI Interviewer for PrepSphere.

Conduct a professional college placement mock interview.

Ask questions about programming, Python, Java,
data structures, algorithms, DBMS, SQL, software
engineering, web development, machine learning,
artificial intelligence, projects and technical skills.

Ask only ONE question at a time.

Wait for the candidate to finish answering before
asking the next question.

Do not ask multiple questions at once.

Do not reveal the expected answer before the candidate
responds.

Keep the interview professional, realistic,
friendly and encouraging.

Conduct approximately 5 questions.
""",

        "hr": """
You are the HR AI Interviewer for PrepSphere.

Conduct a professional college placement HR interview.

Ask questions about self introduction, strengths,
weaknesses, career goals, motivation, teamwork,
leadership, adaptability, problem solving,
conflict management and workplace situations.

Ask only ONE question at a time.

Wait for the candidate to finish answering before
asking the next question.

Do not ask multiple questions at once.

Keep the interview professional, realistic,
friendly and encouraging.

Conduct approximately 5 questions.
""",

        "communication": """
You are the Communication AI Interviewer for PrepSphere.

Conduct a professional communication assessment.

Evaluate English communication, clarity, fluency,
confidence, grammar, vocabulary, sentence formation,
professional expression and ability to explain ideas.

Ask simple interview-style questions.

Ask only ONE question at a time.

Wait for the candidate to finish answering before
asking the next question.

Do not ask multiple questions at once.

Keep the interview professional, friendly and encouraging.

Conduct approximately 5 questions.
""",
    }


    # ========================================================
    # PAYLOAD
    # ========================================================

    payload = {
        "pal_id": pal_id,

        "conversation_name": (
            f"PrepSphere {interview_name}"
        ),

        "conversational_context": (
            contexts[interview_type]
        ),

        "test_mode": tavus_test_mode(),
    }


    # ========================================================
    # HEADERS
    # ========================================================

    headers = {
        "Content-Type": "application/json",
        "x-api-key": api_key,
    }


    # ========================================================
    # DEBUG INFORMATION
    # ========================================================

    print(
        "PAL ID:",
        pal_id,
    )

    print(
        "Test mode:",
        tavus_test_mode(),
    )

    # NEVER print the API key.


    # ========================================================
    # API REQUEST
    # ========================================================

    try:

        async with httpx.AsyncClient(
            timeout=httpx.Timeout(
                30.0,
                connect=10.0,
            )
        ) as client:

            response = await client.post(
                TAVUS_API_URL,
                headers=headers,
                json=payload,
            )


        print(
            "Tavus HTTP status:",
            response.status_code,
        )


        # ====================================================
        # SUCCESS
        # ====================================================

        if response.is_success:

            try:

                data = response.json()

            except ValueError:

                print(
                    "Tavus returned invalid JSON."
                )

                return fallback_response(
                    interview_type,
                    "Tavus returned an invalid response.",
                )


            conversation_id = data.get(
                "conversation_id"
            )

            conversation_url = data.get(
                "conversation_url"
            )

            status = data.get(
                "status"
            )


            print(
                "Conversation ID:",
                conversation_id,
            )

            print(
                "Conversation URL:",
                conversation_url,
            )

            print(
                "Status:",
                status,
            )


            if not conversation_url:

                return fallback_response(
                    interview_type,
                    "Tavus did not return a conversation URL.",
                )


            return {
                "success": True,
                "available": True,
                "fallback": False,

                "conversation_id":
                    conversation_id,

                "conversation_url":
                    conversation_url,

                "status":
                    status,

                "interview_type":
                    interview_type,

                "test_mode":
                    tavus_test_mode(),
            }


        # ====================================================
        # CREDIT / PAYMENT LIMIT
        # ====================================================

        if response.status_code == 402:

            print(
                "Tavus credit/payment limit reached."
            )

            return fallback_response(
                interview_type,
                "Tavus usage or credit limit reached.",
            )


        # ====================================================
        # AUTHORIZATION ERROR
        # ====================================================

        if response.status_code in (401, 403):

            print(
                "Tavus authentication/authorization error."
            )

            return fallback_response(
                interview_type,
                "Tavus API key is invalid or unauthorized.",
            )


        # ====================================================
        # RATE LIMIT
        # ====================================================

        if response.status_code == 429:

            print(
                "Tavus rate limit reached."
            )

            return fallback_response(
                interview_type,
                "Tavus rate limit reached. Please try again later.",
            )


        # ====================================================
        # OTHER API ERROR
        # ====================================================

        print(
            "Tavus API error:",
            response.text,
        )

        return fallback_response(
            interview_type,
            (
                f"Tavus API returned "
                f"HTTP {response.status_code}."
            ),
        )


    # ========================================================
    # NETWORK ERROR
    # ========================================================

    except httpx.RequestError as e:

        print(
            "Tavus network error:",
            str(e),
        )

        return fallback_response(
            interview_type,
            "Unable to connect to Tavus.",
        )


    # ========================================================
    # UNEXPECTED ERROR
    # ========================================================

    except Exception as e:

        print(
            "Tavus unexpected error:",
            str(e),
        )

        return fallback_response(
            interview_type,
            "Unexpected Tavus error.",
        )