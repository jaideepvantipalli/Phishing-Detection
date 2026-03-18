# =========================================
# 1. INSTALL DEPENDENCIES
# =========================================
# !pip install kagglehub[pandas-datasets]
# !pip install scikit-learn pandas numpy joblib

# =========================================
# 2. IMPORT LIBRARIES
# =========================================
import kagglehub
from kagglehub import KaggleDatasetAdapter

import pandas as pd
import numpy as np
import re
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score

# =========================================
# 3. LOAD DATASET
# =========================================
# Adjusting to absolute path for reliable execution
import os
script_dir = os.path.dirname(os.path.abspath(__file__))
dataset_path = os.path.join(script_dir, "data/malicious_phish.csv")

print(f"Loading dataset from: {dataset_path}")
try:
    df = pd.read_csv(dataset_path)
except FileNotFoundError:
    print(f"Dataset not found at {dataset_path}. Falling back to kagglehub...")
    df = kagglehub.load_dataset(
      KaggleDatasetAdapter.PANDAS,
      "sid321axn/malicious-urls-dataset",
      ""
    )

print("Dataset shape:", df.shape)
print(df.head())

# =========================================
# 4. CLEAN DATA
# =========================================
df = df.dropna()

# Standardize column names
df.columns = ['url', 'label']

# Convert labels to binary (0 = Benign, 1 = Malicious/Phishing)
# Handling both 'benign'/'phishing' strings and potential 0/1 integers
def encode_label(l):
    if isinstance(l, str):
        l = l.lower()
        if l == 'benign' or l == '0': return 0
        return 1
    return 0 if l == 0 else 1

df['label'] = df['label'].apply(encode_label)

# =========================================
# 5. FEATURE ENGINEERING
# =========================================

def extract_features(url):
    features = {}
    url = str(url)

    features['url_length'] = len(url)
    features['num_digits'] = sum(c.isdigit() for c in url)
    features['num_special_chars'] = len(re.findall(r'[^a-zA-Z0-9]', url))
    features['has_https'] = 1 if url.startswith('https') else 0
    features['num_subdomains'] = url.count('.')
    features['has_ip'] = 1 if re.search(r'\d+\.\d+\.\d+\.\d+', url) else 0
    
    suspicious_words = ['login', 'verify', 'secure', 'account', 'update', 'bank', 'confirm', 'urgent', 'signin']
    features['has_suspicious_words'] = 1 if any(word in url.lower() for word in suspicious_words) else 0
    
    features['num_hyphens'] = url.count('-')
    features['num_at_symbol'] = url.count('@')

    return pd.Series(features)

print("Extracting features...")
features_df = df['url'].apply(extract_features)

X = features_df
y = df['label']

# =========================================
# 6. TRAIN TEST SPLIT
# =========================================
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# =========================================
# 7. TRAIN MODEL
# =========================================
print("Training RandomForestClassifier...")
model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
model.fit(X_train, y_train)

# =========================================
# 8. EVALUATE MODEL
# =========================================
y_pred = model.predict(X_test)

print("\n--- Model Evaluation ---")
print("Accuracy:", accuracy_score(y_test, y_pred))
print("\nClassification Report:")
print(classification_report(y_test, y_pred))

# =========================================
# 9. SAVE ARTIFACTS
# =========================================
models_dir = os.path.join(script_dir, "models")
os.makedirs(models_dir, exist_ok=True)

model_path = os.path.join(models_dir, "phishing_model.pkl")
cols_path = os.path.join(models_dir, "feature_columns.pkl")

joblib.dump(model, model_path)
joblib.dump(X.columns.tolist(), cols_path)

print(f"\nModel saved to: {model_path}")
print(f"Features saved to: {cols_path}")
print("Training complete!")
