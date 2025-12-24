use crate::models::config::AppConfig;
use std::fs;
use std::path::{Path, PathBuf};
use tauri::Manager;
use tracing::{error, info};

pub fn load_config(app_handle: &tauri::AppHandle) -> AppConfig {
    match _get_config_path(app_handle) {
        Ok(config_path) => {
            if config_path.exists() {
                match _read_config_file(&config_path) {
                    Ok(config) => {
                        info!("Loaded config from: {:?}", config_path);
                        return config;
                    }
                    Err(e) => {
                        error!("Failed to load config file: {}", e);
                    }
                }
            }
        }
        Err(e) => {
            error!("Failed to get config path: {}", e);
        }
    }
    AppConfig::default()
}

pub fn save_config(app_handle: &tauri::AppHandle, config: &AppConfig) -> Result<(), String> {
    let config_path = _get_config_path(app_handle)?;

    let json = serde_json::to_string_pretty(config)
        .map_err(|e| format!("Failed to serialize config: {}", e))?;

    fs::write(&config_path, json).map_err(|e| format!("Failed to write config file: {}", e))?;
    info!("Saved config to: {:?}", config_path);

    Ok(())
}

pub fn create_directory(path: &str, name: &str) -> Result<String, String> {
    let base_path: PathBuf = PathBuf::from(path);
    let directory_path: PathBuf = base_path.join(name);

    if !base_path.exists() {
        return Err(format!("Path does not exist: {:?}", base_path));
    }

    if !base_path.is_dir() {
        return Err(format!("Path is not a directory: {:?}", base_path));
    }

    if !directory_path.exists() {
        fs::create_dir_all(&directory_path)
            .map_err(|e| format!("Failed to create directory: {}", e))?;
        info!("Created directory: {:?}", directory_path);
    } else {
        info!("Directory already exists: {:?}", directory_path);
    }

    let directory_path_str = directory_path
        .to_str()
        .ok_or_else(|| "Failed to convert path to string".to_string())
        .map(|s| s.to_string())?;

    Ok(directory_path_str)
}

fn _get_config_path(app_handle: &tauri::AppHandle) -> Result<PathBuf, String> {
    let app_data: PathBuf = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data directory: {}", e))?;

    fs::create_dir_all(&app_data)
        .map_err(|e| format!("Failed to create app data directory: {}", e))?;

    Ok(app_data.join("config.json"))
}

fn _read_config_file(config_path: &Path) -> Result<AppConfig, String> {
    let content = fs::read_to_string(config_path)
        .map_err(|e| format!("Failed to read config file: {}", e))?;
    serde_json::from_str::<AppConfig>(&content)
        .map_err(|e| format!("Failed to parse config file: {}", e))
}
