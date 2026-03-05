from urllib.parse import urlparse

# 是否在白名单中
def is_in_white_list(url: str, auth_white_list: list) -> bool:
    """检查请求路径是否在白名单中"""
    path = urlparse(url).path
    for white_path in auth_white_list:
        if path == white_path or path.endswith(white_path):
            return True
    return False