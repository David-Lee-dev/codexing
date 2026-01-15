use crate::domains::document::model::{Block, Document};
use crate::infrastructure::database::query::{query_all, query_one};
use rusqlite::{Connection, Result};

// ============================================
// Document Repository
// ============================================

pub fn find_document_by_id(conn: &Connection, document_id: &str) -> Result<Option<Document>> {
    let mut document = query_one(
        conn,
        "SELECT id, title, status, tags, created_at, updated_at
         FROM documents
         WHERE id = ?",
        [document_id],
        |row| {
            let tags_str: Option<String> = row.get(3)?;
            let tags = tags_str.filter(|s| !s.is_empty()).map(|s| {
                s.split(',')
                    .map(|s| s.trim().to_string())
                    .filter(|s| !s.is_empty())
                    .collect()
            });

            Ok(Document {
                id: row.get(0)?,
                title: row.get(1)?,
                status: row.get(2)?,
                tags,
                created_at: row.get(4)?,
                updated_at: row.get(5)?,
                blocks: Vec::new(),
            })
        },
    )?;

    if let Some(ref mut doc) = document {
        doc.blocks = find_blocks_by_document_id(conn, document_id)?;
    }

    Ok(document)
}

pub fn find_documents(conn: &Connection, limit: i64, offset: i64) -> Result<Vec<Document>> {
    query_all(
        conn,
        "SELECT id, title, status, tags, created_at, updated_at
         FROM documents
         WHERE status != 99
         ORDER BY status ASC, updated_at DESC
         LIMIT ?1 OFFSET ?2",
        [limit, offset],
        |row| {
            let tags_str: Option<String> = row.get(3)?;
            let tags = tags_str.filter(|s| !s.is_empty()).map(|s| {
                s.split(',')
                    .map(|s| s.trim().to_string())
                    .filter(|s| !s.is_empty())
                    .collect()
            });

            Ok(Document {
                id: row.get(0)?,
                title: row.get(1)?,
                status: row.get(2)?,
                tags,
                created_at: row.get(4)?,
                updated_at: row.get(5)?,
                blocks: Vec::new(),
            })
        },
    )
}

pub fn upsert_document(conn: &Connection, document: &Document) -> Result<()> {
    let tags_str = document
        .tags
        .as_ref()
        .map(|t| t.join(","))
        .unwrap_or_default();

    conn.execute(
        "INSERT INTO documents (id, title, status, tags)
         VALUES (?1, ?2, ?3, ?4)
         ON CONFLICT(id) DO UPDATE SET
             title = excluded.title,
             status = excluded.status,
             tags = excluded.tags,
             updated_at = datetime('now', 'localtime')",
        (&document.id, &document.title, &document.status, &tags_str),
    )?;

    Ok(())
}

pub fn delete_document(conn: &Connection, document_id: &str) -> Result<()> {
    conn.execute("DELETE FROM documents WHERE id = ?", [document_id])?;
    Ok(())
}

// ============================================
// Block Repository
// ============================================

pub fn find_blocks_by_document_id(conn: &Connection, document_id: &str) -> Result<Vec<Block>> {
    query_all(
        conn,
        "SELECT id, document_id, content, order_index,
                source_document_id, indexing_status, created_at, updated_at
         FROM blocks
         WHERE document_id = ?
         ORDER BY order_index ASC",
        [document_id],
        |row| {
            Ok(Block {
                id: row.get(0)?,
                document_id: row.get(1)?,
                content: row.get(2)?,
                order_index: row.get(3)?,
                source_document_id: row.get(4)?,
                indexing_status: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            })
        },
    )
}

pub fn find_block_by_id(conn: &Connection, block_id: &str) -> Result<Option<Block>> {
    query_one(
        conn,
        "SELECT id, document_id, content, order_index,
                source_document_id, indexing_status, created_at, updated_at
         FROM blocks
         WHERE id = ?",
        [block_id],
        |row| {
            Ok(Block {
                id: row.get(0)?,
                document_id: row.get(1)?,
                content: row.get(2)?,
                order_index: row.get(3)?,
                source_document_id: row.get(4)?,
                indexing_status: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            })
        },
    )
}

pub fn find_oldest_pending_block(conn: &Connection) -> Result<Option<Block>> {
    query_one(
        conn,
        "SELECT id, document_id, content, order_index,
                source_document_id, indexing_status, created_at, updated_at
         FROM blocks
         WHERE indexing_status = 0
         ORDER BY updated_at ASC
         LIMIT 1",
        [],
        |row| {
            Ok(Block {
                id: row.get(0)?,
                document_id: row.get(1)?,
                content: row.get(2)?,
                order_index: row.get(3)?,
                source_document_id: row.get(4)?,
                indexing_status: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            })
        },
    )
}

pub fn upsert_block(conn: &Connection, block: &Block) -> Result<()> {
    conn.execute(
        "INSERT INTO blocks (id, document_id, content, order_index,
                             source_document_id, indexing_status)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)
         ON CONFLICT(id) DO UPDATE SET
             content = excluded.content,
             order_index = excluded.order_index,
             source_document_id = excluded.source_document_id,
             indexing_status = CASE
                 WHEN blocks.content IS NOT excluded.content THEN 0
                 ELSE blocks.indexing_status
             END,
             updated_at = CASE
                 WHEN blocks.content IS NOT excluded.content THEN datetime('now', 'localtime')
                 ELSE blocks.updated_at
             END",
        (
            &block.id,
            &block.document_id,
            &block.content,
            &block.order_index,
            &block.source_document_id,
            &block.indexing_status,
        ),
    )?;

    Ok(())
}

