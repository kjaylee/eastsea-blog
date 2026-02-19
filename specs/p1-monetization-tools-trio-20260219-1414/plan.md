# Plan — p1-monetization-tools-trio-20260219-1414

1. **Discovery & Uniqueness Check**
   - `tools/manifest.json`에서 기존 slug 목록 확인
   - 신규 slug 3개 확정
     - `mobile-game-iap-ad-mix-revenue-calculator`
     - `b2b-renewal-uplift-roi-calculator`
     - `social-commerce-live-selling-profit-calculator`

2. **SDD/TDD 문서화 (고정 순서)**
   1) `spec.md`
   2) `plan.md`
   3) `test-cases.md`
   4) `tasks.md`

3. **Implementation (3 Tools)**
   - 각 디렉터리 생성 후 single `index.html` 구현
   - 공통 UI: 반응형 레이아웃, KO/EN 토글, copy-summary, `href="/"`
   - 공통 로직 패턴: `validate -> compute -> render`

4. **Catalog & Index Sync**
   - `tools/index.html`에 카드 3개 추가
   - `scripts/build-manifests.sh`로 `tools/manifest.json` 재생성
   - `_data/tools-list.json`에 3개 엔트리 반영(중복 방지)

5. **Local Validation**
   - `python3 -m http.server` 실행
   - `curl`로 신규 3 URL + `/tools/` + `/tools/manifest.json` + `/_data/tools-list.json` HTTP 200 확인

6. **Release**
   - `cd $WORKSPACE/eastsea-blog`
   - `git add -A`
   - `git commit -m "feat(tools): add 3 monetization calculators (1414 wave)"`
   - `git push origin master`

7. **Live Verification**
   - GitHub Pages 라이브 URL 3개를 최대 2분 내 재시도하며 200 확인

8. **Checkpointing**
   - 단계별 결과를 `.state/p1-monetization-tools-trio/20260219-1414/step*.json`로 저장
