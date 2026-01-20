use std::collections::HashMap;

const EMBEDDING_DIMENSION: usize = 384;

pub fn calculate_text_embedding(text: &str) -> Vec<f32> {
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

    // L2 normalization
    let magnitude: f32 = embedding.iter().map(|x| x * x).sum::<f32>().sqrt();
    if magnitude > 0.0 {
        for val in &mut embedding {
            *val /= magnitude;
        }
    }

    embedding
}
