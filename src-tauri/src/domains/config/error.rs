use anyhow::Error as AnyhowError;
use rusqlite::Error as RusqliteError;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum ConfigError {
    #[error("Failed to get app data path")]
    AppDataPath(AnyhowError),

    #[error("Failed to parse config file")]
    ConfigParsing(AnyhowError),

    #[error("Failed to serialize config file")]
    ConfigSerializing(AnyhowError),

    #[error("Failed to read config file")]
    ConfigReading(AnyhowError),

    #[error("Failed to save config file")]
    ConfigSaving(AnyhowError),

    #[error("Failed to create database connection")]
    DatabaseConnectionCreation(RusqliteError),

    #[error("Failed to load sqlite-vec extension")]
    DatabaseExtensionLoading(AnyhowError),

    #[error("Failed to initialize schema")]
    DatabaseSchemaInitialization(RusqliteError),

    #[error("Failed to run migrations")]
    DatabaseMigrationsRunning(RusqliteError),
}
