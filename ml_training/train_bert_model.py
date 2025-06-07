# linkshield-ai/ml_training/train_bert_model.py

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score # For ROC AUC metric
from transformers import BertTokenizer, BertForSequenceClassification, Trainer, TrainingArguments
import transformers # For version checking
from datasets import Dataset
import torch
import numpy as np
import evaluate 
import inspect
import math 
import os # For creating output directory

# --- Print location of TrainingArguments and transformers version ---
try:
    print(f"--- DEBUG: TrainingArguments is imported from: {inspect.getfile(TrainingArguments)} ---")
    print(f"--- DEBUG: transformers library version: {transformers.__version__} ---")
    print(f"--- DEBUG: PyTorch version: {torch.__version__} ---")
except Exception as e:
    print(f"--- DEBUG: Could not get file for TrainingArguments or library versions: {e} ---")
# --- End Debug Print ---

# --- Configuration & Setup ---
DATASET_PATH = "dataset/clean_urls.csv"
MODEL_OUTPUT_DIR = "phishing-url-detector" 
TRAINING_RESULTS_DIR = './results' 
LOGGING_DIR = './logs'
RANDOM_SEED = 42 
NUM_EPOCHS = 1
# !! IMPORTANT for GTX 1650 (4GB VRAM) !!
# Start with a smaller batch size, e.g., 4 or 8.
# If you get Out-of-Memory (OOM) errors, reduce this further.
TRAIN_BATCH_SIZE = 8 # Reduced for 4GB VRAM
EVAL_BATCH_SIZE = 8  # Reduced for 4GB VRAM
# Use gradient accumulation to achieve a larger effective batch size if needed
# e.g., if TRAIN_BATCH_SIZE is 4, and GRADIENT_ACCUMULATION_STEPS is 4, effective batch size is 16.
GRADIENT_ACCUMULATION_STEPS = 2 # Example: effective batch size 8*2=16

torch.manual_seed(RANDOM_SEED)
np.random.seed(RANDOM_SEED)
if torch.cuda.is_available():
    torch.cuda.manual_seed_all(RANDOM_SEED)

