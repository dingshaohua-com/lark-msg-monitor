import { useEffect, useState, useCallback } from 'react';
import { syncReport, getSyncStatus, rebuildOptimize } from '@/api/report';
import { Button } from '@repo/ui-shadcn/components/ui/button';

type TaskMode = 'idle' | 'running' | 'done' | 'error';

function useTaskProgress() {
  const [mode, setMode] = useState<TaskMode>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (mode !== 'running') return;
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) return 90;
        const step = p < 30 ? 8 : p < 60 ? 4 : 1.5;
        return Math.min(p + step, 90);
      });
    }, 300);
    return () => clearInterval(timer);
  }, [mode]);

  const start = () => { setMode('running'); setProgress(0); setError(''); };
  const done = () => { setProgress(100); setMode('done'); };
  const fail = (msg: string) => { setProgress(0); setError(msg); setMode('error'); };

  return { mode, progress, error, start, done, fail };
}

function ProgressBar({ mode, progress }: { mode: TaskMode; progress: number }) {
  if (mode === 'idle') return null;
  const color = mode === 'error' ? 'bg-red-500' : mode === 'done' ? 'bg-green-500' : 'bg-blue-500';
  const label = mode === 'running' ? '正在处理中...' : mode === 'done' ? '处理完成' : '处理失败';
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{label}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-gray-100">
        <div className={`h-full rounded-full transition-all duration-300 ease-out ${color}`} style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

const SyncReport = () => {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [optimize, setOptimize] = useState(true);

  const [syncAction, setSyncAction] = useState<'date' | 'full' | null>(null);
  const sync = useTaskProgress();
  const [syncResult, setSyncResult] = useState<{
    inserted: number; updated: number; replies?: number; duration: number;
    sync_at: string; optimize_inserted?: number; optimize_updated?: number;
  } | null>(null);

  const rebuild = useTaskProgress();
  const [rebuildResult, setRebuildResult] = useState<{
    optimize_inserted: number; optimize_updated: number; duration: number;
  } | null>(null);

  const [status, setStatus] = useState<{
    raw_total: number; optimize_total: number;
    optimize_main: number; optimize_replies: number;
    last_sync_at: string | null;
  } | null>(null);

  const anyRunning = sync.mode === 'running' || rebuild.mode === 'running';

  const fetchStatus = useCallback(async () => {
    try {
      const res = await getSyncStatus();
      setStatus(res.data.data);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const handleSync = async (full: boolean) => {
    setSyncAction(full ? 'full' : 'date');
    setSyncResult(null);
    sync.start();
    try {
      const params = full ? { optimize } : { start, end, optimize };
      const res = await syncReport(params);
      setSyncResult(res.data.data);
      sync.done();
      fetchStatus();
    } catch (e: any) {
      sync.fail(e?.response?.data?.detail || e.message || '同步失败');
    } finally {
      setSyncAction(null);
    }
  };

  const handleRebuild = async () => {
    setRebuildResult(null);
    rebuild.start();
    try {
      const res = await rebuildOptimize();
      setRebuildResult(res.data.data);
      rebuild.done();
      fetchStatus();
    } catch (e: any) {
      rebuild.fail(e?.response?.data?.detail || e.message || '重建失败');
    }
  };

  const formatTime = (iso: string | null | undefined) => {
    if (!iso) return '暂无记录';
    return new Date(iso).toLocaleString('zh-CN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  };

  const inputCls = 'w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:opacity-50';

  return (
    <div className="p-6 md:p-10">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* 同步状态 */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">同步状态</h2>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs text-gray-500">最后同步时间</p>
              <p className="mt-1 text-sm font-medium text-gray-900">{formatTime(status?.last_sync_at)}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs text-gray-500">原始消息数 (raw_msg)</p>
              <p className="mt-1 text-sm font-medium text-gray-900">{status?.raw_total?.toLocaleString() ?? '-'}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs text-gray-500">优化主消息 (optimize_msg)</p>
              <p className="mt-1 text-sm font-medium text-gray-900">{status?.optimize_main?.toLocaleString() ?? '-'}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs text-gray-500">优化回复数</p>
              <p className="mt-1 text-sm font-medium text-gray-900">{status?.optimize_replies?.toLocaleString() ?? '-'}</p>
            </div>
          </div>
        </div>

        {/* 执行同步 */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">执行同步</h2>

          <div className="mt-4 flex items-end gap-3">
            <label className="flex-1 space-y-1.5">
              <span className="text-xs font-medium text-gray-600">开始日期</span>
              <input type="date" value={start} onChange={(e) => setStart(e.target.value)} disabled={anyRunning} className={inputCls} />
            </label>
            <label className="flex-1 space-y-1.5">
              <span className="text-xs font-medium text-gray-600">结束日期</span>
              <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} disabled={anyRunning} className={inputCls} />
            </label>
          </div>

          <label className="mt-4 flex cursor-pointer items-center gap-2.5 select-none">
            <input
              type="checkbox" checked={optimize}
              onChange={(e) => setOptimize(e.target.checked)}
              disabled={anyRunning}
              className="size-4 rounded border-gray-300 text-blue-600 accent-blue-600 disabled:opacity-50"
            />
            <div>
              <span className="text-sm font-medium text-gray-700">同步优化数据</span>
              <p className="text-xs text-gray-400">解析消息内容并写入 optimize_msg 集合，便于查询和展示</p>
            </div>
          </label>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button disabled={anyRunning || !start || !end} onClick={() => handleSync(false)}>
              {syncAction === 'date' ? '同步中...' : '按日期同步'}
            </Button>
            <Button variant="outline" disabled={anyRunning} onClick={() => handleSync(true)}>
              {syncAction === 'full' ? '同步中...' : '全量同步'}
            </Button>
          </div>

          <ProgressBar mode={sync.mode} progress={sync.progress} />

          {sync.mode === 'error' && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">{sync.error}</div>
          )}

          {syncResult && sync.mode === 'done' && (
            <div className="mt-4 space-y-4">
              {(syncResult.inserted > 0 || syncResult.updated > 0) && (
                <div>
                  <p className="text-xs font-medium text-gray-500">原始数据 (raw_msg)</p>
                  <div className="mt-2 grid grid-cols-4 gap-3">
                    <div className="rounded-lg bg-green-50 p-3 text-center">
                      <p className="text-xl font-bold text-green-600">{syncResult.inserted}</p>
                      <p className="mt-0.5 text-xs text-gray-500">新增</p>
                    </div>
                    <div className="rounded-lg bg-blue-50 p-3 text-center">
                      <p className="text-xl font-bold text-blue-600">{syncResult.updated}</p>
                      <p className="mt-0.5 text-xs text-gray-500">更新</p>
                    </div>
                    <div className="rounded-lg bg-violet-50 p-3 text-center">
                      <p className="text-xl font-bold text-violet-600">{syncResult.replies ?? 0}</p>
                      <p className="mt-0.5 text-xs text-gray-500">回复</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3 text-center">
                      <p className="text-xl font-bold text-gray-600">{syncResult.duration}s</p>
                      <p className="mt-0.5 text-xs text-gray-500">耗时</p>
                    </div>
                  </div>
                </div>
              )}
              {syncResult.optimize_inserted !== undefined && (
                <div>
                  <p className="text-xs font-medium text-gray-500">优化数据 (optimize_msg)</p>
                  <div className="mt-2 grid grid-cols-3 gap-3">
                    <div className="rounded-lg bg-purple-50 p-3 text-center">
                      <p className="text-xl font-bold text-purple-600">{syncResult.optimize_inserted}</p>
                      <p className="mt-0.5 text-xs text-gray-500">新增</p>
                    </div>
                    <div className="rounded-lg bg-indigo-50 p-3 text-center">
                      <p className="text-xl font-bold text-indigo-600">{syncResult.optimize_updated}</p>
                      <p className="mt-0.5 text-xs text-gray-500">更新</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3 text-center">
                      <p className="text-xl font-bold text-gray-600">{syncResult.duration}s</p>
                      <p className="mt-0.5 text-xs text-gray-500">耗时</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 重建优化数据 */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">重建优化数据</h2>
              <p className="mt-1 text-xs text-gray-400">从已有原始数据重新解析生成 optimize_msg，不会请求飞书接口</p>
            </div>
            <Button variant="secondary" disabled={anyRunning} onClick={handleRebuild}>
              {rebuild.mode === 'running' ? '处理中...' : '执行重建'}
            </Button>
          </div>

          <ProgressBar mode={rebuild.mode} progress={rebuild.progress} />

          {rebuild.mode === 'error' && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">{rebuild.error}</div>
          )}

          {rebuildResult && rebuild.mode === 'done' && (
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-purple-50 p-3 text-center">
                <p className="text-xl font-bold text-purple-600">{rebuildResult.optimize_inserted}</p>
                <p className="mt-0.5 text-xs text-gray-500">新增</p>
              </div>
              <div className="rounded-lg bg-indigo-50 p-3 text-center">
                <p className="text-xl font-bold text-indigo-600">{rebuildResult.optimize_updated}</p>
                <p className="mt-0.5 text-xs text-gray-500">更新</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <p className="text-xl font-bold text-gray-600">{rebuildResult.duration}s</p>
                <p className="mt-0.5 text-xs text-gray-500">耗时</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SyncReport;
