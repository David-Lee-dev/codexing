use std::fs;
use std::path::PathBuf;
use tracing::info;

/// 저장소 경로 검증
pub fn validate_path(path: &PathBuf) -> Result<(), String> {
    if !path.exists() {
        return Err(format!("Path does not exist: {:?}", path));
    }
    if !path.is_dir() {
        return Err(format!("Path is not a directory: {:?}", path));
    }
    Ok(())
}

/// 선택한 폴더 내에 codex 서브디렉토리 생성
pub fn create_codex_directory(selected_path: &str) -> Result<String, String> {
    let base_path = PathBuf::from(selected_path);
    validate_path(&base_path)?;

    // codex 서브디렉토리 경로 생성
    let codex_path = base_path.join("codex");

    // codex 디렉토리 생성 (이미 존재하면 무시)
    if !codex_path.exists() {
        fs::create_dir_all(&codex_path)
            .map_err(|e| format!("Failed to create codex directory: {}", e))?;
        info!("Created codex directory: {:?}", codex_path);
    } else {
        info!("Codex directory already exists: {:?}", codex_path);
    }

    // 경로를 문자열로 변환
    codex_path
        .to_str()
        .ok_or_else(|| "Failed to convert path to string".to_string())
        .map(|s| s.to_string())
}
