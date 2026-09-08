import { useMemo, useState } from "react";
import {
  BadgeIndianRupee,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  FileText,
  Landmark,
  Loader2,
  ShieldCheck,
  UserRound,
  XCircle,
} from "lucide-react";

const initialForm = {
  age: "",
  applicant_income: "",
  coapplicant_income: "",
  loan_amount: "",
  loan_term: "",
  credit_history: "",
  employment_status: "",
  dependents: "",
  property_area: "",
};

const numericFields = new Set([
  "age",
  "applicant_income",
  "coapplicant_income",
  "loan_amount",
  "loan_term",
  "dependents",
]);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function validate(form) {
  const errors = {};
  const age = Number(form.age);
  const applicantIncome = Number(form.applicant_income);
  const coapplicantIncome = Number(form.coapplicant_income || 0);
  const loanAmount = Number(form.loan_amount);
  const dependents = Number(form.dependents);

  if (form.age === "") errors.age = "Please enter age.";
  else if (age < 18 || age > 80) errors.age = "Age must be between 18 and 80.";

  if (form.applicant_income === "") {
    errors.applicant_income = "Please enter applicant income.";
  } else if (applicantIncome <= 0) {
    errors.applicant_income = "Applicant income must be greater than 0.";
  }

  if (form.coapplicant_income !== "" && coapplicantIncome < 0) {
    errors.coapplicant_income = "Co-applicant income cannot be negative.";
  }

  if (form.loan_amount === "") {
    errors.loan_amount = "Please enter loan amount.";
  } else if (loanAmount <= 0) {
    errors.loan_amount = "Loan amount must be greater than 0.";
  }

  if (form.loan_term === "") errors.loan_term = "Please select loan term.";
  if (form.credit_history === "") errors.credit_history = "Please select credit history.";
  if (form.employment_status === "") errors.employment_status = "Please select employment status.";

  if (form.dependents === "") {
    errors.dependents = "Please enter number of dependents.";
  } else if (dependents < 0 || dependents > 10) {
    errors.dependents = "Dependents must be between 0 and 10.";
  }

  if (form.property_area === "") errors.property_area = "Please select property area.";

  return errors;
}

