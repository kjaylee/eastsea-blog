const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const mapper = require('./app.js');

const fixtureCsv = fs.readFileSync(
  path.join(__dirname, 'fixtures', 'sample-gsc-query-export.csv'),
  'utf8'
);

function joinCsv(rows) {
  return rows.join('\n');
}

test('fixture produces the exact ranked top 3 contract and summary counts', () => {
  const analysis = mapper.analyzeCsvText(fixtureCsv);

  assert.equal(analysis.ok, true);
  assert.deepEqual(analysis.summary, {
    parsedRows: 8,
    validRows: 8,
    utilityRows: 8,
    clusters: 4,
    rankedClusters: 3,
    excludedClusters: 1,
    invalidRows: 0,
    exclusions: {
      nonUtility: 0,
      emptyBaseTerm: 0,
      lowDemand: 0,
      alreadyCovered: 1,
    },
  });

  assert.deepEqual(
    analysis.results.map((row) => ({
      rank: row.rank,
      toolSlug: row.toolSlug,
      toolTitle: row.toolTitle,
      opportunityScore: row.opportunityScore,
      coverageStatus: row.coverageStatus,
    })),
    [
      {
        rank: 1,
        toolSlug: 'google-play-net-revenue-calculator',
        toolTitle: 'Google Play Net Revenue Calculator',
        opportunityScore: 81,
        coverageStatus: 'no-page',
      },
      {
        rank: 2,
        toolSlug: 'etsy-fee-calculator',
        toolTitle: 'Etsy Fee Calculator',
        opportunityScore: 71,
        coverageStatus: 'weak-page',
      },
      {
        rank: 3,
        toolSlug: 'youtube-title-generator',
        toolTitle: 'YouTube Title Generator',
        opportunityScore: 59,
        coverageStatus: 'weak-page',
      },
    ]
  );

  assert.equal(analysis.excludedResults[0].toolSlug, 'tip-calculator');
  assert.equal(analysis.excludedResults[0].coverageStatus, 'exactish-page');
  assert.equal(analysis.excludedResults[0].exclusionReason, 'alreadyCovered');

  assert.deepEqual(analysis.results[0].scoreBreakdown, {
    intentWeight: 25,
    coverageWeight: 12,
    monetizationWeight: 15,
    specificityWeight: 6,
    demandWeight: 15,
    ctrGapWeight: 8,
  });
  assert.deepEqual(analysis.results[0].supportingQueries, [
    'google play net revenue calculator',
    'google play net revenue estimator',
  ]);
  assert.deepEqual(analysis.results[1].coveragePages, [
    'https://eastsea.xyz/tools/marketplace-fee-profit-calculator/',
  ]);
});

test('header aliases normalize correctly', () => {
  const aliasedCsv = fixtureCsv.replace(
    'query,clicks,impressions,ctr,position,page',
    'Top queries,Clicks,Impressions,CTR,Average position,Landing page'
  );

  const analysis = mapper.analyzeCsvText(aliasedCsv);

  assert.equal(analysis.ok, true);
  assert.equal(analysis.summary.validRows, 8);
  assert.equal(analysis.results[0].toolSlug, 'google-play-net-revenue-calculator');
});

test('rows without utility intent are excluded as nonUtility', () => {
  const csv = joinCsv([
    'query,clicks,impressions,position,page',
    'how to sell more on etsy,10,200,5.1,',
    'etsy fee calculator,8,220,5.4,',
  ]);

  const analysis = mapper.analyzeCsvText(csv);

  assert.equal(analysis.ok, true);
  assert.equal(analysis.summary.exclusions.nonUtility, 1);
  assert.equal(analysis.summary.utilityRows, 1);
  assert.equal(analysis.results[0].toolSlug, 'etsy-fee-calculator');
});

test('utility-only intent rows with empty base term are excluded', () => {
  const csv = joinCsv([
    'query,clicks,impressions,position,page',
    'calculator,10,200,5.1,',
    'validator,9,190,5.3,',
    'etsy fee calculator,8,220,5.4,',
  ]);

  const analysis = mapper.analyzeCsvText(csv);

  assert.equal(analysis.ok, true);
  assert.equal(analysis.summary.exclusions.emptyBaseTerm, 2);
  assert.equal(analysis.summary.utilityRows, 1);
});

