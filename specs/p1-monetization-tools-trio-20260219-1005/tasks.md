# Tasks — p1-monetization-tools-trio-20260219-1005

## T1. Discovery
- [ ] `tools/manifest.json`에서 기존 슬러그 중복 확인
- [ ] 신규 3개 슬러그 최종 확정

## T2. Tool Implementation (single-file)
- [ ] `tools/b2b-saas-commitment-discount-uplift-calculator/index.html`
  - [ ] 한/영 UI 텍스트
  - [ ] 입력 검증 + 오류 상태
  - [ ] KPI/상세표/요약복사
- [ ] `tools/ecommerce-repeat-purchase-ltv-uplift-calculator/index.html`
  - [ ] 한/영 UI 텍스트
  - [ ] 입력 검증 + 오류 상태
  - [ ] KPI/상세표/요약복사
- [ ] `tools/working-capital-interest-savings-calculator/index.html`
  - [ ] 한/영 UI 텍스트
  - [ ] 입력 검증 + 오류 상태
  - [ ] KPI/상세표/요약복사

## T3. Portal/Catalog Updates
- [ ] `tools/index.html` 카드 3개 추가
- [ ] `tools/manifest.json` 항목 3개 반영 (slug/title/url/size)
- [ ] `_data/tools-list.json` 항목 3개 반영
- [ ] 신규 페이지 내 포탈 링크 `href="/"` 확인

## T4. Validation
- [ ] `python3 -m http.server` 실행
- [ ] 신규 3개 URL `curl -I` 결과 HTTP 200

## T5. Release
- [ ] `eastsea-blog/` 내부 git add/commit/push
- [ ] GitHub Pages 라이브 URL 200 확인
- [ ] 도구명 + 라이브 URL + 커밋 해시 보고
