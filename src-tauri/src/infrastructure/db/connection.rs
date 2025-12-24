use rusqlite::{Connection, Result};
use std::path::{Path, PathBuf};
use tracing::{error, info, warn};

pub fn create_connection<P: AsRef<Path>>(db_path: P) -> Result<Connection> {
    let conn = Connection::open(db_path)?;

    conn.execute("PRAGMA journal_mode = WAL;", [])?;

    conn.execute("PRAGMA foreign_keys = ON;", [])?;

    Ok(conn)
}

pub fn load_sqlite_vec_extension(conn: &Connection) -> Result<()> {
    let extension_paths = get_sqlite_vec_paths();

    for path in extension_paths {
        if path.exists() {
            info!("Loading sqlite-vec extension from: {:?}", path);
            unsafe {
                match conn.load_extension(&path, None::<&str>) {
                    Ok(_) => {
                        info!("sqlite-vec extension loaded successfully");
                        return Ok(());
                    }
                    Err(e) => {
                        warn!("Failed to load sqlite-vec from {:?}: {}", path, e);
                        continue;
                    }
                }
            }
        }
    }

    error!("sqlite-vec extension not found in any expected location");
    Err(rusqlite::Error::SqliteFailure(
        rusqlite::ffi::Error::new(rusqlite::ffi::SQLITE_ERROR),
        Some(format!(
            "sqlite-vec extension not found. Checked paths: {:?}",
            get_sqlite_vec_paths()
        )),
    ))
}

fn get_sqlite_vec_paths() -> Vec<PathBuf> {
    let mut paths = Vec::new();

    if let Ok(resource_dir) = std::env::var("TAURI_RESOURCE_DIR") {
        let resource_path = PathBuf::from(resource_dir).join("sqlite-vec");
        #[cfg(target_os = "macos")]
        paths.push(resource_path.join("libsqlite_vec.dylib"));
        #[cfg(target_os = "linux")]
        paths.push(resource_path.join("libsqlite_vec.so"));
        #[cfg(target_os = "windows")]
        paths.push(resource_path.join("sqlite_vec.dll"));
    }

    if let Ok(custom_path) = std::env::var("SQLITE_VEC_PATH") {
        paths.push(PathBuf::from(custom_path));
    }

    if let Ok(exe_dir) = std::env::current_exe() {
        if let Some(parent) = exe_dir.parent() {
            #[cfg(target_os = "macos")]
            paths.push(parent.join("libsqlite_vec.dylib"));
            #[cfg(target_os = "linux")]
            paths.push(parent.join("libsqlite_vec.so"));
            #[cfg(target_os = "windows")]
            paths.push(parent.join("sqlite_vec.dll"));
        }
    }

    paths
}
