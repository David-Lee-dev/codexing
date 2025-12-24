use crate::models::config::AppConfig;
use crate::services::file_service;

use tracing::info;

#[tauri::command]
pub fn get_config(app_handle: tauri::AppHandle) -> AppConfig {
    info!("Fetching app configuration");
    file_service::load_config(&app_handle)
}

#[tauri::command]
pub fn save_config(app_handle: tauri::AppHandle, config: AppConfig) -> Result<(), String> {
    info!("Saving app configuration");
    file_service::save_config(&app_handle, &config)
}
