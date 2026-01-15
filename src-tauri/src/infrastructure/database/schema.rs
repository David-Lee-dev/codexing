use rusqlite::Connection;

pub fn init_schema(conn: &mut Connection) -> rusqlite::Result<()> {
    let tx = conn.transaction()?;

    // documents.status: 0 = FLEETING, 1 = PERMANENT, 99 = ARCHIVED
    tx.execute(
        "CREATE TABLE IF NOT EXISTS documents (
            id TEXT PRIMARY KEY,
            title TEXT,
            status SMALLINT DEFAULT 0,
            tags TEXT,
            created_at DATETIME DEFAULT (datetime('now', 'localtime')),
            updated_at DATETIME DEFAULT (datetime('now', 'localtime'))
        )",
        [],
    )?;

    // blocks.indexing_status: 0 = PENDING, 1 = INDEXED, 2 = FAILED
    tx.execute(
        "CREATE TABLE IF NOT EXISTS blocks (
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
            created_at DATETIME DEFAULT (datetime('now', 'localtime')),
            PRIMARY KEY (source_id, target_id),
            FOREIGN KEY(source_id) REFERENCES documents(id),
            FOREIGN KEY(target_id) REFERENCES documents(id)
        )",
        [],
    )?;

    tx.commit()?;
    Ok(())
}
