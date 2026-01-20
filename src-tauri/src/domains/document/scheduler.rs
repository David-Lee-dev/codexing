use crate::domains::config::service::load_config;
use crate::domains::document::embedding::calculate_text_embedding;
use crate::domains::document::model::{Block, EdgeChangeInfo, GraphEdge};
use crate::domains::document::service;
use once_cell::sync::Lazy;
use std::collections::{HashSet, HashMap};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::time::Duration;
use tauri::{AppHandle, Emitter};
use tokio::sync::Mutex;
use tokio::time::sleep;
use tracing::{error, info};

const DEFAULT_SIMILARITY_THRESHOLD: f32 = 0.5;
const SIMILARITY_SEARCH_LIMIT: i64 = 100;

pub struct IndexingScheduler {
    is_running: AtomicBool,
    app_handle: Arc<Mutex<Option<AppHandle>>>,
}

impl IndexingScheduler {
    pub fn new() -> Self {
        Self {
            is_running: AtomicBool::new(false),
            app_handle: Arc::new(Mutex::new(None)),
        }
    }

    pub async fn start(&self, app_handle: AppHandle) {
        {
            let mut handle = self.app_handle.lock().await;
            *handle = Some(app_handle);
        }

        if !self.is_running.swap(true, Ordering::SeqCst) {
            info!("Indexing scheduler started");
            self.run_loop().await;
        }
    }

    pub fn stop(&self) {
        self.is_running.store(false, Ordering::SeqCst);
        info!("Indexing scheduler stopped");
    }

    async fn run_loop(&self) {
        while self.is_running.load(Ordering::SeqCst) {
            let app_handle = {
                let handle = self.app_handle.lock().await;
                handle.clone()
            };

            if let Some(ref handle) = app_handle {
                match self.process_next_block(handle) {
                    Ok(true) => continue,
                    Ok(false) => sleep(Duration::from_secs(5)).await,
                    Err(e) => {
                        error!("Error processing block: {:?}", e);
                        sleep(Duration::from_secs(10)).await;
                    }
                }
            } else {
                sleep(Duration::from_secs(1)).await;
            }
        }
    }

    fn process_next_block(&self, app_handle: &AppHandle) -> anyhow::Result<bool> {
        let block = match service::get_oldest_pending_block(app_handle)? {
            Some(block) => block,
            None => return Ok(false),
        };

        let content = block.content.as_deref().unwrap_or("");
        if content.trim().is_empty() {
            service::update_block_indexing_status(app_handle, &block.id, 1)?;
            info!("Block skipped (empty content): {}", block.id);
            return Ok(true);
        }

        info!("Processing block: {}", block.id);

        let threshold = load_config(app_handle)
            .map(|config| config.vector_settings.similarity_threshold)
            .unwrap_or(DEFAULT_SIMILARITY_THRESHOLD);

        // 1. Calculate and save embedding
        let embedding = calculate_text_embedding(content);
        service::save_block_vector(app_handle, &block.id, &embedding)?;

        // 2. Sync edges for this document
        self.sync_document_edges(app_handle, &block.document_id, &embedding, threshold)?;

        service::update_block_indexing_status(app_handle, &block.id, 1)?;

        info!("Block indexed: {}", block.id);
        Ok(true)
    }

    fn sync_document_edges(
        &self,
        app_handle: &AppHandle,
        document_id: &str,
        embedding: &[f32],
        threshold: f32,
    ) -> anyhow::Result<()> {
        // A group: Find similar documents via vector search
        let similar_blocks = service::find_similar_blocks_with_document(
            app_handle,
            embedding,
            threshold,
            SIMILARITY_SEARCH_LIMIT,
        )?;

        // Count similar blocks per document (excluding self-document)
        let mut similar_blocks_per_doc: HashMap<String, usize> = HashMap::new();
        for (_, doc_id, _) in similar_blocks.iter() {
            if doc_id != document_id {
                *similar_blocks_per_doc.entry(doc_id.clone()).or_insert(0) += 1;
            }
        }

        let similar_doc_ids: HashSet<String> = similar_blocks_per_doc.keys().cloned().collect();

        // B group: Get existing edge documents (both directions)
        let existing_edges = service::find_related_documents(app_handle, document_id)?;
        let existing_doc_ids: HashSet<String> =
            existing_edges.into_iter().map(|(doc_id, _)| doc_id).collect();

        let mut added_edges: Vec<GraphEdge> = Vec::new();
        let mut removed_edges: Vec<GraphEdge> = Vec::new();

        // Add edges for documents in A but not in B, with weight based on similar block count
        for doc_id in similar_doc_ids.difference(&existing_doc_ids) {
            if let Some(similar_count) = similar_blocks_per_doc.get(doc_id) {
                let weight = *similar_count as f64 / 10.0; // Normalize to roughly 0.0-1.0 range
                let weight = weight.min(1.0); // Cap at 1.0
                service::create_edge(app_handle, document_id, doc_id, Some("similar"), weight)?;
                info!("Edge added: {} -> {} (weight: {:.2})", document_id, doc_id, weight);

                added_edges.push(GraphEdge {
                    source: document_id.to_string(),
                    target: doc_id.clone(),
                    edge_type: "document-document".to_string(),
                    weight: Some(weight),
                });
            }
        }

        // Remove edges for documents in B but not in A
        for doc_id in existing_doc_ids.difference(&similar_doc_ids) {
            service::delete_edge_bidirectional(app_handle, document_id, doc_id)?;
            info!("Edge removed: {} <-> {}", document_id, doc_id);

            removed_edges.push(GraphEdge {
                source: document_id.to_string(),
                target: doc_id.clone(),
                edge_type: "document-document".to_string(),
                weight: None,
            });
        }

        if !added_edges.is_empty() || !removed_edges.is_empty() {
            let change_info = EdgeChangeInfo {
                added_edges,
                removed_edges,
            };
            let _ = app_handle.emit("graph-edge-changed", change_info);
        }

        Ok(())
    }
}

impl Default for IndexingScheduler {
    fn default() -> Self {
        Self::new()
    }
}

pub static INDEXING_SCHEDULER: Lazy<IndexingScheduler> = Lazy::new(IndexingScheduler::new);
