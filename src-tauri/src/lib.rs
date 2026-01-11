mod domains;
mod infrastructure;
mod utils;

use crate::utils::shortcuts::AppShortcuts;
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
        .setup(|app| {
            AppShortcuts::setup_menu(app.handle())?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            domains::config::command::load_config,
            domains::config::command::save_config,
            domains::config::command::init_database,
            domains::config::command::load_database,
            // Note
            domains::note::command::select_storage,
            domains::note::command::get_document,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
