from fastapi import APIRouter, Depends
from app.core.dependencies import get_current_user
from app.data.study_content import STUDY_VAULT_CONTENT, DEFAULT_CONTENT

router = APIRouter(prefix="/api/study-vault", tags=["study-vault"])

@router.get("/{skill_name}")
async def get_study_content(skill_name: str, current_user: dict = Depends(get_current_user)):
    content = STUDY_VAULT_CONTENT.get(skill_name, DEFAULT_CONTENT)
    return {
        "skill_name": skill_name,
        **content,
    }