# Plan — p1-monetization-tools-trio-20260220-0200

1. **Slug uniqueness 확인**
   - `_data/tools-list.json` + `tools/*/index.html` 기준으로 3개 slug 미존재 확인

2. **SDD/TDD 문서 작성 (순서 고정)**
   - `spec.md` → `plan.md` → `test-cases.md` → `tasks.md`

3. **도구 구현**
   - `tools/usage-based-pricing-migration-roi-calculator/index.html`
   - `tools/self-serve-upgrade-conversion-roi-calculator/index.html`
   - `tools/b2b-discount-approval-roi-calculator/index.html`
   - 공통 요구: 반응형, KO/EN 토글, copy-summary, 포털 링크 `href="/"`

4. **카탈로그 동기화**
   - `tools/index.html` 카드 3개 추가
   - `_data/tools-list.json` 엔트리 3개 추가
   - `bash scripts/build-manifests.sh`로 `tools/manifest.json` 재생성

5. **검증**
   - 로컬 HTTP 서버에서 신규 3개 URL 200 확인

6. **배포**
   - `git add -A`
   - `git commit -m "feat(tools): add 3 monetization calculators (0200 wave)"`
   - `git push origin master`

7. **라이브 검증**
   - GitHub Pages 신규 3개 URL 200 확인
   - 최대 2분 대기, 1회 재시도

8. **체크포인트 기록**
   - `.state/p1-monetization-tools-trio/20260220-0200/`에 step별 JSON 저장
