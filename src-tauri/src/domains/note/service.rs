use crate::domains::note::error::NoteError;
use crate::utils::file_system::create_directory;
use anyhow::anyhow;
use std::path::PathBuf;

pub fn ensure_storage(path: &str, name: &str) -> Result<(), NoteError> {
    let base_path: PathBuf = PathBuf::from(path);

    if !base_path.exists() {
        return Err(NoteError::PathDoesNotExistError(anyhow!(
            "Path does not exist: {:?}",
            base_path
        )));
    }

    if !base_path.is_dir() {
        return Err(NoteError::PathIsNotDirectoryError(anyhow!(
            "Path is not a directory: {:?}",
            base_path
        )));
    }

    create_directory(&base_path).map_err(NoteError::PathCreationError)?;

    Ok(())
}
