# Test Cases — P1 ROI Business Tools Trio (2026-02-19 03:01 KST)

## A. 구조/요건
- [ ] 3개 슬러그 경로에 `index.html` 존재
- [ ] 각 도구에 `<title>`, `meta description`, `href='/'` Back to Portal 링크 존재
- [ ] 모바일 폭(360px)에서 단일 컬럼으로 입력/결과 사용 가능

## B. 계산/검증

### B1. Pricing Uplift ROI Calculator
1. 기본값 입력 시 월 증분이익/연간 증분이익/ROI가 계산된다.
2. 단위 원가 >= 인상 후 단가인 경우 validation 오류가 표시된다.

### B2. Retention Campaign ROI Calculator
1. 기본값 입력 시 유지 고객 수, 기간 총이익, ROI, 회수기간이 계산된다.
2. 개선폭(pp) > 현재 이탈률 또는 대상 고객 수 > 전체 고객 수일 때 validation 오류가 표시된다.

### B3. Inventory Optimization ROI Calculator
1. 기본값 입력 시 연간 순효과, 1년 ROI, 3년 NPV가 계산된다.
2. 유지비율 0 이하/100 초과, 재고감소율 0 이하, 할인율 음수 등 비정상 입력 시 validation 오류가 표시된다.

## C. 통합/배포
- [ ] `tools/manifest.json`에 신규 3개 slug 포함
- [ ] `_data/tools-list.json`에 신규 3개 URL 포함
- [ ] 배포 URL 3개 HTTP 200 확인
