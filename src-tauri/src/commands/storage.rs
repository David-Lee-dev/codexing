use crate::services::file_service;
use tracing::info;

#[tauri::command]
pub fn select_storage_folder(
    app_handle: tauri::AppHandle,
    selected_path: String,
) -> Result<String, String> {
    info!("Selecting storage folder: {}", selected_path);

    let codex_path = file_service::create_directory(&app_handle, "codex")?;

    Ok(codex_path)
}
