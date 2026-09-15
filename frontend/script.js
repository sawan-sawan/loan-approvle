/* Loan Approval Prediction UI behaviour + FastAPI integration */
(function () {
  'use strict';

  var API_URL = 'http://127.0.0.1:8000/predict';
  var FIELDS = ['income', 'employment', 'amount', 'term', 'area'];
  var ANNUAL_RATE = 0.0875;

  var state = { credit: '', running: false };

  var el = {
    form: document.getElementById('loanForm'),
    income: document.getElementById('income'),
    employment: document.getElementById('employment'),
    amount: document.getElementById('amount'),
    term: document.getElementById('term'),
    area: document.getElementById('area'),
    incomeHint: document.getElementById('incomeHint'),
    amountHint: document.getElementById('amountHint'),
    progressFill: document.getElementById('progressFill'),
    progressPct: document.getElementById('progressPct'),
    submitBtn: document.getElementById('submitBtn'),
    resetBtn: document.getElementById('resetBtn'),
    resultCard: document.getElementById('resultCard'),
    resultEmpty: document.getElementById('resultEmpty'),
    resultBody: document.getElementById('resultBody'),
    gaugeArc: document.getElementById('gaugeArc'),
    confidenceValue: document.getElementById('confidenceValue'),
    verdictPill: document.getElementById('verdictPill'),
    verdictNote: document.getElementById('verdictNote'),
    emiLine: document.getElementById('emiLine'),
    choices: Array.prototype.slice.call(document.querySelectorAll('.choice')),
    sum: {
      income: document.getElementById('sumIncome'),
      amount: document.getElementById('sumAmount'),
      term: document.getElementById('sumTerm'),
      employment: document.getElementById('sumEmployment'),
      area: document.getElementById('sumArea'),
      credit: document.getElementById('sumCredit')
    }
  };

  var countTimer = null;
  var LABELS = {
    salaried: 'Salaried',
    self: 'Self-employed',
    contract: 'Contract',
    unemployed: 'Unemployed',
    urban: 'Urban',
    semiurban: 'Semi-urban',
    rural: 'Rural'
  };

  function money(value) {
    var n = Number(value);
    if (!value || isNaN(n)) return '\u2014';
    return '\u20B9' + n.toLocaleString('en-IN');
  }

  function emi(principal, months) {
    if (!principal || !months) return 0;
    var r = ANNUAL_RATE / 12;
    return Math.round((principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1));
  }

  function readValues() {
    return {
      income: Number(el.income.value) || 0,
      amount: Number(el.amount.value) || 0,
      term: Number(el.term.value) || 0,
      employment: el.employment.value,
      area: el.area.value,
      credit: state.credit
    };
  }

  function apiEmployment(value) {
    if (value === 'salaried') return 'Salaried';
    if (value === 'unemployed') return 'Unemployed';
    return 'Self-employed';
  }

  function payloadFromValues(v) {
    return {
      applicant_income: v.income,
      loan_amount: v.amount,
      loan_term: v.term,
      credit_history: v.credit,
      employment_status: apiEmployment(v.employment)
    };
  }

  function syncUI() {
    var v = readValues();
    var filled = FIELDS.filter(function (k) {
      return String(el[k].value) !== '';
    }).length + (state.credit ? 1 : 0);
    var pct = Math.round((filled / 6) * 100);

    el.progressFill.style.width = pct + '%';
    el.progressPct.textContent = pct + '%';

    el.incomeHint.classList.remove('is-error');
    el.amountHint.classList.remove('is-error');

    el.incomeHint.textContent = v.income
      ? 'About ' + money(v.income * 12) + ' a year'
      : 'Gross income before deductions';

    var monthly = emi(v.amount, v.term);
    el.amountHint.textContent = monthly
      ? 'Indicative EMI ' + money(monthly) + ' a month at 8.75% p.a.'
      : 'Total principal requested';
    el.emiLine.textContent = monthly ? 'EMI ' + money(monthly) + '/mo' : '';

    el.sum.income.textContent = money(v.income);
    el.sum.amount.textContent = money(v.amount);
    el.sum.term.textContent = v.term ? (v.term / 12) + ' years' : '\u2014';
    el.sum.employment.textContent = LABELS[v.employment] || '\u2014';
    el.sum.area.textContent = LABELS[v.area] || '\u2014';
    el.sum.credit.textContent = v.credit || '\u2014';
  }

  function clearResult() {
    clearInterval(countTimer);
    el.resultCard.classList.remove('is-approved', 'is-rejected');
    el.resultBody.hidden = true;
    el.resultEmpty.hidden = false;
    el.gaugeArc.style.strokeDashoffset = 314;
    el.confidenceValue.textContent = '0%';
  }

  function showResult(result) {
    el.resultEmpty.hidden = true;
    el.resultBody.hidden = false;
    el.resultCard.classList.remove('is-approved', 'is-rejected');
    el.resultCard.classList.add(result.approved ? 'is-approved' : 'is-rejected');

    el.verdictPill.textContent = result.approved ? 'Likely approved' : 'Likely rejected';
    el.verdictNote.textContent = result.note;

    el.gaugeArc.style.transition = 'none';
    el.gaugeArc.style.strokeDashoffset = 314;
    void el.gaugeArc.getBoundingClientRect();
    el.gaugeArc.style.transition = '';
    el.gaugeArc.style.strokeDashoffset = 314 - (314 * result.confidence) / 100;

    var shown = 0;
    var step = Math.max(1, Math.round(result.confidence / 26));
    clearInterval(countTimer);
    countTimer = setInterval(function () {
      shown += step;
      if (shown >= result.confidence) {
        shown = result.confidence;
        clearInterval(countTimer);
      }
      el.confidenceValue.textContent = shown + '%';
    }, 26);
  }

  function showError(message) {
    showResult({
      approved: false,
      confidence: 0,
      note: message || 'Please make sure the backend server is running and try again.'
    });
    el.verdictPill.textContent = 'Prediction unavailable';
  }

  function validate(v) {
    var ok = true;
    el.income.closest('.input-group').classList.toggle('is-error', !v.income);
    el.amount.closest('.input-group').classList.toggle('is-error', !v.amount);
    el.employment.classList.toggle('is-error', !v.employment);
    el.term.classList.toggle('is-error', !v.term);
    el.area.classList.toggle('is-error', !v.area);
    document.querySelector('.choices').classList.toggle('is-error', !v.credit);

    if (!v.income) {
      el.incomeHint.textContent = 'Please enter applicant monthly income.';
      el.incomeHint.classList.add('is-error');
      ok = false;
    }
    if (!v.amount) {
      el.amountHint.textContent = 'Please enter requested loan amount.';
      el.amountHint.classList.add('is-error');
      ok = false;
    }
    if (!v.employment || !v.term || !v.area || !v.credit) ok = false;
    return ok;
  }

  function resultFromApi(data) {
    var approved = data.prediction === 'Approved';
    var probability = approved ? data.approval_probability : data.rejection_probability;
    var confidence = Math.round((Number(probability) || 0) * 100);
    var note = approved
      ? 'The model found this profile likely eligible based on the submitted income, loan, term, employment, and credit history.'
      : 'The model found this profile likely not eligible based on the submitted details.';

    return {
      approved: approved,
      confidence: confidence,
      note: data.note || note
    };
  }

  el.form.addEventListener('input', function () {
    clearResult();
    syncUI();
  });

  el.form.addEventListener('change', function () {
    clearResult();
    syncUI();
  });

  el.choices.forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.credit = btn.dataset.credit;
      document.querySelector('.choices').classList.remove('is-error');
      el.choices.forEach(function (b) { b.classList.toggle('is-active', b === btn); });
      clearResult();
      syncUI();
    });
  });

  el.form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (state.running) return;

    var values = readValues();
    if (!validate(values)) return;

    state.running = true;
    el.submitBtn.classList.add('is-running');
    el.submitBtn.textContent = 'Running model...';
    clearResult();

    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadFromValues(values))
    })
      .then(function (response) {
        if (!response.ok) throw new Error('Prediction request failed.');
        return response.json();
      })
      .then(function (data) {
        showResult(resultFromApi(data));
      })
      .catch(function () {
        showError('Please make sure the backend server is running and try again.');
      })
      .finally(function () {
        state.running = false;
        el.submitBtn.classList.remove('is-running');
        el.submitBtn.textContent = 'Run prediction';
      });
  });

  el.resetBtn.addEventListener('click', function () {
    state.credit = '';
    state.running = false;
    el.choices.forEach(function (b) { b.classList.remove('is-active'); });
    el.submitBtn.classList.remove('is-running');
    el.submitBtn.textContent = 'Run prediction';
    setTimeout(function () { clearResult(); syncUI(); }, 0);
  });

  syncUI();
})();
