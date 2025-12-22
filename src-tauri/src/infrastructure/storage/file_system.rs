use std::fs;
use std::path::PathBuf;
use tracing::info;

/// Validate storage path
pub fn validate_path(path: &PathBuf) -> Result<(), String> {
    if !path.exists() {
        return Err(format!("Path does not exist: {:?}", path));
    }
    if !path.is_dir() {
        return Err(format!("Path is not a directory: {:?}", path));
    }
    Ok(())
}

/// Create codex subdirectory in selected path
pub fn create_codex_directory(selected_path: &str) -> Result<String, String> {
    let base_path: PathBuf = PathBuf::from(selected_path);
    validate_path(&base_path)?;

    let codex_path: PathBuf = base_path.join("codex");

    if !codex_path.exists() {
        fs::create_dir_all(&codex_path)
            .map_err(|e| format!("Failed to create codex directory: {}", e))?;
        info!("Created codex directory: {:?}", codex_path);
    } else {
        info!("Codex directory already exists: {:?}", codex_path);
    }

    codex_path
        .to_str()
        .ok_or_else(|| "Failed to convert path to string".to_string())
        .map(|s| s.to_string())
}
