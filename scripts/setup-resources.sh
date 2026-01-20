#!/bin/bash

# Codexing - Platform-specific resource setup script
# Usage: ./scripts/setup-resources.sh [platform]
# Platforms: macos-aarch64, macos-x86_64, linux-aarch64, linux-x86_64, windows-x86_64

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
RESOURCES_DIR="$PROJECT_ROOT/src-tauri/resources"
EMBEDDING_DIR="$RESOURCES_DIR/embedding"

# Detect platform if not specified
detect_platform() {
    local os=$(uname -s | tr '[:upper:]' '[:lower:]')
    local arch=$(uname -m)

    case "$os" in
        darwin) os="macos" ;;
        linux) os="linux" ;;
        mingw*|msys*|cygwin*) os="windows" ;;
    esac

    case "$arch" in
        x86_64|amd64) arch="x86_64" ;;
        arm64|aarch64) arch="aarch64" ;;
    esac

    echo "${os}-${arch}"
}

PLATFORM="${1:-$(detect_platform)}"
ONNX_FILE="bge_m3_${PLATFORM//-/_}.onnx"
ONNX_URL="https://github.com/David-Lee-dev/codexing/releases/download/v0.1.0/$ONNX_FILE"

echo "Setting up resources for platform: $PLATFORM"
echo "ONNX file: $ONNX_FILE"

# Create directories
mkdir -p "$EMBEDDING_DIR"

# Download ONNX model if not exists
if [ ! -f "$EMBEDDING_DIR/$ONNX_FILE" ]; then
    echo "Downloading ONNX model..."
    curl -L -o "$EMBEDDING_DIR/$ONNX_FILE" "$ONNX_URL" || {
        echo "Warning: Failed to download ONNX model from releases."
        echo "You can manually download it from: $ONNX_URL"
        echo "Or place the file at: $EMBEDDING_DIR/$ONNX_FILE"
    }
else
    echo "ONNX model already exists: $EMBEDDING_DIR/$ONNX_FILE"
fi

# Verify tokenizer.json exists
if [ ! -f "$EMBEDDING_DIR/tokenizer.json" ]; then
    echo "Warning: tokenizer.json not found at $EMBEDDING_DIR/tokenizer.json"
    echo "Please ensure tokenizer.json is present before building."
fi

echo "Resource setup complete!"
