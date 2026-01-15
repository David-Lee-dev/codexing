use rusqlite::{Connection, Result};
use std::path::PathBuf;
use std::sync::Once;

static SQLITE_VEC_INIT: Once = Once::new();

pub fn create_connection(path: &PathBuf) -> Result<Connection> {
    // Register sqlite-vec extension once
    SQLITE_VEC_INIT.call_once(|| unsafe {
        rusqlite::ffi::sqlite3_auto_extension(Some(std::mem::transmute(
            sqlite_vec::sqlite3_vec_init as *const (),
        )));
    });

    let db_path = path.join(
        std::env::var("DATABASE_NAME").expect("DATABASE_NAME environment variable is not set"),
    );
    let conn: Connection = Connection::open(db_path)?;

    conn.pragma_update(None, "journal_mode", Some("WAL"))?;
    conn.pragma_update(None, "foreign_keys", Some(1))?;

    Ok(conn)
}
