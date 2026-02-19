# Spec — p1-monetization-tools-trio-20260219-2200

## 1) Objective
`_data/tools-list.json` 기준 기존 slug와 중복되지 않는 신규 **비즈니스 수익 계산기 3종**을 추가 배포한다.

## 2) Scope
### In scope
1. `tools/freemium-paywall-threshold-roi-calculator/index.html`
2. `tools/saas-trial-to-paid-acceleration-calculator/index.html`
3. `tools/in-app-purchase-conversion-uplift-calculator/index.html`
4. 탐색 파일 동기화
   - `tools/index.html` 카드 3개 추가
   - `_data/tools-list.json` 엔트리 3개 추가
   - `tools/manifest.json` 재생성

### Out of scope
- 기존 도구 리팩토링
- 백엔드/API 연동
- 공통 프레임워크 도입

## 3) Functional Requirements

### FR-A: Freemium Paywall Threshold ROI Calculator
**목적:** 페이월 노출 임계점 조정으로 유료 전환 모수를 확대했을 때 월 순이익과 ROI를 계산한다.

**입력**
- 월 활성 무료 사용자 수
- 현재 페이월 노출률(%)
- 목표 페이월 노출률(%)
- 노출 대비 유료 전환율(%)
- 유료 플랜 월 ARPPU (KRW)
- 매출총이익률(%)
- 결제/플랫폼 수수료율(%)
- 신규 유료 사용자당 지원 비용 (KRW)
- 월 고정 운영비 (KRW)
- 초기 셋업비 (KRW)
- 분석 기간 (개월)

**출력**
- 순증 유료 사용자 수
- 유료 1인당 월 순기여액
- 월 순증 순이익
- 기간 순효과(셋업비 반영)
- ROI, 회수기간, 손익분기 목표 노출률

---

### FR-B: SaaS Trial-to-Paid Acceleration Calculator
**목적:** 온보딩/세일즈 어시스트를 통한 trial→paid 전환율 개선 시 수익성과 손익분기 전환율을 계산한다.

**입력**
- 월 trial 가입 수
- 현재 trial→paid 전환율(%)
- 목표 trial→paid 전환율(%)
- 유료 플랜 월 구독료 (KRW)
- 매출총이익률(%)
- 첫 달 프로모션 할인율(%)
- trial 1건당 온보딩 비용 (KRW)
- 전환 고객 1인당 세일즈/CS 비용 (KRW)
- 월 고정 프로그램비 (KRW)
- 초기 셋업비 (KRW)
- 분석 기간 (개월)

**출력**
- 순증 유료 계정 수
- 유료 계정 1건당 순기여액
- 월 순증 순이익
- 기간 순효과, ROI, 회수기간
- 손익분기 목표 전환율

---

### FR-C: In-app Purchase Conversion Uplift Calculator
**목적:** 인앱결제 전환율 개선 시 순증 payer 기반의 월 순이익 및 ROI를 계산한다.

**입력**
- 월 활성 사용자(MAU)
- 현재 결제 전환율(%)
- 목표 결제 전환율(%)
- payer 1인당 월 결제 횟수
- 1회 평균 결제금액 (KRW)
- 플랫폼 수수료율(%)
- 환불률(%)
- 콘텐츠/리워드 원가율(%)
- payer 1인당 라이브옵스 비용 (KRW)
- 월 고정 운영비 (KRW)
- 초기 셋업비 (KRW)
- 분석 기간 (개월)

**출력**
- 순증 payer 수
- payer 1인당 월 순기여액
- 월 순증 순이익
- 기간 순효과, ROI, 회수기간
- 손익분기 목표 결제 전환율

## 4) UX/UI Requirements
- 각 도구는 single-file `index.html` (내장 CSS/JS)
- 반응형 레이아웃 (데스크톱 2열, 모바일 1열)
- KO/EN 토글 버튼
- summary textarea + copy-summary 버튼
- 포털 링크 `href="/"`
- 유효성 에러 표시 + invalid 시 계산 차단

## 5) Non-functional Requirements
- 순수 클라이언트 계산, 외부 의존성 없음
- NaN/Infinity 및 손익분기 불가 케이스 처리
- 동일 입력 재현성 보장

## 6) Acceptance Criteria
- 신규 3개 slug가 기존 목록과 중복 없음
- `tools/index.html`, `_data/tools-list.json`, `tools/manifest.json` 동기화
- 로컬 HTTP 서버에서 신규 3개 URL 모두 HTTP 200
- 지정 커밋 메시지로 commit/push 완료
- GitHub Pages 라이브 URL HTTP 200 확인(최대 2분, 1회 재시도)
- 체크포인트 `.state/p1-monetization-tools-trio/20260219-2200/` 기록 완료
