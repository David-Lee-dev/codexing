use crate::models::config::AppConfig;
use anyhow::{Context, Result};
use std::fs;
use std::path::{Path, PathBuf};
use tracing::warn;

pub enum SaveMode {
    Overwrite,
    NoOverwrite,
}

pub fn save_file(path: &str, content: &str, save_mode: SaveMode) -> Result<()> {
    let file_path: PathBuf = PathBuf::from(path);

    if save_mode == SaveMode::Overwrite || !file_path.exists() {
        fs::write(&file_path, content).context("Failed to save file")?;
    }

    Ok(())
}

pub fn read_file(file_path: &Path) -> Result<String> {
    fs::read_to_string(file_path).context("Failed to read file")
}

pub fn create_directory(path: &PathBuf) -> Result<()> {
    if !path.exists() {
        fs::create_dir_all(path).context("Failed to create directory");
    }

    Ok(())
}

pub fn get_directory_path(path: &str) -> Result<PathBuf> {
    let directory_path: PathBuf = PathBuf::from(path);

    if !directory_path.exists() {
        return Err(anyhow::anyhow!(
            "Directory does not exist: {:?}",
            directory_path
        ));
    }

    Ok(directory_path)
}
