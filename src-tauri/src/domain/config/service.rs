use super::model::AppConfig;
use crate::infrastructure::config::file_system;
use tracing::{error, info};

pub fn load_config(app_handle: &tauri::AppHandle) -> AppConfig {
    match file_system::get_config_path(app_handle) {
        Ok(config_path) => {
            if config_path.exists() {
                match file_system::read_config_file(&config_path) {
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
    let config_path = file_system::get_config_path(app_handle)?;
    file_system::write_config_file(&config_path, config)?;
    info!("Saved config to: {:?}", config_path);
    Ok(())
}
