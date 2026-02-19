# Spec — p1-monetization-tools-trio-20260220-0100

## 1) Objective
기존 slug와 충돌하지 않는 신규 **비즈니스 수익 계산기 3종**을 추가하고, 탐색/배포 메타데이터를 동기화한다.

## 2) Scope
### In scope
1. `tools/subscription-price-increase-retention-calculator/index.html`
2. `tools/b2b-pilot-to-contract-conversion-roi-calculator/index.html`
3. `tools/checkout-express-payment-conversion-roi-calculator/index.html`
4. discovery 동기화
   - `tools/index.html` 카드 3개 추가
   - `_data/tools-list.json` 엔트리 3개 추가
   - `tools/manifest.json` 재생성

### Out of scope
- 기존 도구 리팩토링
- 백엔드/DB/API 연동
- 공용 JS 번들링

## 3) Functional Requirements

### FR-A: Subscription Price Increase Retention Calculator
**목적:** 구독 가격 인상 시 추가 이탈을 감안한 월 순효과, ROI, 허용 가능한 최대 이탈(손익분기)을 계산한다.

**입력**
- 활성 유료 구독자 수
- 현재 월 구독 가격 (KRW)
- 인상률 (%)
- 가격 인상으로 인한 추가 이탈률 (%p)
- 매출총이익률 (%)
- 결제 수수료율 (%)
- 구독자당 월 지원비 (KRW)
- 월 운영비 (KRW)
- 초기 셋업비 (KRW)
- 분석 기간 (개월)

**출력**
- 인상 후 가격
- 유지 구독자 수
- 월 순이익 변화
- 기간 순효과
- ROI, 회수기간
- 손익분기 추가 이탈률

---

### FR-B: B2B Pilot-to-Contract Conversion ROI Calculator
**목적:** 파일럿→유료 계약 전환율 개선이 월 순이익, ROI, 손익분기 목표 전환율에 미치는 영향을 계산한다.

**입력**
- 월 파일럿 수
- 현재 파일럿 전환율 (%)
- 목표 파일럿 전환율 (%)
- 계약당 ARR (KRW)
- 매출총이익률 (%)
- 계약당 온보딩 비용 (KRW)
- 세일즈 커미션율 (ARR 대비, %)
- 계약당 월 지원비 (KRW)
- 월 프로그램 운영비 (KRW)
- 초기 셋업비 (KRW)
- 분석 기간 (개월)

**출력**
- 순증 계약 수 (월)
- 계약 1건당 월 순기여
- 월 순이익
- 기간 순효과
- ROI, 회수기간
- 손익분기 목표 전환율

---

### FR-C: Checkout Express Payment Conversion ROI Calculator
**목적:** Express 결제 도입으로 결제완료율이 개선될 때 순증 주문, 월 순이익, ROI, 손익분기 결제완료율을 계산한다.

**입력**
- 월 체크아웃 세션 수
- 현재 결제완료율 (%)
- 목표 결제완료율 (%)
- 평균 주문금액 AOV (KRW)
- 매출총이익률 (%)
- 결제 수수료율 (%)
- 결제 사기/손실률 (%)
- Express 결제 주문당 추가비용 (KRW)
- 월 운영비 (KRW)
- 초기 셋업비 (KRW)
- 분석 기간 (개월)

**출력**
- 순증 주문 수
- 주문당 순기여
- 월 순이익
- 기간 순효과
- ROI, 회수기간
- 손익분기 목표 결제완료율

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
- 체크포인트 `.state/p1-monetization-tools-trio/20260220-0100/` 기록 완료
