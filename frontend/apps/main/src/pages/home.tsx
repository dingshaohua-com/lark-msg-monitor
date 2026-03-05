import { useEffect, useState, useCallback } from 'react';
import { getMessages, getMessageReplies, type MessageItem, type MessageQuery } from '@/api/message';
import { Button } from '@repo/ui-shadcn/components/ui/button';

const MSG_TYPE_LABELS: Record<string, string> = {
  text: '文本',
  post: '富文本',
  interactive: '卡片',
  image: '图片',
  file: '文件',
  audio: '语音',
  media: '视频',
  sticker: '表情',
  share_chat: '群分享',
  share_user: '用户分享',
  merge_forward: '合并转发',
};

const MSG_TYPE_COLORS: Record<string, string> = {
  text: 'bg-blue-50 text-blue-700',
  post: 'bg-purple-50 text-purple-700',
  interactive: 'bg-amber-50 text-amber-700',
  image: 'bg-green-50 text-green-700',
  file: 'bg-orange-50 text-orange-700',
};

const PAGE_SIZE = 20;

const Home = () => {
  const [items, setItems] = useState<MessageItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [keyword, setKeyword] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [msgType, setMsgType] = useState('');
  const [hasReply, setHasReply] = useState('');

  const [appliedFilters, setAppliedFilters] = useState<MessageQuery>({});
  const [detail, setDetail] = useState<MessageItem | null>(null);
  const [replies, setReplies] = useState<MessageItem[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);

  const fetchData = useCallback(async (p: number, filters: MessageQuery) => {
    setLoading(true);
    try {
      const params: MessageQuery = { ...filters, page: p, page_size: PAGE_SIZE };
      const res = await getMessages(params);
      const d = res.data.data;
      setItems(d.items);
      setTotal(d.total);
      setTotalPages(d.total_pages);
      setPage(d.page);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(1, {}); }, [fetchData]);

  const handleSearch = () => {
    const filters: MessageQuery = {};
    if (keyword.trim()) filters.keyword = keyword.trim();
    if (startDate) filters.start_date = startDate;
    if (endDate) filters.end_date = endDate;
    if (msgType) filters.msg_type = msgType;
    if (hasReply) filters.has_reply = hasReply;
    setAppliedFilters(filters);
    fetchData(1, filters);
  };

  const handleReset = () => {
    setKeyword('');
    setStartDate('');
    setEndDate('');
    setMsgType('');
    setHasReply('');
    setAppliedFilters({});
    fetchData(1, {});
  };

  const goPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    fetchData(p, appliedFilters);
  };

  const openDetail = async (item: MessageItem) => {
    setDetail(item);
    setReplies([]);
    if ((item.reply_count ?? 0) > 0) {
      setLoadingReplies(true);
      try {
        const res = await getMessageReplies(item.message_id);
        setReplies(res.data.data);
      } catch { /* ignore */ } finally {
        setLoadingReplies(false);
      }
    }
  };

  const renderPageButtons = () => {
    const pages: (number | '...')[] = [];
    const delta = 2;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages.map((p, idx) =>
      p === '...' ? (
        <span key={`e${idx}`} className="px-2 text-gray-400">...</span>
      ) : (
        <button
          key={p}
          onClick={() => goPage(p)}
          className={`min-w-[36px] rounded-lg px-3 py-1.5 text-sm transition ${
            p === page ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >{p}</button>
      ),
    );
  };

  const inputClass =
    'rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100';

  const TypeBadge = ({ type }: { type: string }) => (
    <span className={`inline-block rounded-md px-2 py-0.5 text-xs ${MSG_TYPE_COLORS[type] || 'bg-gray-100 text-gray-600'}`}>
      {MSG_TYPE_LABELS[type] || type}
    </span>
  );

  const SenderBadge = ({ type }: { type: string }) => (
    <span className={`inline-block rounded-md px-2 py-0.5 text-xs ${type === 'user' ? 'bg-sky-50 text-sky-700' : 'bg-gray-100 text-gray-600'}`}>
      {type}
    </span>
  );

  return (
    <div className="p-6 md:p-10">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* 筛选栏 */}
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-600 whitespace-nowrap">关键字</span>
              <input
                type="text" value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="搜索消息内容..."
                className={`w-44 ${inputClass}`}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-600 whitespace-nowrap">开始</span>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-600 whitespace-nowrap">结束</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-600 whitespace-nowrap">类型</span>
              <select value={msgType} onChange={(e) => setMsgType(e.target.value)} className={inputClass}>
                <option value="">全部</option>
                {Object.entries(MSG_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-600 whitespace-nowrap">回复</span>
              <select value={hasReply} onChange={(e) => setHasReply(e.target.value)} className={inputClass}>
                <option value="">全部</option>
                <option value="yes">有回复</option>
                <option value="no">无回复</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSearch}>搜索</Button>
              <Button variant="outline" onClick={handleReset}>重置</Button>
            </div>
          </div>
        </div>

        {/* 表格 */}
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
            <p className="text-sm text-gray-500">
              共 <span className="font-medium text-gray-900">{total.toLocaleString()}</span> 条主消息
            </p>
            {loading && <span className="text-xs text-blue-500">加载中...</span>}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-medium text-gray-500">
                  <th className="whitespace-nowrap px-5 py-3">日期</th>
                  <th className="whitespace-nowrap px-5 py-3">时间</th>
                  <th className="whitespace-nowrap px-5 py-3">发送者</th>
                  <th className="whitespace-nowrap px-5 py-3">类型</th>
                  <th className="px-5 py-3">内容</th>
                  <th className="whitespace-nowrap px-5 py-3">回复</th>
                  <th className="whitespace-nowrap px-5 py-3">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.length === 0 && !loading && (
                  <tr><td colSpan={7} className="px-5 py-16 text-center text-gray-400">暂无数据</td></tr>
                )}
                {items.map((item) => (
                  <tr key={item.message_id} className="transition hover:bg-gray-50/50">
                    <td className="whitespace-nowrap px-5 py-3 text-gray-600">{item.create_date}</td>
                    <td className="whitespace-nowrap px-5 py-3 font-mono text-gray-500">{item.create_time_str}</td>
                    <td className="whitespace-nowrap px-5 py-3"><SenderBadge type={item.sender_type} /></td>
                    <td className="whitespace-nowrap px-5 py-3"><TypeBadge type={item.msg_type} /></td>
                    <td className="max-w-[200px] px-5 py-3">
                      <p className="truncate text-gray-800">{item.content || '-'}</p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-center">
                      {(item.reply_count ?? 0) > 0 ? (
                        <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-medium text-violet-600">
                          {item.reply_count}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300">-</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3">
                      <button onClick={() => openDetail(item)} className="text-xs text-blue-500 hover:text-blue-700 hover:underline">
                        查看
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
              <p className="text-xs text-gray-400">第 {page} / {totalPages} 页</p>
              <div className="flex items-center gap-1.5">
                <button onClick={() => goPage(page - 1)} disabled={page <= 1} className="rounded-lg bg-white px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-100 disabled:opacity-40">上一页</button>
                {renderPageButtons()}
                <button onClick={() => goPage(page + 1)} disabled={page >= totalPages} className="rounded-lg bg-white px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-100 disabled:opacity-40">下一页</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 详情弹窗 */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDetail(null)}>
          <div className="mx-4 w-full max-w-2xl rounded-2xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h3 className="text-base font-semibold text-gray-900">消息详情</h3>
              <button onClick={() => setDetail(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto px-6 py-5 space-y-5">
              {/* 主消息 */}
              <MessageBubble msg={detail} isRoot />

              {/* 回复链 */}
              {(detail.reply_count ?? 0) > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-medium text-gray-500">
                    {loadingReplies ? '加载回复中...' : `${replies.length} 条回复`}
                  </p>
                  <div className="ml-4 border-l-2 border-gray-200 pl-4 space-y-3">
                    {replies.map((r) => (
                      <MessageBubble key={r.message_id} msg={r} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 px-6 py-3 text-right">
              <Button variant="outline" size="sm" onClick={() => setDetail(null)}>关闭</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function MessageBubble({ msg, isRoot = false }: { msg: MessageItem; isRoot?: boolean }) {
  return (
    <div className={`rounded-xl p-4 ${isRoot ? 'bg-blue-50/60 ring-1 ring-blue-100' : 'bg-gray-50'}`}>
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span className={`rounded-md px-2 py-0.5 ${msg.sender_type === 'user' ? 'bg-sky-50 text-sky-700' : 'bg-gray-100 text-gray-600'}`}>
          {msg.sender_type}
        </span>
        <span className={`rounded-md px-2 py-0.5 ${
          MSG_TYPE_COLORS[msg.msg_type] || 'bg-gray-100 text-gray-600'
        }`}>
          {MSG_TYPE_LABELS[msg.msg_type] || msg.msg_type}
        </span>
        <span className="font-mono">{msg.create_date} {msg.create_time_str}</span>
        {isRoot && msg.thread_id && (
          <span className="text-gray-400">话题 {msg.thread_id.slice(-6)}</span>
        )}
      </div>
      <div className="mt-2.5 text-sm leading-relaxed text-gray-800 whitespace-pre-wrap break-all">
        {msg.content || '-'}
      </div>
      <p className="mt-2 text-[10px] font-mono text-gray-400">ID: {msg.message_id}</p>
    </div>
  );
}

export default Home;
