# Spec — p1-monetization-tools-trio-20260220-0300

## 1) Objective
기존 slug와 중복되지 않는 신규 **비즈니스 수익 계산기 3종**을 추가한다.

- Affiliate Tiered Commission ROI Calculator
- Marketplace Take-rate Optimization Calculator
- Annual Prepay Discount Cashflow Calculator

각 도구는 단일 `index.html`로 제공하며, **반응형 + KO/EN 토글 + copy-summary + 포털 링크(`href="/"`)**를 충족한다.

## 2) Scope
### In Scope
1. `tools/affiliate-tiered-commission-roi-calculator/index.html`
2. `tools/marketplace-take-rate-optimization-calculator/index.html`
3. `tools/annual-prepay-discount-cashflow-calculator/index.html`
4. 카탈로그 동기화
   - `tools/index.html` 카드 추가
   - `_data/tools-list.json` 엔트리 추가
   - `tools/manifest.json` 재생성 (count 갱신)
5. 로컬 HTTP 200 확인
6. Git push 및 GitHub Pages 라이브 200 확인
7. 체크포인트 기록
   - `.state/p1-monetization-tools-trio/20260220-0300/`

### Out of Scope
- 백엔드/API 연동
- 기존 도구 리팩토링
- 외부 라이브러리 추가

## 3) Functional Requirements

### FR-1 Affiliate Tiered Commission ROI Calculator
**목적:** 단일 커미션 구조에서 tiered 커미션 구조로 전환 시 전환율 상승과 커미션 증가를 함께 반영해 순이익 개선 여부를 계산한다.

**Inputs**
- 월 제휴 유입 클릭 수
- 현재 전환율 (%)
- 목표 전환율 (%)
- 평균 주문금액 (KRW)
- 매출총이익률 (%)
- 현재 커미션율 (%)
- 티어1 커미션율 (%)
- 티어1 주문 비중 (%)
- 티어2 커미션율 (%)
- 월 운영비 (KRW)
- 초기 전환비 (KRW)
- 분석 기간 (개월)

**Outputs**
- 현재 월 순이익
- Tiered 월 순이익
- 월 순효과
- 분석기간 순효과
- ROI
- 회수기간
- 손익분기 목표 전환율

### FR-2 Marketplace Take-rate Optimization Calculator
**목적:** 플랫폼 take-rate와 인센티브 정책 조정이 GMV 변화와 결합될 때 순이익/ROI를 계산한다.

**Inputs**
- 현재 월 GMV (KRW)
- 현재 take-rate (%)
- 목표 take-rate (%)
- 예상 GMV 변화율 (%)
- 결제/정산 비용률 (%)
- 현재 판매자 인센티브율 (%)
- 목표 판매자 인센티브율 (%)
- 월 운영비 (KRW)
- 초기 시행비 (KRW)
- 분석 기간 (개월)

**Outputs**
- 현재 월 순기여
- 개선 후 월 순기여
- 월 순효과
- 분석기간 순효과
- ROI
- 회수기간
- 손익분기 목표 take-rate

### FR-3 Annual Prepay Discount Cashflow Calculator
**목적:** 월 과금 고객을 연간 선결제로 전환할 때 할인과 선입금, 유지율 개선을 반영한 현금흐름/ROI를 계산한다.

**Inputs**
- 대상 월 구독자 수
- 월 구독 가격 (KRW)
- 연간 선결제 할인율 (%)
- 선결제 전환율 (%)
- 현재 월 이탈률 (%)
- 선결제 시 이탈률 개선폭 (%p)
- 매출총이익률 (%)
- 전환 고객당 월 결제실패 손실 절감액 (KRW)
- 월 운영비 (KRW)
- 초기 전환비 (KRW)
- 분석 기간 (개월)

**Outputs**
- 현재 시나리오 기간 현금유입
- 선결제 시나리오 기간 현금유입
- 월 평균 순효과
- 분석기간 순효과
- ROI
- 회수기간
- 손익분기 선결제 전환율

## 4) UX/UI Requirements
- 도구별 단일 HTML
- 데스크톱 2열 / 모바일 1열 반응형
- KO/EN 토글 버튼
- Copy Summary 버튼 + 요약 textarea
- 포털 링크 `href="/"`
- 유효성 오류 시 계산 차단 + 에러 메시지

## 5) Non-functional Requirements
- 정적 브라우저 실행 (외부 라이브러리 미사용)
- `Intl.NumberFormat` 기반 숫자/통화 포맷
- NaN/Infinity 안전 처리

## 6) Acceptance Criteria
1. 신규 3개 slug가 기존 `_data/tools-list.json`/`tools/`와 중복되지 않는다.
2. 신규 3개 도구가 반응형 + KO/EN 토글 + copy-summary + `href="/"`를 충족한다.
3. `tools/index.html`, `_data/tools-list.json`, `tools/manifest.json`에 3개 도구가 반영된다.
4. 로컬 HTTP 서버에서 신규 3개 URL이 200이다.
5. 지정 커밋 메시지로 commit/push 성공한다.
6. GitHub Pages 라이브 URL 3개가 200이다(최대 2분, 1회 재시도).
7. 체크포인트 파일이 `.state/p1-monetization-tools-trio/20260220-0300/`에 기록된다.
