use crate::storage;
use tracing::info;

#[tauri::command]
pub fn select_storage_folder(
    app_handle: tauri::AppHandle,
    selected_path: String,
) -> Result<String, String> {
    storage::select_and_set_storage_folder(&app_handle, selected_path)
}

#[tauri::command]
pub fn set_storage_path(app_handle: tauri::AppHandle, path: String) -> Result<(), String> {
    info!("Setting storage path: {}", path);
    storage::set_storage_path(&app_handle, path)
}

