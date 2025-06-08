# ML Model Fallback Mechanism

## Overview

LinkShield AI includes a fallback prediction mechanism that ensures the application remains functional even when the ML model files are missing or corrupted. This document explains how the fallback system works and how to restore the full ML model functionality.

## How the Fallback System Works

When the application starts, it attempts to load the ML model files from the `backend/ml_models/phishing-url-detector` directory. If any required files are missing, the application will automatically switch to the fallback prediction mechanism.

The fallback system uses rule-based heuristics to analyze URLs for potential phishing indicators, including:

1. Protocol security (HTTP vs HTTPS)
2. Suspicious top-level domains
3. IP addresses in URLs
4. Excessive subdomains
5. Unusually long domain names
6. Suspicious keywords in the hostname
7. Special characters in the hostname
8. Excessively long paths
9. Excessive query parameters

While not as accurate as the ML model, the fallback system provides a reasonable assessment of URL risk until the model files can be restored.

## Required Model Files

The following files are required for the ML model to function properly:

- `pytorch_model.bin` - The trained model weights
- `config.json` - Model configuration
- `vocab.txt` - Vocabulary file for tokenization
- `tokenizer_config.json` - Tokenizer configuration

## Restoring the ML Model

To restore the ML model functionality, you'll need to ensure the required model files are present in the `backend/ml_models/phishing-url-detector` directory:

1. Make sure you have all required model files:
   - `pytorch_model.bin` or `model.safetensors`
   - `config.json`
   - `vocab.txt`
   - `tokenizer_config.json`

2. Place these files in the correct directory:
   - `backend/ml_models/phishing-url-detector/`

**Note:** In a production environment, you should use a properly fine-tuned model trained on phishing URL data.

## Monitoring Model Status

You can check the status of the ML model through the `/health` endpoint, which provides detailed information about:

- Whether the model is loaded
- Which files are missing (if any)
- Whether the fallback mechanism is active
- The device being used (CPU or GPU)

Example response when model is missing:

```json
{
  "status": "ok",
  "timestamp": "2025-06-08T15:30:45.123456Z",
  "device": "cpu",
  "model_status": "fallback",
  "model_details": {
    "error": "Missing model files: pytorch_model.bin, config.json. Using fallback prediction.",
    "fallback_active": true,
    "message": "Using rule-based fallback prediction instead of ML model",
    "model_dir": "/path/to/model",
    "files_present": ["tokenizer_config.json", "vocab.txt"],
    "missing_files": ["pytorch_model.bin", "config.json"]
  }
}
```

## Training Custom Models

For production deployments, we recommend training a custom model on phishing data. See the `ml_training` directory for scripts and sample data to train your own model.
