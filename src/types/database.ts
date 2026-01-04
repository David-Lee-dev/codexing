export interface DatabaseHealth {
  connected: boolean;
  sqlite_vec_loaded: boolean;
  wal_mode: boolean;
  foreign_keys_enabled: boolean;
}

export function isDatabaseHealthy(health: DatabaseHealth): boolean {
  return (
    health.connected &&
    health.sqlite_vec_loaded &&
    health.wal_mode &&
    health.foreign_keys_enabled
  );
}