export default function App() {
  const [form, setForm] = useState(initialForm);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const errors = useMemo(() => validate(form), [form]);
  const formIsValid = Object.keys(errors).length === 0;

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
    setError("");
  };

  const markTouched = (event) => {
    const { name } = event.target;
    setTouched((current) => ({
      ...current,
      [name]: true,
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSubmitted(true);

    if (!formIsValid || loading) return;

    setLoading(true);
    setResult(null);
    setError("");

    const payload = {
      ...form,
      coapplicant_income: form.coapplicant_income === "" ? 0 : form.coapplicant_income,
    };

    numericFields.forEach((field) => {
      payload[field] = Number(payload[field]);
    });

    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.detail || "Prediction failed.");
      }

      setResult(await response.json());
    } catch (err) {
      setError(err.message || "Could not connect to the backend.");
    } finally {
      setLoading(false);
    }
  };

  const approved = result?.prediction === "Approved";
  const approvalPercent = result ? Math.round(result.approval_probability * 100) : 0;

  return (
    <main className="page">
      <header className="bank-header">
        <div className="shell header-shell">
          <div className="bank-brand">
            <div className="brand-mark" aria-hidden="true">
              <Landmark size={28} />
            </div>
            <div>
              <p className="service-label">Banking Services</p>
              <h1>Loan Eligibility Predictor</h1>
              <p className="subtitle">
                Check your estimated loan eligibility using a machine learning model.
              </p>
            </div>
          </div>
          <span className="demo-badge">Educational ML Demo</span>
        </div>
      </header>

      <section className="shell workspace">
        <form className="panel application-panel" onSubmit={submit} noValidate>
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Applicant Details</p>
              <h2>Loan application form</h2>
            </div>
            <FileText size={24} />
          </div>

          <FormSection icon={<UserRound size={18} />} title="Personal Details">
            <Field label="Age" name="age" error={errors.age} touched={touched.age || submitted}>
              <input
                name="age"
                type="number"
                min="18"
                max="80"
                value={form.age}
                onChange={update}
                onBlur={markTouched}
                placeholder="Enter age"
              />
            </Field>

            <Field
              label="Number of Dependents"
              name="dependents"
              error={errors.dependents}
              touched={touched.dependents || submitted}
            >
              <input
                name="dependents"
                type="number"
                min="0"
                max="10"
                value={form.dependents}
                onChange={update}
                onBlur={markTouched}
                placeholder="0 to 10"
              />
            </Field>

            <Field
              label="Property Area"
              name="property_area"
              error={errors.property_area}
              touched={touched.property_area || submitted}
            >
              <select name="property_area" value={form.property_area} onChange={update} onBlur={markTouched}>
                <option value="">Select property area</option>
                <option value="Urban">Urban</option>
                <option value="Semi-Urban">Semi-Urban</option>
                <option value="Rural">Rural</option>
              </select>
            </Field>
          </FormSection>

          <FormSection icon={<BriefcaseBusiness size={18} />} title="Employment & Income">
            <Field
              label="Employment Status"
              name="employment_status"
              error={errors.employment_status}
              touched={touched.employment_status || submitted}
            >
              <select
                name="employment_status"
                value={form.employment_status}
                onChange={update}
                onBlur={markTouched}
              >
                <option value="">Select employment status</option>
                <option value="Salaried">Salaried</option>
                <option value="Self-employed">Self-employed</option>
                <option value="Unemployed">Unemployed</option>
              </select>
            </Field>

            <Field
              label="Applicant Monthly Income"
              name="applicant_income"
              error={errors.applicant_income}
              touched={touched.applicant_income || submitted}
              helper="Enter the main applicant's monthly income."
              prefix="₹"
            >
              <input
                name="applicant_income"
                type="number"
                min="1"
                value={form.applicant_income}
                onChange={update}
                onBlur={markTouched}
                placeholder="60000"
              />
            </Field>

            <Field
              label="Co-applicant Monthly Income"
              name="coapplicant_income"
              error={errors.coapplicant_income}
              touched={touched.coapplicant_income || submitted}
              helper="Optional. Leave blank if there is no co-applicant income."
              prefix="₹"
            >
              <input
                name="coapplicant_income"
                type="number"
                min="0"
                value={form.coapplicant_income}
                onChange={update}
                onBlur={markTouched}
                placeholder="Optional"
              />
            </Field>
          </FormSection>

          <FormSection icon={<Building2 size={18} />} title="Loan Details">
            <Field
              label="Requested Loan Amount"
              name="loan_amount"
              error={errors.loan_amount}
              touched={touched.loan_amount || submitted}
              prefix="₹"
            >
              <input
                name="loan_amount"
                type="number"
                min="1"
                value={form.loan_amount}
                onChange={update}
                onBlur={markTouched}
                placeholder="400000"
              />
            </Field>

            <Field label="Loan Term" name="loan_term" error={errors.loan_term} touched={touched.loan_term || submitted}>
              <select name="loan_term" value={form.loan_term} onChange={update} onBlur={markTouched}>
                <option value="">Select loan term</option>
                {[12, 24, 36, 48, 60, 84, 120, 180, 240].map((term) => (
                  <option key={term} value={term}>
                    {term} months
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Credit History"
              name="credit_history"
              error={errors.credit_history}
              touched={touched.credit_history || submitted}
              helper="Select the applicant's mock credit profile."
            >
              <select name="credit_history" value={form.credit_history} onChange={update} onBlur={markTouched}>
                <option value="">Select credit history</option>
                <option value="Good">Good</option>
                <option value="Average">Average</option>
                <option value="Poor">Poor</option>
              </select>
            </Field>
          </FormSection>

          <button className="primary-button" type="submit" disabled={loading || !formIsValid}>
            {loading ? (
              <>
                <Loader2 className="spin" size={18} />
                Checking eligibility...
              </>
            ) : (
              <>
                <ShieldCheck size={18} />
                Check Eligibility
              </>
            )}
          </button>

          {error && <p className="api-error">{error}</p>}
        </form>

        <aside className="panel result-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Eligibility Result</p>
              <h2>ML prediction</h2>
            </div>
            <BadgeIndianRupee size={24} />
          </div>

          {!result ? (
            <div className="empty-result">
              <div className="empty-icon" aria-hidden="true">
                <ShieldCheck size={34} />
              </div>
              <h3>Check your loan eligibility</h3>
              <p>Complete the applicant form to generate an ML-based prediction.</p>
            </div>
          ) : (
            <div className={`result-box ${approved ? "approved" : "rejected"}`}>
              {approved ? <CheckCircle2 size={56} /> : <XCircle size={56} />}
              <p className="result-kicker">ML estimate</p>
              <h3>{approved ? "Likely Eligible" : "Likely Not Eligible"}</h3>

              <div className="probability">
                <span>Estimated approval probability</span>
                <strong>{approvalPercent}%</strong>
              </div>

              <div className="meter" aria-hidden="true">
                <div className="meter-fill" style={{ width: `${approvalPercent}%` }} />
              </div>

              <p className="model-note">
                This is a machine learning prediction based on synthetic historical-style data.
              </p>
            </div>
          )}
        </aside>
      </section>

      <footer className="shell disclaimer">
        <h2>Educational Project Disclaimer</h2>
        <p>
          This application is created for educational purposes only. It uses synthetic/mock loan data and a
          machine learning model to demonstrate loan approval prediction. It does not use real HDFC Bank customer
          data, does not reproduce HDFC Bank's internal lending policy, and does not provide an actual bank loan
          approval.
        </p>
      </footer>
    </main>
  );
}

function FormSection({ icon, title, children }) {
  return (
    <section className="form-section">
      <div className="section-title">
        {icon}
        <h3>{title}</h3>
      </div>
      <div className="form-grid">{children}</div>
    </section>
  );
}

function Field({ label, name, error, touched, helper, prefix, children }) {
  return (
    <label className={`field ${error && touched ? "field-invalid" : ""}`} htmlFor={name}>
      <span className="field-label">{label}</span>
      <span className="input-wrap">
        {prefix && <span className="input-prefix">{prefix}</span>}
        {children}
      </span>
      {helper && !error && <span className="helper-text">{helper}</span>}
      {error && touched && <span className="field-error">{error}</span>}
    </label>
  );
}
