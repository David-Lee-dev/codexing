use anyhow::Error as AnyhowError;
use rusqlite::Error as RusqliteError;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum ConfigError {
    #[error("Failed to get app data path")]
    AppDataPath(#[from] AnyhowError),

    #[error("Failed to parse config file")]
    ConfigParsing(#[from] AnyhowError),

    #[error("Failed to serialize config file")]
    ConfigSerializing(#[from] AnyhowError),

    #[error("Failed to read config file")]
    ConfigReading(#[from] AnyhowError),

    #[error("Failed to save config file")]
    ConfigSaving(#[from] AnyhowError),

    #[error("Failed to initialize database")]
    DatabaseInitialization(#[from] AnyhowError),

    #[error("Failed to create database connection")]
    DatabaseConnectionCreation(#[from] AnyhowError),

    #[error("Failed to load sqlite-vec extension")]
    DatabaseExtensionLoading(#[from] AnyhowError),

    #[error("Failed to initialize schema")]
    DatabaseSchemaInitialization(#[from] AnyhowError),

    #[error("Failed to run migrations")]
    DatabaseMigrationsRunning(#[from] AnyhowError),
}
