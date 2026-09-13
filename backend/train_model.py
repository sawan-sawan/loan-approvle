from pathlib import Path
import json
import warnings

import joblib
import pandas as pd

warnings.filterwarnings("ignore", category=RuntimeWarning)

from sklearn.compose import ColumnTransformer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "data" / "loan_data.csv"
MODEL_DIR = BASE_DIR / "model"
MODEL_PATH = MODEL_DIR / "loan_model.pkl"
METRICS_PATH = MODEL_DIR / "metrics.json"

df = pd.read_csv(DATA_PATH)

X = df.drop(columns=["Loan_ID", "Loan_Status"])
y = df["Loan_Status"]

numeric_features = [
    "Applicant_Income",
    "Loan_Amount",
    "Loan_Term",
]

categorical_features = [
    "Credit_History",
    "Employment_Status",
]

preprocessor = ColumnTransformer(
    transformers=[
        ("num", StandardScaler(), numeric_features),
        ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_features),
    ]
)

pipeline = Pipeline([
    ("preprocess", preprocessor),
    ("model", LogisticRegression(max_iter=1000, random_state=42)),
])

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y,
)

pipeline.fit(X_train, y_train)
predictions = pipeline.predict(X_test)

metrics = {
    "accuracy": round(float(accuracy_score(y_test, predictions)), 4),
    "precision": round(float(precision_score(
        y_test, predictions, pos_label="Approved", zero_division=0
    )), 4),
    "recall": round(float(recall_score(
        y_test, predictions, pos_label="Approved", zero_division=0
    )), 4),
    "f1": round(float(f1_score(
        y_test, predictions, pos_label="Approved", zero_division=0
    )), 4),
}

MODEL_DIR.mkdir(exist_ok=True)
joblib.dump(pipeline, MODEL_PATH)

output = {
    "model": "Logistic Regression",
    "metrics": metrics,
    "dataset_rows": len(df),
}
METRICS_PATH.write_text(json.dumps(output, indent=2), encoding="utf-8")

print(json.dumps(output, indent=2))
print(f"Saved model to: {MODEL_PATH}")
