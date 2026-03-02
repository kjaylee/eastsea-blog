const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const base = 'http://127.0.0.1:4173';
const outDir = '/home/spritz/tmp/p1-games-unique-0302/specs/p1-games-batch-20260302-1307';
const shotsDir = path.join(outDir, 'qa-screenshots');
fs.mkdirSync(shotsDir, { recursive: true });

const cases = [
  { id: 'paper-gate-arbiter', startSelector: '#startBtn', action: async (page) => {
      await page.click('#startBtn');
      await page.waitForTimeout(600);
      await page.keyboard.press('A');
      await page.waitForTimeout(200);
      await page.click('#langBtn');
      await page.waitForTimeout(120);
    }
  },
  { id: 'echo-loop-speedway', startSelector: '#startBtn', action: async (page) => {
      await page.click('#startBtn');
      await page.waitForTimeout(500);
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Space');
      await page.waitForTimeout(500);
      await page.click('#langBtn');
      await page.waitForTimeout(120);
    }
  },
  { id: 'inkfield-bastion', startSelector: '#startBtn', action: async (page) => {
      await page.click('#startBtn');
      await page.waitForTimeout(500);
      const c = await page.locator('#c').boundingBox();
      if (c) {
        await page.mouse.move(c.x + c.width*0.2, c.y + c.height*0.3);
        await page.mouse.down();
        await page.mouse.move(c.x + c.width*0.6, c.y + c.height*0.5, { steps: 8 });
        await page.mouse.up();
      }
      await page.keyboard.press('2');
      await page.waitForTimeout(200);
      await page.click('#langBtn');
      await page.waitForTimeout(120);
    }
  }
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const tc of cases) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const errors = [];
    page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
    page.on('console', msg => { if (msg.type() === 'error') errors.push(`console: ${msg.text()}`); });

    const url = `${base}/games/${tc.id}/`;
    let loaded = false;
    let canvasOk = false;
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 5000 });
      await page.waitForSelector('#c', { timeout: 3000 });
      loaded = true;
      const canvas = page.locator('#c');
      const bb = await canvas.boundingBox();
      canvasOk = !!(bb && bb.width > 100 && bb.height > 100);
      await tc.action(page);
      await page.screenshot({ path: path.join(shotsDir, `${tc.id}.png`), fullPage: true });
    } catch (e) {
      errors.push(`exception: ${e.message}`);
    }

    results.push({
      id: tc.id,
      url,
      loaded,
      canvasOk,
      errors,
      pass: loaded && canvasOk && errors.length === 0
    });
    await page.close();
  }

  await browser.close();
  fs.writeFileSync(path.join(outDir, 'qa-results.json'), JSON.stringify(results, null, 2));

  const lines = [];
  lines.push('# QA Results — p1-games-batch-20260302-1307');
  lines.push('');
  for (const r of results) {
    lines.push(`## ${r.id}`);
    lines.push(`- URL: ${r.url}`);
    lines.push(`- loaded: ${r.loaded}`);
    lines.push(`- canvasOk: ${r.canvasOk}`);
    lines.push(`- errors: ${r.errors.length}`);
    if (r.errors.length) lines.push(`- detail: ${r.errors.join(' | ')}`);
    lines.push(`- verdict: ${r.pass ? 'PASS' : 'FAIL'}`);
    lines.push('');
  }
  fs.writeFileSync(path.join(outDir, 'qa.md'), lines.join('\n'));

  const fail = results.some(r => !r.pass);
  process.exit(fail ? 1 : 0);
})();
