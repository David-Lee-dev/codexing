use crate::domains::common::model::CommandResponse;
use crate::domains::config::model::AppConfig;
use crate::domains::config::service::{
    init_database as init_database_service, load_config as load_config_service,
    load_database as load_database_service, save_config as save_config_service,
};
use tauri::AppHandle;

#[tauri::command]
pub fn load_config(app_handle: AppHandle) -> CommandResponse<AppConfig> {
    match load_config_service(&app_handle) {
        Ok(config) => CommandResponse {
            success: true,
            code: 200,
            message: "Config loaded successfully".to_string(),
            data: Some(config),
        },
        Err(_) => CommandResponse {
            success: false,
            code: 500,
            message: "Cannot load config".to_string(),
            data: None,
        },
    }
}

#[tauri::command]
pub fn save_config(app_handle: AppHandle, config: AppConfig) -> CommandResponse<AppConfig> {
    match save_config_service(&app_handle, &config) {
        Ok(config) => CommandResponse {
            success: true,
            code: 200,
            message: "Config saved successfully".to_string(),
            data: Some(config),
        },
        Err(_) => CommandResponse {
            success: false,
            code: 500,
            message: "Cannot save config".to_string(),
            data: None,
        },
    }
}

#[tauri::command]
pub fn init_database(app_handle: AppHandle) -> CommandResponse<()> {
    match init_database_service(&app_handle) {
        Ok(_) => CommandResponse {
            success: true,
            code: 200,
            message: "Database initialized successfully".to_string(),
            data: None,
        },
        Err(_) => CommandResponse {
            success: false,
            code: 500,
            message: "Cannot initialize database".to_string(),
            data: None,
        },
    }
}

#[tauri::command]
pub fn get_database_health(app_handle: AppHandle) -> CommandResponse<DatabaseHealth> {
    match load_database_service(&app_handle) {
        Ok(health) => CommandResponse {
            success: true,
            code: 200,
            message: "Database health loaded successfully".to_string(),
            data: Some(health),
        },
        Err(_) => CommandResponse {
            success: false,
            code: 500,
            message: "Cannot load database health".to_string(),
            data: None,
        },
    }
}
