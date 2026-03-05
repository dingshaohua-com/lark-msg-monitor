import os
import httpx
from msg_monitor.utils.common import is_in_white_list
import msg_monitor.utils.store as store



# ============ 白名单配置 ============
AUTH_WHITE_LIST = [
    "/auth/v3/tenant_access_token/internal",  # 登录接口
]

# 定义拦截器
def request_interceptor(request):
    # 1. 白名单放行
    if is_in_white_list(str(request.url), AUTH_WHITE_LIST):
        return
    # 2. 获取 Token
    token = store.tenant_access_token
    # 将token放到请求头
    if token:
        request.headers["Authorization"] = f"Bearer {token}"
        request.headers["Content-Type"] = "application/json"
    else:
        raise httpx.HTTPStatusError( "token去哪儿了？", request=request, response=None)

# 创建 client
base_url=os.getenv('LARK_HOST')
lark_client = httpx.Client(base_url=base_url, event_hooks={
    "request": [request_interceptor],  # 请求前拦截
    # "response": [response_interceptor]  # 响应后拦截
})



