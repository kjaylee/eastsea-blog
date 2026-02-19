# Plan — p1-monetization-tools-trio-20260219-1300

1. **Discovery / Uniqueness Check**
   - `tools/manifest.json`에서 기존 slug 목록 확인
   - 신규 3개 slug 최종 확정
     - freemium-to-paid-conversion-revenue-calculator
     - creator-membership-tier-revenue-calculator
     - wholesale-vs-dtc-margin-calculator

2. **SDD/TDD 문서화 (순서 고정)**
   - `spec.md`
   - `plan.md`
   - `test-cases.md`
   - `tasks.md`

3. **Implementation (Single index.html per tool)**
   - 각 tool 디렉터리 생성 및 `index.html` 구현
   - 공통 요구 충족: 반응형, KO/EN 토글, copy-summary, `href="/"`

4. **Catalog Update**
   - `tools/index.html`에 3개 카드 추가
   - `scripts/build-manifests.sh` 실행으로 `tools/manifest.json` 갱신
   - `_data/tools-list.json`에 3개 항목 추가

5. **Local Verification**
   - `python3 -m http.server` 실행
   - `curl`로 신규 3개 도구 + 카탈로그 파일 HTTP 200 확인

6. **Git Release**
   - `cd $WORKSPACE/eastsea-blog`
   - `git add -A`
   - `git commit -m "feat(tools): add 3 monetization calculators"`
   - `git push origin master`

7. **Live Verification**
   - GitHub Pages 라이브 URL 3개에 대해 HTTP 200 확인
   - 최대 2분 대기(retry)

8. **Checkpoint**
   - 단계별 결과를 `.state/p1-monetization-tools-trio/20260219-1300/step*.json`에 저장