def main():
    # --- Device Check ---
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")
    if device.type == 'cuda':
        print(f"CUDA Device Name: {torch.cuda.get_device_name(0)}")
        print(f"CUDA Capability: {torch.cuda.get_device_capability(0)}")
    elif device.type == 'cpu':
        print("Warning: CUDA not available, training on CPU. This will be very slow.")

    # --- Load and Prepare Data ---
    print(f"Loading dataset from: {DATASET_PATH}")
    try:
        df = pd.read_csv(DATASET_PATH).dropna()
    except FileNotFoundError:
        print(f"Error: Dataset file not found at {DATASET_PATH}")
        print("Please ensure 'clean_urls.csv' is inside the 'dataset' subdirectory within 'ml_training/'.")
        return
    except Exception as e:
        print(f"Error loading dataset: {e}")
        return

    df = df.sample(frac=1, random_state=RANDOM_SEED).reset_index(drop=True)
    print(f"Loaded {len(df)} rows. First 5 rows:\n{df.head()}")

    if 'url' not in df.columns or 'label' not in df.columns:
        print("Error: Dataset must contain 'url' and 'label' columns.")
        return
    
    df['label'] = df['label'].astype(int)
    print(f"Label distribution:\n{df['label'].value_counts(normalize=True)}")

    print("Splitting dataset into training and validation sets (80/20)...")
    train_texts, val_texts, train_labels, val_labels = train_test_split(
        df['url'].tolist(), 
        df['label'].tolist(), 
        test_size=0.2, 
        random_state=RANDOM_SEED,
        stratify=df['label'].tolist() 
    )
    print(f"Training samples: {len(train_texts)}, Validation samples: {len(val_texts)}")

    # --- Tokenization ---
    print("Loading BERT tokenizer (bert-base-uncased)...")
    try:
        tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")
    except Exception as e:
        print(f"Error loading tokenizer: {e}")
        return
        
    print("Tokenizing training and validation texts...")
    train_encodings = tokenizer(train_texts, truncation=True, padding=True, max_length=128)
    val_encodings = tokenizer(val_texts, truncation=True, padding=True, max_length=128)

    # --- Prepare HuggingFace Datasets ---
    print("Preparing HuggingFace Datasets...")
    train_dataset = Dataset.from_dict({
        'input_ids': train_encodings['input_ids'],
        'attention_mask': train_encodings['attention_mask'],
        'labels': train_labels
    })
    val_dataset = Dataset.from_dict({
        'input_ids': val_encodings['input_ids'],
        'attention_mask': val_encodings['attention_mask'],
        'labels': val_labels
    })
    
    train_dataset.set_format("torch")
    val_dataset.set_format("torch")

    # --- Load BERT Model ---
    print("Loading BERT model for sequence classification (bert-base-uncased, num_labels=2)...")
    try:
        model = BertForSequenceClassification.from_pretrained(
            "bert-base-uncased", 
            num_labels=2,
            problem_type="single_label_classification" 
        ) 
        model.to(device) # Move model to GPU if available
    except Exception as e:
        print(f"Error loading model: {e}")
        return

    # --- Define Metrics Computation using 'evaluate' ---
    accuracy_metric_eval = evaluate.load("accuracy")
    precision_metric_eval = evaluate.load("precision")
    recall_metric_eval = evaluate.load("recall")
    f1_metric_eval = evaluate.load("f1")

    def compute_metrics(pred):
        labels = pred.label_ids
        logits = pred.predictions 
        preds = np.argmax(logits, axis=-1)
        probs_positive_class = torch.softmax(torch.tensor(logits), dim=-1)[:, 1].numpy()

        acc_result = accuracy_metric_eval.compute(predictions=preds, references=labels)
        precision_result = precision_metric_eval.compute(predictions=preds, references=labels, average='binary', zero_division=0)
        recall_result = recall_metric_eval.compute(predictions=preds, references=labels, average='binary', zero_division=0)
        f1_result = f1_metric_eval.compute(predictions=preds, references=labels, average='binary', zero_division=0)
        
        roc_auc = 0.0
        try:
            if len(np.unique(labels)) > 1:
                 roc_auc = roc_auc_score(labels, probs_positive_class)
        except ValueError as e_roc:
            print(f"Warning: Could not calculate ROC AUC for this batch: {e_roc}")

        return {
            'accuracy': acc_result['accuracy'],
            'f1': f1_result['f1'],
            'precision': precision_result['precision'],
            'recall': recall_result['recall'],
            'roc_auc': roc_auc
        }

    # --- Define Training Arguments ---
    print("Defining training arguments...")
    
    effective_train_batch_size = TRAIN_BATCH_SIZE * GRADIENT_ACCUMULATION_STEPS 
    steps_per_epoch = 1
    if len(train_dataset) > 0 and effective_train_batch_size > 0 :
        steps_per_epoch = math.ceil(len(train_dataset) / effective_train_batch_size)
    else:
        print("Warning: train_dataset length or effective_train_batch_size is zero. Defaulting steps_per_epoch to 1.")
    if steps_per_epoch == 0: steps_per_epoch = 1 

    training_args = TrainingArguments(
        output_dir=TRAINING_RESULTS_DIR,
        num_train_epochs=NUM_EPOCHS,
        per_device_train_batch_size=TRAIN_BATCH_SIZE,
        per_device_eval_batch_size=EVAL_BATCH_SIZE,
        gradient_accumulation_steps=GRADIENT_ACCUMULATION_STEPS,
        weight_decay=0.01,
        logging_dir=LOGGING_DIR,
        logging_steps=max(1, int(steps_per_epoch / 10)),
        
        # Training settings
        learning_rate=5e-5,
        warmup_steps=0,
        
        # Minimal evaluation setting
        do_eval=True,                    # Enable evaluation during training
        
        # GPU optimization
        fp16=torch.cuda.is_available(),  # Enable mixed precision if GPU available
    )

    # --- Initialize Trainer ---
    print("Initializing Trainer...")
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=val_dataset,
        compute_metrics=compute_metrics,
        tokenizer=tokenizer,
    )

    # --- Train the Model ---
    print(f"\nStarting model training for {NUM_EPOCHS} epochs...")
    print(f"Training with batch size: {TRAIN_BATCH_SIZE}, grad accumulation: {GRADIENT_ACCUMULATION_STEPS} (effective batch size: {effective_train_batch_size})")
    print(f"Total training steps: {steps_per_epoch * NUM_EPOCHS * GRADIENT_ACCUMULATION_STEPS}") # Corrected total steps shown
    print(f"Evaluation and saving every {steps_per_epoch} optimization steps (approx. end of each epoch).")
    try:
        trainer.train()
        print("Training complete!")
    except Exception as e:
        print(f"An error occurred during training: {e}")
        import traceback
        traceback.print_exc() 
        return

    print("\nEvaluating the final model (best model loaded if load_best_model_at_end=True)...")
    eval_results = trainer.evaluate()
    print(f"Final evaluation results: {eval_results}")

    print(f"\nSaving the final (best) model and tokenizer to: {MODEL_OUTPUT_DIR}")
    try:
        if not os.path.exists(MODEL_OUTPUT_DIR):
            os.makedirs(MODEL_OUTPUT_DIR)
        trainer.save_model(MODEL_OUTPUT_DIR)
        print("Model and tokenizer saved successfully.")
    except Exception as e:
        print(f"Error saving model/tokenizer: {e}")

if __name__ == "__main__":
    main()