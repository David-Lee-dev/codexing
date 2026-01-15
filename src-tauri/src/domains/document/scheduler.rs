use crate::domains::document::error::DocumentError;
use crate::domains::document::model::Block;
use crate::domains::document::service;
use once_cell::sync::Lazy;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::time::Duration;
use tauri::AppHandle;
use tokio::sync::Mutex;
use tokio::time::sleep;
use tracing::{error, info};

// ============================================
// Scheduler State
// ============================================

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
        // Store app_handle
        {
            let mut handle = self.app_handle.lock().await;
            *handle = Some(app_handle);
        }

        // Start the background task
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
            // Get app_handle
            let app_handle = {
                let handle = self.app_handle.lock().await;
                handle.clone()
            };

            if let Some(ref handle) = app_handle {
                match self.process_next_block(handle).await {
                    Ok(true) => {
                        // Block processed, continue immediately
                        continue;
                    }
                    Ok(false) => {
                        // No pending blocks, wait before checking again
                        sleep(Duration::from_secs(5)).await;
                    }
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

    async fn process_next_block(&self, app_handle: &AppHandle) -> Result<bool, DocumentError> {
        // Find the oldest pending block
        let block = match service::get_oldest_pending_block(app_handle)? {
            Some(block) => block,
            None => return Ok(false),
        };

        info!("Processing block: {}", block.id);

        // Calculate embedding
        let embedding = calculate_embedding(&block)?;

        // Save the vector
        service::save_block_vector(app_handle, &block.id, &embedding)?;

        service::update_block_indexing_status(app_handle, &block.id, 1)?;

        // Find similar blocks and create edges
        create_similarity_edges(app_handle, &block, &embedding)?;

        info!("Block indexed successfully: {}", block.id);
        Ok(true)
    }
}

impl Default for IndexingScheduler {
    fn default() -> Self {
        Self::new()
    }
}

// ============================================
// Embedding Calculation
// ============================================

fn calculate_embedding(block: &Block) -> Result<Vec<f32>, DocumentError> {
    // TODO: Implement actual embedding calculation using a model
    // For now, return a placeholder embedding

    let content = block.content.as_deref().unwrap_or("");

    // Simple placeholder: create a 384-dimensional vector based on content hash
    // This should be replaced with actual embedding model (e.g., sentence-transformers)
    let mut embedding = vec![0.0f32; 384];

    if !content.is_empty() {
        // Simple hash-based placeholder
        for (i, c) in content.chars().enumerate() {
            let idx = i % 384;
            embedding[idx] += (c as u32 as f32) / 1000.0;
        }

        // Normalize
        let magnitude: f32 = embedding.iter().map(|x| x * x).sum::<f32>().sqrt();
        if magnitude > 0.0 {
            for val in &mut embedding {
                *val /= magnitude;
            }
        }
    }

    Ok(embedding)
}

// ============================================
// Edge Creation
// ============================================

fn create_similarity_edges(
    app_handle: &AppHandle,
    source_block: &Block,
    embedding: &[f32],
) -> Result<(), DocumentError> {
    const SIMILARITY_THRESHOLD: f32 = 0.8;
    const MAX_SIMILAR_BLOCKS: i64 = 10;

    // Find similar blocks
    let similar_blocks = service::find_similar_blocks(
        app_handle,
        embedding,
        SIMILARITY_THRESHOLD,
        MAX_SIMILAR_BLOCKS,
    )?;

    // Get source document ID
    let source_doc_id = &source_block.document_id;

    // Create edges between documents
    for (similar_block_id, distance) in similar_blocks {
        // Skip self
        if similar_block_id == source_block.id {
            continue;
        }

        // Get the similar block to find its document
        if let Some(similar_block) = service::get_block(app_handle, &similar_block_id)? {
            let target_doc_id = &similar_block.document_id;

            // Skip if same document
            if source_doc_id == target_doc_id {
                continue;
            }

            // Calculate weight (inverse of distance, higher is more similar)
            let weight = 1.0 - distance as f64;

            // Create bidirectional edges
            service::create_edge(
                app_handle,
                source_doc_id,
                target_doc_id,
                Some("SIMILAR"),
                weight,
            )?;

            service::create_edge(
                app_handle,
                target_doc_id,
                source_doc_id,
                Some("SIMILAR"),
                weight,
            )?;

            info!(
                "Created edge: {} <-> {} (weight: {:.3})",
                source_doc_id, target_doc_id, weight
            );
        }
    }

    Ok(())
}

// ============================================
// Global Scheduler Instance
// ============================================

pub static INDEXING_SCHEDULER: Lazy<IndexingScheduler> = Lazy::new(IndexingScheduler::new);
