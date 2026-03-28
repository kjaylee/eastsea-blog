const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const checker = require('./app.js');

const toolDir = __dirname;
const repoRoot = path.resolve(toolDir, '..', '..');
const slug = 'keyword-cannibalization-checker';
const url = `/tools/${slug}/`;
const fixtureCsv = fs.readFileSync(
  path.join(toolDir, 'fixtures', 'sample-gsc-query-page-export.csv'),
  'utf8'
);

function joinCsv(rows) {
  return rows.join('\n');
}

test('fixture produces the expected deterministic scoring contract', () => {
  const analysis = checker.analyzeCsvText(fixtureCsv, { brandTerms: 'eastsea' });

  assert.equal(analysis.ok, true);
  assert.deepEqual(analysis.summary, {
    parsedRows: 9,
    validRows: 9,
    invalidRows: 0,
    eligibleQueries: 2,
    highSeverity: 1,
    mediumSeverity: 1,
    lowSeverity: 0,
    affectedImpressions: 680,
    affectedClicks: 42,
    excludedBrandQueries: 1,
    excludedBelowImpressions: 1,
    excludedBelowDistinctPages: 0,
  });

  assert.deepEqual(
    analysis.results.map((row) => ({
      query: row.query,
      severityScore: row.severityScore,
      severityBand: row.severityBand,
      recommendedAction: row.recommendedAction,
      distinctPages: row.distinctPages,
      totalImpressions: row.totalImpressions,
      affectedImpressions: row.affectedImpressions,
      totalClicks: row.totalClicks,
      topPageShare: row.topPageShare,
      positionSpread: row.positionSpread,
    })),
    [
      {
        query: 'best standing desk',
        severityScore: 73,
        severityBand: 'high',
        recommendedAction: 'merge-or-canonicalize',
        distinctPages: 3,
        totalImpressions: 1000,
        affectedImpressions: 500,
        totalClicks: 93,
        topPageShare: 0.5,
        positionSpread: 5.2,
      },
      {
        query: 'saas onboarding checklist',
        severityScore: 53,
        severityBand: 'medium',
        recommendedAction: 'strengthen-primary-page',
        distinctPages: 2,
        totalImpressions: 880,
        affectedImpressions: 180,
        totalClicks: 41,
        topPageShare: 0.795455,
        positionSpread: 5.4,
      },
    ]
  );

  assert.equal(analysis.results[0].topPage.page, '/desk-guide');
  assert.equal(analysis.results[0].affectedClicks, 33);
  assert.equal(analysis.results[1].topPage.page, '/saas-onboarding-checklist');
  assert.equal(analysis.results[1].affectedClicks, 9);
});

test('header aliases normalize correctly and missing ctr does not block analysis', () => {
  const aliasedCsv = fixtureCsv
    .replace(
      'query,page,clicks,impressions,ctr,position,country,device,date',
      'Query,Top pages,Clicks,Impressions,Position,Country,Device,Date'
    )
    .replace(/^([^\n]+\n.*)$/s, function (match) {
      return match
        .split('\n')
        .map(function (line, index) {
          if (!line) return line;
          if (index === 0) return line;
          const parts = line.split(',');
          parts.splice(4, 1); // remove ctr column values
          return parts.join(',');
        })
        .join('\n');
    });

  const analysis = checker.analyzeCsvText(aliasedCsv, { brandTerms: 'eastsea' });

  assert.equal(analysis.ok, true);
  assert.equal(analysis.summary.eligibleQueries, 2);
  assert.equal(analysis.results[0].rows[0].ctr, null);
});

test('brand filter removes branded overlap clusters', () => {
  const csv = joinCsv([
    'query,page,clicks,impressions,position',
    'eastsea pricing,/pricing,20,400,2.2',
    'eastsea pricing,/tools/pricing-calculator,7,160,5.1',
    'generic pricing guide,/pricing-guide,9,220,3.2',
    'generic pricing guide,/pricing-template,4,120,8.4',
  ]);

  const analysis = checker.analyzeCsvText(csv, { brandTerms: 'eastsea', minQueryImpressions: 50 });

  assert.equal(analysis.ok, true);
  assert.equal(analysis.summary.excludedBrandQueries, 1);
  assert.deepEqual(analysis.results.map((row) => row.query), ['generic pricing guide']);
});

