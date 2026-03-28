import {
  DEFAULT_INPUT,
  validateInputs,
  calculateVestingSchedule,
  buildSummary,
  buildCsv,
} from './logic.mjs';

const $ = (id) => document.getElementById(id);

const refs = {
  form: {
    totalUnits: $('totalUnits'),
    startDate: $('startDate'),
    totalMonths: $('totalMonths'),
    cliffMonths: $('cliffMonths'),
    vestingCadence: $('vestingCadence'),
    unitLabel: $('unitLabel'),
  },
  error: $('error'),
  summary: $('summary'),
  firstVestingDate: $('firstVestingDate'),
  cliffVestingUnits: $('cliffVestingUnits'),
  lastVestingDate: $('lastVestingDate'),
  totalEvents: $('totalEvents'),
  scheduleMeta: $('scheduleMeta'),
  tableBody: $('scheduleBody'),
  copySummaryBtn: $('copySummaryBtn'),
  copyCsvBtn: $('copyCsvBtn'),
  downloadCsvBtn: $('downloadCsvBtn'),
  resetBtn: $('resetBtn'),
};

function formatUnits(value) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 4,
  }).format(value);
}

function getInput() {
  return Object.fromEntries(
    Object.entries(refs.form).map(([key, element]) => [key, element.value])
  );
}

function setDefaults() {
  for (const [key, value] of Object.entries(DEFAULT_INPUT)) {
    refs.form[key].value = value;
  }
}

function setError(message) {
  refs.error.textContent = message;
  refs.error.classList.toggle('show', Boolean(message));
}

function clearOutputs() {
  refs.summary.value = '';
  refs.firstVestingDate.textContent = '-';
  refs.cliffVestingUnits.textContent = '-';
  refs.lastVestingDate.textContent = '-';
  refs.totalEvents.textContent = '-';
  refs.scheduleMeta.textContent = 'Waiting for valid inputs.';
  refs.tableBody.innerHTML = '<tr><td colspan="4">Fix the input error to generate a schedule.</td></tr>';
}

function renderTable(result) {
  refs.tableBody.innerHTML = result.schedule
    .map((event) => `
      <tr>
        <td>${event.date}</td>
        <td>${formatUnits(event.vestedThisEvent)}</td>
        <td>${formatUnits(event.cumulativeVested)}</td>
        <td>${formatUnits(event.remainingUnvested)}</td>
      </tr>
    `)
    .join('');
}

function render() {
  const input = getInput();
  const validation = validateInputs(input);

  if (!validation.valid) {
    setError(validation.message);
    clearOutputs();
    return null;
  }

  setError('');
  const result = calculateVestingSchedule(input);

  refs.summary.value = buildSummary(result);
  refs.firstVestingDate.textContent = result.firstVestingDate;
  refs.cliffVestingUnits.textContent = `${formatUnits(result.cliffVestingUnits)} ${result.unitLabel}`;
  refs.lastVestingDate.textContent = result.lastVestingDate;
  refs.totalEvents.textContent = `${result.totalEvents}`;
  refs.scheduleMeta.textContent = `Total vested: ${formatUnits(result.totalVestedUnits)} ${result.unitLabel} across ${result.totalEvents} event(s).`;
  renderTable(result);

  return result;
}

async function copyText(text, button, successText) {
  try {
    await navigator.clipboard.writeText(text);
    button.textContent = successText;
  } catch {
    button.textContent = 'Copy failed';
  }
  setTimeout(() => {
    button.textContent = button.dataset.defaultLabel;
  }, 1400);
}

refs.copySummaryBtn.addEventListener('click', () => {
  const result = render();
  if (!result) return;
  copyText(buildSummary(result), refs.copySummaryBtn, 'Summary copied');
});

refs.copyCsvBtn.addEventListener('click', () => {
  const result = render();
  if (!result) return;
  copyText(buildCsv(result), refs.copyCsvBtn, 'CSV copied');
});

refs.downloadCsvBtn.addEventListener('click', () => {
  const result = render();
  if (!result) return;

  const blob = new Blob([buildCsv(result)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'equity-vesting-schedule.csv';
  link.click();
  URL.revokeObjectURL(url);
});

refs.resetBtn.addEventListener('click', () => {
  setDefaults();
  render();
});

Object.values(refs.form).forEach((element) => {
  element.addEventListener('input', render);
  element.addEventListener('change', render);
});

setDefaults();
render();
