from datetime import date, datetime

def write_message(msg, idx, msg_dict, is_reply=False, reply_idx=0):
    """写入单条消息及其回复"""
    new_msg = {}

    # 解析时间戳
    timestamp = int(msg['create_time'])
    msg_time = datetime.fromtimestamp(timestamp / 1000).strftime('%H:%M:%S')

    # 获取发送者信息
    sender = msg.get('sender', {})
    sender_name = sender.get('sender_type', '未知')

    # # 标题
    # if is_reply:
    #     new_msg[(f'### 回复 {reply_idx}']
    # else:
    #     f.write(f'## 消息 {idx}\n\n')
    #
    # f.write(f'- **时间**: {msg_time}\n')
    # f.write(f'- **发送者**: {sender_name}\n')
    # f.write(f'- **类型**: {msg.get("msg_type")}\n')
    #
    # # 如果是回复消息，显示回复关系
    # if msg.get('parent_id'):
    #     f.write(f'- **回复消息**: `{msg["parent_id"]}`\n')
    # if msg.get('thread_id'):
    #     f.write(f'- **话题ID**: `{msg["thread_id"]}`\n')
    #
    # f.write(f'- **消息ID**: `{msg["message_id"]}`\n\n')
    #
    # # 处理消息内容
    # content = extract_message_content(msg)
    #
    # if msg.get('msg_type') == 'text':
    #     f.write(f'**内容**:\n\n```\n{content}\n```\n\n')
    # else:
    #     f.write(f'**内容**:\n\n{content}\n\n')
    #
    # # 如果这条消息有回复，递归显示回复
    # replies = msg_dict.get('_replies', {}).get(msg['message_id'], [])
    # if replies:
    #     f.write(f'**💬 此消息有 {len(replies)} 条回复:**\n\n')
    #     for reply_num, reply_msg in enumerate(replies, 1):
    #         write_message(f, reply_msg, idx, msg_dict, is_reply=True, reply_idx=reply_num)
    #
    # if not is_reply:
    #     f.write('---\n\n')


def org_msgs(msgs):
    """整理消息结构，建立父子关系"""
    # 按时间排序
    msgs.sort(key=lambda x: int(x.get('create_time', '0')))

    # 构建消息字典
    msg_dict = {msg['message_id']: msg for msg in msgs}
    msg_dict['_replies'] = {}

    # 建立回复关系
    for msg in msgs:
        parent_id = msg.get('parent_id')
        if parent_id and parent_id in msg_dict:
            if parent_id not in msg_dict['_replies']:
                msg_dict['_replies'][parent_id] = []
            msg_dict['_replies'][parent_id].append(msg)

    # 获取主消息（没有parent_id的消息）
    main_messages = [msg for msg in msgs if not msg.get('parent_id')]
    # 写入每条主消息
    # for idx, msg in enumerate(main_messages, 1):
    #     write_message(msg, idx, msg_dict)
    return main_messages, msg_dict