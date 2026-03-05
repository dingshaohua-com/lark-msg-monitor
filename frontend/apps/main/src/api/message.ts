import axios from 'axios';

export interface MessageItem {
  chat_id: string;
  message_id: string;
  sender_type: string;
  sender_id: string;
  msg_type: string;
  content: string;
  thread_id: string | null;
  parent_id: string | null;
  is_reply: boolean;
  create_time: number;
  create_date: string;
  create_time_str: string;
  sync_at: string;
  reply_count?: number;
}

export interface MessageQuery {
  keyword?: string;
  start_date?: string;
  end_date?: string;
  msg_type?: string;
  sender_type?: string;
  has_reply?: string;
  page?: number;
  page_size?: number;
}

interface MessageListResult {
  items: MessageItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export const getMessages = (params?: MessageQuery) => {
  return axios.get<{ data: MessageListResult }>('/api/report/messages', { params });
};

export const getMessageReplies = (messageId: string) => {
  return axios.get<{ data: MessageItem[] }>(`/api/report/messages/${messageId}/replies`);
};
