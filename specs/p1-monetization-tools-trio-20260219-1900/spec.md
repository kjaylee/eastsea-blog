# Spec — p1-monetization-tools-trio-20260219-1900

## 1) Objective
`_data/tools-list.json` 기준 기존 slug와 중복되지 않는 신규 **비즈니스 수익 계산기 3종**을 추가 배포한다.

## 2) Scope
### In scope
1. `tools/subscription-family-plan-upgrade-revenue-calculator/index.html`
2. `tools/podcast-dynamic-ad-insertion-roi-calculator/index.html`
3. `tools/creator-affiliate-commission-profit-calculator/index.html`
4. 탐색 파일 동기화
   - `tools/index.html` 카드 3개 추가
   - `_data/tools-list.json` 엔트리 3개 추가
   - `tools/manifest.json` 재생성

### Out of scope
- 기존 도구 리팩토링
- 외부 API/서버 연동
- 공통 레이아웃 프레임워크 도입

## 3) Functional Requirements

### FR-A: Subscription Family Plan Upgrade Revenue Calculator
**목적:** 개인 플랜 사용자의 패밀리 플랜 업그레이드 전환이 월 순이익/ROI에 주는 효과를 계산.

**입력**
- 활성 개인 플랜 계정 수
- 현재 패밀리 플랜 비중(%)
- 목표 패밀리 플랜 비중(%)
- 개인 플랜 월 가격 (KRW)
- 패밀리 플랜 월 가격 (KRW)
- 패밀리 플랜 매출총이익률(%)
- 업그레이드 인센티브 비용(계정당, KRW)
- 패밀리 플랜 추가 지원비(계정당, KRW)
- 운영 월 고정비 (KRW)
- 초기 셋업비 (KRW)
- 분석 기간 (개월)

**출력**
- 순증 패밀리 계정 수
- 계정당 월 순기여액
- 월 순증 순이익
- 기간 순효과(셋업비 반영)
- ROI, 회수기간, 손익분기 목표 비중

---

### FR-B: Podcast Dynamic Ad Insertion ROI Calculator
**목적:** 팟캐스트 DAI(dynamic ad insertion) 도입 시 수익 개선과 투자회수 가능성을 계산.

**입력**
- 월 다운로드 수
- 에피소드당 광고 슬롯 수
- 평균 Fill rate(%)
- eCPM (KRW)
- DAI 도입 후 Fill rate 개선폭(%p)
- DAI 도입 후 eCPM 개선폭(%)
- 광고 매출 쉐어/수수료율(%)
- 광고 운영비(월, KRW)
- 플랫폼/툴 월 비용 (KRW)
- 초기 셋업비 (KRW)
- 분석 기간 (개월)

**출력**
- 도입 전/후 월 총광고매출
- 도입 후 월 순이익
- 월 순증 순이익
- 기간 순효과(셋업비 반영)
- ROI, 회수기간, 손익분기 Fill 개선폭

---

### FR-C: Creator Affiliate Commission Profit Calculator
**목적:** 크리에이터 제휴 판매 프로그램의 순이익성과 손익분기 전환율을 계산.

**입력**
- 월 노출/클릭 유입 수
- 클릭→구매 전환율(%)
- 평균 주문금액(AOV, KRW)
- 제품 매출총이익률(%)
- 제휴 커미션율(%)
- 환불/취소율(%)
- 결제/플랫폼 수수료율(%)
- 콘텐츠 제작비(월, KRW)
- 운영 월 고정비(월, KRW)
- 초기 셋업비 (KRW)
- 분석 기간 (개월)

**출력**
- 월 주문수/순매출
- 주문당 순기여액
- 월 순이익
- 기간 순효과(셋업비 반영)
- ROI, 회수기간, 손익분기 전환율

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
- 체크포인트 `.state/p1-monetization-tools-trio/20260219-1900/` 기록 완료
