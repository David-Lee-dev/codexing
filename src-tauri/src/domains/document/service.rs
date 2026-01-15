use crate::domains::config::service::load_config;
use crate::domains::document::error::DocumentError;
use crate::domains::document::model::{Block, Document};
use crate::domains::document::repository;
use crate::infrastructure::database::connection::create_connection;
use crate::utils::error_logger::ResultExt;
use crate::utils::file_system::create_directory;
use anyhow::anyhow;
use rusqlite::Connection;
use std::path::PathBuf;
use tauri::AppHandle;

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

    Ok(())
}

pub fn retrieve_document(
    app_handle: &AppHandle,
    _query: Option<String>, // TODO: Implement query
    page: i64,
) -> Result<Vec<Document>, DocumentError> {
    let conn = get_connection(app_handle)?;
    let limit = 50;
    let offset = (page - 1) * limit;

    repository::find_documents(&conn, limit, offset)
        .map_err_log("retrieve_document::find_documents", DocumentError::DatabaseQueryError)
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
