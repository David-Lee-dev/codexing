use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Tab {
    pub document_id: String,
    pub block_id: String,
    pub is_active: bool,
    pub cursor: u32,
    pub title: Option<String>,
}
