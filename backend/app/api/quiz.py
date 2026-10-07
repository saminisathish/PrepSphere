from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.core.dependencies import get_current_user
from app.db.mongo import database
from app.data.quiz_bank import QUIZ_BANK, DEFAULT_QUIZ
from app.services.verification_engine import get_next_difficulty, is_verified

router = APIRouter(prefix="/api/quiz", tags=["quiz"])

quiz_attempts_collection = database["quiz_attempts"]
skill_passport_collection = database["skill_passport"]
foundation_progress_collection = database["foundation_track_progress"]


class QuizSubmission(BaseModel):
    skill_name: str
    difficulty: str
    answers: list[int]  # index of the option the student chose, per question


@router.get("/{skill_name}")
async def get_quiz(skill_name: str, difficulty: str = "easy", current_user: dict = Depends(get_current_user)):
    bank = QUIZ_BANK.get(skill_name, DEFAULT_QUIZ)
    questions = bank.get(difficulty, [])
    if not questions:
        questions = bank.get("easy", DEFAULT_QUIZ["easy"])
        difficulty = "easy"

    # Don't send the correct answer to the frontend
    safe_questions = [{"question": q["question"], "options": q["options"]} for q in questions]

    return {"skill_name": skill_name, "difficulty": difficulty, "questions": safe_questions}


@router.post("/submit")
async def submit_quiz(data: QuizSubmission, current_user: dict = Depends(get_current_user)):
    bank = QUIZ_BANK.get(data.skill_name, DEFAULT_QUIZ)
    questions = bank.get(data.difficulty, [])
    if not questions:
        raise HTTPException(status_code=400, detail="Invalid quiz")

    correct_count = 0
    for i, answer_index in enumerate(data.answers):
        if i < len(questions) and answer_index == questions[i]["correct_index"]:
            correct_count += 1

    score_percent = round((correct_count / len(questions)) * 100) if questions else 0
    verified = is_verified(score_percent)
    next_difficulty = get_next_difficulty(data.difficulty, score_percent)

    await quiz_attempts_collection.insert_one({
        "user_id": current_user["_id"],
        "skill_name": data.skill_name,
        "difficulty": data.difficulty,
        "score_percent": score_percent,
        "verified": verified,
    })

    # Update Skill Passport status
    await skill_passport_collection.update_one(
        {"user_id": current_user["_id"], "skill_name": data.skill_name},
        {"$set": {"status": "verified" if verified else "practicing"}},
        upsert=True,
    )

    return {
        "score_percent": score_percent,
        "correct_count": correct_count,
        "total_questions": len(questions),
        "verified": verified,
        "next_difficulty": next_difficulty,
    }