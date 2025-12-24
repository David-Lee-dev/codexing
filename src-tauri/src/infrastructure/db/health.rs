use rusqlite::Connection;
use serde::{Deserialize, Serialize};
use tracing::{error, info};

#[derive(Debug, Serialize, Deserialize)]
pub struct HealthStatus {
    pub connected: bool,
    pub sqlite_vec_loaded: bool,
    pub wal_mode: bool,
    pub foreign_keys_enabled: bool,
}

pub fn health_check(conn: &Connection) -> rusqlite::Result<HealthStatus> {
    conn.execute("SELECT 1", [])?;
    let connected = true;

    let wal_mode = conn
        .query_row("PRAGMA journal_mode", [], |row| {
            Ok::<String, rusqlite::Error>(row.get(0)?)
        })
        .map(|mode| mode == "wal")
        .unwrap_or(false);

    let foreign_keys_enabled = conn
        .query_row("PRAGMA foreign_keys", [], |row| {
            Ok::<i32, rusqlite::Error>(row.get(0)?)
        })
        .map(|val| val == 1)
        .unwrap_or(false);

    let sqlite_vec_loaded = check_sqlite_vec_loaded(conn);

    let status = HealthStatus {
        connected,
        sqlite_vec_loaded,
        wal_mode,
        foreign_keys_enabled,
    };

    if status.connected
        && status.sqlite_vec_loaded
        && status.wal_mode
        && status.foreign_keys_enabled
    {
        info!("Health check passed: all systems operational");
    } else {
        error!(
            "Health check warnings: connected={}, sqlite_vec={}, wal={}, fk={}",
            status.connected,
            status.sqlite_vec_loaded,
            status.wal_mode,
            status.foreign_keys_enabled
        );
    }

    Ok(status)
}

fn check_sqlite_vec_loaded(conn: &Connection) -> bool {
    match conn.query_row(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='vec_blocks'",
        [],
        |row| {
            let name: String = row.get(0)?;
            Ok(name == "vec_blocks")
        },
    ) {
        Ok(exists) => exists,
        Err(e) => {
            error!("Failed to check sqlite-vec: {}", e);
            false
        }
    }
}
