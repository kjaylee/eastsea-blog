const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { compute } = require('../calculator.js');

const fixturePath = path.join(__dirname, '..', 'fixtures', 'sample-input.json');
const input = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
const result = compute(input);

assert.ok(result.feeBearingRevenue > 0, 'feeBearingRevenue should be positive');
assert.ok(result.googleFeeAmount > 0, 'googleFeeAmount should be positive');
assert.ok(Number.isFinite(result.blendedFeeRate), 'blendedFeeRate should be finite');
assert.ok(result.netProceedsBeforeCosts > 0, 'netProceedsBeforeCosts should be positive');
assert.ok(result.remainingTierRunway >= 0, 'remainingTierRunway should be non-negative');

console.log(JSON.stringify({
  input,
  result: {
    feeBearingRevenue: Number(result.feeBearingRevenue.toFixed(2)),
    googleFeeAmount: Number(result.googleFeeAmount.toFixed(2)),
    blendedFeeRate: Number(result.blendedFeeRate.toFixed(4)),
    netProceedsBeforeCosts: Number(result.netProceedsBeforeCosts.toFixed(2)),
    netProfit: Number(result.netProfit.toFixed(2)),
    remainingTierRunway: Number(result.remainingTierRunway.toFixed(2))
  }
}, null, 2));
