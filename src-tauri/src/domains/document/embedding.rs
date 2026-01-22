use once_cell::sync::Lazy;
use ort::session::{builder::GraphOptimizationLevel, Session};
use std::sync::{Mutex, Once};
use tauri::{path::BaseDirectory, AppHandle, Manager};
use tokenizers::Tokenizer;
use tracing::{error, info, warn};

pub const EMBEDDING_DIMENSION: usize = 1024;
const MAX_SEQUENCE_LENGTH: usize = 512;

static ORT_INIT: Once = Once::new();

struct EmbeddingModel {
    session: Option<Session>,
    tokenizer: Option<Tokenizer>,
    initialized: bool,
}

impl EmbeddingModel {
    fn new() -> Self {
        Self {
            session: None,
            tokenizer: None,
            initialized: false,
        }
    }
}

static EMBEDDING_MODEL: Lazy<Mutex<EmbeddingModel>> = Lazy::new(|| Mutex::new(EmbeddingModel::new()));

fn get_onnx_filename() -> &'static str {
    #[cfg(all(target_os = "macos", target_arch = "aarch64"))]
    return "bge_m3_macos_aarch64.onnx";

    #[cfg(all(target_os = "macos", target_arch = "x86_64"))]
    return "bge_m3_macos_x86_64.onnx";

    #[cfg(all(target_os = "windows", target_arch = "x86_64"))]
    return "bge_m3_windows_x86_64.onnx";

    #[cfg(all(target_os = "linux", target_arch = "aarch64"))]
    return "bge_m3_linux_aarch64.onnx";

    #[cfg(all(target_os = "linux", target_arch = "x86_64"))]
    return "bge_m3_linux_x86_64.onnx";

    #[cfg(not(any(
        all(target_os = "macos", target_arch = "aarch64"),
        all(target_os = "macos", target_arch = "x86_64"),
        all(target_os = "windows", target_arch = "x86_64"),
        all(target_os = "linux", target_arch = "aarch64"),
        all(target_os = "linux", target_arch = "x86_64"),
    )))]
    compile_error!("Unsupported platform");
}

fn get_ort_dylib_filename() -> &'static str {
    #[cfg(target_os = "macos")]
    return "libonnxruntime.dylib";

    #[cfg(target_os = "windows")]
    return "onnxruntime.dll";

    #[cfg(target_os = "linux")]
    return "libonnxruntime.so";

    #[cfg(not(any(target_os = "macos", target_os = "windows", target_os = "linux")))]
    compile_error!("Unsupported platform");
}

fn initialize_ort_runtime(app_handle: &AppHandle) -> Result<(), String> {
    let dylib_path = app_handle
        .path()
        .resolve(
            format!("resources/onnxruntime/{}", get_ort_dylib_filename()),
            BaseDirectory::Resource,
        )
        .map_err(|e| format!("Failed to resolve ONNX Runtime library path: {}", e))?;

    if !dylib_path.exists() {
        return Err(format!("ONNX Runtime library not found: {:?}", dylib_path));
    }

    info!("Loading ONNX Runtime from: {:?}", dylib_path);

    let dylib_path_str = dylib_path
        .to_str()
        .ok_or_else(|| "Invalid ONNX Runtime library path".to_string())?;

    ort::init_from(dylib_path_str)
        .commit()
        .map_err(|e| format!("Failed to initialize ONNX Runtime: {}", e))?;

    Ok(())
}

pub fn initialize_embedding_model(app_handle: &AppHandle) -> Result<(), String> {
    let mut model = EMBEDDING_MODEL.lock().map_err(|e| e.to_string())?;

    if model.initialized {
        return Ok(());
    }

    // Initialize ONNX Runtime with dynamic loading (only once)
    let app_handle_clone = app_handle.clone();
    let mut init_error: Option<String> = None;
    ORT_INIT.call_once(|| {
        if let Err(e) = initialize_ort_runtime(&app_handle_clone) {
            init_error = Some(e);
        }
    });

    if let Some(e) = init_error {
        return Err(e);
    }

    let onnx_path = app_handle
        .path()
        .resolve(
            format!("resources/embedding/{}", get_onnx_filename()),
            BaseDirectory::Resource,
        )
        .map_err(|e| format!("Failed to resolve ONNX path: {}", e))?;

    let tokenizer_path = app_handle
        .path()
        .resolve("resources/embedding/tokenizer.json", BaseDirectory::Resource)
        .map_err(|e| format!("Failed to resolve tokenizer path: {}", e))?;

    if !onnx_path.exists() {
        let msg = format!("ONNX model not found: {:?}", onnx_path);
        warn!("{}", msg);
        return Err(msg);
    }

    if !tokenizer_path.exists() {
        let msg = format!("Tokenizer not found: {:?}", tokenizer_path);
        warn!("{}", msg);
        return Err(msg);
    }

    info!("Loading ONNX model from: {:?}", onnx_path);
    let session = Session::builder()
        .map_err(|e| format!("Failed to create session builder: {}", e))?
        .with_optimization_level(GraphOptimizationLevel::Level3)
        .map_err(|e| format!("Failed to set optimization level: {}", e))?
        .with_intra_threads(4)
        .map_err(|e| format!("Failed to set threads: {}", e))?
        .commit_from_file(&onnx_path)
        .map_err(|e| format!("Failed to load ONNX model: {}", e))?;

    info!("Loading tokenizer from: {:?}", tokenizer_path);
    let tokenizer = Tokenizer::from_file(&tokenizer_path)
        .map_err(|e| format!("Failed to load tokenizer: {}", e))?;

    model.session = Some(session);
    model.tokenizer = Some(tokenizer);
    model.initialized = true;

    info!("Embedding model initialized successfully");
    Ok(())
}

