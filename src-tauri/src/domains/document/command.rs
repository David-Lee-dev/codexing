use crate::domains::common::model::CommandResponse;
use crate::domains::document::model::{Document, DocumentGraphInfo, GraphData, SearchResult};
use crate::domains::document::service;
use tauri::AppHandle;

// ============================================
// Storage Commands
// ============================================

#[tauri::command]
pub fn select_storage(_app_handle: AppHandle, selected_path: String) -> CommandResponse<String> {
    match service::ensure_storage(&selected_path, "codex") {
        Ok(storage_path) => CommandResponse {
            success: true,
            code: 200,
            message: "Storage selected successfully".to_string(),
            data: Some(storage_path),
        },
        Err(_) => CommandResponse {
            success: false,
            code: 500,
            message: "Failed to select storage".to_string(),
            data: None,
        },
    }
}

// ============================================
// Document Commands
// ============================================

#[tauri::command]
pub fn get_document(app_handle: AppHandle, document_id: String) -> CommandResponse<Document> {
    match service::get_document(&app_handle, &document_id) {
        Ok(document) => CommandResponse {
            success: true,
            code: 200,
            message: "Document retrieved successfully".to_string(),
            data: document,
        },
        Err(_) => CommandResponse {
            success: false,
            code: 500,
            message: "Failed to get document".to_string(),
            data: None,
        },
    }
}

#[tauri::command]
pub fn save_document(
    app_handle: AppHandle,
    document: Document,
) -> CommandResponse<DocumentGraphInfo> {
    match service::save_document(&app_handle, &document) {
        Ok(_) => {
            let graph_info = service::get_document_graph_info(&document);
            CommandResponse {
                success: true,
                code: 200,
                message: "Document saved successfully".to_string(),
                data: Some(graph_info),
            }
        }
        Err(_) => CommandResponse {
            success: false,
            code: 500,
            message: "Failed to save document".to_string(),
            data: None,
        },
    }
}

#[tauri::command]
pub fn retrieve_document(
    app_handle: AppHandle,
    query: Option<String>,
    page: i64,
) -> CommandResponse<Vec<Document>> {
    match service::retrieve_document(&app_handle, query, page) {
        Ok(documents) => CommandResponse {
            success: true,
            code: 200,
            message: "Documents retrieved successfully".to_string(),
            data: Some(documents),
        },
        Err(_) => CommandResponse {
            success: false,
            code: 500,
            message: "Failed to retrieve documents".to_string(),
            data: None,
        },
    }
}

#[tauri::command]
pub fn delete_document(app_handle: AppHandle, document_id: String) -> CommandResponse<String> {
    match service::delete_document(&app_handle, &document_id) {
        Ok(_) => CommandResponse {
            success: true,
            code: 200,
            message: "Document deleted successfully".to_string(),
            data: Some(document_id),
        },
        Err(_) => CommandResponse {
            success: false,
            code: 500,
            message: "Failed to delete document".to_string(),
            data: None,
        },
    }
}

#[tauri::command]
pub fn search_documents(app_handle: AppHandle, query: String) -> CommandResponse<Vec<SearchResult>> {
    match service::search_documents(&app_handle, &query) {
        Ok(results) => CommandResponse {
            success: true,
            code: 200,
            message: "Search completed successfully".to_string(),
            data: Some(results),
        },
        Err(_) => CommandResponse {
            success: false,
            code: 500,
            message: "Search failed".to_string(),
            data: None,
        },
    }
}

// ============================================
// Block Commands
// ============================================

#[tauri::command]
pub fn delete_block(app_handle: AppHandle, block_id: String) -> CommandResponse<()> {
    match service::delete_block(&app_handle, &block_id) {
        Ok(_) => CommandResponse {
            success: true,
            code: 200,
            message: "Block deleted successfully".to_string(),
            data: None,
        },
        Err(_) => CommandResponse {
            success: false,
            code: 500,
            message: "Failed to delete block".to_string(),
            data: None,
        },
    }
}

// ============================================
// Reindexing Commands
// ============================================

#[tauri::command]
pub fn trigger_reindex_all(app_handle: AppHandle) -> CommandResponse<()> {
    // 1. Delete all vectors
    if let Err(_) = service::clear_all_vectors(&app_handle) {
        return CommandResponse {
            success: false,
            code: 500,
            message: "Failed to clear vectors".to_string(),
            data: None,
        };
    }

    // 2. Delete all edges
    if let Err(_) = service::clear_all_edges(&app_handle) {
        return CommandResponse {
            success: false,
            code: 500,
            message: "Failed to clear edges".to_string(),
            data: None,
        };
    }

    // 3. Reset all indexing status
    if let Err(_) = service::reset_all_indexing_status(&app_handle) {
        return CommandResponse {
            success: false,
            code: 500,
            message: "Failed to reset indexing status".to_string(),
            data: None,
        };
    }

    CommandResponse {
        success: true,
        code: 200,
        message: "Reindex triggered successfully".to_string(),
        data: None,
    }
}

// ============================================
// Graph Commands
// ============================================

#[tauri::command]
pub fn get_graph_data(app_handle: AppHandle) -> CommandResponse<GraphData> {
    match service::get_graph_data(&app_handle) {
        Ok(graph_data) => CommandResponse {
            success: true,
            code: 200,
            message: "Graph data retrieved successfully".to_string(),
            data: Some(graph_data),
        },
        Err(_) => CommandResponse {
            success: false,
            code: 500,
            message: "Failed to get graph data".to_string(),
            data: None,
        },
    }
}

