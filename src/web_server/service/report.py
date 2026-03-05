import os
import time
from datetime import date, datetime
from typing import Iterator, Dict
import msg_monitor.service.index as msg_monitor_service

container_id = os.getenv("MONITOR_CHAT_ID")

# 递归获取所有飞书信息（飞书奇葩api）
def iter_msgs(
        start_time: str = None,
        end_time: str = None,
        page_size: int = 10
) -> Iterator[Dict]:
    """
    迭代器封装：调用方无需关心分页，像遍历列表一样使用

    示例：
        for msg in client.iter_messages("oc_xxx"):
            print(msg["content"])
    """
    params = {
        "container_id_type": "chat",
        "container_id": container_id,
        "page_size": page_size
    }
    if start_time:
        params["start_time"] = start_time
    if end_time:
        params["end_time"] = end_time

    page_token = None

    while True:
        if page_token:
            params["page_token"] = page_token

        data = msg_monitor_service.get_chat_messages(params)

        for msg in data.get("items", []):
            yield msg  # 逐条产出，内存友好

        if not data.get("has_more"):
            break

        page_token = data.get("page_token")
        time.sleep(0.05)  # 避免限流


def get_msgs(start: date, end: date, page_size: int = 10):
    """获取指定日期范围的所有消息"""
    start_time = str(int(datetime.combine(start, datetime.min.time()).timestamp()))
    end_time = str(int(datetime.combine(end, datetime.max.time()).timestamp()))
    return list(iter_msgs(start_time=start_time, end_time=end_time, page_size=page_size))

