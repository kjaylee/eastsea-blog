const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const builder = require('./builder.js');

function expectIncludes(haystack, needle) {
  assert.ok(haystack.includes(needle), 'Expected to include: ' + needle + '\nActual: ' + haystack);
}

test('SPF-01 minimal a + mx + -all', () => {
  const result = builder.buildSpf({
    includeA: true,
    includeMx: true,
    allMode: '-all',
  });

  assert.equal(result.value, 'v=spf1 a mx -all');
  assert.equal(result.lookupCount, 2);
  assert.deepEqual(result.warnings, []);
  assert.deepEqual(result.errors, []);
});

test('SPF-02 include + ip4 + ip6 + ~all', () => {
  const result = builder.buildSpf({
    customIncludes: '_spf.google.com',
    ip4: '203.0.113.0/24',
    ip6: '2001:db8::/32',
    allMode: '~all',
  });

  assert.equal(result.value, 'v=spf1 include:_spf.google.com ip4:203.0.113.0/24 ip6:2001:db8::/32 ~all');
  assert.deepEqual(result.warnings, []);
});

test('SPF-03 warns when lookup count exceeds 10', () => {
  const result = builder.buildSpf({
    includeA: true,
    includeMx: true,
    customIncludes: [
      '_spf.google.com',
      'spf.protection.outlook.com',
      'sendgrid.net',
      'servers.mcsv.net',
      'amazonses.com',
      'sparkpostmail.com',
      'mailgun.org',
      'spf1.example.net',
      'spf2.example.net',
    ].join(', '),
    redirect: 'spf3.example.net',
    allMode: '-all',
  });

  assert.equal(result.value, 'v=spf1 a mx include:_spf.google.com include:spf.protection.outlook.com include:sendgrid.net include:servers.mcsv.net include:amazonses.com include:sparkpostmail.com include:mailgun.org include:spf1.example.net include:spf2.example.net redirect=spf3.example.net -all');
  assert.equal(result.lookupCount, 12);
  assert.ok(result.warnings.some((warning) => /at most 10/i.test(warning)));
});

test('SPF-04 warns when TXT length exceeds 255 characters', () => {
  const includes = Array.from({ length: 22 }, (_, index) => 'spf' + (index + 1) + '.example.net');
  const result = builder.buildSpf({
    customIncludes: includes.join('\n'),
    allMode: '-all',
  });

  assert.ok(result.value.startsWith('v=spf1 include:spf1.example.net'));
  assert.ok(result.length > 255);
  assert.ok(result.warnings.some((warning) => /255 characters/i.test(warning)));
  assert.ok(result.chunks.length > 1);
});

test('DMARC-01 default safe policy', () => {
  const result = builder.buildDmarc({
    dmarcPolicy: 'none',
    dmarcPct: '100',
    dmarcRua: 'mailto:dmarc@domain.com',
    dmarcAdkim: 'r',
    dmarcAspf: 'r',
    dmarcFo: '0',
  });

  assert.equal(result.value, 'v=DMARC1; p=none; pct=100; rua=mailto:dmarc@domain.com; adkim=r; aspf=r; fo=0');
  assert.deepEqual(result.warnings, []);
  assert.deepEqual(result.errors, []);
});

test('DMARC-02 quarantine + strict alignment', () => {
  const result = builder.buildDmarc({
    dmarcPolicy: 'quarantine',
    dmarcSubdomainPolicy: 'none',
    dmarcPct: '50',
    dmarcRua: 'mailto:dmarc@domain.com, mailto:dmarc2@domain.com',
    dmarcRuf: 'mailto:forensics@domain.com',
    dmarcAdkim: 's',
    dmarcAspf: 's',
    dmarcFo: '1',
    dmarcRi: '3600',
  });

  assert.equal(result.value, 'v=DMARC1; p=quarantine; sp=none; pct=50; rua=mailto:dmarc@domain.com,mailto:dmarc2@domain.com; ruf=mailto:forensics@domain.com; adkim=s; aspf=s; fo=1; ri=3600');
  assert.deepEqual(result.warnings, []);
  assert.deepEqual(result.errors, []);
});

test('DMARC-03 invalid pct shows error state', () => {
  const result = builder.buildDmarc({
    dmarcPolicy: 'reject',
    dmarcPct: '120',
  });

  expectIncludes(result.value, 'pct=120');
  assert.ok(result.errors.some((error) => /pct must be 0–100/i.test(error)));
});

test('DMARC-04 missing mailto keeps output but flags warning', () => {
  const result = builder.buildDmarc({
    dmarcPolicy: 'none',
    dmarcRua: 'dmarc@domain.com',
  });

  expectIncludes(result.value, 'rua=dmarc@domain.com');
  assert.ok(result.warnings.some((warning) => /rua entries must start with mailto/i.test(warning)));
});

test('deduplicates provider + custom includes without changing order', () => {
  const result = builder.buildSpf({
    selectedProviders: ['google-workspace', 'microsoft-365'],
    customIncludes: 'include:_spf.google.com, spf.protection.outlook.com, mailgun.org',
    allMode: '-all',
  });

  assert.equal(result.value, 'v=spf1 include:_spf.google.com include:spf.protection.outlook.com include:mailgun.org -all');
  assert.equal(result.lookupCount, 3);
});

test('HTML scaffold includes required anchors', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

  for (const token of [
    'Email Authentication Record Builder',
    'providerList',
    'copySpf',
    'copyDmarc',
    'SPF TXT record',
    'DMARC TXT record',
    'builder.js',
  ]) {
    assert.ok(html.includes(token), token);
  }
});

test('catalog integration exists exactly once across discovery surfaces', () => {
  const repoRoot = path.join(__dirname, '..', '..');
  const slug = 'email-auth-record-builder';
  const url = `/tools/${slug}/`;

  const htmlIndex = fs.readFileSync(path.join(repoRoot, 'tools', 'index.html'), 'utf8');
  const markdownIndex = fs.readFileSync(path.join(repoRoot, 'tools', 'index.md'), 'utf8');
  const manifest = JSON.parse(fs.readFileSync(path.join(repoRoot, 'tools', 'manifest.json'), 'utf8'));
  const toolsList = JSON.parse(fs.readFileSync(path.join(repoRoot, '_data', 'tools-list.json'), 'utf8'));

  const htmlMatches = (htmlIndex.match(new RegExp(`href="${slug}/"`, 'g')) || []).length;
  const mdMatches = (markdownIndex.match(new RegExp(`\\(\\./${slug}/\\)`, 'g')) || []).length;
  const manifestMatches = manifest.tools.filter((entry) => entry.slug === slug && entry.url === url).length;
  const listMatches = toolsList.filter((entry) => entry.url === url).length;

  assert.equal(htmlMatches, 1, 'tools/index.html should link to the tool exactly once');
  assert.equal(mdMatches, 1, 'tools/index.md should reference the tool exactly once');
  assert.equal(manifestMatches, 1, 'tools/manifest.json should include the tool exactly once');
  assert.equal(listMatches, 1, '_data/tools-list.json should include the tool exactly once');
});
