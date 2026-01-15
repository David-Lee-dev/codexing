use crate::domains::document::model::Block;
use crate::domains::document::service;
use once_cell::sync::Lazy;
use std::collections::HashSet;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::time::Duration;
use tauri::AppHandle;
use tokio::sync::Mutex;
use tokio::time::sleep;
use tracing::{error, info};

const EMBEDDING_DIMENSION: usize = 384;
const SIMILARITY_THRESHOLD: f32 = 0.5;
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

        // 1. Calculate and save embedding
        let embedding = calculate_embedding(&block);
        service::save_block_vector(app_handle, &block.id, &embedding)?;

        // 2. Sync edges for this document
        self.sync_document_edges(app_handle, &block.document_id, &embedding)?;

        service::update_block_indexing_status(app_handle, &block.id, 1)?;

        info!("Block indexed: {}", block.id);
        Ok(true)
    }

    fn sync_document_edges(
        &self,
        app_handle: &AppHandle,
        document_id: &str,
        embedding: &[f32],
    ) -> anyhow::Result<()> {
        // A group: Find similar documents via vector search
        let similar_blocks = service::find_similar_blocks_with_document(
            app_handle,
            embedding,
            SIMILARITY_THRESHOLD,
            SIMILARITY_SEARCH_LIMIT,
        )?;

        // Collect unique document IDs from similar blocks (excluding self)
        let similar_doc_ids: HashSet<String> = similar_blocks
            .into_iter()
            .map(|(_, doc_id, _)| doc_id)
            .filter(|doc_id| doc_id != document_id)
            .collect();

        // B group: Get existing edge target documents
        let existing_edges = service::find_edges_by_source(app_handle, document_id)?;
        let existing_doc_ids: HashSet<String> =
            existing_edges.into_iter().map(|(target_id, _)| target_id).collect();

        // Add edges for documents in A but not in B
        for doc_id in similar_doc_ids.difference(&existing_doc_ids) {
            service::create_edge(app_handle, document_id, doc_id, Some("similar"), 1.0)?;
            info!("Edge added: {} -> {}", document_id, doc_id);
        }

        // Remove edges for documents in B but not in A
        for doc_id in existing_doc_ids.difference(&similar_doc_ids) {
            service::delete_edge(app_handle, document_id, doc_id)?;
            info!("Edge removed: {} -> {}", document_id, doc_id);
        }

        Ok(())
    }
}

impl Default for IndexingScheduler {
    fn default() -> Self {
        Self::new()
    }
}

fn calculate_embedding(block: &Block) -> Vec<f32> {
    let content = block.content.as_deref().unwrap_or("");
    let mut embedding = vec![0.0f32; EMBEDDING_DIMENSION];

    if content.is_empty() {
        return embedding;
    }

    for (i, c) in content.chars().enumerate() {
        let idx = i % EMBEDDING_DIMENSION;
        embedding[idx] += (c as u32 as f32) / 1000.0;
    }

    let magnitude: f32 = embedding.iter().map(|x| x * x).sum::<f32>().sqrt();
    if magnitude > 0.0 {
        for val in &mut embedding {
            *val /= magnitude;
        }
    }

    embedding
}

pub static INDEXING_SCHEDULER: Lazy<IndexingScheduler> = Lazy::new(IndexingScheduler::new);
