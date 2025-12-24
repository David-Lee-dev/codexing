use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct DatabaseHealth {
    pub connected: bool,
    pub sqlite_vec_loaded: bool,
    pub wal_mode: bool,
    pub foreign_keys_enabled: bool,
}

impl Default for DatabaseHealth {
    fn default() -> Self {
        DatabaseHealth {
            connected: false,
            sqlite_vec_loaded: false,
            wal_mode: false,
            foreign_keys_enabled: false,
        }
    }
}
