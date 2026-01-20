mod domains;
mod infrastructure;
mod utils;

use crate::domains::document::scheduler::INDEXING_SCHEDULER;
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

            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                INDEXING_SCHEDULER.start(handle).await;
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Config
            domains::config::command::load_config,
            domains::config::command::save_config,
            domains::config::command::init_database,
            domains::config::command::load_database,
            // Document
            domains::document::command::select_storage,
            domains::document::command::get_document,
            domains::document::command::save_document,
            domains::document::command::retrieve_document,
            domains::document::command::delete_document,
            domains::document::command::search_documents,
            // Block
            domains::document::command::delete_block,
            // Reindexing
            domains::document::command::trigger_reindex_all,
            // Graph
            domains::document::command::get_graph_data,
            // AI
            domains::ai::command::generate_tags,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
