# Plan — Skool Fee Calculator

## Execution plan
1. Create research-backed spec artifacts first.
2. Implement a pure calculator module with exported constants, deterministic math helpers, and exact validation rules.
3. Build a polished static HTML page with responsive layout, copyable summary, comparison table, and related links.
4. Wire the slug into discovery surfaces (`tools/index.html`, `tools/index.md`, `_data/tools-list.json`).
5. Rebuild `tools/manifest.json`.
6. Run Node tests, local HTTP checks, and repo guard / manifest checks as evidence.
7. Write verification, gap analysis, and quality-loop artifacts.

## Small verifiable slices
### Slice 1 — math core
- Export constants for plans and thresholds
- Add baseline / threshold / invalid-input tests
- Verify with `node --test tools/skool-fee-calculator/calculator.test.js`

### Slice 2 — page shell
- Responsive static page with metadata, input form, KPIs, details, table, summary, related links
- Verify HTML anchors via test

### Slice 3 — discovery
- Add exact-once entries to index + tools list
- Rebuild manifest
- Verify with exact-once test and manifest presence

### Slice 4 — local serving
- Run `python3 -m http.server`
- Verify `curl -I` returns 200 and body contains signature strings

## File checklist
- [ ] `tools/skool-fee-calculator/index.html`
- [ ] `tools/skool-fee-calculator/calculator.js`
- [ ] `tools/skool-fee-calculator/calculator.test.js`
- [ ] `tools/index.html`
- [ ] `tools/index.md`
- [ ] `_data/tools-list.json`
- [ ] `tools/manifest.json`
- [ ] `specs/heartbeat-p1-20260327-skool-fee-calculator/verification.md`
- [ ] `specs/heartbeat-p1-20260327-skool-fee-calculator/gap-analysis.md`
- [ ] `specs/heartbeat-p1-20260327-skool-fee-calculator/quality-loop.md`

## Verification commands
```bash
cd /Users/kjaylee/.openclaw/workspace/eastsea-blog
node --test tools/skool-fee-calculator/calculator.test.js
bash scripts/build-manifests.sh
python3 -m http.server 4175 >/tmp/eastsea-skool-http.log 2>&1 &
echo $! >/tmp/eastsea-skool-http.pid
curl -I http://127.0.0.1:4175/tools/skool-fee-calculator/
curl -s http://127.0.0.1:4175/tools/skool-fee-calculator/ | grep -E 'Skool Fee Calculator|Hobby|Pro|2.9% \+ \$0.30|10% \+ \$0.30'
kill "$(cat /tmp/eastsea-skool-http.pid)"
python3 scripts/tool-catalog-guard.py --root . --fail-on error --max-examples 5
```

## 🔴 Red Team
- [공격 1]: 이미 membership / creator 수익화 도구가 많아 또 하나의 fee calculator가 카탈로그 중복처럼 보일 수 있다.
- [공격 2]: Skool 요금 정책을 잘못 해석하면 SEO는 얻어도 신뢰를 잃는다. 특히 Pro의 `$900` 이상 고액 결제 구간과 yearly `2 months free` 해석이 위험하다.
- [공격 3]: 너무 단순하게 만들면 generic fee page가 되어 `creator-membership-platform-fee-comparator`와 차별이 약해진다.
- [방어/완화]:
  - 로컬 카탈로그에서 Skool 부재를 먼저 검증해 낮은 중복을 확인했다.
  - 공식 `skool.com/pricing` + 공식 Help FAQ 2개 소스를 근거로 수식 범위를 제한한다.
  - 차별 포인트를 `Hobby ↔ Pro 업그레이드 손익분기`에 둔다.
  - 환불 fee reversal, 세금, 지역별 처리비용은 v1 비모델 범위로 명시한다.
- [합의]: 🟢극복
