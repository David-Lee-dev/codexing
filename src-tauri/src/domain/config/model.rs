use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppConfig {
    pub storage_path: Option<String>,
    pub is_onboarding_complete: bool,
}

impl Default for AppConfig {
    fn default() -> Self {
        AppConfig {
            storage_path: None,
            is_onboarding_complete: false,
        }
    }
}

