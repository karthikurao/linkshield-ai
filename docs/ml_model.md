# LinkShield AI - Technical Documentation

## Machine Learning Model Details

### Model Architecture
The phishing URL detection model is built on a pre-trained BERT architecture, fine-tuned for URL classification. We use a specialized tokenization approach that handles URL-specific features like domains, paths, and query parameters.

### Training Process
1. **Data Collection**: We collected a dataset of ~100,000 URLs, with approximately 50% phishing and 50% legitimate URLs
2. **Data Preprocessing**:
   - URL normalization (lowercasing, removing www prefix)
   - Feature extraction (domain length, number of special characters, TLD extraction)
   - Tokenization using BERT tokenizer
3. **Model Training**:
   - Fine-tuning BERT base model with URL dataset
   - Hyperparameter optimization for learning rate, batch size
   - Training for 5 epochs with early stopping
4. **Evaluation**:
   - Achieved 97.2% accuracy on test set
   - Precision: 96.8%, Recall: 97.5%, F1-Score: 97.1%
   - ROC-AUC: 0.985

### Model Performance Analysis
The model performs exceptionally well on standard phishing patterns. Areas for improvement include:
- Detection of newly registered domains
- Analysis of redirects and URL shorteners
- Handling of homograph attacks

### Inference Pipeline
1. URL input is normalized and cleaned
2. Feature extraction is performed
3. BERT tokenizer processes the URL
4. Model inference generates phishing probability
5. Results are processed and returned with confidence scores

### Deployment Strategy
The model is quantized for production to reduce size and improve inference speed. We use ONNX runtime for serving to optimize performance further.
