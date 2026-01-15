use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Document {
    pub id: String,
    pub title: Option<String>,
    pub status: i16,
    pub tags: Option<Vec<String>>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
    pub blocks: Vec<Block>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Block {
    pub id: String,
    pub document_id: String,
    pub content: Option<String>,
    pub order_index: f64,
    pub source_document_id: Option<String>,
    pub indexing_status: i16,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}
