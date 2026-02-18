# Spec — P1 ROI Business Tools Trio (2026-02-19)

## Objective
신규 비즈니스 ROI 중심 웹툴 3개를 end-to-end로 제작/배포한다.

## In Scope
1. `tools/marketing-roi-calculator/index.html`
2. `tools/sales-pipeline-roi-calculator/index.html`
3. `tools/automation-payback-calculator/index.html`

그리고 아래 목록 파일 반영:
- `tools/manifest.json`
- `_data/tools-list.json`

## Mandatory Constraints
- 각 도구는 단일 HTML(인라인 CSS/JS)이어야 함
- 모바일 반응형이어야 함
- 실사용 계산/검증 로직 포함
- 모든 도구에 `Back to Portal` 링크(`href='/'`) 포함
- Git 작업은 `eastsea-blog` repo 내부에서만 수행

## Functional Requirements

### Common
- 입력값 변경 시 결과 즉시 갱신
- 숫자 validation(음수/0/분모 0/비현실 범위) 처리 및 오류 메시지 표시
- KPI 카드 최소 4개 이상 제공
- 요약 텍스트(복사 가능한 의사결정 메모) 제공

### 1) Marketing ROI Calculator
- Inputs: 광고비, 클릭수, 전환수, 객단가(AOV), 매출총이익률, 추가 고정비
- Outputs: 매출, 매출총이익, 순이익, ROI(%), ROAS, 전환당 비용(CPA), 손익분기 전환수

### 2) Sales Pipeline ROI Calculator
- Inputs: 리드 수, 단계별 전환율(MQL→SQL→제안→수주), 평균 계약금액, 세일즈 운영비
- Outputs: 예상 수주 건수, 예상 매출, 세일즈 ROI(%), 리드당 기대매출, 수주당 비용

### 3) Automation Payback Calculator
- Inputs: 현재 월 작업시간, 인건비(시간당), 자동화 후 절감률, 초기 구축비, 월 유지비, 월 추가 매출효과
- Outputs: 월 절감비용, 월 순효과, 투자 회수기간(개월), 연간 순효과, 연간 ROI(%)

## Non-Functional Requirements
- 외부 CDN/백엔드 없이 동작
- 최신 모바일/데스크톱 브라우저 지원
- 계산식이 코드 내에서 명확히 확인 가능해야 함
