use rusqlite::Connection;

fn create_migrations_table(conn: &Connection) -> rusqlite::Result<()> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS schema_migrations (
            version TEXT PRIMARY KEY,
            applied_at DATETIME DEFAULT (datetime('now', 'localtime'))
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

pub fn run_migrations(conn: &mut Connection) -> rusqlite::Result<()> {
    create_migrations_table(conn)?;

    if !is_migration_applied(conn, "v1")? {
        record_migration(conn, "v1")?;
    }

    if !is_migration_applied(conn, "v2_migrate_to_numeric_types")? {
        migrate_to_numeric_types(conn)?;
        record_migration(conn, "v2_migrate_to_numeric_types")?;
    }

    Ok(())
}

fn migrate_to_numeric_types(conn: &mut Connection) -> rusqlite::Result<()> {
    let tx = conn.transaction()?;

    tx.execute("PRAGMA foreign_keys=off", [])?;

    tx.execute(
        "CREATE TABLE IF NOT EXISTS documents_new (
            id TEXT PRIMARY KEY,
            title TEXT,
            status SMALLINT DEFAULT 0,
            tags TEXT,
            created_at DATETIME DEFAULT (datetime('now', 'localtime')),
            updated_at DATETIME DEFAULT (datetime('now', 'localtime'))
        )",
        [],
    )?;

    tx.execute(
        "INSERT INTO documents_new (id, title, status, tags, created_at, updated_at)
         SELECT
            id,
            title,
            CASE
                WHEN status = 'draft' OR status = 'FLEETING' THEN 0
                WHEN status = 'published' OR status = 'PERMANENT' THEN 1
                WHEN status = 'archived' OR status = 'ARCHIVED' THEN 99
                ELSE 0
            END,
            tags,
            created_at,
            updated_at
         FROM documents",
        [],
    )?;

    tx.execute("DROP TABLE documents", [])?;
    tx.execute("ALTER TABLE documents_new RENAME TO documents", [])?;

    tx.execute(
        "CREATE TABLE IF NOT EXISTS blocks_new (
            id TEXT PRIMARY KEY,
            document_id TEXT NOT NULL,
            content TEXT,
            order_index REAL NOT NULL,
            source_document_id TEXT,
            indexing_status SMALLINT DEFAULT 0,
            created_at DATETIME DEFAULT (datetime('now', 'localtime')),
            updated_at DATETIME DEFAULT (datetime('now', 'localtime')),
            FOREIGN KEY(document_id) REFERENCES documents(id) ON DELETE CASCADE
        )",
        [],
    )?;

    tx.execute(
        "INSERT INTO blocks_new (id, document_id, content, order_index, source_document_id, indexing_status, created_at, updated_at)
         SELECT
            id,
            document_id,
            content,
            order_index,
            source_document_id,
            CASE
                WHEN indexing_status = 'pending' OR indexing_status = 'PENDING' THEN 0
                WHEN indexing_status = 'indexed' OR indexing_status = 'INDEXED' THEN 1
                WHEN indexing_status = 'failed' OR indexing_status = 'FAILED' THEN 2
                ELSE 0
            END,
            created_at,
            updated_at
         FROM blocks",
        [],
    )?;

    tx.execute("DROP TABLE blocks", [])?;
    tx.execute("ALTER TABLE blocks_new RENAME TO blocks", [])?;

    tx.execute("PRAGMA foreign_keys=on", [])?;

    tx.commit()?;
    Ok(())
}
