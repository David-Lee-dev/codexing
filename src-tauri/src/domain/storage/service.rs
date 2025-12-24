use crate::domain::config;
use crate::infrastructure::storage::file_system;
use tracing::info;

/// Create codex directory in selected path
pub fn create_codex_directory(selected_path: &str) -> Result<String, String> {
    file_system::create_codex_directory(selected_path)
}

/// Set storage path in configuration
pub fn set_storage_path(app_handle: &tauri::AppHandle, path: String) -> Result<(), String> {
    let storage_path = std::path::PathBuf::from(&path);
    file_system::validate_path(&storage_path)?;

    let mut app_config = config::load_config(app_handle);
    app_config.storage_path = Some(path);
    app_config.is_onboarding_complete = true;
    config::save_config(app_handle, &app_config)?;

    Ok(())
}

pub fn select_and_set_storage_folder(
    app_handle: &tauri::AppHandle,
    selected_path: String,
) -> Result<String, String> {
    info!("Selecting storage folder: {}", selected_path);

    let codex_path_str = create_codex_directory(&selected_path)?;

    let mut app_config = config::load_config(app_handle);
    app_config.storage_path = Some(codex_path_str.clone());
    app_config.is_onboarding_complete = true;
    config::save_config(app_handle, &app_config)?;

    Ok(codex_path_str)
}