pub fn update_block_indexing_status(conn: &Connection, block_id: &str, status: i16) -> Result<()> {
    conn.execute(
        "UPDATE blocks SET indexing_status = ? WHERE id = ?",
        rusqlite::params![status, block_id],
    )?;
    Ok(())
}

pub fn delete_block(conn: &Connection, block_id: &str) -> Result<()> {
    conn.execute("DELETE FROM blocks WHERE id = ?", [block_id])?;
    Ok(())
}

pub fn delete_blocks_by_document_id(conn: &Connection, document_id: &str) -> Result<()> {
    conn.execute("DELETE FROM blocks WHERE document_id = ?", [document_id])?;
    Ok(())
}

// ============================================
// Vector Repository
// ============================================

pub fn upsert_block_vector(conn: &Connection, block_id: &str, embedding: &[f32]) -> Result<()> {
    // Convert f32 slice to bytes for sqlite-vec
    let embedding_bytes: Vec<u8> = embedding.iter().flat_map(|f| f.to_le_bytes()).collect();

    // Delete existing vector if any (using block_id as rowid reference)
    conn.execute(
        "DELETE FROM vec_blocks WHERE rowid IN (SELECT rowid FROM blocks WHERE id = ?)",
        rusqlite::params![block_id],
    )?;

    // Insert new vector using block's rowid
    conn.execute(
        "INSERT INTO vec_blocks (rowid, embedding)
         SELECT rowid, ?2 FROM blocks WHERE id = ?1",
        rusqlite::params![block_id, &embedding_bytes],
    )?;

    Ok(())
}

pub fn find_similar_blocks(
    conn: &Connection,
    embedding: &[f32],
    threshold: f32,
    limit: i64,
) -> Result<Vec<(String, f32)>> {
    // Convert f32 slice to bytes for sqlite-vec
    let embedding_bytes: Vec<u8> = embedding.iter().flat_map(|f| f.to_le_bytes()).collect();

    query_all(
        conn,
        "SELECT b.id, v.distance
         FROM vec_blocks v
         JOIN blocks b ON b.rowid = v.rowid
         WHERE v.embedding MATCH ?1
           AND k = ?2
           AND v.distance < ?3",
        rusqlite::params![&embedding_bytes, limit, threshold],
        |row| Ok((row.get(0)?, row.get(1)?)),
    )
}

/// Returns (block_id, document_id, distance) for similar blocks
pub fn find_similar_blocks_with_document(
    conn: &Connection,
    embedding: &[f32],
    threshold: f32,
    limit: i64,
) -> Result<Vec<(String, String, f32)>> {
    let embedding_bytes: Vec<u8> = embedding.iter().flat_map(|f| f.to_le_bytes()).collect();

    query_all(
        conn,
        "SELECT b.id, b.document_id, v.distance
         FROM vec_blocks v
         JOIN blocks b ON b.rowid = v.rowid
         WHERE v.embedding MATCH ?1
           AND k = ?2
           AND v.distance < ?3",
        rusqlite::params![&embedding_bytes, limit, threshold],
        |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)),
    )
}

pub fn delete_block_vector(conn: &Connection, block_id: &str) -> Result<()> {
    conn.execute(
        "DELETE FROM vec_blocks WHERE rowid IN (SELECT rowid FROM blocks WHERE id = ?)",
        rusqlite::params![block_id],
    )?;
    Ok(())
}

// ============================================
// Edge Repository
// ============================================

pub fn upsert_edge(
    conn: &Connection,
    source_id: &str,
    target_id: &str,
    relation_type: Option<&str>,
    weight: f64,
) -> Result<()> {
    conn.execute(
        "INSERT INTO edges (source_id, target_id, relation_type, weight)
         VALUES (?1, ?2, ?3, ?4)
         ON CONFLICT(source_id, target_id) DO UPDATE SET
             relation_type = excluded.relation_type,
             weight = excluded.weight",
        (source_id, target_id, relation_type, weight),
    )?;
    Ok(())
}

pub fn delete_edges_by_source(conn: &Connection, source_id: &str) -> Result<()> {
    conn.execute("DELETE FROM edges WHERE source_id = ?", [source_id])?;
    Ok(())
}

pub fn delete_edges_by_target(conn: &Connection, target_id: &str) -> Result<()> {
    conn.execute("DELETE FROM edges WHERE target_id = ?", [target_id])?;
    Ok(())
}

pub fn find_edges_by_source_id(conn: &Connection, source_id: &str) -> Result<Vec<(String, f64)>> {
    query_all(
        conn,
        "SELECT target_id, weight FROM edges WHERE source_id = ?",
        [source_id],
        |row| Ok((row.get(0)?, row.get(1)?)),
    )
}

pub fn delete_edge(conn: &Connection, source_id: &str, target_id: &str) -> Result<()> {
    conn.execute(
        "DELETE FROM edges WHERE source_id = ? AND target_id = ?",
        [source_id, target_id],
    )?;
    Ok(())
}

// ============================================
// Legacy aliases (for backward compatibility)
// ============================================

pub fn get_document_by_id(conn: &Connection, document_id: &str) -> Result<Option<Document>> {
    find_document_by_id(conn, document_id)
}

pub fn get_documents(conn: &Connection, limit: i64, offset: i64) -> Result<Vec<Document>> {
    find_documents(conn, limit, offset)
}
