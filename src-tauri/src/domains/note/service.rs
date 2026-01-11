use crate::domains::config::service::load_config;
use crate::domains::note::error::NoteError;
use crate::domains::note::model::{Block, Document};
use crate::infrastructure::database::connection::create_connection;
use crate::utils::file_system::create_directory;
use anyhow::anyhow;
use rusqlite::OptionalExtension;
use std::path::PathBuf;
use tauri::AppHandle;

pub fn ensure_storage(path: &str, name: &str) -> Result<String, NoteError> {
    let base_path = PathBuf::from(path);
    let storage_path = base_path.join(name);

    if !base_path.exists() {
        return Err(NoteError::PathDoesNotExistError(anyhow!(
            "Path does not exist: {:?}",
            base_path
        )));
    }

    if !base_path.is_dir() {
        return Err(NoteError::PathIsNotDirectoryError(anyhow!(
            "Path is not a directory: {:?}",
            base_path
        )));
    }

    create_directory(&storage_path).map_err(NoteError::PathCreationError)?;

    Ok(storage_path.to_string_lossy().into_owned())
}

pub fn get_document(
    app_handle: &AppHandle,
    document_id: &str,
) -> Result<Option<Document>, NoteError> {
    let config = load_config(app_handle).map_err(NoteError::ConfigLoadingError)?;
    let conn: rusqlite::Connection =
        create_connection(&PathBuf::from(config.storage_path.unwrap_or_default()))
            .map_err(NoteError::DatabaseConnectionCreationError)?;

    let document = conn
        .query_row(
            "SELECT id, title, status, tags, created_at, updated_at FROM documents WHERE id = ?",
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
                    blocks: None,
                })
            },
        )
        .optional()
        .map_err(NoteError::DatabaseQueryError)?;

    let Some(mut doc) = document else {
        return Ok(None);
    };

    let blocks = conn
        .prepare("SELECT id, document_id, block_type, content, order_index, source_document_id, indexing_status, created_at, updated_at FROM blocks WHERE document_id = ? ORDER BY order_index ASC")
        .map_err(NoteError::DatabaseQueryError)?
        .query_map([document_id], |row| {
            Ok(Block {
                id: row.get(0)?,
                document_id: row.get(1)?,
                block_type: row.get(2)?,
                content: row.get(3)?,
                order_index: row.get(4)?,
                source_document_id: row.get(5)?,
                indexing_status: row.get(6)?,
                created_at: row.get(7)?,
                updated_at: row.get(8)?,
            })
        })
        .and_then(|rows| rows.collect())
        .map_err(NoteError::DatabaseQueryError)?;

    doc.blocks = Some(blocks);
    Ok(Some(doc))
}