pub fn calculate_text_embedding(text: &str) -> Vec<f32> {
    if text.trim().is_empty() {
        return vec![0.0f32; EMBEDDING_DIMENSION];
    }

    let mut model = match EMBEDDING_MODEL.lock() {
        Ok(m) => m,
        Err(e) => {
            error!("Failed to lock embedding model: {}", e);
            return fallback_embedding(text);
        }
    };

    if !model.initialized {
        warn!("Embedding model not initialized, using fallback");
        return fallback_embedding(text);
    }

    let tokenizer = match &model.tokenizer {
        Some(t) => t.clone(),
        None => return fallback_embedding(text),
    };

    let session = match &mut model.session {
        Some(s) => s,
        None => return fallback_embedding(text),
    };

    match compute_embedding(session, &tokenizer, text) {
        Ok(embedding) => embedding,
        Err(e) => {
            error!("Failed to compute embedding: {}", e);
            fallback_embedding(text)
        }
    }
}

fn compute_embedding(session: &mut Session, tokenizer: &Tokenizer, text: &str) -> Result<Vec<f32>, String> {
    use ort::value::Tensor;

    let encoding = tokenizer
        .encode(text, true)
        .map_err(|e| format!("Tokenization failed: {}", e))?;

    let mut input_ids: Vec<i64> = encoding.get_ids().iter().map(|&id| id as i64).collect();
    let mut attention_mask: Vec<i64> = encoding.get_attention_mask().iter().map(|&m| m as i64).collect();
    let mut token_type_ids: Vec<i64> = encoding.get_type_ids().iter().map(|&t| t as i64).collect();

    if input_ids.len() > MAX_SEQUENCE_LENGTH {
        input_ids.truncate(MAX_SEQUENCE_LENGTH);
        attention_mask.truncate(MAX_SEQUENCE_LENGTH);
        token_type_ids.truncate(MAX_SEQUENCE_LENGTH);
    }

    let seq_len = input_ids.len();

    let input_ids_tensor = Tensor::from_array(([1, seq_len], input_ids.into_boxed_slice()))
        .map_err(|e| format!("Failed to create input_ids tensor: {}", e))?;
    let attention_mask_tensor = Tensor::from_array(([1, seq_len], attention_mask.into_boxed_slice()))
        .map_err(|e| format!("Failed to create attention_mask tensor: {}", e))?;
    let token_type_ids_tensor = Tensor::from_array(([1, seq_len], token_type_ids.into_boxed_slice()))
        .map_err(|e| format!("Failed to create token_type_ids tensor: {}", e))?;

    let outputs = session
        .run(ort::inputs![
            "input_ids" => input_ids_tensor,
            "attention_mask" => attention_mask_tensor,
            "token_type_ids" => token_type_ids_tensor,
        ])
        .map_err(|e| format!("Inference failed: {}", e))?;

    let output_value = outputs
        .get("last_hidden_state")
        .or_else(|| outputs.get("sentence_embedding"))
        .ok_or("No output tensor found")?;

    let (shape, data) = output_value
        .try_extract_tensor::<f32>()
        .map_err(|e| format!("Failed to extract tensor: {}", e))?;

    let dims: Vec<usize> = shape.iter().map(|&d| d as usize).collect();

    let embedding: Vec<f32> = if dims.len() == 3 {
        // Shape: [batch, seq_len, hidden_size] - mean pooling over seq_len
        let seq_length = dims[1];
        let hidden_size = dims[2];

        let mut pooled = vec![0.0f32; hidden_size];
        for i in 0..seq_length {
            for j in 0..hidden_size {
                pooled[j] += data[i * hidden_size + j];
            }
        }
        for val in &mut pooled {
            *val /= seq_length as f32;
        }
        pooled
    } else if dims.len() == 2 {
        // Shape: [batch, hidden_size] - already pooled
        data.to_vec()
    } else {
        data.to_vec()
    };

    Ok(l2_normalize(embedding))
}

fn l2_normalize(mut embedding: Vec<f32>) -> Vec<f32> {
    let magnitude: f32 = embedding.iter().map(|x| x * x).sum::<f32>().sqrt();
    if magnitude > 0.0 {
        for val in &mut embedding {
            *val /= magnitude;
        }
    }
    embedding
}

fn fallback_embedding(text: &str) -> Vec<f32> {
    use std::collections::HashMap;

    let mut embedding = vec![0.0f32; EMBEDDING_DIMENSION];

    if text.is_empty() {
        return embedding;
    }

    let content_lower = text.to_lowercase();
    let words: Vec<&str> = content_lower
        .split(|c: char| !c.is_alphanumeric() && c != '\'' && c != '-')
        .filter(|w| !w.is_empty() && w.len() > 1)
        .collect();

    if words.is_empty() {
        return embedding;
    }

    let mut word_freq: HashMap<&str, u32> = HashMap::new();
    for word in words.iter() {
        *word_freq.entry(word).or_insert(0) += 1;
    }

    for (word, freq) in word_freq {
        let hash_val: u32 = word.chars().map(|c| c as u32).sum();
        let idx = (hash_val as usize) % EMBEDDING_DIMENSION;
        let tf_weight = (1.0 + freq as f32).ln();
        embedding[idx] += tf_weight;
    }

    l2_normalize(embedding)
}
