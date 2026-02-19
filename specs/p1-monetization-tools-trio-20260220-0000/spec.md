# Spec — p1-monetization-tools-trio-20260220-0000

## 1) Objective
기존 slug와 충돌하지 않는 신규 **비즈니스 수익 계산기 3종**을 추가하고, 탐색/배포 메타데이터를 동기화한다.

## 2) Scope
### In scope
1. `tools/checkout-one-click-upsell-revenue-calculator/index.html`
2. `tools/saas-seat-underutilization-recapture-calculator/index.html`
3. `tools/loyalty-points-redemption-margin-calculator/index.html`
4. discovery 동기화
   - `tools/index.html` 카드 3개 추가
   - `_data/tools-list.json` 엔트리 3개 추가
   - `tools/manifest.json` 재생성

### Out of scope
- 기존 도구 UI 리팩토링
- 백엔드/DB/API 연동
- 공용 JS 번들링 도입

## 3) Functional Requirements

### FR-A: Checkout One-click Upsell Revenue Calculator
**목적:** 체크아웃 1-click upsell 채택률 개선 시 월/기간 순이익, ROI, 손익분기 업셀률을 계산한다.

**입력**
- 월 주문 수
- 현재 업셀 채택률(%)
- 목표 업셀 채택률(%)
- 업셀 상품 평균가 (KRW)
- 업셀 원가율(%)
- 결제 수수료율(%)
- 환불률(%)
- 업셀 주문당 추가 이행비용 (KRW)
- 월 툴/운영비 (KRW)
- 초기 셋업비 (KRW)
- 분석 기간 (개월)

**출력**
- 순증 업셀 주문 수
- 업셀 1건당 순기여액
- 월 순이익
- 기간 순효과
- ROI, 회수기간
- 손익분기 목표 업셀률

---

### FR-B: SaaS Seat Underutilization Recapture Calculator
**목적:** 좌석 과할당(유휴 좌석) 회수 정책 강화 시 순증 수익과 ROI를 계산한다.

**입력**
- 계약 좌석 수
- 유휴 좌석 비율(%)
- 현재 회수율(%)
- 목표 회수율(%)
- 좌석당 월 요금 (KRW)
- 매출총이익률(%)
- 회수 좌석당 리스크 완충비 (KRW)
- 회수 좌석당 청구/운영비 (KRW)
- 월 프로그램 운영비 (KRW)
- 초기 셋업비 (KRW)
- 분석 기간 (개월)

**출력**
- 순증 회수 좌석 수
- 좌석당 월 순기여액
- 월 순이익
- 기간 순효과
- ROI, 회수기간
- 손익분기 목표 회수율

---

### FR-C: Loyalty Points Redemption Margin Calculator
**목적:** 포인트 사용률(리뎀션율) 변화가 마진에 미치는 영향을 계산해 수익성 임계점을 확인한다.

**입력**
- 활성 멤버 수
- 현재 리뎀션율(%)
- 목표 리뎀션율(%)
- 리뎀션 멤버당 월 주문 수
- 주문 평균 객단가(AOV, KRW)
- 매출총이익률(%)
- 포인트 비용률(%)
- 결제 수수료율(%)
- 반품률(%)
- 리뎀션 멤버당 월 운영비 (KRW)
- 월 고정 프로그램비 (KRW)
- 초기 셋업비 (KRW)
- 분석 기간 (개월)

**출력**
- 순증 리뎀션 멤버 수
- 멤버당 월 순기여액
- 월 순이익
- 기간 순효과
- ROI, 회수기간
- 손익분기 목표 리뎀션율

## 4) UX/UI Requirements
- 각 도구는 단일 `index.html` (내장 CSS/JS)
- 반응형 (Desktop 2열 / Mobile 1열)
- KO/EN 토글 버튼 제공
- summary textarea + copy-summary 버튼 제공
- 포털 링크는 반드시 `href="/"`
- 입력 검증 실패 시 에러 표시 + 계산 차단

## 5) Non-functional Requirements
- 외부 라이브러리 의존성 없음
- NaN/Infinity 안전 처리
- 동일 입력값에 대해 동일 결과 재현

## 6) Acceptance Criteria
- 신규 slug 3개가 `_data/tools-list.json` 및 `tools/` 기준 중복 없음
- 신규 3개 도구 구현 완료
- `tools/index.html`, `_data/tools-list.json`, `tools/manifest.json` 동기화 완료
- 로컬 HTTP 서버에서 신규 3개 URL 200 확인
- 지정 커밋 메시지로 commit/push 완료
- GitHub Pages 라이브 URL 200 확인(최대 2분 대기, 1회 재시도)
- 체크포인트 `.state/p1-monetization-tools-trio/20260220-0000/` 기록 완료
