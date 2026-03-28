# Plan — Whop Fee Calculator

## Execution order
1. Confirm the slug remains absent from shipped discovery surfaces and from recent heartbeat / nearby-resale specs.
2. Re-verify Whop public fee docs immediately before implementation so no constants are copied stale from this planning artifact.
3. Implement a narrow first release:
   - baseline card processing
   - international / FX surcharge toggles
   - billing / tax / affiliate toggles
   - payout method assumption
   - seller-cost overlay
4. Add deterministic tests for fee-stack math, validation boundaries, and exact-once discovery wiring.
5. Smoke-test the page over local HTTP and record assumptions visibly in the UI.

## Implementation shape
- Keep it static and browser-only.
- Export pure compute helpers from `calculator.js`.
- Keep optional fees explicit and toggle-driven rather than hidden in one opaque "Whop fee" field.
- Default to conservative official baselines, but allow manual override in an advanced section.

## Verification commands
Pre-implementation gap check:

```bash
rg -n "whop-fee-calculator|Whop Fee Calculator|whop fee calculator" \
  tools tools/index.html tools/index.md _data/tools-list.json tools/manifest.json specs tests
```

```bash
node - <<'NODE'
const manifest=require('./tools/manifest.json').tools;
const toolsList=require('./_data/tools-list.json');
const slug='whop-fee-calculator';
const url=`/tools/${slug}/`;
console.log(JSON.stringify({
  manifestMatches: manifest.filter(x=>x.slug===slug||x.url===url).length,
  toolsListMatches: toolsList.filter(x=>x.slug===slug||x.url===url).length
}, null, 2));
NODE
```

Future implementation verification:

```bash
node --check tools/whop-fee-calculator/calculator.js
node --test tools/whop-fee-calculator/calculator.test.js
python3 -m http.server 4176 >/tmp/eastsea-whop-http.log 2>&1 &
echo $! >/tmp/eastsea-whop-http.pid
curl -I http://127.0.0.1:4176/tools/whop-fee-calculator/
curl -s http://127.0.0.1:4176/tools/whop-fee-calculator/ | \
  grep -E 'Whop Fee Calculator|2.7% \\+ \\$0.30|1.5%|0.5%|1.25%'
kill "$(cat /tmp/eastsea-whop-http.pid)"
```

Post-task artifact check for this docs-only run:

```bash
git status --short specs/heartbeat-queue-87-whop-fee-calculator-20260327
find specs/heartbeat-queue-87-whop-fee-calculator-20260327 -maxdepth 1 -type f | sort
```

## Red Team
- Attack: This is still too close to the recent marketplace / resale wave.
  - Mitigation: keep the page positioned as a creator-platform fee calculator and link only to creator-platform neighbors.
- Attack: Whop’s fee stack is more like a payments platform than a simple creator fee page, so the UI could become confusing.
  - Mitigation: ship a narrow baseline first and push advanced fee layers behind explicit toggles with assumption text.
- Attack: Public fees can change, so hard-coded constants could rot.
  - Mitigation: require re-verification against current Whop docs at implementation time and label this spec as non-authoritative.

## Non-goals for the future build
- Do not turn this into a generic payment-gateway calculator.
- Do not add tax-advice copy.
- Do not model every fraud or reserve edge case in v1.
