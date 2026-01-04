import { DatabaseHealth } from '@/types/database';

import { invokeTauri } from './tauri-client';

export async function initDatabase(): Promise<void> {
  return invokeTauri<void>('init_database');
}

export async function loadDatabase(): Promise<DatabaseHealth> {
  return invokeTauri<DatabaseHealth>('load_database');
}
