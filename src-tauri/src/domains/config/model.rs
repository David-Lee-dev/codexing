use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Tab {
    pub id: uuid::Uuid,
    pub focused: bool,
}

impl Default for Tab {
    fn default() -> Self {
        Tab {
            id: Uuid::new_v4(),
            focused: false,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppConfig {
    pub storage_path: Option<String>,
    pub is_onboarding_complete: bool,
    pub tabs: Vec<Tab>,
}

impl Default for AppConfig {
    fn default() -> Self {
        AppConfig {
            storage_path: None,
            is_onboarding_complete: false,
            tabs: Vec::new(),
        }
    }
}

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
