use crate::domains::config::service::load_config;
use crate::domains::document::error::DocumentError;
use crate::domains::document::model::{
    Block, Document, DocumentDeletedEvent, DocumentGraphInfo, DocumentUpdatedEvent, GraphData,
    GraphEdge, GraphNode, SearchResult,
};
use crate::domains::document::repository;
use crate::infrastructure::database::connection::create_connection;
use crate::utils::error_logger::ResultExt;
use crate::utils::file_system::create_directory;
use anyhow::anyhow;
use rusqlite::Connection;
use std::path::PathBuf;
use tauri::{AppHandle, Emitter};

// ============================================
// Connection Helper
// ============================================

fn get_connection(app_handle: &AppHandle) -> Result<Connection, DocumentError> {
    let config =
        load_config(app_handle).map_err_log("get_connection::load_config", DocumentError::ConfigLoadingError)?;

    create_connection(&PathBuf::from(config.storage_path.unwrap_or_default()))
        .map_err_log("get_connection::create_connection", DocumentError::DatabaseConnectionCreationError)
}

// ============================================
// Storage Service
// ============================================

pub fn ensure_storage(path: &str, name: &str) -> Result<String, DocumentError> {
    use crate::utils::error_logger::log_error_with_trace;

    let base_path = PathBuf::from(path);
    let storage_path = base_path.join(name);

    if !base_path.exists() {
        let err = DocumentError::PathDoesNotExistError(anyhow!("Path does not exist: {:?}", base_path));
        log_error_with_trace("ensure_storage::path_exists", &err);
        return Err(err);
    }

    if !base_path.is_dir() {
        let err = DocumentError::PathIsNotDirectoryError(anyhow!("Path is not a directory: {:?}", base_path));
        log_error_with_trace("ensure_storage::is_directory", &err);
        return Err(err);
    }

    create_directory(&storage_path)
        .map_err_log("ensure_storage::create_directory", DocumentError::PathCreationError)?;

    Ok(storage_path.to_string_lossy().into_owned())
}

// ============================================
// Document Service
// ============================================

pub fn get_document(app_handle: &AppHandle, document_id: &str) -> Result<Option<Document>, DocumentError> {
    let conn = get_connection(app_handle)?;

    repository::find_document_by_id(&conn, document_id)
        .map_err_log("get_document::find_document_by_id", DocumentError::DatabaseQueryError)
}

pub fn save_document(app_handle: &AppHandle, document: &Document) -> Result<(), DocumentError> {
    let conn = get_connection(app_handle)?;

    // Save document
    repository::upsert_document(&conn, document)
        .map_err_log("save_document::upsert_document", DocumentError::DatabaseQueryError)?;

    // Save blocks
    for block in &document.blocks {
        repository::upsert_block(&conn, block)
            .map_err_log("save_document::upsert_block", DocumentError::DatabaseQueryError)?;
    }

    let _ = app_handle.emit(
        "document-updated",
        DocumentUpdatedEvent {
            document_id: document.id.clone(),
            title: document.title.clone(),
            tags: document.tags.clone(),
            updated_at: document.updated_at.clone().unwrap_or_default(),
        },
    );

    Ok(())
}

pub fn retrieve_document(
    app_handle: &AppHandle,
    _query: Option<String>,
    page: i64,
) -> Result<Vec<Document>, DocumentError> {
    let conn = get_connection(app_handle)?;
    let limit = 50;
    let offset = (page - 1) * limit;

    repository::find_documents(&conn, limit, offset)
        .map_err_log("retrieve_document::find_documents", DocumentError::DatabaseQueryError)
}

pub fn search_documents(
    app_handle: &AppHandle,
    query: &str,
) -> Result<Vec<SearchResult>, DocumentError> {
    use crate::domains::document::embedding::calculate_text_embedding;
    use std::collections::HashSet;

    let conn = get_connection(app_handle)?;
    let sql_limit = 30;
    let vector_limit = 20;

    // 1. SQL text search (title, tags, content)
    let mut results = repository::search_documents(&conn, query, sql_limit)
        .map_err_log("search_documents::sql_search", DocumentError::DatabaseQueryError)?;

    // Track IDs already in results
    let mut seen_ids: HashSet<String> = results.iter().map(|r| r.id.clone()).collect();

    // 2. Vector similarity search
    let config = load_config(app_handle).map_err_log("search_documents::load_config", DocumentError::ConfigLoadingError)?;
    let threshold = config.vector_settings.similarity_threshold;

    let embedding = calculate_text_embedding(query);
    let vector_results = repository::search_by_vector(&conn, &embedding, threshold, vector_limit)
        .map_err_log("search_documents::vector_search", DocumentError::DatabaseQueryError)?;

    // 3. Merge results: add vector results that aren't already in SQL results
    for vector_result in vector_results {
        if !seen_ids.contains(&vector_result.id) {
            seen_ids.insert(vector_result.id.clone());
            results.push(vector_result);
        }
    }

    Ok(results)
}

// ============================================
// Block Service
// ============================================

