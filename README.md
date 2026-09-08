# Loan Approval Prediction Using Machine Learning

## Project Summary

This is a simple loan eligibility prediction project.

The user fills a loan application form on the website. The form data is sent to a Python FastAPI backend. The backend uses a saved machine learning model and returns whether the applicant is likely eligible or likely not eligible for a loan.

This project is made for learning and demonstration purpose only. It uses synthetic/mock loan data, not real customer data.

## Main Features

- Blank loan application form when the website opens
- Required field validation before submission
- Professional banking-style user interface
- FastAPI backend for prediction
- Saved Scikit-learn model using `loan_model.pkl`
- Result shown as:
  - Likely Eligible
  - Likely Not Eligible
- Approval probability shown in percentage
- No database
- No login system
- No external API
- No AI chatbot or LLM

## Tech Stack

Frontend:

- React
- Vite
- CSS
- Lucide React icons

Backend:

- Python
- FastAPI
- Pydantic

Machine Learning:

- Pandas
- Scikit-learn
- Joblib

Data:

- Synthetic/mock CSV loan dataset

## How The Project Works

```text
User fills loan form
        |
        v
React frontend validates the form
        |
        v
Data is sent to FastAPI backend
        |
        v
Backend loads saved ML model
        |
        v
Model predicts loan status
        |
        v
Frontend displays the result
```

## Form Fields

The user enters these details:

- Age
- Applicant Monthly Income
- Co-applicant Monthly Income
- Requested Loan Amount
- Loan Term
- Credit History
- Employment Status
- Number of Dependents
- Property Area

All fields are required except co-applicant income. If co-applicant income is empty, the system sends `0` to the backend.

## Validation Rules

- Age must be between 18 and 80
- Applicant income must be greater than 0
- Co-applicant income must be 0 or greater
- Loan amount must be greater than 0
- Dependents must be between 0 and 10
- Loan term, credit history, employment status, and property area must be selected

The form cannot be submitted until valid details are entered.

## Machine Learning Model

The model is trained using synthetic/mock historical-style loan data.

The training script compares:

- Logistic Regression
- Random Forest

The better model is saved as:

```text
backend/model/loan_model.pkl
```

The model is not trained every time the user submits the form. During normal use, the backend only loads the saved model and makes a prediction.

## Project Structure

```text
loan-approval-project/
|
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
|
├── backend/
│   ├── data/
│   │   └── loan_data.csv
│   ├── model/
│   │   ├── loan_model.pkl
│   │   └── metrics.json
│   ├── generate_mock_data.py
│   ├── train_model.py
│   ├── main.py
│   └── requirements.txt
|
├── package.json
├── README.md
└── .gitignore
```

## Setup

Install backend requirements once:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python train_model.py
```

Install frontend packages once:

```bash
cd frontend
npm install
```

## Run The Project

From the root project folder, run:

```bash
npm run dev
```

This starts both servers:

```text
Backend:  http://127.0.0.1:8000
Frontend: http://localhost:5173
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

## Example Inputs

Strong profile example:

```text
Age: 30
Applicant Income: 80000
Co-applicant Income: 20000
Loan Amount: 400000
Loan Term: 60
Credit History: Good
Employment Status: Salaried
Dependents: 1
Property Area: Urban
```

Expected result:

```text
Likely Eligible
```

Weak profile example:

```text
Age: 28
Applicant Income: 22000
Co-applicant Income: 0
Loan Amount: 1800000
Loan Term: 24
Credit History: Poor
Employment Status: Unemployed
Dependents: 4
Property Area: Rural
```

Expected result:

```text
Likely Not Eligible
```

The exact probability may change based on the trained model.

## Important Disclaimer

This is an educational project only.

- It does not use real HDFC Bank customer data.
- It does not copy HDFC Bank's internal loan policy.
- It does not give real bank approval.
- It only demonstrates loan prediction using machine learning.
# loan-approvle