test('below-threshold queries are excluded before scoring output', () => {
  const csv = joinCsv([
    'query,page,clicks,impressions,position',
    'tiny overlap query,/a,3,25,10',
    'tiny overlap query,/b,1,15,12',
  ]);

  const analysis = checker.analyzeCsvText(csv, { minQueryImpressions: 50 });

  assert.equal(analysis.ok, true);
  assert.equal(analysis.summary.eligibleQueries, 0);
  assert.equal(analysis.summary.excludedBelowImpressions, 1);
  assert.equal(analysis.results.length, 0);
});

test('missing required columns return a user-friendly error', () => {
  const csv = joinCsv([
    'query,clicks,impressions,ctr,position',
    'best standing desk,60,500,12%,3.0',
  ]);

  const analysis = checker.analyzeCsvText(csv);

  assert.equal(analysis.ok, false);
  assert.match(analysis.error, /Missing required columns: page/);
});

test('export contracts remain stable', () => {
  const analysis = checker.analyzeCsvText(fixtureCsv, { brandTerms: 'eastsea' });
  const jsonPayload = JSON.parse(checker.serializeResultsToJson(analysis, {
    generatedAt: '2026-03-27T15:40:00+09:00',
  }));
  const csvPayload = checker.serializeResultsToCsv(analysis);
  const summaryText = checker.buildCopySummary(analysis);

  assert.equal(jsonPayload.generatedAt, '2026-03-27T15:40:00+09:00');
  assert.equal(jsonPayload.results[0].query, 'best standing desk');
  assert.equal(jsonPayload.results[0].severityScore, 73);
  assert.ok(Array.isArray(jsonPayload.results[0].rows));
  assert.ok(Object.prototype.hasOwnProperty.call(jsonPayload.results[0], 'recommendedAction'));
  assert.match(csvPayload, /^query,severityScore,severityBand,recommendedAction,distinctPages,totalImpressions,affectedImpressions,totalClicks,topPageShare/m);
  assert.match(csvPayload, /best standing desk/);
  assert.match(summaryText, /Eligible queries: 2/);
  assert.match(summaryText, /1\. best standing desk/);
});

test('deterministic sorting breaks severity ties with affected impressions then query', () => {
  const csv = joinCsv([
    'query,page,clicks,impressions,position',
    'alpha overlap,/alpha-a,10,50,5',
    'alpha overlap,/alpha-b,5,90,5',
    'beta overlap,/beta-a,10,60,5',
    'beta overlap,/beta-b,5,150,5',
    'aardvark overlap,/aa-a,10,50,5',
    'aardvark overlap,/aa-b,5,90,5',
  ]);

  const analysis = checker.analyzeCsvText(csv, { minQueryImpressions: 0 });

  assert.equal(analysis.ok, true);
  assert.deepEqual(
    analysis.results.map((row) => ({ query: row.query, severityScore: row.severityScore, affectedImpressions: row.affectedImpressions })),
    [
      { query: 'beta overlap', severityScore: 23, affectedImpressions: 60 },
      { query: 'aardvark overlap', severityScore: 23, affectedImpressions: 50 },
      { query: 'alpha overlap', severityScore: 23, affectedImpressions: 50 },
    ]
  );
});

test('catalog integration exists exactly once across tool discovery surfaces', () => {
  const htmlIndex = fs.readFileSync(path.join(repoRoot, 'tools', 'index.html'), 'utf8');
  const markdownIndex = fs.readFileSync(path.join(repoRoot, 'tools', 'index.md'), 'utf8');
  const manifest = JSON.parse(fs.readFileSync(path.join(repoRoot, 'tools', 'manifest.json'), 'utf8'));
  const toolsList = JSON.parse(fs.readFileSync(path.join(repoRoot, '_data', 'tools-list.json'), 'utf8'));

  const htmlMatches = (htmlIndex.match(new RegExp(`href="${slug}/"`, 'g')) || []).length;
  const mdMatches = (markdownIndex.match(new RegExp(`\(\./${slug}/\)`, 'g')) || []).length;
  const manifestMatches = manifest.tools.filter((entry) => entry.slug === slug && entry.url === url).length;
  const listMatches = toolsList.filter((entry) => entry.url === url).length;

  assert.equal(htmlMatches, 1, 'tools/index.html should link to the tool exactly once');
  assert.equal(mdMatches, 1, 'tools/index.md should reference the tool exactly once');
  assert.equal(manifestMatches, 1, 'tools/manifest.json should include the tool exactly once');
  assert.equal(listMatches, 1, '_data/tools-list.json should include the tool exactly once');
});
