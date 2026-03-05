# router/index.py
from fastapi import APIRouter
from . import root, report

# 创建父路由，统一添加 /api 前缀
router = APIRouter(prefix="/api")

# 将所有子路由注册到父路由
router.include_router(root.router)
router.include_router(report.router)