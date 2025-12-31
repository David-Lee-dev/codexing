use anyhow::{Context, Result};
use std::path::PathBuf;
use tauri::Manager;

pub fn get_app_data_path(app_handle: &tauri::AppHandle) -> Result<PathBuf> {
    let app_data = app_handle
        .path()
        .app_data_dir()
        .context("Failed to get app data directory")?;

    Ok(app_data)
}
