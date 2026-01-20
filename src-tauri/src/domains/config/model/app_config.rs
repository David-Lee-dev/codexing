use crate::domains::config::model::tab::Tab;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct VectorSettings {
    pub similarity_threshold: f32,  // 0.0 ~ 1.0, default 0.5
}

impl Default for VectorSettings {
    fn default() -> Self {
        VectorSettings {
            similarity_threshold: 0.5,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct GraphColors {
    pub document_node: String,
    pub tag_node: String,
    pub document_link: String,
    pub tag_link: String,
}

impl Default for GraphColors {
    fn default() -> Self {
        GraphColors {
            document_node: "#3b82f6".to_string(),
            tag_node: "#22c55e".to_string(),
            document_link: "#94a3b8".to_string(),
            tag_link: "#86efac".to_string(),
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct GraphSettings {
    pub multi_hop_level: i32,
    pub colors: GraphColors,
}

impl Default for GraphSettings {
    fn default() -> Self {
        GraphSettings {
            multi_hop_level: 1,
            colors: GraphColors::default(),
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone, Default, PartialEq)]
pub enum GeminiModel {
    #[serde(rename = "gemini-2.5-flash")]
    Gemini25Flash,
    #[default]
    #[serde(rename = "gemini-2.0-flash")]
    Gemini20Flash,
    #[serde(rename = "gemini-2.0-flash-lite")]
    Gemini20FlashLite,
    #[serde(rename = "gemini-1.5-flash")]
    Gemini15Flash,
    #[serde(rename = "gemini-1.5-pro")]
    Gemini15Pro,
}

impl GeminiModel {
    pub fn as_str(&self) -> &'static str {
        match self {
            GeminiModel::Gemini25Flash => "gemini-2.5-flash",
            GeminiModel::Gemini20Flash => "gemini-2.0-flash",
            GeminiModel::Gemini20FlashLite => "gemini-2.0-flash-lite",
            GeminiModel::Gemini15Flash => "gemini-1.5-flash",
            GeminiModel::Gemini15Pro => "gemini-1.5-pro",
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct AppConfigSaveDto {
    pub storage_path: Option<Option<String>>,
    pub is_database_initialized: Option<Option<bool>>,
    pub tabs: Option<Option<Vec<Tab>>>,
    pub vector_settings: Option<Option<VectorSettings>>,
    pub graph_settings: Option<Option<GraphSettings>>,
    pub gemini_api_key: Option<Option<String>>,
    pub gemini_model: Option<Option<GeminiModel>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct AppConfig {
    pub storage_path: Option<String>,
    pub is_database_initialized: bool,
    pub tabs: Vec<Tab>,
    pub vector_settings: VectorSettings,
    pub graph_settings: GraphSettings,
    pub gemini_api_key: Option<String>,
    pub gemini_model: GeminiModel,
}

impl Default for AppConfig {
    fn default() -> Self {
        AppConfig {
            storage_path: None,
            is_database_initialized: false,
            tabs: Vec::new(),
            vector_settings: VectorSettings::default(),
            graph_settings: GraphSettings::default(),
            gemini_api_key: None,
            gemini_model: GeminiModel::default(),
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
            vector_settings: match &dto.vector_settings {
                None => self.vector_settings.clone(),
                Some(None) => VectorSettings::default(),
                Some(Some(settings)) => settings.clone(),
            },
            graph_settings: match &dto.graph_settings {
                None => self.graph_settings.clone(),
                Some(None) => GraphSettings::default(),
                Some(Some(settings)) => settings.clone(),
            },
            gemini_api_key: match &dto.gemini_api_key {
                None => self.gemini_api_key.clone(),
                Some(None) => None,
                Some(Some(value)) => Some(value.clone()),
            },
            gemini_model: match &dto.gemini_model {
                None => self.gemini_model.clone(),
                Some(None) => GeminiModel::default(),
                Some(Some(model)) => model.clone(),
            },
        }
    }
}
