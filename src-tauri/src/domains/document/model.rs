use serde::{Deserialize, Serialize};

// ============================================
// Document & Block Models
// ============================================

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

// ============================================
// Graph Models
// ============================================

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GraphData {
    pub nodes: Vec<GraphNode>,
    pub edges: Vec<GraphEdge>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GraphNode {
    pub id: String,
    pub label: String,
    pub node_type: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GraphEdge {
    pub source: String,
    pub target: String,
    pub edge_type: String,
    pub weight: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DocumentGraphInfo {
    pub document_id: String,
    pub document_node: GraphNode,
    pub tag_nodes: Vec<GraphNode>,
    pub tag_edges: Vec<GraphEdge>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EdgeChangeInfo {
    pub added_edges: Vec<GraphEdge>,
    pub removed_edges: Vec<GraphEdge>,
}

// ============================================
// Event Models
// ============================================

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DocumentDeletedEvent {
    pub document_id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DocumentUpdatedEvent {
    pub document_id: String,
    pub title: Option<String>,
    pub tags: Option<Vec<String>>,
    pub updated_at: String,
}

// ============================================
// Search Models
// ============================================

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SearchResult {
    pub id: String,
    pub title: Option<String>,
    pub tags: Option<Vec<String>>,
    pub status: i16,
    pub match_type: String, // "title", "tag", "content", "similar"
    pub match_snippet: Option<String>,
    pub similarity_score: Option<f32>,
}
