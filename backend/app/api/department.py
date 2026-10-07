from fastapi import APIRouter, Depends
from app.core.dependencies import require_department_or_admin
from app.services.department_engine import get_department_overview

router = APIRouter(prefix="/api/department", tags=["department"])

@router.get("/overview")
async def get_overview(current_user: dict = Depends(require_department_or_admin)):
    return await get_department_overview()