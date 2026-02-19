# Spec — p1-monetization-tools-trio-20260219-1801

## 1) Objective
`tools/manifest.json` 기준 기존 slug와 중복되지 않는 **신규 수익화 계산기 3개**를 배포한다.

## 2) Scope
### In scope
1. `tools/subscription-add-on-attach-rate-revenue-calculator/index.html`
2. `tools/paywall-intro-offer-roi-calculator/index.html`
3. `tools/coupon-leakage-profit-impact-calculator/index.html`
4. 탐색 파일 동기화
   - `tools/index.html` 카드 추가
   - `tools/manifest.json` 재생성
   - `_data/tools-list.json` 엔트리 추가

### Out of scope
- 기존 도구 리팩토링
- 백엔드/API 연동
- 디자인 시스템 개편

## 3) Functional Requirements

### FR-A: Subscription Add-on Attach Rate Revenue Calculator
**목적:** 구독 기반 서비스에서 Add-on attach rate 개선이 월 순이익과 ROI에 미치는 효과를 계산.

**입력**
- 활성 구독자 수
- 현재 attach rate (%)
- 목표 attach rate (%)
- Add-on 월 가격 (KRW)
- Add-on 매출총이익률 (%)
- 결제실패/환불 손실률 (%)
- Add-on 사용자당 월 지원비 (KRW)
- 운영 월 고정비 (KRW)
- 초기 셋업비 (KRW)
- 분석 기간 (개월)

**출력**
- 현재/목표 Add-on 사용자 수
- 순증 Add-on 사용자 수
- 사용자 1인당 순기여액
- 월 순증 순이익
- 기간 순효과(셋업비 반영)
- ROI, 회수기간, 손익분기 목표 attach rate

---

### FR-B: Paywall Intro Offer ROI Calculator
**목적:** paywall intro offer 전환 전략의 순증 수익성과 회수 가능성을 계산.

**입력**
- 월 paywall 방문자 수
- 기존 유료 전환율 (%)
- intro offer 적용 전환율 (%)
- Intro 1개월 가격 (KRW)
- 2개월차 정가 (KRW)
- 2개월차 유지율 (%)
- 결제수수료율 (%)
- 환불률 (%)
- 신규 유료 1인당 서비스비 (2개월 기준, KRW)
- 운영 월 고정비 (KRW)
- 초기 셋업비 (KRW)
- 분석 기간 (개월)

**출력**
- 월 순증 유료 구독자 수
- 순증 구독자당 2개월 순기여액
- 월 순증 순이익
- 기간 순효과(셋업비 반영)
- ROI, 회수기간, 손익분기 intro 전환율

---

### FR-C: Coupon Leakage Profit Impact Calculator
**목적:** 쿠폰 유출(무효/남용) 통제 시나리오의 손실 회수 효과를 계산.

**입력**
- 월 쿠폰 적용 주문수
- 주문당 평균 매출 (AOV, KRW)
- 매출총이익률 (%)
- 정상 쿠폰 할인율 (%)
- 유출 주문 비중 (%)
- 유출 주문 추가 할인 손실률 (%p)
- 제휴/플랫폼 수수료율 (%)
- 유출 주문 사기·차지백 손실률 (%)
- 유출 감소율 (%)
- 통제 솔루션 월 비용 (KRW)
- 초기 셋업비 (KRW)
- 분석 기간 (개월)

**출력**
- 현재/개선 유출 주문수
- 통제 전/후 월 순이익
- 월 순증 순이익
- 기간 순효과(셋업비 반영)
- ROI, 회수기간, 손익분기 유출 감소율

## 4) UX/UI Requirements
- 각 도구는 single-file `index.html` (내장 CSS/JS)
- 반응형 레이아웃 (데스크톱 2열, 모바일 1열)
- KO/EN 토글 버튼
- 요약 textarea + copy-summary 버튼
- 포탈 복귀 링크 `href="/"`
- 유효성 에러 표시 + invalid 시 계산 차단

## 5) Non-functional Requirements
- 순수 클라이언트 계산(외부 의존성 없음)
- NaN, divide-by-zero, 불가능 손익분기 처리
- 계산 결과는 재현 가능해야 함

## 6) Acceptance Criteria
- 신규 3개 slug가 manifest 중복 없이 생성됨
- `tools/index.html`, `_data/tools-list.json`, `tools/manifest.json` 동기화됨
- 로컬 HTTP 서빙 + `curl` 3개 URL이 HTTP 200
- 지정 커밋 메시지로 add/commit/push 완료
- GitHub Pages 실 URL 200 확인 (최대 2분 대기)
- 체크포인트 `.state/p1-monetization-tools-trio/20260219-1801/`에 단계별 산출 저장