pub fn get_block(app_handle: &AppHandle, block_id: &str) -> Result<Option<Block>, DocumentError> {
    let conn = get_connection(app_handle)?;

    repository::find_block_by_id(&conn, block_id)
        .map_err_log("get_block::find_block_by_id", DocumentError::DatabaseQueryError)
}

pub fn delete_block(app_handle: &AppHandle, block_id: &str) -> Result<(), DocumentError> {
    let conn = get_connection(app_handle)?;

    // Delete edges where this block is the source
    repository::delete_edges_by_source(&conn, block_id)
        .map_err_log("delete_block::delete_edges_by_source", DocumentError::DatabaseQueryError)?;

    // Delete edges where this block is the target
    repository::delete_edges_by_target(&conn, block_id)
        .map_err_log("delete_block::delete_edges_by_target", DocumentError::DatabaseQueryError)?;

    // Delete block vector
    repository::delete_block_vector(&conn, block_id)
        .map_err_log("delete_block::delete_block_vector", DocumentError::DatabaseQueryError)?;

    // Delete the block itself
    repository::delete_block(&conn, block_id)
        .map_err_log("delete_block::delete_block", DocumentError::DatabaseQueryError)?;

    Ok(())
}

pub fn delete_document(app_handle: &AppHandle, document_id: &str) -> Result<(), DocumentError> {
    let conn = get_connection(app_handle)?;

    let blocks = repository::find_blocks_by_document_id(&conn, document_id)
        .map_err_log("delete_document::find_blocks", DocumentError::DatabaseQueryError)?;

    for block in &blocks {
        repository::delete_edges_by_source(&conn, &block.id)
            .map_err_log("delete_document::delete_edges_source", DocumentError::DatabaseQueryError)?;

        repository::delete_edges_by_target(&conn, &block.id)
            .map_err_log("delete_document::delete_edges_target", DocumentError::DatabaseQueryError)?;

        repository::delete_block_vector(&conn, &block.id)
            .map_err_log("delete_document::delete_vector", DocumentError::DatabaseQueryError)?;
    }

    repository::delete_blocks_by_document_id(&conn, document_id)
        .map_err_log("delete_document::delete_blocks", DocumentError::DatabaseQueryError)?;

    repository::delete_document(&conn, document_id)
        .map_err_log("delete_document::delete_document", DocumentError::DatabaseQueryError)?;

    let _ = app_handle.emit(
        "document-deleted",
        DocumentDeletedEvent {
            document_id: document_id.to_string(),
        },
    );

    Ok(())
}

// ============================================
// Indexing Service
// ============================================

pub fn get_oldest_pending_block(app_handle: &AppHandle) -> Result<Option<Block>, DocumentError> {
    let conn = get_connection(app_handle)?;

    repository::find_oldest_pending_block(&conn)
        .map_err_log("get_oldest_pending_block::find", DocumentError::DatabaseQueryError)
}

pub fn update_block_indexing_status(
    app_handle: &AppHandle,
    block_id: &str,
    status: i16,
) -> Result<(), DocumentError> {
    let conn = get_connection(app_handle)?;

    repository::update_block_indexing_status(&conn, block_id, status)
        .map_err_log("update_block_indexing_status", DocumentError::DatabaseQueryError)
}

pub fn save_block_vector(
    app_handle: &AppHandle,
    block_id: &str,
    embedding: &[f32],
) -> Result<(), DocumentError> {
    let conn = get_connection(app_handle)?;

    repository::upsert_block_vector(&conn, block_id, embedding)
        .map_err_log("save_block_vector::upsert", DocumentError::DatabaseQueryError)
}

pub fn find_similar_blocks(
    app_handle: &AppHandle,
    embedding: &[f32],
    threshold: f32,
    limit: i64,
) -> Result<Vec<(String, f32)>, DocumentError> {
    let conn = get_connection(app_handle)?;

    repository::find_similar_blocks(&conn, embedding, threshold, limit)
        .map_err_log("find_similar_blocks", DocumentError::DatabaseQueryError)
}

pub fn find_similar_blocks_with_document(
    app_handle: &AppHandle,
    embedding: &[f32],
    threshold: f32,
    limit: i64,
) -> Result<Vec<(String, String, f32)>, DocumentError> {
    let conn = get_connection(app_handle)?;

    repository::find_similar_blocks_with_document(&conn, embedding, threshold, limit)
        .map_err_log("find_similar_blocks_with_document", DocumentError::DatabaseQueryError)
}

// ============================================
// Edge Service
// ============================================

pub fn create_edge(
    app_handle: &AppHandle,
    source_id: &str,
    target_id: &str,
    relation_type: Option<&str>,
    weight: f64,
) -> Result<(), DocumentError> {
    let conn = get_connection(app_handle)?;

    repository::upsert_edge(&conn, source_id, target_id, relation_type, weight)
        .map_err_log("create_edge::upsert_edge", DocumentError::DatabaseQueryError)
}

