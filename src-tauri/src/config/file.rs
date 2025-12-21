use super::AppConfig;
use std::fs;
use std::path::{Path, PathBuf};
use tauri::Manager;

/// 설정 파일 경로 가져오기
pub fn get_config_path(app_handle: &tauri::AppHandle) -> Result<PathBuf, String> {
    let app_data = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data directory: {}", e))?;
    fs::create_dir_all(&app_data)
        .map_err(|e| format!("Failed to create app data directory: {}", e))?;
    Ok(app_data.join("config.json"))
}

/// 설정 파일 읽기
pub fn read_config_file(config_path: &Path) -> Result<AppConfig, String> {
    let content = fs::read_to_string(config_path)
        .map_err(|e| format!("Failed to read config file: {}", e))?;
    serde_json::from_str::<AppConfig>(&content)
        .map_err(|e| format!("Failed to parse config file: {}", e))
}

/// 설정 파일 쓰기
pub fn write_config_file(config_path: &Path, config: &AppConfig) -> Result<(), String> {
    let json = serde_json::to_string_pretty(config)
        .map_err(|e| format!("Failed to serialize config: {}", e))?;
    fs::write(config_path, json).map_err(|e| format!("Failed to write config file: {}", e))?;
    Ok(())
}
