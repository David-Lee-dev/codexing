use crate::domains::ai::error::AiError;
use crate::domains::ai::model::{
    GeminiContent, GeminiPart, GeminiRequest, GeminiResponse, GenerateTagsRequest,
};
use crate::domains::config::service::load_config;
use tauri::AppHandle;

const GEMINI_API_BASE: &str = "https://generativelanguage.googleapis.com/v1beta/models";

pub async fn generate_tags(
    app_handle: &AppHandle,
    request: GenerateTagsRequest,
) -> Result<Vec<String>, AiError> {
    let config =
        load_config(app_handle).map_err(|e| AiError::ConfigLoadFailed(e.to_string()))?;

    let api_key = config
        .gemini_api_key
        .ok_or(AiError::ApiKeyNotConfigured)?;

    let model = config.gemini_model.as_str();
    let api_url = format!("{}/{}:generateContent", GEMINI_API_BASE, model);

    let prompt = build_prompt(&request.title, &request.content);

    let gemini_request = GeminiRequest {
        contents: vec![GeminiContent {
            parts: vec![GeminiPart { text: prompt }],
        }],
    };

    let client = reqwest::Client::new();
    let response = client
        .post(format!("{}?key={}", api_url, api_key))
        .json(&gemini_request)
        .send()
        .await?;

    let gemini_response: GeminiResponse = response.json().await?;

    if let Some(error) = gemini_response.error {
        return Err(AiError::ApiError(error.message));
    }

    let text = gemini_response
        .candidates
        .and_then(|c| c.into_iter().next())
        .map(|c| c.content.parts.into_iter().next())
        .flatten()
        .map(|p| p.text)
        .ok_or_else(|| AiError::ResponseParseFailed("No response text found".to_string()))?;

    let tags = parse_tags(&text);
    Ok(tags)
}

fn build_prompt(title: &str, content: &str) -> String {
    format!(
        r#"Generate 3-5 relevant tags for the following document.
Return ONLY the tags as a comma-separated list, nothing else.
Tags should be lowercase, single words or short phrases (2-3 words max).
Do not include hashtags or any other formatting.

Title: {}

Content:
{}

Tags:"#,
        title, content
    )
}

fn parse_tags(text: &str) -> Vec<String> {
    text.split(',')
        .map(|s| s.trim().to_lowercase())
        .filter(|s| !s.is_empty() && s.len() <= 30)
        .take(5)
        .collect()
}
