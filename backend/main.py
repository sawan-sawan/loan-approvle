from pathlib import Path

import joblib
import pandas as pd

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "model" / "loan_model.pkl"
ALLOWED_ORIGINS = [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "https://loan-approvle.vercel.app",
]

app = FastAPI(
    title="Loan Approval Prediction API",
    version="1.0.0",
    description="Simple school project using synthetic loan data.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = joblib.load(MODEL_PATH) if MODEL_PATH.exists() else None


class LoanApplication(BaseModel):
    applicant_income: float = Field(gt=0)
    loan_amount: float = Field(gt=0)
    loan_term: int = Field(gt=0)
    credit_history: str
    employment_status: str


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": model is not None,
    }


@app.post("/predict")
def predict_loan(application: LoanApplication):
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="Model not found. Run: python train_model.py",
        )

    row = pd.DataFrame([{
        "Applicant_Income": application.applicant_income,
        "Loan_Amount": application.loan_amount,
        "Loan_Term": application.loan_term,
        "Credit_History": application.credit_history,
        "Employment_Status": application.employment_status,
    }])

    prediction = model.predict(row)[0]
    probabilities = model.predict_proba(row)[0]
    classes = list(model.classes_)
    probability_map = {
        label: round(float(probabilities[index]), 4)
        for index, label in enumerate(classes)
    }

    return {
        "prediction": prediction,
        "approval_probability": probability_map.get("Approved", 0.0),
        "rejection_probability": probability_map.get("Rejected", 0.0),
        "note": "Educational prediction based on synthetic mock data, not a real bank decision.",
    }
