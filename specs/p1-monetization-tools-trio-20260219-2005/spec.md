# Spec — p1-monetization-tools-trio-20260219-2005

## 1) Objective
`_data/tools-list.json` 기준 기존 slug와 중복되지 않는 신규 **비즈니스 수익 계산기 3종**을 추가 배포한다.

## 2) Scope
### In scope
1. `tools/subscription-bundle-migration-roi-calculator/index.html`
2. `tools/marketplace-buyer-membership-uplift-calculator/index.html`
3. `tools/b2b-contract-auto-renew-uplift-calculator/index.html`
4. 탐색 파일 동기화
   - `tools/index.html` 카드 3개 추가
   - `_data/tools-list.json` 엔트리 3개 추가
   - `tools/manifest.json` 재생성

### Out of scope
- 기존 도구 리팩토링
- 외부 API/서버 연동
- 공통 레이아웃 프레임워크 도입

## 3) Functional Requirements

### FR-A: Subscription Bundle Migration ROI Calculator
**목적:** 기본 요금제 사용자의 번들 플랜 이관 비중 증가가 월 순이익/ROI에 미치는 영향을 계산.

**입력**
- 활성 기본 요금제 계정 수
- 현재 번들 비중(%)
- 목표 번들 비중(%)
- 기본 요금제 월 가격 (KRW)
- 번들 요금제 월 가격 (KRW)
- 번들 매출총이익률(%)
- 번들 추가 제공 원가(계정당, KRW)
- 이관 인센티브(계정당, KRW)
- 월 고정 운영비 (KRW)
- 초기 셋업비 (KRW)
- 분석 기간 (개월)

**출력**
- 순증 번들 계정 수
- 계정당 월 순기여액
- 월 순증 순이익
- 기간 순효과(셋업비 반영)
- ROI, 회수기간, 손익분기 목표 번들 비중

---

### FR-B: Marketplace Buyer Membership Uplift Calculator
**목적:** 구매자 멤버십 채택률 확대 시 멤버십 수익 + 주문 빈도 uplift를 반영한 순효과를 계산.

**입력**
- 월 활성 구매자 수
- 현재 멤버십 가입률(%)
- 목표 멤버십 가입률(%)
- 멤버십 월 구독료 (KRW)
- 비회원 1인당 월 주문수
- 회원 주문수 uplift(%)
- 평균 주문금액 AOV (KRW)
- 주문당 공헌이익률(%)
- 멤버십 결제 수수료율(%)
- 멤버십 혜택 원가(회원당 월, KRW)
- 월 고정 운영비 (KRW)
- 초기 셋업비 (KRW)
- 분석 기간 (개월)

**출력**
- 순증 멤버 수
- 멤버십 순수익(월)
- 추가 주문 공헌이익(월)
- 월 순증 순이익
- 기간 순효과, ROI, 손익분기 목표 가입률

---

### FR-C: B2B Contract Auto-renew Uplift Calculator
**목적:** 계약 자동갱신(또는 자동갱신 캠페인) 도입으로 갱신율을 개선했을 때 보존 수익과 ROI를 계산.

**입력**
- 월 만료 계약 수
- 현재 갱신율(%)
- 목표 갱신율(%)
- 계약당 월 매출 (KRW)
- 매출총이익률(%)
- 갱신 할인율(%)
- 추가 운영비(갱신 1건당, KRW)
- 법무/운영 절감액(갱신 1건당, KRW)
- 월 고정 프로그램비 (KRW)
- 초기 셋업비 (KRW)
- 분석 기간 (개월)

**출력**
- 순증 갱신 계약 수
- 순증 보존 총이익(월)
- 월 순증 순이익
- 기간 순효과(셋업비 반영)
- ROI, 회수기간, 손익분기 목표 갱신율

## 4) UX/UI Requirements
- 각 도구는 single-file `index.html` (내장 CSS/JS)
- 반응형 레이아웃 (데스크톱 2열, 모바일 1열)
- KO/EN 토글 버튼
- 요약 textarea + copy-summary 버튼
- 포탈 복귀 링크 `href="/"`
- 유효성 에러 표시 + invalid 시 계산 차단

## 5) Non-functional Requirements
- 순수 클라이언트 계산 (외부 의존성 없음)
- NaN/Infinity/불가능 손익분기 예외 처리
- 동일 입력 시 동일 결과 재현

## 6) Acceptance Criteria
- 신규 3개 slug가 기존 목록과 중복 없음
- `tools/index.html`, `_data/tools-list.json`, `tools/manifest.json` 동기화
- 로컬 HTTP 서버에서 신규 3개 URL 모두 HTTP 200
- 지정 커밋 메시지로 commit/push 완료
- GitHub Pages 라이브 URL 200 확인(최대 2분, 1회 재시도)
- 체크포인트 `.state/p1-monetization-tools-trio/20260219-2005/` 기록 완료
