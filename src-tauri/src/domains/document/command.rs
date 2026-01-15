use crate::domains::common::model::CommandResponse;
use crate::domains::document::model::Document;
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
pub fn save_document(app_handle: AppHandle, document: Document) -> CommandResponse<()> {
    match service::save_document(&app_handle, &document) {
        Ok(_) => CommandResponse {
            success: true,
            code: 200,
            message: "Document saved successfully".to_string(),
            data: None,
        },
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

