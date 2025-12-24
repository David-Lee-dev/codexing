use rusqlite::{Connection, Result};
use std::path::{Path, PathBuf};
use tauri::path::BaseDirectory;
use tauri::Manager;
use tracing::{error, info};

pub fn create_connection<P: AsRef<Path>>(db_path: P) -> Result<Connection> {
    let conn: Connection = Connection::open(db_path)?;

    conn.pragma_update(None, "journal_mode", Some("WAL"))?;
    conn.pragma_update(None, "foreign_keys", Some(1))?;

    Ok(conn)
}

pub fn load_sqlite_vec_extension(conn: &Connection, app_handle: &tauri::AppHandle) -> Result<()> {
    let extension_path = _get_sqlite_vec_path(app_handle)?;

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
        conn.load_extension(&extension_path, Some("sqlite3_vec_init"))
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

fn _get_sqlite_vec_path(app_handle: &tauri::AppHandle) -> Result<PathBuf, rusqlite::Error> {
    #[cfg(target_os = "windows")]
    let file_name: String = std::env::var("SQLITE_VEC_RESOURCE_WINDOWS")
        .expect("환경 변수 SQLITE_VEC_RESOURCE_WINDOWS가 설정되지 않았습니다.");

    #[cfg(all(target_os = "macos", target_arch = "aarch64"))]
    let file_name: String = std::env::var("SQLITE_VEC_RESOURCE_MACOS_AARCH64")
        .expect("환경 변수 SQLITE_VEC_RESOURCE_MACOS_AARCH64가 설정되지 않았습니다.");

    #[cfg(all(target_os = "macos", target_arch = "x86_64"))]
    let file_name: String = std::env::var("SQLITE_VEC_RESOURCE_MACOS_X86_64")
        .expect("환경 변수 SQLITE_VEC_RESOURCE_MACOS_X86_64가 설정되지 않았습니다.");

    #[cfg(all(target_os = "linux", target_arch = "aarch64"))]
    let file_name: String = std::env::var("SQLITE_VEC_RESOURCE_LINUX_AARCH64")
        .expect("환경 변수 SQLITE_VEC_RESOURCE_LINUX_AARCH64가 설정되지 않았습니다.");

    #[cfg(all(target_os = "linux", target_arch = "x86_64"))]
    let file_name: String = std::env::var("SQLITE_VEC_RESOURCE_LINUX_X86_64")
        .expect("환경 변수 SQLITE_VEC_RESOURCE_LINUX_X86_64가 설정되지 않았습니다.");

    #[cfg(not(any(target_os = "windows", target_os = "macos", target_os = "linux")))]
    compile_error!("지원하지 않는 플랫폼입니다. Windows, macOS, Linux만 지원합니다.");

    let resource_path_str = format!("resources/sqlite-vec/{}", file_name);

    app_handle
        .path()
        .resolve(&resource_path_str, BaseDirectory::Resource)
        .map_err(|e| {
            // Tauri의 에러를 rusqlite 에러로 변환
            rusqlite::Error::SqliteFailure(
                rusqlite::ffi::Error::new(rusqlite::ffi::SQLITE_ERROR),
                Some(format!("Tauri 리소스 경로 에러: {}", e)),
            )
        })
}
