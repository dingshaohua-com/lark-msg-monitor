import asyncio
from dotenv import load_dotenv
from common_utils.start_all import start

# 加载环境变量
load_dotenv()

# 启动前后端服务
try:
    asyncio.run(start())
except KeyboardInterrupt:
    print("\n🛑 已停止所有服务")




