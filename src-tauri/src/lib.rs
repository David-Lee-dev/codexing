// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use serde::{Deserialize, Serialize};
use tracing::info;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[derive(Debug, Serialize, Deserialize)]
pub struct AppConfig {
    pub storage_path: Option<String>,
    pub is_onboarding_complete: bool,
}

#[tauri::command]
fn get_config() -> AppConfig {
    info!("Fetching app configuration (Mock)");
    AppConfig {
        storage_path: None,
        is_onboarding_complete: false,
    }
}

#[tauri::command]
fn greet(name: &str) -> String {
    info!("Greeting: {}", name);
    format!("Hello, {}! You've been greeted from Rust!", name)
}

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
        .invoke_handler(tauri::generate_handler![greet, get_config])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
