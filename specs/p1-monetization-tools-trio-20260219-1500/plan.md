# Plan — p1-monetization-tools-trio-20260219-1500

1. **Discovery & Uniqueness Check**
   - `tools/manifest.json`에서 기존 slug 확인
   - 신규 3개 slug 확정
     - `saas-usage-overage-revenue-calculator`
     - `reseller-margin-waterfall-calculator`
     - `webinar-funnel-revenue-calculator`

2. **SDD/TDD 문서화 (고정 순서)**
   1) `spec.md`
   2) `plan.md`
   3) `test-cases.md`
   4) `tasks.md`

3. **Implementation (3 Tools)**
   - 각 디렉터리에 single `index.html` 작성
   - 공통 UX: 반응형 + KO/EN 토글 + copy-summary + `href="/"`
   - 공통 로직: `validate -> compute -> render`

4. **Catalog Sync**
   - `tools/index.html` 카드 3개 추가
   - `tools/manifest.json` 갱신
   - `_data/tools-list.json` 신규 3개 항목 추가(중복 방지)

5. **Local Validation**
   - `python3 -m http.server` 실행
   - `curl`로 신규 3개 URL + `/tools/` + `/tools/manifest.json` + `/_data/tools-list.json` 200 확인

6. **Release**
   - `cd /Users/kjaylee/.openclaw/workspace/eastsea-blog`
   - `git add -A`
   - `git commit -m "feat(tools): add 3 monetization calculators (1500 wave)"`
   - `git push origin master`

7. **Live Verification**
   - GitHub Pages 라이브 URL 3개를 최대 2분 대기/재시도하여 200 확인

8. **Checkpointing**
   - `.state/p1-monetization-tools-trio/20260219-1500/step*.json` 저장
