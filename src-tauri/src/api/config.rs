use crate::domain::config;
use tracing::info;

#[tauri::command]
pub fn get_config(app_handle: tauri::AppHandle) -> config::AppConfig {
    info!("Fetching app configuration");
    config::load_config(&app_handle)
}

