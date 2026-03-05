import axios from 'axios';

interface SyncReportParams {
  start?: string;
  end?: string;
  optimize?: boolean;
}

interface SyncResult {
  inserted: number;
  updated: number;
  duration: number;
  sync_at: string;
  optimize_inserted?: number;
  optimize_updated?: number;
}

interface SyncStatus {
  total: number;
  optimize_total: number;
  last_sync_at: string | null;
}

export const syncReport = (params?: SyncReportParams) => {
  return axios.get<{ msg: string; data: SyncResult }>('/api/report/sync', { params });
};

export const getSyncStatus = () => {
  return axios.get<{ data: SyncStatus }>('/api/report/sync/status');
};

interface RebuildResult {
  optimize_inserted: number;
  optimize_updated: number;
  duration: number;
}

export const rebuildOptimize = () => {
  return axios.get<{ msg: string; data: RebuildResult }>('/api/report/sync/rebuild-optimize');
};
