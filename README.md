# Loan Approval Prediction Using Machine Learning

## Project Overview

This project predicts whether a loan applicant is likely to be approved or rejected.

The project uses mock/synthetic loan data for learning purposes.

## Tech Stack

Frontend:
- HTML
- CSS
- JavaScript

Backend:
- Python
- FastAPI

Machine Learning:
- Pandas
- Scikit-learn
- Joblib
- Logistic Regression

Data:
- Mock CSV dataset

## Simple Architecture

```
Mock Loan Data
    ↓
Train ML Model
    ↓
Save Model
    ↓
HTML Form
    ↓
JavaScript
    ↓
FastAPI
    ↓
Prediction
    ↓
Likely Approved / Likely Rejected
```

## How to Run Backend

```
cd backend

python3 -m venv .venv

source .venv/bin/activate

pip install -r requirements.txt

python train_model.py

uvicorn main:app --reload
```

The backend runs at `http://127.0.0.1:8000`.

## How to Run Frontend

Because it is plain HTML, CSS and JavaScript, keep it simple.

If opening `index.html` directly causes browser/CORS issues, use a basic local server.

For example:

```
cd frontend

python3 -m http.server 5500
```

Then open:

```
http://localhost:5500
```

## Loan Application Fields

- Applicant Income
- Loan Amount
- Loan Term
- Credit History
- Employment Status

## Disclaimer

- This project uses mock/synthetic data only.
- It is an educational project made for a school presentation.
- It does not use real bank data.
- It does not represent a real bank approval decision.
