use crate::domains::config::error::ConfigError;
use crate::domains::config::model::{AppConfig, DatabaseHealth};
use crate::infrastructure::database::connection::create_connection;
use crate::infrastructure::database::extension::load_sqlite_vec_extension;
use crate::infrastructure::database::migrations::run_migrations;
use crate::infrastructure::database::schema::init_schema;
use crate::utils::app_data::get_app_data_path;
use crate::utils::file_system::{read_file, save_file, SaveMode};
use anyhow::Context;
use std::path::PathBuf;
use tauri::AppHandle;
use tracing::{error, info, instrument, warn};

#[instrument(skip(app_handle))] // app_handle은 복잡한 객체이므로 로그 기록에서 제외
pub fn load_config(app_handle: &AppHandle) -> Result<AppConfig, ConfigError> {
    let config_file_path = get_app_data_path(app_handle)
        .map_err(|e| {
            error!(error = ?e, "Failed to resolve app data path");
            ConfigError::AppDataPath(e)
        })?
        .join("config.json");

    info!(path = ?config_file_path, "Target config file path identified");

    let file_content = match read_file(&config_file_path) {
        Ok(content) => {
            info!("Successfully read config file from disk");
            content
        }
        Err(e) => {
            if !config_file_path.exists() {
                warn!(path = ?config_file_path, "Config file does not exist, using defaults");
            } else {
                error!(error = ?e, path = ?config_file_path, "Failed to read existing config file");
            }
            return Err(ConfigError::ConfigReading(e.into()));
        }
    };

    let mut json_value: serde_json::Value = serde_json::from_str(&file_content)
        .context("Failed to parse config file JSON")
        .map_err(|e| {
            error!(error = ?e, "JSON structure is invalid");
            ConfigError::ConfigParsing(e)
        })?;

    let default_config = AppConfig::default();
    let default_json = serde_json::to_value(&default_config).map_err(|e| {
        error!(error = ?e, "Failed to serialize default config");
        ConfigError::ConfigParsing(e.into())
    })?;

    let mut json_obj = json_value.as_object_mut().cloned().unwrap_or_default();
    let default_obj = default_json.as_object().unwrap();
    let mut missing_fields = Vec::new();

    for (key, default_value) in default_obj {
        if !json_obj.contains_key(key) {
            warn!(field = key, "Missing field, using default value");
            json_obj.insert(key.clone(), default_value.clone());
            missing_fields.push(key.clone());
        }
    }

    if !missing_fields.is_empty() {
        info!(
            missing_fields = ?missing_fields,
            "Config loaded with default values for missing fields"
        );
    }

    serde_json::from_value::<AppConfig>(serde_json::Value::Object(json_obj))
        .context("Failed to deserialize AppConfig with defaults")
        .map_err(|e| {
            error!(error = ?e, "Failed to deserialize AppConfig");
            ConfigError::ConfigParsing(e)
        })
}

#[instrument(skip(app_handle, config))]
pub fn save_config(app_handle: &AppHandle, config: &AppConfig) -> Result<AppConfig, ConfigError> {
    let config_file_path = get_app_data_path(app_handle)
        .map_err(|e| {
            error!(error = ?e, "Failed to resolve app data path");
            ConfigError::AppDataPath(e)
        })?
        .join("config.json");

    info!(path = ?config_file_path, "Target config file path identified");

    let config_str = serde_json::to_string_pretty(config)
        .context("Failed to serialize config file")
        .map_err(|e| {
            error!(error = ?e, "Failed to serialize AppConfig to JSON");
            ConfigError::ConfigSerializing(e)
        })?;

    info!("Successfully serialized config to JSON");

    save_file(&config_file_path, &config_str, SaveMode::Overwrite).map_err(|e| {
        error!(error = ?e, path = ?config_file_path, "Failed to write config file to disk");
        ConfigError::ConfigSaving(e)
    })?;

    info!(path = ?config_file_path, "Successfully saved config file to disk");
    Ok(config.clone())
}

#[instrument(skip(app_handle))]
pub fn init_database(app_handle: &AppHandle) -> Result<(), ConfigError> {
    let config = load_config(app_handle)?;
    let storage_path = PathBuf::from(config.storage_path.unwrap_or_default());

    info!(path = ?storage_path, "Target database storage path identified");

    let mut conn = create_connection(&storage_path).map_err(|e| {
        error!(error = ?e, path = ?storage_path, "Failed to create database connection");
        ConfigError::DatabaseConnectionCreation(e)
    })?;

    info!("Successfully created database connection");

    load_sqlite_vec_extension(&conn, &app_handle).map_err(|e| {
        error!(error = ?e, "Failed to load SQLite Vec extension");
        ConfigError::DatabaseExtensionLoading(e)
    })?;

    info!("Successfully loaded SQLite Vec extension");

    init_schema(&mut conn).map_err(|e| {
        error!(error = ?e, "Failed to initialize database schema");
        ConfigError::DatabaseSchemaInitialization(e)
    })?;

    info!("Successfully initialized database schema");

    run_migrations(&conn).map_err(|e| {
        error!(error = ?e, "Failed to run database migrations");
        ConfigError::DatabaseMigrationsRunning(e)
    })?;

    info!("Successfully completed database initialization");
    Ok(())
}

#[instrument(skip(app_handle))]
pub fn load_database(app_handle: &AppHandle) -> Result<DatabaseHealth, ConfigError> {
    let config = load_config(app_handle)?;
    let storage_path = PathBuf::from(config.storage_path.unwrap_or_default());

    info!(path = ?storage_path, "Target database storage path identified");

    let conn = create_connection(&storage_path).map_err(|e| {
        error!(error = ?e, path = ?storage_path, "Failed to create database connection");
        ConfigError::DatabaseConnectionCreation(e)
    })?;

    info!("Successfully created database connection for health check");

    let mut health = DatabaseHealth {
        connected: false,
        sqlite_vec_loaded: false,
        wal_mode: false,
        foreign_keys_enabled: false,
    };

    health.connected = conn.execute("SELECT 1", []).is_ok();
    info!(
        connected = health.connected,
        "Database connection health check completed"
    );

    health.wal_mode = conn
        .query_row("PRAGMA journal_mode", [], |row| {
            Ok::<String, rusqlite::Error>(row.get(0)?)
        })
        .map(|mode| mode == "wal")
        .unwrap_or(false);

    info!(wal_mode = health.wal_mode, "WAL mode check completed");

    health.foreign_keys_enabled = conn
        .query_row("PRAGMA foreign_keys", [], |row| {
            Ok::<i32, rusqlite::Error>(row.get(0)?)
        })
        .map(|val| val == 1)
        .unwrap_or(false);

    info!(
        foreign_keys_enabled = health.foreign_keys_enabled,
        "Foreign keys check completed"
    );

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

    info!(
        sqlite_vec_loaded = health.sqlite_vec_loaded,
        connected = health.connected,
        wal_mode = health.wal_mode,
        foreign_keys_enabled = health.foreign_keys_enabled,
        "Database health check completed"
    );

    Ok(health)
}
