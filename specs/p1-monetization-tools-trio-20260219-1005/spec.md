# Spec — p1-monetization-tools-trio-20260219-1005

## 1) Objective
새로운 수익화/비즈니스 계산기 3종을 production-ready 품질로 출시한다.
- B2B SaaS 1종
- E-commerce 1종
- Finance 1종

모든 도구는 **단일 `index.html`**, **모바일 반응형**, **한글+영문 설명**, **실시간 계산 로직**을 포함한다.

## 2) Scope
### In scope
1. `tools/b2b-saas-commitment-discount-uplift-calculator/index.html`
2. `tools/ecommerce-repeat-purchase-ltv-uplift-calculator/index.html`
3. `tools/working-capital-interest-savings-calculator/index.html`
4. 발견성/카탈로그 반영
   - `tools/index.html` 카드 추가
   - `tools/manifest.json` 업데이트
   - `_data/tools-list.json` 업데이트

### Out of scope
- 기존 도구 리팩터링
- 백엔드/API 연동
- 사용자 계정/서버 저장 기능

## 3) Functional Requirements

### FR-A: B2B SaaS Commitment Discount Uplift Calculator
**목적:** 월구독 고객을 연간 선결제(할인)로 전환했을 때 매출 실현/총이익/현금선유입 영향을 계산.

**Inputs**
- 활성 고객 수
- 월 구독 단가
- 연간 선결제 전환율(%)
- 연간 선결제 할인율(%)
- 월 이탈률(%)
- 선결제 고객 이탈률 개선폭(%p)
- 결제 실패율(%)
- 선결제 결제실패 개선폭(%p)
- 매출총이익률(%)

**Outputs**
- 기준(전환 전) 연간 실현 매출
- 전환 시나리오 연간 실현 매출
- 전환 시나리오 연간 총이익
- 연간 총이익 증감
- 연간 선결제 유입 현금
- 손익분기 전환율(%)

**Formula notes**
- 연간 기준 이탈률: `1 - (1 - monthlyChurn)^12`
- 선결제군 이탈률: `max(0, baselineAnnualChurn - churnImprovement)`
- 선결제 유효 결제실패율: `max(0, paymentFailure - failureImprovement)`
- 실현 매출: `계약매출 × (1 - 이탈률) × (1 - 결제실패율)`
- 손익분기 전환율: 0~100% 구간 스캔(0.1% 단위)

---

### FR-B: E-commerce Repeat Purchase LTV Uplift Calculator
**목적:** 재구매율 개선 시 코호트 기준 LTV/공헌이익 uplift와 ROI를 계산.

**Inputs**
- 월 신규 고객 수
- 첫 구매 객단가(AOV)
- 재구매 주문 객단가 비율(첫 구매 대비 %)
- 기본 재구매율(%)
- 목표 재구매율(%)
- 재구매 고객당 추가 주문 수(연간)
- 환불률(%)
- 매출총이익률(%)
- 고객당 CRM 실행비
- 재구매 고객당 로열티 비용

**Outputs**
- 기준 시나리오 코호트 매출/공헌이익
- 목표 시나리오 코호트 매출/공헌이익
- 순증 공헌이익
- 프로그램 총비용
- 순효과(순증 공헌이익 - 프로그램 비용)
- ROI(%)
- 손익분기 목표 재구매율(%)

**Formula notes**
- 재구매 객단가: `firstAOV × repeatAOVRatio`
- 반복주문 수: `newCustomers × repeatRate × extraOrdersPerRepeater`
- 공헌이익: `매출 × (1 - 환불률) × 매출총이익률`
- 손익분기 재구매율: 프로그램 비용을 상쇄하는 최소 재구매율

---

### FR-C: Working Capital Interest Savings Calculator
**목적:** 매출채권 회수일(DSO) 단축 시 유동성 개선 및 금융비용 절감 효과를 계산.

**Inputs**
- 연간 외상 매출(credit sales)
- 현재 DSO(일)
- 목표 DSO(일)
- 단기차입 금리(연 %)
- 현재 대손율(%)
- 대손율 개선폭(%p)
- 도입 일회성 비용
- 연간 운영 비용

**Outputs**
- 확보 운전자본(회수 현금)
- 연간 이자 절감액
- 연간 대손 절감액
- 연간 총편익
- 1년 순효과
- 1년 ROI(%)
- 회수기간(개월)
- 손익분기 DSO 단축 일수

**Formula notes**
- 확보 운전자본: `(creditSales / 365) × (currentDSO - targetDSO)`
- 이자절감: `확보 운전자본 × borrowingRate`
- 대손절감: `creditSales × min(currentBadDebt, badDebtImprovement)`
- 순효과(1년): `총편익 - (일회성 + 연간운영비)`

## 4) UX/UI Requirements
- 모바일 우선(<=900px 1열, 이상 2열)
- 실시간 재계산(`input` + `change`)
- 오류 입력 시 경고 박스 표시
- KPI 카드 + 상세 표 + 요약 텍스트(복사)
- 도구 포탈 이동 링크는 반드시 `href="/"`

## 5) Non-Functional Requirements
- 외부 라이브러리 의존 없음 (pure HTML/CSS/JS)
- 숫자 검증 및 divide-by-zero 방어
- 결과값 로케일 포맷(KRW/%, 숫자)

## 6) Acceptance Criteria
- 신규 도구 3개 슬러그가 기존 manifest에 없음
- 3개 도구 페이지가 로컬 서버에서 HTTP 200
- `tools/index.html`, `tools/manifest.json`, `_data/tools-list.json`에 3개 모두 반영
- Git 커밋/푸시 완료
- GitHub Pages 라이브 URL 200 확인
- 체크포인트 저장: `.state/p1-monetization-tools-trio/20260219-1005/`
