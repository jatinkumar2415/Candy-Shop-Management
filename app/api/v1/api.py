from fastapi import APIRouter
from .endpoints import auth, sweets, user

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(sweets.router, prefix="/sweets", tags=["sweets"])
api_router.include_router(user.router, prefix="/users", tags=["users"])