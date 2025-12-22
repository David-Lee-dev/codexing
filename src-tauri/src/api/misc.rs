use tracing::info;

#[tauri::command]
pub fn greet(name: &str) -> String {
    info!("Greeting: {}", name);
    format!("Hello, {}! You've been greeted from Rust!", name)
}

