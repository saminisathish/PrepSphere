from datetime import datetime

from bson import ObjectId
from bson.errors import InvalidId

from fastapi import APIRouter, Depends, HTTPException
from fastapi.concurrency import run_in_threadpool

from pydantic import BaseModel

from app.core.dependencies import get_current_user
from app.db.mongo import database

from app.services.interview_engine import (
    generate_first_question,
    evaluate_answer_and_get_next,
    generate_final_feedback,
)

from app.services.tavus_service import (
    create_tavus_conversation,
)

from app.data.interview_types import (
    INTERVIEW_TYPES,
    QUESTIONS_PER_INTERVIEW,
)


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/api/interview",
    tags=["interview"],
)


# ============================================================
# DATABASE
# ============================================================

interviews_collection = database["interviews"]

skill_passport_collection = database["skill_passport"]


# ============================================================
# REQUEST MODELS
# ============================================================

class StartInterviewRequest(BaseModel):
    interview_type: str


class AnswerRequest(BaseModel):
    answer: str


class TavusSessionRequest(BaseModel):
    interview_type: str


# ============================================================
# OBJECT ID HELPER
# ============================================================

def get_object_id(interview_id: str) -> ObjectId:

    try:

        return ObjectId(interview_id)

    except (InvalidId, TypeError):

        raise HTTPException(
            status_code=400,
            detail="Invalid interview ID",
        )


# ============================================================
# TAVUS SESSION
# ============================================================

@router.post("/tavus/session")
async def create_tavus_session(
    data: TavusSessionRequest,
    current_user: dict = Depends(get_current_user),
):

    print("\n================================")
    print("TAVUS SESSION ROUTE")
    print("================================")

    print(
        "Interview type:",
        data.interview_type,
    )

    # --------------------------------------------------------
    # Supported interview types
    # --------------------------------------------------------

    valid_types = {
        "technical",
        "hr",
        "communication",
    }

    if data.interview_type not in valid_types:

        raise HTTPException(
            status_code=400,
            detail="Invalid interview type",
        )

    # --------------------------------------------------------
    # Create Tavus conversation
    # --------------------------------------------------------

    try:

        result = await create_tavus_conversation(
            data.interview_type
        )

        print(
            "Tavus result:",
            result,
        )

        return result

    except HTTPException:

        raise

    except Exception as e:

        print(
            "Tavus session error:",
            str(e),
        )

        raise HTTPException(
            status_code=500,
            detail=(
                f"Failed to create Tavus session: {str(e)}"
            ),
        )


# ============================================================
# START INTERVIEW
# ============================================================

@router.post("/start")
async def start_interview(
    data: StartInterviewRequest,
    current_user: dict = Depends(get_current_user),
):

    # --------------------------------------------------------
    # Validate interview type
    # --------------------------------------------------------

    if data.interview_type not in INTERVIEW_TYPES:

        raise HTTPException(
            status_code=400,
            detail="Invalid interview type",
        )

    # --------------------------------------------------------
    # Get verified skills
    # --------------------------------------------------------

    verified_docs = skill_passport_collection.find(
        {
            "user_id": current_user["_id"],
            "status": "verified",
        }
    )

    verified_skills = [
        doc["skill_name"]
        async for doc in verified_docs
    ]

    # --------------------------------------------------------
    # Generate first question using Groq
    # --------------------------------------------------------

    try:

        first_question = await run_in_threadpool(
            generate_first_question,
            data.interview_type,
            verified_skills,
        )

    except Exception as e:

        print(
            "First question generation error:",
            str(e),
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to generate interview question: "
                f"{str(e)}"
            ),
        )

    # --------------------------------------------------------
    # Create transcript
    # --------------------------------------------------------

    now = datetime.utcnow()

    transcript = [
        {
            "speaker": "ai",
            "text": first_question,
            "timestamp": now,
        }
    ]

    # --------------------------------------------------------
    # Save interview
    # --------------------------------------------------------

    result = await interviews_collection.insert_one(
        {
            "user_id": current_user["_id"],
            "type": data.interview_type,
            "transcript": transcript,
            "question_number": 1,
            "feedback": None,
            "conducted_at": now,
        }
    )

    # --------------------------------------------------------
    # Return first question
    # --------------------------------------------------------

    return {
        "interview_id": str(result.inserted_id),
        "question": first_question,
        "question_number": 1,
        "total_questions": QUESTIONS_PER_INTERVIEW,
    }


# ============================================================
# SUBMIT ANSWER
# ============================================================

