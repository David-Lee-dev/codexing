use anyhow::Error as AnyhowError;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum NoteError {
    #[error("Path does not exist")]
    PathDoesNotExistError(#[from] AnyhowError),

    #[error("Path is not a directory")]
    PathIsNotDirectoryError(#[from] AnyhowError),

    #[error("Failed to create directory at path: {0}")]
    PathCreationError(#[from] AnyhowError),
}