pub fn find_edges_by_source(
    app_handle: &AppHandle,
    source_id: &str,
) -> Result<Vec<(String, f64)>, DocumentError> {
    let conn = get_connection(app_handle)?;

    repository::find_edges_by_source_id(&conn, source_id)
        .map_err_log("find_edges_by_source", DocumentError::DatabaseQueryError)
}

pub fn delete_edge(
    app_handle: &AppHandle,
    source_id: &str,
    target_id: &str,
) -> Result<(), DocumentError> {
    let conn = get_connection(app_handle)?;

    repository::delete_edge(&conn, source_id, target_id)
        .map_err_log("delete_edge", DocumentError::DatabaseQueryError)
}

pub fn find_related_documents(
    app_handle: &AppHandle,
    document_id: &str,
) -> Result<Vec<(String, f64)>, DocumentError> {
    let conn = get_connection(app_handle)?;

    repository::find_related_documents_bidirectional(&conn, document_id)
        .map_err_log("find_related_documents", DocumentError::DatabaseQueryError)
}

pub fn delete_edge_bidirectional(
    app_handle: &AppHandle,
    source_id: &str,
    target_id: &str,
) -> Result<(), DocumentError> {
    let conn = get_connection(app_handle)?;

    repository::delete_edge_bidirectional(&conn, source_id, target_id)
        .map_err_log("delete_edge_bidirectional", DocumentError::DatabaseQueryError)
}

// ============================================
// Reindexing Service
// ============================================

pub fn reset_all_indexing_status(app_handle: &AppHandle) -> Result<u64, DocumentError> {
    let conn = get_connection(app_handle)?;

    repository::reset_all_indexing_status(&conn)
        .map_err_log("reset_all_indexing_status", DocumentError::DatabaseQueryError)
}

pub fn clear_all_edges(app_handle: &AppHandle) -> Result<u64, DocumentError> {
    let conn = get_connection(app_handle)?;

    repository::delete_all_edges(&conn)
        .map_err_log("clear_all_edges", DocumentError::DatabaseQueryError)
}

pub fn clear_all_vectors(app_handle: &AppHandle) -> Result<u64, DocumentError> {
    let conn = get_connection(app_handle)?;

    repository::delete_all_vectors(&conn)
        .map_err_log("clear_all_vectors", DocumentError::DatabaseQueryError)
}

// ============================================
// Graph Service
// ============================================

pub fn get_graph_data(app_handle: &AppHandle) -> Result<GraphData, DocumentError> {
    use std::collections::HashSet;

    let conn = get_connection(app_handle)?;

    let documents = repository::find_all_documents_for_graph(&conn)
        .map_err_log("get_graph_data::find_documents", DocumentError::DatabaseQueryError)?;

    let db_edges = repository::find_all_edges(&conn)
        .map_err_log("get_graph_data::find_edges", DocumentError::DatabaseQueryError)?;

    let mut nodes: Vec<GraphNode> = Vec::new();
    let mut edges: Vec<GraphEdge> = Vec::new();
    let mut tag_set: HashSet<String> = HashSet::new();

    for (doc_id, title, tags_str) in &documents {
        nodes.push(GraphNode {
            id: doc_id.clone(),
            label: title.clone().unwrap_or_else(|| "Untitled".to_string()),
            node_type: "document".to_string(),
        });

        if let Some(tags) = tags_str {
            for tag in tags.split(',').map(|s| s.trim()).filter(|s| !s.is_empty()) {
                tag_set.insert(tag.to_string());

                edges.push(GraphEdge {
                    source: doc_id.clone(),
                    target: format!("tag:{}", tag),
                    edge_type: "document-tag".to_string(),
                    weight: None,
                });
            }
        }
    }

    for tag in tag_set {
        nodes.push(GraphNode {
            id: format!("tag:{}", tag),
            label: tag,
            node_type: "tag".to_string(),
        });
    }

    for (source_id, target_id, _relation_type, weight) in db_edges {
        edges.push(GraphEdge {
            source: source_id,
            target: target_id,
            edge_type: "document-document".to_string(),
            weight: Some(weight),
        });
    }

    Ok(GraphData { nodes, edges })
}

pub fn get_document_graph_info(document: &Document) -> DocumentGraphInfo {
    let document_node = GraphNode {
        id: document.id.clone(),
        label: document
            .title
            .clone()
            .unwrap_or_else(|| "Untitled".to_string()),
        node_type: "document".to_string(),
    };

    let mut tag_nodes: Vec<GraphNode> = Vec::new();
    let mut tag_edges: Vec<GraphEdge> = Vec::new();

    if let Some(tags) = &document.tags {
        for tag in tags {
            let tag_id = format!("tag:{}", tag);

            tag_nodes.push(GraphNode {
                id: tag_id.clone(),
                label: tag.clone(),
                node_type: "tag".to_string(),
            });

            tag_edges.push(GraphEdge {
                source: document.id.clone(),
                target: tag_id,
                edge_type: "document-tag".to_string(),
                weight: None,
            });
        }
    }

    DocumentGraphInfo {
        document_id: document.id.clone(),
        document_node,
        tag_nodes,
        tag_edges,
    }
}
