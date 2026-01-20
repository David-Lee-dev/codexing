import { useState, useCallback } from 'react';
import { check, Update } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

export type UpdateStatus = 'idle' | 'checking' | 'available' | 'downloading' | 'ready' | 'error';

interface UpdateInfo {
  version: string;
  body: string;
}

interface UseUpdaterResult {
  status: UpdateStatus;
  progress: number;
  updateInfo: UpdateInfo | null;
  error: string | null;
  checkForUpdates: () => Promise<void>;
  downloadAndInstall: () => Promise<void>;
  restartApp: () => Promise<void>;
}

export function useUpdater(): UseUpdaterResult {
  const [status, setStatus] = useState<UpdateStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingUpdate, setPendingUpdate] = useState<Update | null>(null);

  const checkForUpdates = useCallback(async () => {
    try {
      setStatus('checking');
      setError(null);

      const update = await check();

      if (update) {
        setUpdateInfo({
          version: update.version,
          body: update.body || '',
        });
        setPendingUpdate(update);
        setStatus('available');
      } else {
        setStatus('idle');
        setUpdateInfo(null);
      }
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to check for updates');
    }
  }, []);

  const downloadAndInstall = useCallback(async () => {
    if (!pendingUpdate) return;

    try {
      setStatus('downloading');
      setProgress(0);

      await pendingUpdate.downloadAndInstall((event) => {
        if (event.event === 'Started' && event.data.contentLength) {
          setProgress(0);
        } else if (event.event === 'Progress') {
          const percent = Math.round((event.data.chunkLength / (event.data.contentLength || 1)) * 100);
          setProgress((prev) => Math.min(prev + percent, 100));
        } else if (event.event === 'Finished') {
          setProgress(100);
        }
      });

      setStatus('ready');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to download update');
    }
  }, [pendingUpdate]);

  const restartApp = useCallback(async () => {
    try {
      await relaunch();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restart app');
    }
  }, []);

  return {
    status,
    progress,
    updateInfo,
    error,
    checkForUpdates,
    downloadAndInstall,
    restartApp,
  };
}
