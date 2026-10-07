from app.services.tavus_service import create_tavus_conversation
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.auth import router as auth_router
from app.api.profile import router as profile_router
from app.api.resume import router as resume_router
from app.api.skill_gap import router as skill_gap_router
from app.api.placement_hub import router as placement_hub_router
from app.api.study_vault import router as study_vault_router
from app.api.quiz import router as quiz_router
from app.api.readiness import router as readiness_router
from app.api.skill_passport import router as skill_passport_router
from app.api.interview import router as interview_router
from app.api.department import router as department_router
from app.api.admin import router as admin_router


# =========================================================
# FastAPI Application
# =========================================================

app = FastAPI(
    title="PrepSphere API"
)


# =========================================================
# CORS Configuration
# =========================================================

app.add_middleware(
    CORSMiddleware,

    # Allow both localhost and 127.0.0.1
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# =========================================================
# Static Audio
# =========================================================

app.mount(
    "/audio",
    StaticFiles(directory="audio_output"),
    name="audio",
)


# =========================================================
# Static Files
# =========================================================

app.mount(
    "/static",
    StaticFiles(directory="static"),
    name="static",
)


# =========================================================
# API Routers
# =========================================================

app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(resume_router)
app.include_router(skill_gap_router)
app.include_router(placement_hub_router)
app.include_router(study_vault_router)
app.include_router(quiz_router)
app.include_router(readiness_router)
app.include_router(skill_passport_router)
app.include_router(interview_router)
app.include_router(department_router)
app.include_router(admin_router)


# =========================================================
# Health Check
# =========================================================

@app.get("/")
def health_check():
    return {
        "status": "PrepSphere backend is running"
    }

@app.post("/api/tavus/test")
async def test_tavus():
    return await create_tavus_conversation("technical")