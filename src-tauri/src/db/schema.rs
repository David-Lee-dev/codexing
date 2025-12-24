use rusqlite::Connection;
use tracing::info;

pub fn init_schema(conn: &mut Connection) -> rusqlite::Result<()> {
    let tx = conn.transaction()?;

    tx.execute(
        "CREATE TABLE IF NOT EXISTS documents (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            status TEXT DEFAULT 'FLEETING',
            tags TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;

    tx.execute(
        "CREATE TABLE IF NOT EXISTS blocks (
            id TEXT PRIMARY KEY,
            document_id TEXT NOT NULL,
            type TEXT DEFAULT 'paragraph',
            content TEXT,
            order_index REAL NOT NULL,
            source_document_id TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(document_id) REFERENCES documents(id) ON DELETE CASCADE
        )",
        [],
    )?;

    tx.execute(
        "CREATE VIRTUAL TABLE IF NOT EXISTS vec_blocks USING vec0(
            embedding float[384]
        )",
        [],
    )?;

    tx.execute(
        "CREATE TABLE IF NOT EXISTS edges (
            source_id TEXT NOT NULL,
            target_id TEXT NOT NULL,
            relation_type TEXT,
            weight REAL DEFAULT 1.0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (source_id, target_id),
            FOREIGN KEY(source_id) REFERENCES documents(id),
            FOREIGN KEY(target_id) REFERENCES documents(id)
        )",
        [],
    )?;

    tx.commit()?;
    info!("Database schema initialized successfully");
    Ok(())
}
