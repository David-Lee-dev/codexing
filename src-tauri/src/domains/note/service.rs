use crate::domains::note::error::NoteError;
use crate::utils::file_system::create_directory;
use anyhow::anyhow;
use std::path::PathBuf;

pub fn ensure_storage(path: &str, name: &str) -> Result<String, NoteError> {
    let base_path = PathBuf::from(path);
    let storage_path = base_path.join(name);

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

    create_directory(&storage_path).map_err(NoteError::PathCreationError)?;

    Ok(storage_path.to_string_lossy().into_owned())
}
