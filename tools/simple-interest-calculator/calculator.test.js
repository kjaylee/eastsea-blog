const { calcInterest, solveForPrincipal, solveForRate, solveForTime, yearlySchedule } = require('./calculator');

let pass = 0, fail = 0;
function eq(name, actual, expected, tol) {
  const t = tol || 0.01;
  if (actual === null && expected === null) { pass++; return; }
  if (actual === null || expected === null || !isFinite(actual) || !isFinite(expected)) {
    fail++; console.error(`FAIL: ${name} — got ${actual}, expected ${expected}`); return;
  }
  if (Math.abs(actual - expected) < t) { pass++; }
  else { fail++; console.error(`FAIL: ${name} — got ${actual}, expected ${expected}`); }
}
function hasErr(name, result) {
  if (result.error) { pass++; }
  else { fail++; console.error(`FAIL: ${name} — expected error, got ${JSON.stringify(result)}`); }
}

// === calcInterest: I = P * R * T / 100 ===
const r1 = calcInterest(1000, 5, 3);
eq('1000@5%×3yr interest', r1.interest, 150);
eq('1000@5%×3yr total', r1.total, 1150);

const r2 = calcInterest(5000, 8.5, 2);
eq('5000@8.5%×2yr interest', r2.interest, 850);
eq('5000@8.5%×2yr total', r2.total, 5850);

const r3 = calcInterest(10000, 0, 5);
eq('0% rate → 0 interest', r3.interest, 0);
eq('0% rate → same total', r3.total, 10000);

const r4 = calcInterest(0, 10, 5);
eq('0 principal → 0 interest', r4.interest, 0);

const r5 = calcInterest(1000, 5, 0);
eq('0 years → 0 interest', r5.interest, 0);

hasErr('negative principal', calcInterest(-100, 5, 3));
hasErr('negative rate', calcInterest(1000, -5, 3));
hasErr('NaN input', calcInterest(NaN, 5, 3));

// Large values
const r6 = calcInterest(1000000, 12, 10);
eq('1M@12%×10yr interest', r6.interest, 1200000);
eq('1M@12%×10yr total', r6.total, 2200000);

// Fractional years
const r7 = calcInterest(1000, 10, 0.5);
eq('1000@10%×0.5yr interest', r7.interest, 50);

// === solveForPrincipal ===
const sp1 = solveForPrincipal(150, 5, 3);
eq('solve P from I=150,R=5,T=3', sp1.principal, 1000);

const sp2 = solveForPrincipal(850, 8.5, 2);
eq('solve P from I=850,R=8.5,T=2', sp2.principal, 5000);

hasErr('solve P: rate=0', solveForPrincipal(150, 0, 3));
hasErr('solve P: time=0', solveForPrincipal(150, 5, 0));

// === solveForRate ===
const sr1 = solveForRate(1000, 150, 3);
eq('solve R from P=1000,I=150,T=3', sr1.rate, 5);

const sr2 = solveForRate(5000, 850, 2);
eq('solve R from P=5000,I=850,T=2', sr2.rate, 8.5);

hasErr('solve R: P=0', solveForRate(0, 150, 3));

// === solveForTime ===
const st1 = solveForTime(1000, 5, 150);
eq('solve T from P=1000,R=5,I=150', st1.years, 3);

const st2 = solveForTime(5000, 8.5, 850);
eq('solve T from P=5000,R=8.5,I=850', st2.years, 2);

hasErr('solve T: R=0', solveForTime(1000, 0, 150));

// === yearlySchedule ===
const ys1 = yearlySchedule(1000, 10, 3);
eq('schedule y1 interest', ys1.schedule[0].interest, 100);
eq('schedule y1 balance', ys1.schedule[0].balance, 1100);
eq('schedule y2 cumInterest', ys1.schedule[1].cumInterest, 200);
eq('schedule y3 balance', ys1.schedule[2].balance, 1300);
eq('schedule length', ys1.schedule.length, 3);

hasErr('schedule NaN', yearlySchedule(NaN, 5, 3));

console.log(`\nResults: ${pass} passed, ${fail} failed, ${pass + fail} total`);
if (fail > 0) process.exit(1);
