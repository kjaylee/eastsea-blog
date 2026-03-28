export const DEFAULT_INPUT = Object.freeze({
  totalUnits: 4800,
  startDate: '2024-01-01',
  totalMonths: 48,
  cliffMonths: 12,
  vestingCadence: 'Monthly',
  unitLabel: 'Shares',
});

export const CADENCE_MONTHS = Object.freeze({
  Monthly: 1,
  Quarterly: 3,
  Annually: 12,
});

export const UNIT_LABELS = Object.freeze(['Shares', 'Options', 'RSUs']);

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : NaN;
}

function cleanNumber(value, digits = 10) {
  return Number(value.toFixed(digits));
}

function normalizeInput(input = {}) {
  return {
    totalUnits: toNumber(input.totalUnits),
    startDate: String(input.startDate ?? '').trim(),
    totalMonths: toNumber(input.totalMonths),
    cliffMonths: toNumber(input.cliffMonths),
    vestingCadence: String(input.vestingCadence ?? '').trim(),
    unitLabel: String(input.unitLabel ?? '').trim(),
  };
}

function parseIsoDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    Number.isNaN(date.getTime()) ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return { year, month, day };
}

function daysInMonth(year, month) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function addMonthsPreserveDay(startDate, monthsToAdd) {
  const totalMonthsIndex = (startDate.year * 12) + (startDate.month - 1) + monthsToAdd;
  const year = Math.floor(totalMonthsIndex / 12);
  const month = (totalMonthsIndex % 12) + 1;
  const day = Math.min(startDate.day, daysInMonth(year, month));
  return { year, month, day };
}

function formatIsoDate(date) {
  return [
    String(date.year).padStart(4, '0'),
    String(date.month).padStart(2, '0'),
    String(date.day).padStart(2, '0'),
  ].join('-');
}

function buildEventMonths(totalMonths, cliffMonths, cadenceMonths) {
  const firstEventMonth = cliffMonths === 0 ? cadenceMonths : cliffMonths;

  if (firstEventMonth >= totalMonths) {
    return [totalMonths];
  }

  const eventMonths = [];
  for (let month = firstEventMonth; month < totalMonths; month += cadenceMonths) {
    eventMonths.push(month);
  }

  if (eventMonths[eventMonths.length - 1] !== totalMonths) {
    eventMonths.push(totalMonths);
  }

  return eventMonths;
}

export function validateInputs(input = {}) {
  const values = normalizeInput(input);

  if (!Number.isFinite(values.totalUnits) || values.totalUnits <= 0) {
    return { valid: false, values, message: 'totalUnits must be greater than 0.' };
  }

  if (!parseIsoDate(values.startDate)) {
    return { valid: false, values, message: 'startDate must be a valid YYYY-MM-DD date.' };
  }

  if (!Number.isInteger(values.totalMonths) || values.totalMonths < 1) {
    return { valid: false, values, message: 'totalMonths must be an integer greater than or equal to 1.' };
  }

  if (!Number.isInteger(values.cliffMonths) || values.cliffMonths < 0) {
    return { valid: false, values, message: 'cliffMonths must be an integer greater than or equal to 0.' };
  }

  if (values.cliffMonths > values.totalMonths) {
    return { valid: false, values, message: 'cliffMonths cannot be greater than totalMonths.' };
  }

  if (!Object.hasOwn(CADENCE_MONTHS, values.vestingCadence)) {
    return { valid: false, values, message: 'vestingCadence must be Monthly, Quarterly, or Annually.' };
  }

  if (!UNIT_LABELS.includes(values.unitLabel)) {
    return { valid: false, values, message: 'unitLabel must be Shares, Options, or RSUs.' };
  }

  return { valid: true, values, message: '' };
}

export function calculateVestingSchedule(input = {}) {
  const validation = validateInputs(input);
  if (!validation.valid) {
    throw new Error(validation.message);
  }

  const values = validation.values;
  const cadenceMonths = CADENCE_MONTHS[values.vestingCadence];
  const startDate = parseIsoDate(values.startDate);
  const eventMonths = buildEventMonths(values.totalMonths, values.cliffMonths, cadenceMonths);

  let previousCumulative = 0;
  const schedule = eventMonths.map((elapsedMonths, index) => {
    const isLast = index === eventMonths.length - 1;
    const cumulativeExact = isLast
      ? values.totalUnits
      : values.totalUnits * (elapsedMonths / values.totalMonths);
    const vestedExact = isLast
      ? values.totalUnits - previousCumulative
      : cumulativeExact - previousCumulative;

    const cumulativeVested = cleanNumber(cumulativeExact);
    const vestedThisEvent = cleanNumber(vestedExact);
    const remainingUnvested = cleanNumber(values.totalUnits - cumulativeVested);
    const eventDate = formatIsoDate(addMonthsPreserveDay(startDate, elapsedMonths));

    previousCumulative = cumulativeVested;

    return {
      index: index + 1,
      elapsedMonths,
      date: eventDate,
      vestedThisEvent,
      cumulativeVested,
      remainingUnvested,
    };
  });

  const firstEvent = schedule[0];
  const lastEvent = schedule[schedule.length - 1];
  const cliffEvent = schedule.find((event) => event.elapsedMonths === values.cliffMonths) ?? firstEvent;

  return {
    ...values,
    cadenceMonths,
    firstVestingDate: firstEvent.date,
    cliffVestingUnits: cliffEvent.vestedThisEvent,
    lastVestingDate: lastEvent.date,
    totalEvents: schedule.length,
    totalVestedUnits: cleanNumber(schedule[schedule.length - 1].cumulativeVested),
    schedule,
  };
}

function formatNumber(value, locale = 'en-US', maximumFractionDigits = 4) {
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits,
  }).format(value);
}

export function buildSummary(result, locale = 'en-US') {
  return [
    'Equity Vesting Schedule',
    `Total Grant: ${formatNumber(result.totalUnits, locale)} ${result.unitLabel}`,
    `Start Date: ${result.startDate}`,
    `Vesting Term: ${formatNumber(result.totalMonths, locale, 0)} month(s)`,
    `Cliff: ${formatNumber(result.cliffMonths, locale, 0)} month(s)`,
    `Cadence: ${result.vestingCadence}`,
    `First Vesting Date: ${result.firstVestingDate}`,
    `Cliff Vesting: ${formatNumber(result.cliffVestingUnits, locale)} ${result.unitLabel}`,
    `Last Vesting Date: ${result.lastVestingDate}`,
    `Total Vesting Events: ${formatNumber(result.totalEvents, locale, 0)}`,
  ].join('\n');
}

function escapeCsv(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function buildCsv(result) {
  const rows = [
    ['Date', 'Months Since Start', `Vested (${result.unitLabel})`, `Cumulative (${result.unitLabel})`, `Remaining (${result.unitLabel})`],
    ...result.schedule.map((event) => [
      event.date,
      event.elapsedMonths,
      event.vestedThisEvent,
      event.cumulativeVested,
      event.remainingUnvested,
    ]),
  ];

  return rows
    .map((row) => row.map((cell) => escapeCsv(cell)).join(','))
    .join('\n');
}
