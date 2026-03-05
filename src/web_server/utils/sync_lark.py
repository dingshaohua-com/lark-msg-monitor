import os
import time
import logging
from datetime import datetime, date
from typing import Dict, Any
from pymongo import UpdateOne
from pymongo.errors import BulkWriteError

logger = logging.getLogger(__name__)


def run_sync(start: date = None, end: date = None) -> Dict[str, Any]:
    """
    从飞书拉取消息并写入 raw_msg 集合
    - start/end 都传：按日期范围同步
    - 都不传：全量同步（不限时间）
    """
    from web_server.utils.db_helper import collection
    import msg_monitor.service.index as msg_monitor_service

    chat_id = os.getenv('MONITOR_CHAT_ID')
    if not chat_id:
        raise ValueError("MONITOR_CHAT_ID 未配置")

    start_ts = str(int(datetime.combine(start, datetime.min.time()).timestamp())) if start else None
    end_ts = str(int(datetime.combine(end, datetime.max.time()).timestamp())) if end else None

    mode = f"{start} -> {end}" if start and end else "全量"
    logger.info(f"[{chat_id}] 同步模式: {mode}")

    clock = time.time()
    inserted, updated = 0, 0
    page_token = None
    buffer = []

    while True:
        params = {
            "container_id_type": "chat",
            "container_id": chat_id,
            "page_size": 50,
        }
        if start_ts:
            params["start_time"] = start_ts
        if end_ts:
            params["end_time"] = end_ts
        if page_token:
            params["page_token"] = page_token

        data = _fetch_with_retry(msg_monitor_service, params)

        messages = data.get("items", [])
        if not messages:
            break

        for msg in messages:
            doc = {
                **msg,
                "chat_id": chat_id,
                "sync_at": datetime.now(),
                "_id": f"{chat_id}_{msg['message_id']}",
            }
            buffer.append(doc)

            if len(buffer) >= 100:
                i, u = _bulk_upsert(collection, buffer)
                inserted += i
                updated += u
                buffer.clear()

        if not data.get("has_more"):
            break
        page_token = data.get("page_token")
        time.sleep(0.05)

    if buffer:
        i, u = _bulk_upsert(collection, buffer)
        inserted += i
        updated += u

    duration = round(time.time() - clock, 2)
    sync_at = datetime.now().isoformat()
    logger.info(f"[{chat_id}] 同步完成: 新增{inserted}, 更新{updated}, 耗时{duration}s")
    return {"inserted": inserted, "updated": updated, "duration": duration, "sync_at": sync_at}


def get_sync_status() -> Dict[str, Any]:
    """获取同步状态：最后同步时间、消息总数"""
    from web_server.utils.db_helper import collection
    total = collection.count_documents({})
    last_doc = collection.find_one(sort=[("sync_at", -1)])
    last_sync_at = last_doc["sync_at"].isoformat() if last_doc and last_doc.get("sync_at") else None
    return {"total": total, "last_sync_at": last_sync_at}


def _fetch_with_retry(svc, params: dict, max_retries: int = 3):
    for attempt in range(max_retries):
        try:
            return svc.get_chat_messages(params)
        except Exception as e:
            if attempt == max_retries - 1:
                raise
            logger.warning(f"请求失败，第{attempt + 1}次重试: {e}")
            time.sleep(2 ** attempt)
    return {"items": []}


def _bulk_upsert(col, docs: list) -> tuple:
    if not docs:
        return 0, 0

    operations = [
        UpdateOne({"_id": doc["_id"]}, {"$setOnInsert": doc}, upsert=True)
        for doc in docs
    ]

    try:
        result = col.bulk_write(operations, ordered=False)
        return result.upserted_count, result.modified_count
    except BulkWriteError as bwe:
        logger.warning(f"BulkWrite 部分失败: {bwe.details}")
        written = bwe.details.get("nInserted", 0) + bwe.details.get("nUpserted", 0)
        return written, 0
