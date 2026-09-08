from pathlib import Path
import os

import joblib
import pandas as pd

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "model" / "loan_model.pkl"
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

app = FastAPI(
    title="Loan Approval Prediction API",
    version="1.0.0",
    description="Simple school project using synthetic loan data.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = joblib.load(MODEL_PATH) if MODEL_PATH.exists() else None


class LoanApplication(BaseModel):
    age: int = Field(ge=18, le=80)
    applicant_income: float = Field(gt=0)
    coapplicant_income: float = Field(ge=0)
    loan_amount: float = Field(gt=0)
    loan_term: int = Field(gt=0)
    credit_history: str
    employment_status: str
    dependents: int = Field(ge=0, le=10)
    property_area: str


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
        "Age": application.age,
        "Applicant_Income": application.applicant_income,
        "Coapplicant_Income": application.coapplicant_income,
        "Loan_Amount": application.loan_amount,
        "Loan_Term": application.loan_term,
        "Credit_History": application.credit_history,
        "Employment_Status": application.employment_status,
        "Dependents": application.dependents,
        "Property_Area": application.property_area,
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
        "note": "Educational prediction based on synthetic mock data, not a real HDFC decision.",
    }
