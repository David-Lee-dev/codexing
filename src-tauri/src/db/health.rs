use crate::models::db_health::DatabaseHealth;
use rusqlite::Connection;
use tracing::{error, info};

pub fn health_check(conn: &Connection) -> rusqlite::Result<DatabaseHealth> {
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

    let sqlite_vec_loaded = _check_sqlite_vec_loaded(conn);

    let health = DatabaseHealth {
        connected,
        sqlite_vec_loaded,
        wal_mode,
        foreign_keys_enabled,
    };

    if health.connected
        && health.sqlite_vec_loaded
        && health.wal_mode
        && health.foreign_keys_enabled
    {
        info!("Database health check passed: all systems operational");
    } else {
        error!(
            "Database health check failed: connected={}, sqlite_vec={}, wal={}, fk={}",
            health.connected,
            health.sqlite_vec_loaded,
            health.wal_mode,
            health.foreign_keys_enabled
        );
    }

    Ok(health)
}

fn _check_sqlite_vec_loaded(conn: &Connection) -> bool {
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
