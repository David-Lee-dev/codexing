use crate::db::{connection, health, migrations, schema};
use crate::models::config::AppConfig;
use crate::models::db_health::DatabaseHealth;
use crate::services::file_service;
use std::path::PathBuf;
use tracing::{error, info};

#[tauri::command]
pub fn init_database(app_handle: tauri::AppHandle) -> Result<(), String> {
    info!("Initializing database");

    let db_path: PathBuf = _get_db_path(&app_handle)?;

    let mut conn = connection::create_connection(&db_path)
        .map_err(|e| format!("Failed to create database connection: {}", e))?;

    connection::load_sqlite_vec_extension(&conn, &app_handle)
        .map_err(|e| format!("Failed to load sqlite-vec extension: {}", e))?;

    schema::init_schema(&mut conn).map_err(|e| format!("Failed to initialize schema: {}", e))?;

    migrations::run_migrations(&conn).map_err(|e| format!("Failed to run migrations: {}", e))?;

    info!("Database initialized successfully at: {:?}", db_path);
    Ok(())
}

#[tauri::command]
pub fn get_database_health(app_handle: tauri::AppHandle) -> Result<DatabaseHealth, String> {
    info!("Fetching database health");

    let db_path: PathBuf = _get_db_path(&app_handle)?;

    let conn = connection::create_connection(&db_path)
        .map_err(|e| format!("Failed to create database connection: {}", e))?;

    let database_health: DatabaseHealth = health::health_check(&conn).map_err(|e| {
        error!("Database health check failed: {}", e);
        e.to_string()
    })?;

    Ok(database_health)
}

fn _get_db_path(app_handle: &tauri::AppHandle) -> Result<PathBuf, String> {
    let app_config: AppConfig = file_service::load_config(app_handle);

    match app_config.storage_path {
        Some(storage_path) => {
            let db_path = PathBuf::from(storage_path).join("cognitive.db");
            info!("Database path determined: {:?}", db_path);
            Ok(db_path)
        }
        None => {
            error!("Storage path not configured. Please complete onboarding first.");
            Err("Storage path not configured. Please complete onboarding first.".to_string())
        }
    }
}
