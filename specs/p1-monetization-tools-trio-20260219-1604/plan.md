# Plan — p1-monetization-tools-trio-20260219-1604

1. **Discovery & Uniqueness Check**
   - `tools/manifest.json` 기존 slug 점검
   - 신규 3개 slug 확정
     - `saas-feature-gating-revenue-uplift-calculator`
     - `marketplace-promoted-listing-roi-calculator`
     - `api-pricing-tier-shift-revenue-calculator`

2. **SDD/TDD 문서화 (고정 순서 준수)**
   1) `spec.md`
   2) `plan.md`
   3) `test-cases.md`
   4) `tasks.md`

3. **Implementation (3 Tools)**
   - 각 도구 single `index.html` 작성
   - 공통 UX: 반응형 + KO/EN 토글 + copy-summary + `href="/"`
   - 공통 로직: `validate -> compute -> render`

4. **Catalog Sync**
   - `tools/index.html`에 카드 3개 추가
   - `tools/manifest.json` 신규 3개 반영
   - `_data/tools-list.json` 신규 3개 반영

5. **Local Validation**
   - `python3 -m http.server` 실행
   - `curl`로 신규 3개 도구 + `/tools/` + `/tools/manifest.json` + `/_data/tools-list.json` 200 확인

6. **Release**
   - `cd $WORKSPACE/eastsea-blog`
   - `git add -A`
   - `git commit -m "feat(tools): add 3 monetization calculators (1604 wave)"`
   - `git push origin master`

7. **Live Verification**
   - GitHub Pages 라이브 URL(신규 3개) 2분 내 200 확인

8. **Checkpointing**
   - `.state/p1-monetization-tools-trio/20260219-1604/`에 step별 JSON 기록
