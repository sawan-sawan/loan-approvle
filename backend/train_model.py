from pathlib import Path
import json
import joblib
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
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
    "Age",
    "Applicant_Income",
    "Coapplicant_Income",
    "Loan_Amount",
    "Loan_Term",
    "Dependents",
]

categorical_features = [
    "Credit_History",
    "Employment_Status",
    "Property_Area",
]

preprocessor = ColumnTransformer(
    transformers=[
        ("num", StandardScaler(), numeric_features),
        ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_features),
    ]
)

models = {
    "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
    "Random Forest": RandomForestClassifier(
        n_estimators=250,
        max_depth=8,
        random_state=42,
        class_weight="balanced",
    ),
}

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y,
)

results = {}
best_name = None
best_pipeline = None
best_f1 = -1.0

for name, estimator in models.items():
    pipeline = Pipeline([
        ("preprocess", preprocessor),
        ("model", estimator),
    ])

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
    results[name] = metrics

    if metrics["f1"] > best_f1:
        best_f1 = metrics["f1"]
        best_name = name
        best_pipeline = pipeline

MODEL_DIR.mkdir(exist_ok=True)
joblib.dump(best_pipeline, MODEL_PATH)

output = {
    "best_model": best_name,
    "models": results,
    "dataset_rows": len(df),
}
METRICS_PATH.write_text(json.dumps(output, indent=2), encoding="utf-8")

print(json.dumps(output, indent=2))
print(f"Saved model to: {MODEL_PATH}")
