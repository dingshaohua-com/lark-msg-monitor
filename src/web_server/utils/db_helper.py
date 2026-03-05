# from pymongo import MongoClient
# from datetime import datetime
#
# # 带认证和连接池（生产推荐）
# client = MongoClient(
#     "mongodb://root:dshvv@one.0brbjhh.mongodb.net",
#     maxPoolSize=50, # 最大连接数
#     minPoolSize=10, # 最小保留连接
#     serverSelectionTimeoutMS=5000 # 连接超时
# )
#
# # 选择数据库和集合（类似 SQL 的表）
# db = client["lark_monitor"] # 数据库
# collection = db["raw_msg"] # 集合（表）

from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

client: MongoClient | None = None
db = None
collection = None


def init_db(uri: str = "mongodb+srv://root:dshvv@one.0brbjhh.mongodb.net"):
    """应用启动时调用，预热连接"""
    global client, db, collection
    client = MongoClient(uri, maxPoolSize=50)

    # ✅ 关键：立即 ping 一下，建立真实连接，避免第一次请求慢
    try:
        client.admin.command('ping')
        print("✅ MongoDB 连接成功并已预热")
    except ConnectionFailure:
        print("❌ MongoDB 连接失败")
        raise

    db = client["lark_monitor"]
    collection = db["raw_msg"]
    return collection


def close_db():
    """关闭连接"""
    global client
    if client:
        client.close()
        print("MongoDB 连接已关闭")


def get_collection():
    """供其他模块调用（如果需要在函数内使用）"""
    return collection