use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CommandResponse<T> {
    pub success: bool,
    pub code: i8,
    pub message: String,
    pub data: Option<T>,
}
