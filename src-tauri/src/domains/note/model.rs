use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Document {
    pub id: String,
    pub title: String,
    pub status: String,
    pub tags: Option<Vec<String>>,
    pub created_at: String,
    pub updated_at: String,
    pub blocks: Option<Vec<Block>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Block {
    pub id: String,
    pub document_id: String,
    pub block_type: Option<String>,
    pub content: Option<String>,
    pub order_index: f64,
    pub source_document_id: Option<String>,
    pub indexing_status: String,
    pub created_at: String,
    pub updated_at: String,
}