@router.post("/{interview_id}/answer")
async def submit_answer(
    interview_id: str,
    data: AnswerRequest,
    current_user: dict = Depends(get_current_user),
):

    # --------------------------------------------------------
    # Validate answer
    # --------------------------------------------------------

    answer = data.answer.strip()

    if not answer:

        raise HTTPException(
            status_code=400,
            detail="Answer cannot be empty",
        )

    # --------------------------------------------------------
    # Validate interview ID
    # --------------------------------------------------------

    mongo_interview_id = get_object_id(
        interview_id
    )

    # --------------------------------------------------------
    # Find interview
    # --------------------------------------------------------

    interview = await interviews_collection.find_one(
        {
            "_id": mongo_interview_id,
            "user_id": current_user["_id"],
        }
    )

    if not interview:

        raise HTTPException(
            status_code=404,
            detail="Interview not found",
        )

    # --------------------------------------------------------
    # Check completion
    # --------------------------------------------------------

    if interview.get("feedback") is not None:

        raise HTTPException(
            status_code=400,
            detail="This interview has already been completed",
        )

    # --------------------------------------------------------
    # Get transcript
    # --------------------------------------------------------

    transcript = interview.get(
        "transcript",
        [],
    )

    # --------------------------------------------------------
    # Add candidate answer
    # --------------------------------------------------------

    transcript.append(
        {
            "speaker": "student",
            "text": answer,
            "timestamp": datetime.utcnow(),
        }
    )

    # --------------------------------------------------------
    # Prepare conversation for Groq
    # --------------------------------------------------------

    conversation_history = [
        {
            "role": (
                "ai"
                if turn["speaker"] == "ai"
                else "student"
            ),
            "text": turn["text"],
        }
        for turn in transcript
    ]

    # --------------------------------------------------------
    # Current question number
    # --------------------------------------------------------

    question_number = interview.get(
        "question_number",
        1,
    )

    # --------------------------------------------------------
    # Evaluate answer
    # --------------------------------------------------------

    try:

        result = await run_in_threadpool(
            evaluate_answer_and_get_next,
            interview["type"],
            conversation_history,
            answer,
            question_number,
            QUESTIONS_PER_INTERVIEW,
        )

    except Exception as e:

        print(
            "Answer evaluation error:",
            str(e),
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to evaluate answer: "
                f"{str(e)}"
            ),
        )

    # --------------------------------------------------------
    # Get next question
    # --------------------------------------------------------

    next_question = result.get(
        "next_question"
    )

    # --------------------------------------------------------
    # Check whether interview is finished
    # --------------------------------------------------------

    is_finished = (
        next_question is None
        or question_number >= QUESTIONS_PER_INTERVIEW
    )

    # ========================================================
    # CONTINUE INTERVIEW
    # ========================================================

    if not is_finished and next_question:

        transcript.append(
            {
                "speaker": "ai",
                "text": next_question,
                "timestamp": datetime.utcnow(),
            }
        )

        question_number += 1

        await interviews_collection.update_one(
            {
                "_id": mongo_interview_id,
                "user_id": current_user["_id"],
            },
            {
                "$set": {
                    "transcript": transcript,
                    "question_number": question_number,
                }
            },
        )

        return {
            "evaluation": result.get(
                "evaluation",
                "Answer recorded.",
            ),
            "finished": False,
            "next_question": next_question,
            "question_number": question_number,
            "total_questions": QUESTIONS_PER_INTERVIEW,
        }

    # ========================================================
    # FINAL FEEDBACK
    # ========================================================

    try:

        final_feedback = await run_in_threadpool(
            generate_final_feedback,
            interview["type"],
            conversation_history,
        )

    except Exception as e:

        print(
            "Final feedback error:",
            str(e),
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to generate final feedback: "
                f"{str(e)}"
            ),
        )

    # --------------------------------------------------------
    # Save final feedback
    # --------------------------------------------------------

    await interviews_collection.update_one(
        {
            "_id": mongo_interview_id,
            "user_id": current_user["_id"],
        },
        {
            "$set": {
                "transcript": transcript,
                "question_number": question_number,
                "feedback": final_feedback,
            }
        },
    )

    # --------------------------------------------------------
    # Return final result
    # --------------------------------------------------------

    return {
        "evaluation": result.get(
            "evaluation",
            "Answer recorded.",
        ),
        "finished": True,
        "feedback": final_feedback,
    }


# ============================================================
# GET FEEDBACK
# ============================================================

@router.get("/{interview_id}/feedback")
async def get_feedback(
    interview_id: str,
    current_user: dict = Depends(get_current_user),
):

    # --------------------------------------------------------
    # Validate interview ID
    # --------------------------------------------------------

    mongo_interview_id = get_object_id(
        interview_id
    )

    # --------------------------------------------------------
    # Find interview
    # --------------------------------------------------------

    interview = await interviews_collection.find_one(
        {
            "_id": mongo_interview_id,
            "user_id": current_user["_id"],
        }
    )

    if not interview:

        raise HTTPException(
            status_code=404,
            detail="Interview not found",
        )

    # --------------------------------------------------------
    # Return feedback
    # --------------------------------------------------------

    return {
        "type": interview["type"],
        "transcript": interview.get(
            "transcript",
            [],
        ),
        "feedback": interview.get(
            "feedback"
        ),
    }