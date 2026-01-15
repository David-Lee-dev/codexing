use rusqlite::{Connection, OptionalExtension, Params, Result, Row};

/// Query a single row and map it to type T.
/// Returns `Ok(None)` if no rows found (instead of error).
/// Returns `Ok(Some(T))` if exactly one row found.
/// Returns `Err` if query fails for other reasons.
///
/// # Example
/// ```ignore
/// let user = query_one(&conn, "SELECT * FROM users WHERE id = ?", [user_id], |row| {
///     Ok(User { id: row.get(0)?, name: row.get(1)? })
/// })?;
/// ```
pub fn query_one<T, P, F>(conn: &Connection, sql: &str, params: P, mapper: F) -> Result<Option<T>>
where
    P: Params,
    F: FnOnce(&Row<'_>) -> Result<T>,
{
    conn.query_row(sql, params, mapper).optional()
}

/// Query multiple rows and map each to type T.
/// Returns empty Vec if no rows found.
///
/// # Example
/// ```ignore
/// let users = query_all(&conn, "SELECT * FROM users WHERE active = ?", [true], |row| {
///     Ok(User { id: row.get(0)?, name: row.get(1)? })
/// })?;
/// ```
pub fn query_all<T, P, F>(conn: &Connection, sql: &str, params: P, mapper: F) -> Result<Vec<T>>
where
    P: Params,
    F: FnMut(&Row<'_>) -> Result<T>,
{
    let mut stmt = conn.prepare(sql)?;
    let rows = stmt.query_map(params, mapper)?;
    rows.collect()
}

/// Execute a non-SELECT query (INSERT, UPDATE, DELETE).
/// Returns the number of affected rows.
///
/// # Example
/// ```ignore
/// let affected = execute(&conn, "UPDATE users SET active = ? WHERE id = ?", (true, user_id))?;
/// ```
pub fn execute<P>(conn: &Connection, sql: &str, params: P) -> Result<usize>
where
    P: Params,
{
    conn.execute(sql, params)
}

/// Execute multiple SQL statements in a batch.
/// Useful for running multiple independent statements.
/// Returns Ok(()) on success.
///
/// # Example
/// ```ignore
/// execute_batch(&conn, "
///     DELETE FROM sessions WHERE expired = 1;
///     UPDATE users SET last_cleanup = CURRENT_TIMESTAMP;
/// ")?;
/// ```
pub fn execute_batch(conn: &Connection, sql: &str) -> Result<()> {
    conn.execute_batch(sql)
}

/// Check if at least one row exists matching the query.
/// Returns `Ok(true)` if exists, `Ok(false)` if not.
///
/// # Example
/// ```ignore
/// let user_exists = exists(&conn, "SELECT 1 FROM users WHERE email = ?", [email])?;
/// ```
pub fn exists<P>(conn: &Connection, sql: &str, params: P) -> Result<bool>
where
    P: Params,
{
    let result: Option<i32> = conn.query_row(sql, params, |row| row.get(0)).optional()?;
    Ok(result.is_some())
}

/// Query a single scalar value.
/// Returns `Ok(None)` if no rows found.
/// Useful for COUNT, SUM, MAX, etc.
///
/// # Example
/// ```ignore
/// let count: Option<i64> = query_scalar(&conn, "SELECT COUNT(*) FROM users WHERE active = ?", [true])?;
/// let total: Option<f64> = query_scalar(&conn, "SELECT SUM(amount) FROM orders", [])?;
/// ```
pub fn query_scalar<T, P>(conn: &Connection, sql: &str, params: P) -> Result<Option<T>>
where
    P: Params,
    T: rusqlite::types::FromSql,
{
    conn.query_row(sql, params, |row| row.get(0)).optional()
}

/// Insert a row and return the last inserted row ID.
/// Returns the rowid of the last successful INSERT.
///
/// # Example
/// ```ignore
/// let id = insert(&conn, "INSERT INTO users (name, email) VALUES (?, ?)", ("John", "john@example.com"))?;
/// ```
pub fn insert<P>(conn: &Connection, sql: &str, params: P) -> Result<i64>
where
    P: Params,
{
    conn.execute(sql, params)?;
    Ok(conn.last_insert_rowid())
}
