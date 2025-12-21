mod commands;
mod config;
mod storage;

use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

// AppConfig를 외부에서 사용할 수 있도록 re-export
pub use config::AppConfig;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env().unwrap_or_else(|_| "info".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            // Misc commands
            commands::misc::greet,
            // Config commands
            commands::config::get_config,
            // Storage commands
            commands::storage::select_storage_folder,
            commands::storage::set_storage_path,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
