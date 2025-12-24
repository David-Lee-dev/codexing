mod commands;
mod db;
mod models;
mod services;

use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

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
            // api::misc::greet,
            // Config commands
            commands::config::get_config,
            commands::config::save_config,
            // Storage commands
            commands::storage::select_storage_folder,
            // // Database commands
            commands::database::init_database,
            commands::database::get_database_health,
            // api::db::run_migrations,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
