use crate::services::file_service;
use rusqlite::{Connection, Result};
use std::path::{Path, PathBuf};
use tracing::{error, info};

pub fn create_connection<P: AsRef<Path>>(db_path: P) -> Result<Connection> {
    let conn = Connection::open(db_path)?;

    conn.execute("PRAGMA journal_mode = WAL;", [])?;

    conn.execute("PRAGMA foreign_keys = ON;", [])?;

    Ok(conn)
}

pub fn load_sqlite_vec_extension(conn: &Connection, app_handle: &tauri::AppHandle) -> Result<()> {
    let extension_path = get_sqlite_vec_path(app_handle)?;

    if !extension_path.exists() {
        error!("sqlite-vec extension not found at: {:?}", extension_path);
        return Err(rusqlite::Error::SqliteFailure(
            rusqlite::ffi::Error::new(rusqlite::ffi::SQLITE_ERROR),
            Some(format!(
                "sqlite-vec extension not found at: {:?}. Please ensure the extension file is placed in the storage directory.",
                extension_path
            )),
        ));
    }

    info!("Loading sqlite-vec extension from: {:?}", extension_path);
    unsafe {
        conn.load_extension(&extension_path, None::<&str>)
            .map_err(|e| {
                error!(
                    "Failed to load sqlite-vec extension from {:?}: {}",
                    extension_path, e
                );
                rusqlite::Error::SqliteFailure(
                    rusqlite::ffi::Error::new(rusqlite::ffi::SQLITE_ERROR),
                    Some(format!("Failed to load sqlite-vec extension: {}", e)),
                )
            })?;
    }

    info!("sqlite-vec extension loaded successfully");
    Ok(())
}

fn get_sqlite_vec_path(app_handle: &tauri::AppHandle) -> Result<PathBuf, rusqlite::Error> {
    let app_config = file_service::load_config(app_handle);

    let storage_path = app_config.storage_path.ok_or_else(|| {
        rusqlite::Error::SqliteFailure(
            rusqlite::ffi::Error::new(rusqlite::ffi::SQLITE_ERROR),
            Some("Storage path not configured. Please complete onboarding first.".to_string()),
        )
    })?;

    let storage_dir = PathBuf::from(storage_path);

    #[cfg(target_os = "macos")]
    return Ok(storage_dir.join("libsqlite_vec.dylib"));

    #[cfg(target_os = "linux")]
    return Ok(storage_dir.join("libsqlite_vec.so"));

    #[cfg(target_os = "windows")]
    return Ok(storage_dir.join("sqlite_vec.dll"));

    #[cfg(not(any(target_os = "macos", target_os = "linux", target_os = "windows")))]
    Err(rusqlite::Error::SqliteFailure(
        rusqlite::ffi::Error::new(rusqlite::ffi::SQLITE_ERROR),
        Some("Unsupported platform for sqlite-vec extension".to_string()),
    ))
}
