import os
from msg_monitor.utils.client import lark_client
import msg_monitor.utils.store as store
from typing import Dict, List, Optional
from msg_monitor.utils.org_msgs import org_msgs


def login():
    """获取 tenant_access_token"""
    url = "/auth/v3/tenant_access_token/internal"
    payload = {
        "app_id": os.getenv("LARK_APP_ID"),
        "app_secret": os.getenv("LARK_APP_SECRET"),
    }
    res = lark_client.post(url, json=payload)
    token = res.json().get("tenant_access_token")
    store.tenant_access_token=token

def get_chat_list(page_size=10) -> List[Dict]:
    """获取群列表"""
    res = lark_client.get("/im/v1/chats", params={"page_size": page_size})
    return res.json().get('data').get("items", [])

def get_chat_messages(params) -> Dict:
    """
    获取群消息列表，返回 data 层级对象（含 items / has_more / page_token）

    Args:
     container_id_type: "chat"
     container_id: 群 ID
     start_time: 起始时间戳(毫秒,字符串)
     end_time: 结束时间戳(毫秒,字符串)
     page_size: 每页消息数量
     page_token: 分页标记
    """
    res = lark_client.get("/im/v1/messages", params=params)
    body = res.json()
    if body.get("code") != 0:
        raise RuntimeError(f"飞书 API 错误: code={body.get('code')}, msg={body.get('msg')}")
    return body.get("data", {})


