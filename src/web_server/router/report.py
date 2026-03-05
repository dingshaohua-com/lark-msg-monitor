import asyncio
from datetime import date
from typing import Optional

from fastapi import APIRouter, HTTPException

from web_server.utils.sync_lark import run_sync, get_sync_status, rebuild_optimize

router = APIRouter(prefix="/report", tags=["report"])


@router.get("/")
async def get_report():
    return {"message": "i am report"}


@router.get("/download")
async def download_report():
    return {"message": "i am download"}


@router.get("/sync/status")
async def sync_status():
    try:
        status = await asyncio.to_thread(get_sync_status)
        return {"data": status}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sync/rebuild-optimize")
async def rebuild_optimize_data():
    try:
        stats = await asyncio.to_thread(rebuild_optimize)
        return {"msg": "优化数据重建完成", "data": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"重建失败: {e}")


@router.get("/sync")
async def sync_report(
    start: Optional[date] = None,
    end: Optional[date] = None,
    optimize: bool = False,
):
    try:
        stats = await asyncio.to_thread(run_sync, start, end, optimize)
        return {"msg": "同步完成", "data": stats}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"同步失败: {e}")
