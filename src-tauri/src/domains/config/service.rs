use crate::domains::config::error::ConfigError;
use crate::domains::config::model::{AppConfig, DatabaseHealth};
use crate::utils::app_data::get_app_data_path;
use crate::utils::file_system::{read_file, save_file, SaveMode};
use anyhow::Context;
use tauri::AppHandle;

pub fn load_config(app_handle: &AppHandle) -> Result<AppConfig, ConfigError> {
    let config_file_path = get_app_data_path(app_handle)
        .map_err(ConfigError::AppDataPath)?
        .join("config.json");

    match read_file(&config_file_path) {
        Ok(file_content) => serde_json::from_str::<AppConfig>(&file_content)
            .context("Failed to parse config file")
            .map_err(ConfigError::ConfigParsing),
        Err(e) => Err(ConfigError::ConfigReading(e.into())),
    }
}

pub fn save_config(app_handle: &AppHandle, config: &AppConfig) -> Result<AppConfig, ConfigError> {
    let config_file_path = get_app_data_path(app_handle)
        .map_err(ConfigError::AppDataPath)?
        .join("config.json")
        .to_string();

    let config_str = serde_json::to_string_pretty(config)
        .context("Failed to serialize config file")
        .map_err(ConfigError::ConfigSerializing)?;

    save_file(&config_file_path, &config_str, SaveMode::Overwrite)
        .map_err(ConfigError::ConfigSaving)?;

    Ok(config.clone())
}

pub fn init_database(app_handle: &AppHandle) -> Result<(), ConfigError> {
    let config = load_config(app_handle)?;

    let mut conn = connection::create_connection(&config.storage_path)
        .map_err(ConfigError::DatabaseInitialization)?;

    extension::load_sqlite_vec_extension(&conn, &app_handle)
        .map_err(ConfigError::DatabaseInitialization)?;
    schema::init_schema(&mut conn).map_err(ConfigError::DatabaseSchemaInitialization)?;
    migrations::run_migrations(&conn).map_err(ConfigError::DatabaseMigrationsRunning)?;

    Ok(())
}

pub fn load_database(app_handle: &AppHandle) -> Result<DatabaseHealth, ConfigError> {
    let config = load_config(app_handle)?;
    let conn = connection::create_connection(&config.storage_path)
        .map_err(ConfigError::DatabaseConnectionCreation)?;

    let mut health = DatabaseHealth {
        connected: false,
        sqlite_vec_loaded: false,
        wal_mode: false,
        foreign_keys_enabled: false,
    };

    health.connected = conn.execute("SELECT 1", []).is_ok();

    health.wal_mode = conn
        .query_row("PRAGMA journal_mode", [], |row| {
            Ok::<String, rusqlite::Error>(row.get(0)?)
        })
        .map(|mode| mode == "wal")
        .unwrap_or(false);

    health.foreign_keys_enabled = conn
        .query_row("PRAGMA foreign_keys", [], |row| {
            Ok::<i32, rusqlite::Error>(row.get(0)?)
        })
        .map(|val| val == 1)
        .unwrap_or(false);
    health.sqlite_vec_loaded = conn
        .query_row(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='vec_blocks'",
            [],
            |row| {
                let name: String = row.get(0)?;
                Ok(name == "vec_blocks")
            },
        )
        .is_ok();

    Ok(health)
}
