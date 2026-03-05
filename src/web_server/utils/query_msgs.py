"""optimize_msg 集合的查询封装"""
import re
from typing import Dict, Any, Optional, List


def query_optimize_msgs(
    keyword: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    msg_type: Optional[str] = None,
    sender_type: Optional[str] = None,
    has_reply: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
) -> Dict[str, Any]:
    """查询主消息列表（不含回复），reply_count 已在文档中"""
    from web_server.utils.db_helper import optimize_collection

    query: Dict[str, Any] = {"is_reply": False}

    if keyword:
        query["content"] = {"$regex": re.escape(keyword), "$options": "i"}

    if start_date or end_date:
        date_filter: Dict[str, str] = {}
        if start_date:
            date_filter["$gte"] = start_date
        if end_date:
            date_filter["$lte"] = end_date
        query["create_date"] = date_filter

    if msg_type:
        query["msg_type"] = msg_type

    if sender_type:
        query["sender_type"] = sender_type

    if has_reply == "yes":
        query["reply_count"] = {"$gt": 0}
    elif has_reply == "no":
        query["$or"] = [{"reply_count": 0}, {"reply_count": {"$exists": False}}]

    total = optimize_collection.count_documents(query)

    skip = (page - 1) * page_size
    cursor = (
        optimize_collection
        .find(query, {"_id": 0})
        .sort("create_time", -1)
        .skip(skip)
        .limit(page_size)
    )

    items: List[Dict] = _serialize(cursor)

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
    }


def get_message_replies(message_id: str) -> List[Dict]:
    """获取某条主消息的所有回复，按时间正序"""
    from web_server.utils.db_helper import optimize_collection

    cursor = (
        optimize_collection
        .find({"parent_id": message_id}, {"_id": 0})
        .sort("create_time", 1)
    )
    return _serialize(cursor)


def _serialize(cursor) -> List[Dict]:
    items: List[Dict] = []
    for doc in cursor:
        if "sync_at" in doc:
            doc["sync_at"] = doc["sync_at"].isoformat()
        items.append(doc)
    return items
