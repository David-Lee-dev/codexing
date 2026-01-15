use crate::domains::config::error::ConfigError;
use crate::domains::config::model::{AppConfig, AppConfigSaveDto, DatabaseHealth};
use crate::infrastructure::database::connection::create_connection;
use crate::infrastructure::database::extension::load_sqlite_vec_extension;
use crate::infrastructure::database::migrations::run_migrations;
use crate::infrastructure::database::schema::init_schema;
use crate::utils::app_data::get_app_data_path;
use crate::utils::error_logger::{log_error_with_trace, ResultExt};
use crate::utils::file_system::{read_file, save_file, SaveMode};
use anyhow::Context;
use rusqlite::OptionalExtension;
use std::path::PathBuf;
use tauri::AppHandle;

pub fn load_config(app_handle: &AppHandle) -> Result<AppConfig, ConfigError> {
    let config_file_path = get_app_data_path(app_handle)
        .map_err_log("load_config::get_app_data_path", ConfigError::AppDataPath)?
        .join("config.json");

    let file_content = read_file(&config_file_path)
        .map_err_log("load_config::read_file", ConfigError::ConfigReading)?;

    let loaded_json: serde_json::Value = serde_json::from_str(&file_content)
        .context("Failed to parse config file JSON")
        .map_err_log("load_config::parse_json", ConfigError::ConfigParsing)?;

    let default_config = AppConfig::default();
    let default_json = serde_json::to_value(&default_config)
        .context("Failed to serialize default config to JSON")
        .map_err_log("load_config::serialize_default", ConfigError::ConfigParsing)?;

    let mut merged_json = default_json;
    if let (Some(merged_obj), Some(loaded_obj)) =
        (merged_json.as_object_mut(), loaded_json.as_object())
    {
        for (key, value) in loaded_obj {
            merged_obj.insert(key.clone(), value.clone());
        }
    }

    serde_json::from_value::<AppConfig>(merged_json)
        .context("Failed to deserialize merged AppConfig")
        .map_err_log(
            "load_config::deserialize_merged",
            ConfigError::ConfigParsing,
        )
}

pub fn save_config(
    app_handle: &AppHandle,
    dto: &AppConfigSaveDto,
) -> Result<AppConfig, ConfigError> {
    let config_file_path = get_app_data_path(app_handle)
        .map_err_log("save_config::get_app_data_path", ConfigError::AppDataPath)?
        .join("config.json");

    let current_config = match read_file(&config_file_path) {
        Ok(content) => serde_json::from_str(&content)
            .context("Failed to parse config file JSON")
            .map_err_log("save_config::parse_json", ConfigError::ConfigParsing)?,
        Err(_) => AppConfig::default(),
    };

    let merged_config = current_config.merge(dto);

    let config_str = serde_json::to_string_pretty(&merged_config)
        .context("Failed to serialize config file")
        .map_err_log("save_config::serialize", ConfigError::ConfigSerializing)?;
    save_file(&config_file_path, &config_str, SaveMode::Overwrite)
        .context("Failed to save config file")
        .map_err_log("save_config::save_file", ConfigError::ConfigSaving)?;

    Ok(merged_config)
}

pub fn init_database(app_handle: &AppHandle) -> Result<(), ConfigError> {
    let config = load_config(app_handle)?;
    let storage_path = PathBuf::from(config.storage_path.unwrap_or_default());

    let mut conn = create_connection(&storage_path).map_err_log(
        "init_database::create_connection",
        ConfigError::DatabaseConnectionCreation,
    )?;

    load_sqlite_vec_extension(&conn, &app_handle).map_err_log(
        "init_database::load_extension",
        ConfigError::DatabaseExtensionLoading,
    )?;

    init_schema(&mut conn).map_err_log(
        "init_database::init_schema",
        ConfigError::DatabaseSchemaInitialization,
    )?;

    run_migrations(&mut conn).map_err_log(
        "init_database::run_migrations",
        ConfigError::DatabaseMigrationsRunning,
    )?;

    Ok(())
}

pub fn load_database(app_handle: &AppHandle) -> Result<DatabaseHealth, ConfigError> {
    let config = load_config(app_handle)?;
    let storage_path = PathBuf::from(config.storage_path.unwrap_or_default());

    let conn = create_connection(&storage_path).map_err_log(
        "load_database::create_connection",
        ConfigError::DatabaseConnectionCreation,
    )?;

    let mut health = DatabaseHealth {
        connected: false,
        sqlite_vec_loaded: false,
        wal_mode: false,
        foreign_keys_enabled: false,
    };

    health.connected = conn.query_row("SELECT 1", [], |_| Ok(())).is_ok();
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

    health.sqlite_vec_loaded = match load_sqlite_vec_extension(&conn, app_handle) {
        Ok(_) => conn
            .query_row(
                "SELECT name FROM sqlite_master WHERE type='table' AND name='vec_blocks'",
                [],
                |row| {
                    let name: String = row.get(0)?;
                    Ok(name == "vec_blocks")
                },
            )
            .optional()
            .map(|result| result.is_some())
            .unwrap_or(false),
        Err(e) => {
            log_error_with_trace("load_database::load_sqlite_vec_extension", &e);
            false
        }
    };

    Ok(health)
}
