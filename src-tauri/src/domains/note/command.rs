use crate::domains::common::model::CommandResponse;
use crate::domains::note::model::Document;
use crate::domains::note::service::{ensure_storage, get_document as get_document_service};
use tauri::AppHandle;

#[tauri::command]
pub fn select_storage(_app_handle: AppHandle, selected_path: String) -> CommandResponse<()> {
    match ensure_storage(&selected_path, "codex") {
        Ok(_) => CommandResponse {
            success: true,
            code: 200,
            message: "Storage selected successfully".to_string(),
            data: None,
        },
        Err(_) => CommandResponse {
            success: false,
            code: 500,
            message: "Failed to select storage".to_string(),
            data: None,
        },
    }
}

#[tauri::command]
pub fn get_document(app_handle: AppHandle, document_id: String) -> CommandResponse<Document> {
    match get_document_service(&app_handle, &document_id) {
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
