import { invoke } from '@tauri-apps/api/core';

import { DatabaseHealth } from '@/features/database/types';

export async function initDatabase(): Promise<void> {
  let databaseHealth: DatabaseHealth | null = null;

  try {
    databaseHealth = await invoke<DatabaseHealth>('get_database_health');
  } catch (error) {
    console.error('Failed to check database health', error);
  }

  try {
    if (
      !databaseHealth ||
      !databaseHealth.connected ||
      !databaseHealth.sqlite_vec_loaded ||
      !databaseHealth.wal_mode ||
      !databaseHealth.foreign_keys_enabled
    ) {
      await invoke('init_database');
    }
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}
