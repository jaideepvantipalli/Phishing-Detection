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
# The dataset seems to be mounted at /kaggle/input/malicious-urls-dataset
# Directly loading the CSV using pandas with the full path.
dataset_path = "data/malicious_phish.csv" # Adjusted for local structure
try:
    df = pd.read_csv(dataset_path)
except FileNotFoundError:
    print(f"Dataset not found at {dataset_path}. Using kagglehub to load...")
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

# Rename columns if needed (adjust if different)
df.columns = ['url', 'label']

# Convert labels to binary
df['label'] = df['label'].map({
    'benign': 0,
    'malicious': 1,
    'phishing': 1,
    'defacement': 1,
    'malware': 1
})

df = df.dropna()

# =========================================
# 5. FEATURE ENGINEERING (VERY IMPORTANT)
# =========================================

def extract_features(url):
    features = {}

    features['url_length'] = len(url)
    features['num_digits'] = sum(c.isdigit() for c in url)
    features['num_special_chars'] = len(re.findall(r'[^a-zA-Z0-9]', url))
    features['has_https'] = 1 if 'https' in url else 0
    features['num_subdomains'] = url.count('.')
    features['has_ip'] = 1 if re.search(r'\d+\.\d+\.\d+\.\d+', url) else 0
    features['has_suspicious_words'] = 1 if any(word in url.lower() for word in [
        'login', 'verify', 'secure', 'account', 'update', 'bank'
    ]) else 0

    return pd.Series(features)

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
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# =========================================
# 8. EVALUATE MODEL
# =========================================
y_pred = model.predict(X_test)

print("Accuracy:", accuracy_score(y_test, y_pred))
print(classification_report(y_test, y_pred))

# =========================================
# 9. SAVE MODEL
# =========================================
joblib.dump(model, "models/phishing_model.pkl")

# Save feature columns (IMPORTANT for backend)
joblib.dump(X.columns.tolist(), "models/feature_columns.pkl")

print("Model and features saved successfully!")
