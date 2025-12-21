mod file;

use serde::{Deserialize, Serialize};
use tracing::{error, info};

#[derive(Debug, Serialize, Deserialize)]
pub struct AppConfig {
    pub storage_path: Option<String>,
    pub is_onboarding_complete: bool,
}

impl Default for AppConfig {
    fn default() -> Self {
        AppConfig {
            storage_path: None,
            is_onboarding_complete: false,
        }
    }
}

/// 설정 파일 읽기
pub fn load_config(app_handle: &tauri::AppHandle) -> AppConfig {
    match file::get_config_path(app_handle) {
        Ok(config_path) => {
            if config_path.exists() {
                match file::read_config_file(&config_path) {
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
    // 기본값 반환
    AppConfig::default()
}

/// 설정 파일 저장
pub fn save_config(app_handle: &tauri::AppHandle, config: &AppConfig) -> Result<(), String> {
    let config_path = file::get_config_path(app_handle)?;
    file::write_config_file(&config_path, config)?;
    info!("Saved config to: {:?}", config_path);
    Ok(())
}
