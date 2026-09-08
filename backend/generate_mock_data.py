import csv
import random
from pathlib import Path

random.seed(42)

BASE_DIR = Path(__file__).resolve().parent
OUTPUT = BASE_DIR / "data" / "loan_data.csv"
OUTPUT.parent.mkdir(exist_ok=True)

rows = []

for i in range(1, 601):
    age = random.randint(21, 60)
    applicant_income = random.randint(18000, 150000)
    coapplicant_income = random.choice([0, random.randint(10000, 70000)])
    loan_amount = random.randint(100000, 2500000)
    loan_term = random.choice([12, 24, 36, 48, 60, 84, 120, 180, 240])
    credit_history = random.choices(
        ["Good", "Average", "Poor"],
        weights=[0.58, 0.27, 0.15]
    )[0]
    employment_status = random.choices(
        ["Salaried", "Self-employed", "Unemployed"],
        weights=[0.62, 0.31, 0.07]
    )[0]
    dependents = random.randint(0, 4)
    property_area = random.choice(["Urban", "Semi-Urban", "Rural"])

    total_income = applicant_income + coapplicant_income
    affordability = (loan_amount / loan_term) / total_income

    score = 0
    score += 3 if credit_history == "Good" else (1 if credit_history == "Average" else -3)
    score += 2 if employment_status == "Salaried" else (1 if employment_status == "Self-employed" else -3)
    score += 2 if total_income >= 70000 else (1 if total_income >= 45000 else -2)
    score += 2 if affordability <= 0.20 else (0 if affordability <= 0.35 else -3)
    score += 1 if dependents <= 2 else -1
    score += 1 if 23 <= age <= 55 else 0
    score += random.choice([-1, 0, 0, 0, 1])

    loan_status = "Approved" if score >= 2 else "Rejected"

    rows.append([
        i, age, applicant_income, coapplicant_income, loan_amount,
        loan_term, credit_history, employment_status, dependents,
        property_area, loan_status
    ])

with OUTPUT.open("w", newline="", encoding="utf-8") as file:
    writer = csv.writer(file)
    writer.writerow([
        "Loan_ID", "Age", "Applicant_Income", "Coapplicant_Income",
        "Loan_Amount", "Loan_Term", "Credit_History",
        "Employment_Status", "Dependents", "Property_Area",
        "Loan_Status"
    ])
    writer.writerows(rows)

print(f"Created {len(rows)} mock rows at {OUTPUT}")
