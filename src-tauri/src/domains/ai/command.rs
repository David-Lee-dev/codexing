use crate::domains::ai::model::GenerateTagsRequest;
use crate::domains::ai::service::generate_tags as generate_tags_service;
use crate::domains::common::model::CommandResponse;
use tauri::AppHandle;

#[tauri::command]
pub async fn generate_tags(
    app_handle: AppHandle,
    request: GenerateTagsRequest,
) -> CommandResponse<Vec<String>> {
    match generate_tags_service(&app_handle, request).await {
        Ok(tags) => CommandResponse {
            success: true,
            code: 200,
            message: "Tags generated successfully".to_string(),
            data: Some(tags),
        },
        Err(e) => CommandResponse {
            success: false,
            code: 500,
            message: format!("Failed to generate tags: {}", e),
            data: None,
        },
    }
}
