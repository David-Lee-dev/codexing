use anyhow::{Context, Result};
use std::fs;
use std::path::PathBuf;

#[derive(PartialEq, Debug)]
pub enum SaveMode {
    Overwrite,
    NoOverwrite,
}

pub fn save_file(path: &PathBuf, content: &str, save_mode: SaveMode) -> Result<()> {
    if save_mode == SaveMode::Overwrite || !path.exists() {
        fs::write(path, content).context("Failed to save file")?;
    }

    Ok(())
}
pub fn read_file(file_path: &PathBuf) -> Result<String> {
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
