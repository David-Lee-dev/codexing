use crate::domains::common::model::CommandResponse;
use crate::domains::note::service::ensure_storage;
use tauri::AppHandle;

#[tauri::command]
pub fn select_storage(_: AppHandle, selected_path: String) -> CommandResponse<()> {
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
