use anyhow::Error as AnyhowError;
use rusqlite::Error as RusqliteError;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum ConfigError {
    #[error("Failed to get app data path: {0}")]
    AppDataPath(#[source] AnyhowError),

    #[error("Failed to parse config file: {0}")]
    ConfigParsing(#[source] AnyhowError),

    #[error("Failed to serialize config file: {0}")]
    ConfigSerializing(#[source] AnyhowError),

    #[error("Failed to read config file: {0}")]
    ConfigReading(#[source] AnyhowError),

    #[error("Failed to save config file: {0}")]
    ConfigSaving(#[source] AnyhowError),

    #[error("Failed to create database connection: {0}")]
    DatabaseConnectionCreation(#[source] RusqliteError),

    #[error("Failed to load sqlite-vec extension: {0}")]
    DatabaseExtensionLoading(#[source] AnyhowError),

    #[error("Failed to initialize schema: {0}")]
    DatabaseSchemaInitialization(#[source] RusqliteError),

    #[error("Failed to run migrations: {0}")]
    DatabaseMigrationsRunning(#[source] RusqliteError),
}
