export interface DatabaseHealth {
  connected: boolean;
  sqlite_vec_loaded: boolean;
  wal_mode: boolean;
  foreign_keys_enabled: boolean;
}
