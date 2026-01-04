use anyhow::{anyhow, Context, Result};
use rusqlite::Connection;
use tauri::{path::BaseDirectory, AppHandle, Manager};

pub fn load_sqlite_vec_extension(conn: &Connection, app_handle: &AppHandle) -> Result<()> {
    let extension_path = _get_sqlite_vec_path();

    let absolute_path = app_handle
        .path()
        .resolve(&extension_path, BaseDirectory::Resource)
        .context("Failed to resolve sqlite-vec extension path")?;

    if !absolute_path.exists() {
        return Err(anyhow!("sqlite-vec extension file does not exist"));
    }

    unsafe {
        conn.load_extension(&absolute_path, Some("sqlite3_vec_init"))
            .context("Failed to load sqlite-vec extension")?;
    }

    Ok(())
}

fn _get_sqlite_vec_path() -> String {
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

    format!("resources/sqlite-vec/{}", file_name)
}
