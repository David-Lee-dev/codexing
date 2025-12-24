use crate::domain::config;
use crate::infrastructure::db::{connection, health, migrations, schema};
use std::path::PathBuf;
use tracing::{error, info};

fn get_db_path(app_handle: &tauri::AppHandle) -> Result<PathBuf, String> {
    let app_config = config::load_config(app_handle);

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

#[tauri::command]
pub fn init_database(app_handle: tauri::AppHandle) -> Result<(), String> {
    info!("Initializing database");

    let db_path = get_db_path(&app_handle)?;

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
pub fn run_migrations(app_handle: tauri::AppHandle) -> Result<(), String> {
    info!("Running database migrations");

    let db_path = get_db_path(&app_handle)?;

    let conn = connection::create_connection(&db_path)
        .map_err(|e| format!("Failed to create database connection: {}", e))?;

    migrations::run_migrations(&conn).map_err(|e| format!("Failed to run migrations: {}", e))?;

    info!("Migrations completed successfully");
    Ok(())
}

#[tauri::command]
pub fn health_check(app_handle: tauri::AppHandle) -> Result<health::HealthStatus, String> {
    info!("Performing database health check");

    let db_path = get_db_path(&app_handle)?;

    let conn = connection::create_connection(&db_path)
        .map_err(|e| format!("Failed to create database connection: {}", e))?;

    health::health_check(&conn).map_err(|e| format!("Failed to perform health check: {}", e))
}
