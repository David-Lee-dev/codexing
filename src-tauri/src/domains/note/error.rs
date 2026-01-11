use crate::domains::config::error::ConfigError;
use anyhow::Error as AnyhowError;
use rusqlite::Error as RusqliteError;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum NoteError {
    #[error("Path does not exist")]
    PathDoesNotExistError(AnyhowError),

    #[error("Path is not a directory")]
    PathIsNotDirectoryError(AnyhowError),

    #[error("Failed to create directory at path: {0}")]
    PathCreationError(AnyhowError),

    #[error("Failed to load config")]
    ConfigLoadingError(ConfigError),

    #[error("Failed to create database connection")]
    DatabaseConnectionCreationError(RusqliteError),

    #[error("Failed to query database")]
    DatabaseQueryError(RusqliteError),
}
