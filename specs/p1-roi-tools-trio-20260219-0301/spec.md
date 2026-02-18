# Spec — P1 ROI Business Tools Trio (2026-02-19 03:01 KST)

## Objective
신규 비즈니스 ROI 중심 웹툴 3개를 단일 HTML로 제작하고 배포 가능한 상태까지 완료한다.

## Scope
1. `tools/pricing-uplift-roi-calculator/index.html`
2. `tools/retention-campaign-roi-calculator/index.html`
3. `tools/inventory-optimization-roi-calculator/index.html`

동시 반영:
- `tools/manifest.json`
- `_data/tools-list.json`

## Mandatory Constraints
- 게임 관련 폴리싱/개발 금지
- Git 작업은 `eastsea-blog` repo 내부에서만 수행
- 각 도구는 단일 HTML(inline CSS/JS), 모바일 반응형
- 각 도구에 `Back to Portal` 링크 포함 (`href='/'`)
- 실사용 계산/검증 로직 포함

## Functional Requirements

### Common
- 숫자 입력 변경 시 결과 자동 갱신
- 비정상 입력(음수, 0, 분모 0, 허용 범위 초과) 검증 및 오류 안내
- KPI 카드 4개 이상 노출
- 의사결정용 요약 텍스트 제공 및 복사 지원

### Tool A — Pricing Uplift ROI Calculator
- Inputs: 월 판매량, 현재 단가, 단위 원가, 가격 인상률, 예상 판매량 변화율, 실행비용
- Outputs: 현재/인상 후 월 총이익, 월 증분이익, 연간 증분이익, ROI(%), 회수기간(개월), 허용 가능한 최대 판매량 감소율

### Tool B — Retention Campaign ROI Calculator
- Inputs: 전체 고객 수, 캠페인 대상 고객 수, 월 이탈률, 이탈률 개선폭(pp), 고객당 월매출, 매출총이익률, 캠페인 비용, 분석 기간(개월)
- Outputs: 월 유지 고객 수, 월 보호 매출, 월 증분 총이익, 기간 총이익, 순효과, ROI(%), 회수기간

### Tool C — Inventory Optimization ROI Calculator
- Inputs: 평균 재고자산, 재고 유지비율, 재고 감소율, 연간 재고부족 리스크 비용, 연간 솔루션 비용, 초기 구축비, 할인율
- Outputs: 연간 총절감, 연간 순효과, 1년 ROI(%), 회수기간(개월), 3년 NPV, 손익분기 필요 재고감소율

## Non-Functional Requirements
- 외부 CDN/백엔드 없이 계산 가능
- 최신 모바일/데스크톱 브라우저 동작
- 계산식이 코드에서 명확히 추적 가능해야 함
