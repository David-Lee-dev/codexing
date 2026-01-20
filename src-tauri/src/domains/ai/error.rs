use thiserror::Error;

#[derive(Debug, Error)]
pub enum AiError {
    #[error("API key not configured")]
    ApiKeyNotConfigured,

    #[error("Failed to load config: {0}")]
    ConfigLoadFailed(String),

    #[error("HTTP request failed: {0}")]
    HttpRequestFailed(#[from] reqwest::Error),

    #[error("Failed to parse API response: {0}")]
    ResponseParseFailed(String),

    #[error("API returned error: {0}")]
    ApiError(String),
}
