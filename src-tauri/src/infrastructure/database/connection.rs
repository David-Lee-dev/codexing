use rusqlite::{Connection, Result};
use std::path::{Path, PathBuf};
use tauri::path::BaseDirectory;
use tauri::Manager;

pub fn create_connection(path: &PathBuf) -> Result<Connection> {
    let db_path = path.join(
        std::env::var("DATABASE_NAME").expect("DATABASE_NAME environment variable is not set"),
    );
    let conn: Connection = Connection::open(db_path)?;

    conn.pragma_update(None, "journal_mode", Some("WAL"))?;
    conn.pragma_update(None, "foreign_keys", Some(1))?;

    Ok(conn)
}
