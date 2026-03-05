# router/root.py
from fastapi import APIRouter

router = APIRouter(tags=["root"])

@router.get("/")
async def root():
    return {"message": "i am root"}