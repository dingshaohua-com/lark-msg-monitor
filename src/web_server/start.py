from contextlib import asynccontextmanager
from typing import AsyncGenerator

import uvicorn
from fastapi import FastAPI
from web_server.router.index import router
from fastapi.middleware.cors import CORSMiddleware
from msg_monitor.start import start as msg_monitor_start
from web_server.utils.db_helper import init_db, close_db


@asynccontextmanager
async def on_start(app: FastAPI)-> AsyncGenerator[None, None]:
    msg_monitor_start() # 登录一下 msg monitor cli
    init_db() # 链接数据库
    print("🚀 启动中...")
    yield  # 必须 yield，这里开始接收请求
    close_db() # 关闭数据库连接
app = FastAPI(title="Lark Msg Monitor API", version="0.0.1", lifespan=on_start)

# 解决跨域问题
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],           # 生产环境改成具体域名，如 ["http://localhost:5173"]
    allow_credentials=True,        # 允许携带 cookie/token
    allow_methods=["*"],           # 允许所有 HTTP 方法（GET/POST/PUT/DELETE 等）
    allow_headers=["*"],           # 允许所有请求头
    max_age=600,                   # 预检请求缓存 10 分钟（减少 OPTIONS 请求次数）
)

# 只需注册一次聚合路由
app.include_router(router)


# 外部通过异步进程启动，所以这里注释掉
# uvicorn.run(app, host="0.0.0.0", port=8000)

