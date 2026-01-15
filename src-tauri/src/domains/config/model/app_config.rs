use crate::domains::config::model::tab::Tab;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct AppConfigSaveDto {
    pub storage_path: Option<Option<String>>,
    pub is_database_initialized: Option<Option<bool>>,
    pub tabs: Option<Option<Vec<Tab>>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct AppConfig {
    pub storage_path: Option<String>,
    pub is_database_initialized: bool,
    pub tabs: Vec<Tab>,
}

impl Default for AppConfig {
    fn default() -> Self {
        AppConfig {
            storage_path: None,
            is_database_initialized: false,
            tabs: Vec::new(),
        }
    }
}

impl AppConfig {
    pub fn merge(&self, dto: &AppConfigSaveDto) -> AppConfig {
        AppConfig {
            storage_path: match &dto.storage_path {
                None => self.storage_path.clone(),
                Some(None) => None,
                Some(Some(value)) => Some(value.clone()),
            },
            is_database_initialized: dto
                .is_database_initialized
                .as_ref()
                .and_then(|inner| *inner)
                .unwrap_or(self.is_database_initialized),
            tabs: match &dto.tabs {
                None => self.tabs.clone(),
                Some(None) => Vec::new(),
                Some(Some(vec)) => vec.clone(),
            },
        }
    }
}
