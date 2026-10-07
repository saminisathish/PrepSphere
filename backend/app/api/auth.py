from fastapi import APIRouter, HTTPException
from app.models.user import RegisterRequest, LoginRequest
from app.db.mongo import users_collection
from app.core.security import hash_password, verify_password, create_access_token
from app.core.config import ADMIN_SIGNUP_CODE

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register")
async def register(data: RegisterRequest):
    existing_user = await users_collection.find_one({"email": data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    role = "student"
    if data.role in ("department", "admin"):
        if data.admin_code != ADMIN_SIGNUP_CODE:
            raise HTTPException(status_code=403, detail="Invalid admin/department signup code")
        role = data.role

    hashed_pw = hash_password(data.password)
    new_user = {
        "name": data.name,
        "email": data.email,
        "password_hash": hashed_pw,
        "role": role,
    }
    result = await users_collection.insert_one(new_user)

    token = create_access_token({"sub": str(result.inserted_id), "email": data.email, "role": role})
    return {"access_token": token, "token_type": "bearer", "name": data.name, "role": role}


@router.post("/login")
async def login(data: LoginRequest):
    user = await users_collection.find_one({"email": data.email})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user["_id"]), "email": user["email"], "role": user.get("role", "student")})
    return {"access_token": token, "token_type": "bearer", "name": user["name"], "role": user.get("role", "student")}