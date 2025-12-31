use rusqlite::Connection;
use tracing::info;

fn create_migrations_table(conn: &Connection) -> rusqlite::Result<()> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS schema_migrations (
            version TEXT PRIMARY KEY,
            applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;
    Ok(())
}

fn is_migration_applied(conn: &Connection, version: &str) -> rusqlite::Result<bool> {
    let mut stmt = conn.prepare("SELECT 1 FROM schema_migrations WHERE version = ?1")?;
    let exists = stmt.exists([version])?;
    Ok(exists)
}

fn record_migration(conn: &Connection, version: &str) -> rusqlite::Result<()> {
    conn.execute(
        "INSERT OR IGNORE INTO schema_migrations (version) VALUES (?1)",
        [version],
    )?;
    Ok(())
}

pub fn run_migrations(conn: &Connection) -> rusqlite::Result<()> {
    create_migrations_table(conn)?;

    if !is_migration_applied(conn, "v1")? {
        record_migration(conn, "v1")?;
    }

    Ok(())
}
