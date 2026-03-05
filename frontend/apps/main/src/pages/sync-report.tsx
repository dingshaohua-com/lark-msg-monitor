import { useEffect, useState, useCallback } from 'react';
import { syncReport, getSyncStatus } from '@/api/report';
import { Button } from '@repo/ui-shadcn/components/ui/button';

type SyncMode = 'idle' | 'syncing' | 'done' | 'error';

const SyncReport = () => {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [mode, setMode] = useState<SyncMode>('idle');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{
    inserted: number;
    updated: number;
    duration: number;
    sync_at: string;
  } | null>(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<{
    total: number;
    last_sync_at: string | null;
  } | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await getSyncStatus();
      setStatus(res.data.data);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    if (mode !== 'syncing') return;
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) return 90;
        const step = p < 30 ? 8 : p < 60 ? 4 : 1.5;
        return Math.min(p + step, 90);
      });
    }, 300);
    return () => clearInterval(timer);
  }, [mode]);

  const handleSync = async (full: boolean) => {
    setMode('syncing');
    setProgress(0);
    setResult(null);
    setError('');

    try {
      const params = full ? undefined : { start, end };
      const res = await syncReport(params);
      setProgress(100);
      setResult(res.data.data);
      setMode('done');
      fetchStatus();
    } catch (e: any) {
      setProgress(0);
      setError(e?.response?.data?.detail || e.message || '同步失败');
      setMode('error');
    }
  };

  const formatTime = (iso: string | null | undefined) => {
    if (!iso) return '暂无记录';
    return new Date(iso).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const isSyncing = mode === 'syncing';

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* 同步状态卡片 */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">同步状态</h2>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs text-gray-500">最后同步时间</p>
              <p className="mt-1 text-sm font-medium text-gray-900">
                {formatTime(status?.last_sync_at)}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs text-gray-500">消息总数</p>
              <p className="mt-1 text-sm font-medium text-gray-900">
                {status?.total?.toLocaleString() ?? '-'}
              </p>
            </div>
          </div>
        </div>

        {/* 同步操作卡片 */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">执行同步</h2>

          {/* 日期范围 */}
          <div className="mt-4 flex items-end gap-3">
            <label className="flex-1 space-y-1.5">
              <span className="text-xs font-medium text-gray-600">开始日期</span>
              <input
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                disabled={isSyncing}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:opacity-50"
              />
            </label>
            <label className="flex-1 space-y-1.5">
              <span className="text-xs font-medium text-gray-600">结束日期</span>
              <input
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                disabled={isSyncing}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:opacity-50"
              />
            </label>
          </div>

          {/* 按钮组 */}
          <div className="mt-5 flex gap-3">
            <Button
              disabled={isSyncing || !start || !end}
              onClick={() => handleSync(false)}
            >
              {isSyncing ? '同步中...' : '按日期同步'}
            </Button>
            <Button
              variant="outline"
              disabled={isSyncing}
              onClick={() => handleSync(true)}
            >
              {isSyncing ? '同步中...' : '全量同步'}
            </Button>
          </div>

          {/* 进度条 */}
          {mode !== 'idle' && (
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  {isSyncing ? '正在从飞书拉取消息...' : mode === 'done' ? '同步完成' : '同步失败'}
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`h-full rounded-full transition-all duration-300 ease-out ${
                    mode === 'error'
                      ? 'bg-red-500'
                      : mode === 'done'
                        ? 'bg-green-500'
                        : 'bg-blue-500'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* 同步结果 */}
        {result && (
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">同步结果</h2>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-green-50 p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{result.inserted}</p>
                <p className="mt-1 text-xs text-gray-500">新增消息</p>
              </div>
              <div className="rounded-lg bg-blue-50 p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">{result.updated}</p>
                <p className="mt-1 text-xs text-gray-500">更新消息</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4 text-center">
                <p className="text-2xl font-bold text-gray-600">{result.duration}s</p>
                <p className="mt-1 text-xs text-gray-500">耗时</p>
              </div>
            </div>
          </div>
        )}

        {/* 错误提示 */}
        {mode === 'error' && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default SyncReport;
