import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const testDir = path.dirname(new URL(import.meta.url).pathname);
const toolDir = path.resolve(testDir, '..');
const repoRoot = path.resolve(toolDir, '..', '..');
const slug = 'vat-gst-margin-calculator';
const url = `/tools/${slug}/`;
const html = fs.readFileSync(path.join(toolDir, 'index.html'), 'utf8');

function loadCompute() {
  const match = html.match(/\/\* TESTABLE_COMPUTE_START \*\/[\s\S]*?function compute\(v\) \{[\s\S]*?\n    \}\n    \/\* TESTABLE_COMPUTE_END \*\//);
  assert.ok(match, 'compute block with TESTABLE_COMPUTE markers should exist');
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(`${match[0]}; this.compute = compute;`, sandbox);
  return sandbox.compute;
}

const compute = loadCompute();

test('baseline fixture matches the spec formula contract', () => {
  const r = compute({
    grossPriceInclTax: 29,
    vatRate: 10,
    paymentFeeRate: 3.4,
    refundRate: 4,
    costPerOrder: 4,
    monthlyFixedCost: 1200,
    monthlyOrders: 180,
    targetNetMarginPct: 20
  });

  assert.ok(Math.abs(r.netPriceExTax - 26.363636363636363) < 1e-9);
  assert.ok(Math.abs(r.refundedRevenueExTax - 1.0545454545454545) < 1e-9);
  assert.ok(Math.abs(r.recognizedRevenueExTax - 25.30909090909091) < 1e-9);
  assert.ok(Math.abs(r.paymentFeeAmount - 0.986) < 1e-9);
  assert.ok(Math.abs(r.contributionAfterVariableCost - 20.32309090909091) < 1e-9);
  assert.ok(Math.abs(r.monthlyContribution - 3658.156363636364) < 1e-9);
  assert.ok(Math.abs(r.monthlyNetProfit - 2458.1563636363626) < 1e-9);
  assert.ok(Math.abs(r.actualNetMarginPct - 47.09111807732496) < 1e-9);
  assert.ok(Math.abs(r.breakEvenOrders - 59.04613650393195) < 1e-9);
  assert.ok(Math.abs(r.targetPriceInclTax - 16.699876648638398) < 1e-9);
});

test('non-achievable edge case returns Infinity for break-even and target price', () => {
  const r = compute({
    grossPriceInclTax: 10,
    vatRate: 25,
    paymentFeeRate: 5,
    refundRate: 15,
    costPerOrder: 7,
    monthlyFixedCost: 800,
    monthlyOrders: 50,
    targetNetMarginPct: 70
  });

  assert.ok(r.contributionAfterVariableCost < 0);
  assert.equal(r.breakEvenOrders, Infinity);
  assert.equal(r.targetPriceInclTax, Infinity);
});

test('page contains required discovery and UX markers', () => {
  assert.match(html, /<title>VAT & GST Margin Calculator \| 부가세 포함 마진 계산기<\/title>/);
  assert.match(html, /\/assets\/analytics\.js/);
  assert.match(html, /Back to Portal/);
  assert.match(html, /VAT|GST/);

  const ids = ['grossPriceInclTax', 'vatRate', 'paymentFeeRate', 'refundRate', 'costPerOrder', 'monthlyFixedCost', 'monthlyOrders', 'targetNetMarginPct'];
  ids.forEach((id) => assert.match(html, new RegExp(`id="${id}"`), `${id} input should exist`));
});

test('catalog integration exists exactly once across discovery surfaces', () => {
  const htmlIndex = fs.readFileSync(path.join(repoRoot, 'tools', 'index.html'), 'utf8');
  const markdownIndex = fs.readFileSync(path.join(repoRoot, 'tools', 'index.md'), 'utf8');
  const manifest = JSON.parse(fs.readFileSync(path.join(repoRoot, 'tools', 'manifest.json'), 'utf8'));
  const toolsList = JSON.parse(fs.readFileSync(path.join(repoRoot, '_data', 'tools-list.json'), 'utf8'));

  const htmlMatches = (htmlIndex.match(new RegExp(`href="${slug}\/"`, 'g')) || []).length;
  const mdMatches = (markdownIndex.match(new RegExp(`\(\.\/${slug}\/\)`, 'g')) || []).length;
  const manifestMatches = manifest.tools.filter((entry) => entry.slug === slug && entry.url === url).length;
  const listMatches = toolsList.filter((entry) => entry.url === url).length;

  assert.equal(htmlMatches, 1, 'tools/index.html should link to the tool exactly once');
  assert.equal(mdMatches, 1, 'tools/index.md should reference the tool exactly once');
  assert.equal(manifestMatches, 1, 'tools/manifest.json should include the tool exactly once');
  assert.equal(listMatches, 1, '_data/tools-list.json should include the tool exactly once');
});
