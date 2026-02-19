# Plan — p1-monetization-tools-trio-20260219-1206

1. **Discovery**
   - `tools/manifest.json`에서 기존 slug 목록 확인
   - 신규 3개 slug 최종 확정

2. **SDD/TDD 문서화**
   - `spec.md` 작성
   - `plan.md` 작성
   - `test-cases.md` 작성
   - `tasks.md` 작성

3. **Implementation (Single-page tools)**
   - `newsletter-sponsorship-pricing-calculator/index.html`
   - `creator-sponsorship-rate-calculator/index.html`
   - `youtube-ad-revenue-estimator/index.html`
   - 공통 구현: 반응형, 한/영 토글, copy-summary, `href="/"`

4. **Catalog Update**
   - `tools/index.html` 카드 3개 추가
   - `scripts/build-manifests.sh`로 `tools/manifest.json` 갱신
   - `_data/tools-list.json`에 3개 항목 추가

5. **Verification**
   - 로컬 서버 실행: `python3 -m http.server`
   - `curl`로 3개 페이지 + 카탈로그 파일 상태 검증

6. **Release**
   - `eastsea-blog` repo 내부에서 `git add -A`
   - 커밋: `feat(tools): add 3 monetization calculators`
   - `git push origin master`

7. **Live Check**
   - GitHub Pages URL 3개에 대해 최대 2분 내 HTTP 200 확인

8. **Checkpoint**
   - 각 단계 결과를 `.state/p1-monetization-tools-trio/20260219-1206/step*.json` 저장
