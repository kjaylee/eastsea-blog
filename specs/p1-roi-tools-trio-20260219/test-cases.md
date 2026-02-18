# Test Cases — P1 ROI Business Tools Trio (2026-02-19)

## A. 구조/요건
- [ ] 3개 툴 경로에 `index.html` 존재
- [ ] 각 파일에 `<title>`, `meta description`, `href='/'` Back to Portal 링크 존재
- [ ] 모바일 폭(360px)에서 가로 스크롤 없이 주요 KPI 카드 확인 가능

## B. 기능 검증

### B1. Marketing ROI Calculator
1. 입력: 광고비 1,500,000 / 클릭 12,000 / 전환 360 / AOV 85,000 / 마진 58 / 고정비 300,000
   - 기대: 매출 30,600,000, 순이익 > 0, ROI/ROAS 계산 표시
2. 입력: 클릭 0 또는 전환 > 클릭
   - 기대: validation 오류 노출, 잘못된 KPI 출력 차단

### B2. Sales Pipeline ROI Calculator
1. 입력: 리드 2,000 / 32% / 45% / 55% / 38% / 평균계약 4,800,000 / 운영비 24,000,000
   - 기대: 예상 수주 건수, 매출, ROI, 수주당 비용 계산
2. 입력: 전환율 100 초과 또는 음수
   - 기대: validation 오류

### B3. Automation Payback Calculator
1. 입력: 월 작업시간 420 / 시급 38,000 / 절감률 52 / 구축비 28,000,000 / 유지비 1,200,000 / 추가매출 3,600,000
   - 기대: 월 절감비용, 월 순효과, 회수기간(개월), 연간 ROI 계산
2. 입력: 절감률 0 또는 100 초과
   - 기대: validation 오류

## C. 통합/배포
- [ ] `tools/manifest.json`에 신규 3개 slug 포함
- [ ] `_data/tools-list.json`에 신규 3개 URL 포함
- [ ] 배포 URL 3개 HTTP 200 확인
