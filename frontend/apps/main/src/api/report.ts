import axios from 'axios';

interface SyncReportParams {
  start?: string;
  end?: string;
}

interface SyncResult {
  inserted: number;
  updated: number;
  duration: number;
  sync_at: string;
}

interface SyncStatus {
  total: number;
  last_sync_at: string | null;
}

export const syncReport = (params?: SyncReportParams) => {
  return axios.get<{ msg: string; data: SyncResult }>('/api/report/sync', { params });
};

export const getSyncStatus = () => {
  return axios.get<{ data: SyncStatus }>('/api/report/sync/status');
};
