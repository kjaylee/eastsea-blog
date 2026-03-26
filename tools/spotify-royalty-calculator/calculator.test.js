const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { calculate, buildSummary, DEFAULTS } = require('./calculator.js');

function ok(raw) {
  const evaluated = calculate(raw);
  assert.equal(evaluated.error, '');
  assert.ok(evaluated.result);
  return evaluated.result;
}

test('TC-SP-01 baseline artist-owned case', () => {
  const result = ok({
    monthlyStreams: 120000,
    payoutPerStream: 0.0035,
    artistSharePct: 100,
    distributorFeePct: 0,
    collaboratorSplitPct: 0,
    fixedMonthlyCosts: 0,
    annualDistributionCost: 0,
    targetMonthlyTakeHome: 1000
  });

  assert.equal(result.grossMonthlyRoyalties, 420);
  assert.equal(result.artistGrossAfterShare, 420);
  assert.equal(result.distributorFee, 0);
  assert.equal(result.collaboratorPayout, 0);
  assert.equal(result.takeHomeBeforeFixed, 420);
  assert.equal(result.takeHomeAfterFixed, 420);
  assert.equal(result.annualTakeHomeAfterFixed, 5040);
  assert.equal(result.effectiveTakeHomePerThousand, 3.5);
  assert.equal(result.estimatedAnnualStreams, 1440000);
  assert.equal(result.gapToAnnualThreshold, 0);
  assert.equal(result.status, 'good');
  assert.equal(result.streamsNeededForTargetTakeHome, 285715);
});

test('TC-SP-02 label distributor and collaborator drag', () => {
  const result = ok({
    monthlyStreams: 250000,
    payoutPerStream: 0.0038,
    artistSharePct: 65,
    distributorFeePct: 10,
    collaboratorSplitPct: 20,
    fixedMonthlyCosts: 150,
    annualDistributionCost: 120,
    targetMonthlyTakeHome: 1500
  });

  assert.equal(result.grossMonthlyRoyalties, 950);
  assert.equal(result.artistGrossAfterShare, 617.5);
  assert.equal(result.distributorFee, 61.75);
  assert.equal(result.collaboratorPayout, 111.15);
  assert.equal(result.takeHomeBeforeFixed, 444.6);
  assert.equal(result.monthlyFixedCostLoad, 160);
  assert.equal(result.takeHomeAfterFixed, 284.6);
  assert.equal(result.annualTakeHomeAfterFixed, 3415.2);
  assert.equal(result.effectiveTakeHomePerThousand, 1.78);
  assert.equal(result.streamsNeededForTargetTakeHome, 933424);
});

test('TC-SP-03 fixed costs can push net negative', () => {
  const result = ok({
    monthlyStreams: 10000,
    payoutPerStream: 0.003,
    artistSharePct: 80,
    distributorFeePct: 15,
    collaboratorSplitPct: 10,
    fixedMonthlyCosts: 40,
    annualDistributionCost: 180,
    targetMonthlyTakeHome: 200
  });

  assert.equal(result.grossMonthlyRoyalties, 30);
  assert.equal(result.takeHomeBeforeFixed, 18.36);
  assert.equal(result.monthlyFixedCostLoad, 55);
  assert.equal(result.takeHomeAfterFixed, -36.64);
  assert.equal(result.status, 'bad');
});

test('TC-SP-04 zero streams stays finite', () => {
  const result = ok({
    monthlyStreams: 0,
    payoutPerStream: 0.0035,
    artistSharePct: 100,
    distributorFeePct: 0,
    collaboratorSplitPct: 0,
    fixedMonthlyCosts: 20,
    annualDistributionCost: 120,
    targetMonthlyTakeHome: 100
  });

  assert.equal(result.grossMonthlyRoyalties, 0);
  assert.equal(result.takeHomeBeforeFixed, 0);
  assert.equal(result.monthlyFixedCostLoad, 30);
  assert.equal(result.takeHomeAfterFixed, -30);
  assert.equal(result.effectiveTakeHomePerThousand, 0);
  assert.equal(result.estimatedAnnualStreams, 0);
  assert.equal(result.gapToAnnualThreshold, 1000);
  assert.equal(result.streamsNeededForTargetTakeHome, 37143);
});

test('TC-SP-05 threshold helper reflects annualized pace', () => {
  const result = ok({
    monthlyStreams: 60,
    payoutPerStream: 0.0035,
    artistSharePct: 100,
    distributorFeePct: 0,
    collaboratorSplitPct: 0,
    fixedMonthlyCosts: 0,
    annualDistributionCost: 0,
    targetMonthlyTakeHome: 10
  });

  assert.equal(result.estimatedAnnualStreams, 720);
  assert.equal(result.gapToAnnualThreshold, 280);
  assert.equal(result.qualifiesForAnnualThreshold, false);
});

test('TC-SP-06 validation rejects bad input', () => {
  assert.match(calculate({ ...DEFAULTS, monthlyStreams: -1 }).error, /Monthly streams/);
  assert.match(calculate({ ...DEFAULTS, payoutPerStream: 0 }).error, /payout per stream/);
  assert.match(calculate({ ...DEFAULTS, artistSharePct: 120 }).error, /Artist share/);
  assert.match(calculate({ ...DEFAULTS, distributorFeePct: -2 }).error, /Distributor fee/);
  assert.match(calculate({ ...DEFAULTS, collaboratorSplitPct: 999 }).error, /Collaborator split/);
  assert.match(calculate({ ...DEFAULTS, fixedMonthlyCosts: -1 }).error, /Fixed monthly costs/);
  assert.match(calculate({ ...DEFAULTS, annualDistributionCost: -1 }).error, /Annual distribution cost/);
  assert.match(calculate({ ...DEFAULTS, targetMonthlyTakeHome: -1 }).error, /Target monthly take-home/);
  assert.match(calculate({ ...DEFAULTS, monthlyStreams: 'abc' }).error, /Monthly streams/);
});

test('TC-SP-07 summary contains key labels', () => {
  const summary = buildSummary(ok(DEFAULTS));
  assert.match(summary, /\[Spotify Royalty Calculator Summary\]/);
  assert.match(summary, /Gross monthly royalties/);
  assert.match(summary, /Take-home after fixed costs/);
  assert.match(summary, /Streams needed for target take-home/);
});

test('TC-SP-08 discovery files contain slug exactly once', () => {
  const root = path.resolve(__dirname, '..', '..');
  const slug = 'spotify-royalty-calculator';
  const url = '/tools/' + slug + '/';
  const toolsList = fs.readFileSync(path.join(root, '_data', 'tools-list.json'), 'utf8');
  const indexHtml = fs.readFileSync(path.join(root, 'tools', 'index.html'), 'utf8');
  const indexMd = fs.readFileSync(path.join(root, 'tools', 'index.md'), 'utf8');
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'manifest.json'), 'utf8'));

  assert.equal((toolsList.match(new RegExp(slug, 'g')) || []).length, 1, 'tools-list exact-once');
  assert.equal((indexHtml.match(new RegExp(slug, 'g')) || []).length, 1, 'index.html exact-once');
  assert.equal((indexMd.match(new RegExp(slug, 'g')) || []).length, 1, 'index.md exact-once');
  assert.equal(manifest.tools.filter((entry) => entry.slug === slug && entry.url === url).length, 1, 'manifest exact-once');
});
