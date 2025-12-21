mod path;

use crate::config;
use tracing::info;

/// 선택한 폴더 내에 codex 서브디렉토리 생성
pub fn create_codex_directory(selected_path: &str) -> Result<String, String> {
    path::create_codex_directory(selected_path)
}

/// 저장소 경로 설정
pub fn set_storage_path(app_handle: &tauri::AppHandle, path: String) -> Result<(), String> {
    let storage_path = std::path::PathBuf::from(&path);
    path::validate_path(&storage_path)?;

    // 설정에 저장
    let mut config = config::load_config(app_handle);
    config.storage_path = Some(path);
    config.is_onboarding_complete = true;
    config::save_config(app_handle, &config)?;

    Ok(())
}

/// 저장소 폴더 선택 및 설정
pub fn select_and_set_storage_folder(
    app_handle: &tauri::AppHandle,
    selected_path: String,
) -> Result<String, String> {
    info!("Selecting storage folder: {}", selected_path);

    // codex 디렉토리 생성
    let codex_path_str = create_codex_directory(&selected_path)?;

    // 설정에 저장
    let mut config = config::load_config(app_handle);
    config.storage_path = Some(codex_path_str.clone());
    config.is_onboarding_complete = true;
    config::save_config(app_handle, &config)?;

    Ok(codex_path_str)
}

