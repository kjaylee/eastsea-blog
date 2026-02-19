# Plan — p1-monetization-tools-trio-20260219-1005

## Execution Order (SDD/TDD)
1. Spec ✅
2. Plan (this doc)
3. Test Cases
4. Tasks
5. Implementation

## Delivery Plan

### Phase 1 — Discovery & Naming
- 기존 `tools/manifest.json` 확인으로 중복 slug 회피
- 신규 3개 도구 slug/title 확정
  - `b2b-saas-commitment-discount-uplift-calculator`
  - `ecommerce-repeat-purchase-ltv-uplift-calculator`
  - `working-capital-interest-savings-calculator`

### Phase 2 — TDD Artifacts
- `test-cases.md`에 계산 검증 케이스(정상/경계/오류) 작성
- 핵심 수식별 기준값(expected) 명시

### Phase 3 — Implementation
- 각 슬러그 디렉터리 생성 후 `index.html` 단일 파일 구현
- 공통 UI 패턴 적용
  - 입력 패널 / KPI / 상세표 / 요약복사
  - 반응형 레이아웃, 양언어(한/영) 레이블
  - 에러 처리/포맷팅

### Phase 4 — Catalog Integration
- `tools/index.html`에 카드 3개 추가
- `tools/manifest.json`에 항목 3개 추가(슬러그/타이틀/url/size)
- `_data/tools-list.json`에 제목/설명/url 추가

### Phase 5 — Verification & Release
- `python3 -m http.server` 로컬 구동
- 각 신규 URL `curl -I`로 HTTP 200 확인
- Git 작업(반드시 `eastsea-blog/` 내부)
  - `git add -A`
  - `git commit -m "feat(tools): add 3 monetization calculators"`
  - `git push origin master`
- GitHub Pages 반영 후 라이브 URL 200 확인

## Risks & Mitigations
- **중복 도구 리스크**: manifest 검색으로 사전 차단
- **공식 오류 리스크**: test-cases 수치 검증 후 구현
- **배포 지연 리스크**: push 후 잠시 대기(1~2분) 후 재시도
