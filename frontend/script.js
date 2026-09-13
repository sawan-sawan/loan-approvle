const API_URL = "http://127.0.0.1:8000/predict";

const form = document.getElementById("loan-form");
const submitBtn = document.getElementById("submit-btn");

const resultInitial = document.getElementById("result-initial");
const resultPending = document.getElementById("result-pending");
const resultFinal = document.getElementById("result-final");
const resultError = document.getElementById("result-error");

const resultIcon = document.getElementById("result-icon");
const resultTitle = document.getElementById("result-title");
const probabilityValue = document.getElementById("probability-value");
const progressFill = document.getElementById("progress-fill");

const summaryIncome = document.getElementById("summary-income");
const summaryAmount = document.getElementById("summary-amount");
const summaryCredit = document.getElementById("summary-credit");
const summaryEmployment = document.getElementById("summary-employment");

const FIELD_NAMES = [
  "applicant_income",
  "loan_amount",
  "loan_term",
  "credit_history",
  "employment_status",
];

function getInputWrapper(fieldName) {
  const inputEl = document.getElementById(fieldName);
  const prefixWrapper = inputEl.closest(".input-prefix");
  return prefixWrapper || inputEl;
}

function setError(fieldName, message) {
  const errorEl = document.getElementById(`err-${fieldName}`);
  const inputEl = document.getElementById(fieldName);
  const wrapper = getInputWrapper(fieldName);

  errorEl.textContent = message;
  inputEl.classList.toggle("invalid", Boolean(message));
  wrapper.classList.toggle("invalid", Boolean(message));
}

function clearErrors() {
  FIELD_NAMES.forEach((name) => setError(name, ""));
}

function formatCurrency(value) {
  const number = Number(value);
  return `₹${number.toLocaleString("en-IN")}`;
}

function validateForm(data) {
  let isValid = true;

  if (!data.applicant_income || Number(data.applicant_income) <= 0) {
    setError(
      "applicant_income",
      !data.applicant_income
        ? "Please enter applicant income."
        : "Loan income must be greater than 0."
    );
    isValid = false;
  }

  if (!data.loan_amount || Number(data.loan_amount) <= 0) {
    setError(
      "loan_amount",
      !data.loan_amount
        ? "Please enter loan amount."
        : "Loan amount must be greater than 0."
    );
    isValid = false;
  }

  if (!data.loan_term) {
    setError("loan_term", "Please select a loan term.");
    isValid = false;
  }

  if (!data.credit_history) {
    setError("credit_history", "Please select credit history.");
    isValid = false;
  }

  if (!data.employment_status) {
    setError("employment_status", "Please select employment status.");
    isValid = false;
  }

  return isValid;
}

function showState(state) {
  [resultInitial, resultPending, resultFinal, resultError].forEach((el) => {
    el.classList.add("hidden");
  });
  state.classList.remove("hidden");
}

function clearFieldErrorOnInput(fieldName) {
  const inputEl = document.getElementById(fieldName);
  const eventName = inputEl.tagName === "SELECT" ? "change" : "input";

  inputEl.addEventListener(eventName, () => {
    const value = inputEl.value;
    const hasValue =
      inputEl.type === "number" ? Number(value) > 0 : Boolean(value);

    if (hasValue) {
      setError(fieldName, "");
    }
  });
}

FIELD_NAMES.forEach(clearFieldErrorOnInput);

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearErrors();

  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  if (!validateForm(data)) {
    return;
  }

  const payload = {
    applicant_income: Number(data.applicant_income),
    loan_amount: Number(data.loan_amount),
    loan_term: Number(data.loan_term),
    credit_history: data.credit_history,
    employment_status: data.employment_status,
  };

  submitBtn.disabled = true;
  submitBtn.textContent = "Checking eligibility...";
  showState(resultPending);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Prediction request failed.");
    }

    const result = await response.json();
    const approved = result.prediction === "Approved";
    const probability = result.approval_probability;
    const probabilityPercent = typeof probability === "number"
      ? Math.round(probability * 100)
      : 0;

    resultFinal.classList.remove("approved", "rejected");
    resultFinal.classList.add(approved ? "approved" : "rejected");

    resultIcon.classList.remove("neutral", "approve", "reject");
    resultIcon.classList.add(approved ? "approve" : "reject");
    resultIcon.textContent = approved ? "✓" : "✕";

    resultTitle.textContent = approved ? "Likely Eligible" : "Likely Not Eligible";
    probabilityValue.textContent = `${probabilityPercent}%`;
    progressFill.style.width = `${probabilityPercent}%`;

    summaryIncome.textContent = formatCurrency(payload.applicant_income);
    summaryAmount.textContent = formatCurrency(payload.loan_amount);
    summaryCredit.textContent = payload.credit_history;
    summaryEmployment.textContent = payload.employment_status;

    showState(resultFinal);
  } catch (error) {
    showState(resultError);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Check Loan Eligibility";
  }
});
