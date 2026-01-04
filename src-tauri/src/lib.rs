mod domains;
mod infrastructure;
mod utils;

use tauri_plugin_global_shortcut::GlobalShortcutExt;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use utils::shortcuts::{global_shortcut_handler, AppShortcuts};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env().unwrap_or_else(|_| "info".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let shortcuts = AppShortcuts::new();
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(global_shortcut_handler)
                .build(),
        )
        .setup(move |app| {
            for shortcut in shortcuts.all() {
                app.global_shortcut().register(shortcut)?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            domains::config::command::load_config,
            domains::config::command::save_config,
            domains::config::command::init_database,
            domains::config::command::load_database,
            domains::note::command::select_storage,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