test('low-demand clusters are excluded', () => {
  const csv = joinCsv([
    'query,clicks,impressions,position,page',
    'rare tax calculator,4,99,5.4,',
    'rare tax estimator,0,10,5.8,',
    'etsy fee calculator,8,220,5.4,',
  ]);

  const analysis = mapper.analyzeCsvText(csv);

  assert.equal(analysis.ok, true);
  assert.equal(analysis.summary.exclusions.lowDemand, 1);
  assert.equal(analysis.results.length, 1);
  assert.equal(analysis.excludedResults[0].toolSlug, 'rare-tax-calculator');
});

test('missing page column degrades safely to no-page coverage', () => {
  const csv = joinCsv([
    'query,clicks,impressions,position',
    'google play net revenue calculator,18,520,6.2',
    'google play net revenue estimator,9,240,6.8',
  ]);

  const analysis = mapper.analyzeCsvText(csv);

  assert.equal(analysis.ok, true);
  assert.equal(analysis.results[0].coverageStatus, 'no-page');
  assert.deepEqual(analysis.results[0].coveragePages, []);
});

test('brand casing overrides are applied', () => {
  const csv = joinCsv([
    'query,clicks,impressions,position,page',
    'youtube title generator,8,220,4.2,',
    'ebay fee calculator,7,210,4.8,',
  ]);

  const analysis = mapper.analyzeCsvText(csv);

  assert.equal(analysis.ok, true);
  assert.deepEqual(
    analysis.results.map((row) => row.toolTitle).sort(),
    ['YouTube Title Generator', 'eBay Fee Calculator'].sort()
  );
});

test('sort tie-breakers are deterministic by score, impressions, clicks, then slug', () => {
  const csv = joinCsv([
    'query,clicks,impressions,position,page',
    'gamma quota calculator,6,200,6.0,',
    'alpha quota calculator,6,224,6.0,',
    'beta quota calculator,6,200,6.0,',
  ]);

  const analysis = mapper.analyzeCsvText(csv);

  assert.equal(analysis.ok, true);
  assert.deepEqual(
    analysis.results.map((row) => row.toolSlug),
    ['alpha-quota-calculator', 'beta-quota-calculator', 'gamma-quota-calculator']
  );
  assert.deepEqual(
    analysis.results.map((row) => row.opportunityScore),
    [51, 51, 51]
  );
});

test('JSON and CSV serializers preserve required export schema keys', () => {
  const analysis = mapper.analyzeCsvText(fixtureCsv);
  assert.equal(analysis.ok, true);

  const jsonPayload = JSON.parse(mapper.serializeResultsToJson(analysis, {
    generatedAt: '2026-03-12T13:30:00+09:00',
  }));
  const csvPayload = mapper.serializeResultsToCsv(analysis);

  assert.equal(jsonPayload.generatedAt, '2026-03-12T13:30:00+09:00');
  assert.equal(jsonPayload.summary.rankedClusters, 3);
  assert.equal(jsonPayload.results[0].toolSlug, 'google-play-net-revenue-calculator');
  assert.equal(jsonPayload.results[0].buildBrief, 'Build a static calculator for Google Play Net Revenue Calculator with transparent inputs, formula disclosure, instant results, and exportable summaries.');
  assert.ok(Object.prototype.hasOwnProperty.call(jsonPayload.results[0], 'coveragePages'));
  assert.ok(Object.prototype.hasOwnProperty.call(jsonPayload.results[0], 'scoreBreakdown'));
  assert.match(csvPayload, /rank,toolSlug,toolTitle,intentType,baseTerm,opportunityScore/);
  assert.match(csvPayload, /google-play-net-revenue-calculator/);
  assert.match(csvPayload, /youtube-title-generator/);
});

test('missing required columns return a blocking error', () => {
  const csv = joinCsv([
    'query,clicks,impressions,page',
    'etsy fee calculator,8,220,https://eastsea.xyz/tools/marketplace-fee-profit-calculator/',
  ]);

  const analysis = mapper.analyzeCsvText(csv);

  assert.equal(analysis.ok, false);
  assert.match(analysis.error, /Missing required columns: position/);
});
