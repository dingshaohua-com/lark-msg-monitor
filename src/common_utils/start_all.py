import asyncio
import sys
from pathlib import Path

# 封装一个基于asyncio启动子进程的工具函数
async def run_service(name: str, cmd: list, cwd: Path):
    """启动服务并实时输出日志"""
    print(f"🚀 [{name}] 启动: {' '.join(cmd)}")

    proc = await asyncio.create_subprocess_exec(
        *cmd,
        cwd=cwd,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.STDOUT
    )

    # 实时转发输出，带前缀区分前后端
    while True:
        line = await proc.stdout.readline()
        if not line:
            break
        print(f"[{name:>8}] {line.decode().rstrip()}")

    return await proc.wait()


async def start():
    root = Path.cwd()
    fe_dir = root / "frontend"

    try:
        # 同时启动两个服务（不阻塞）
        await asyncio.gather(
            run_service("frontend", ["npm", "run", "dev:main"], fe_dir),
            run_service("backend",
                        [sys.executable, "-m", "uvicorn", "web_server.start:app", "--reload"],
                        root),
            return_exceptions=True
        )
    except asyncio.CancelledError:
        pass


