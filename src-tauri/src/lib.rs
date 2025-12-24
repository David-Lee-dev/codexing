mod api;
mod domain;
mod infrastructure;

use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

// AppConfig를 외부에서 사용할 수 있도록 re-export
pub use domain::config::AppConfig;

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
            api::misc::greet,
            // Config commands
            api::config::get_config,
            // Storage commands
            api::storage::select_storage_folder,
            api::storage::set_storage_path,
            // Database commands
            api::db::init_database,
            api::db::run_migrations,
            api::db::health_check,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
