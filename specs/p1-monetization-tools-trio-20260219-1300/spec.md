# Spec — p1-monetization-tools-trio-20260219-1300

## 1) Objective
기존 slug와 중복되지 않는 신규 수익화/비즈니스 계산기 3개를 배포한다.
- Freemium to Paid Conversion Revenue Calculator
- Creator Membership Tier Revenue Calculator
- Wholesale vs DTC Margin Calculator

모든 도구는 단일 `index.html`로 구현하며, 반응형 레이아웃 + 한/영 토글 + copy-summary를 제공한다.

## 2) Scope
### In Scope
1. `tools/freemium-to-paid-conversion-revenue-calculator/index.html`
2. `tools/creator-membership-tier-revenue-calculator/index.html`
3. `tools/wholesale-vs-dtc-margin-calculator/index.html`
4. 카탈로그/인덱스 반영
   - `tools/index.html`
   - `tools/manifest.json`
   - `_data/tools-list.json`
5. 로컬 HTTP 검증 + GitHub Pages 라이브 200 확인
6. 체크포인트 기록
   - `.state/p1-monetization-tools-trio/20260219-1300/`

### Out of Scope
- 외부 API, 서버 연동, DB 저장
- 기존 도구 구조 리팩터링
- 디자인 시스템 전면 개편

## 3) Functional Requirements

### FR-1 Freemium to Paid Conversion Revenue Calculator
**목적:** 무료 사용자 기반에서 유료 전환율 개선이 월 순이익/누적 ROI에 미치는 효과를 계산한다.

**Inputs**
- 월 활성 사용자 수
- 현재 유료 전환율(%)
- 목표 유료 전환율(%)
- 유료 사용자 월 ARPU (KRW)
- 유료 매출 공헌마진율(%)
- 유료 사용자당 월 추가 서비스비 (KRW)
- 월 운영/실험비 (KRW)
- 초기 도입비 (KRW)
- 분석 기간 (개월)

**Outputs**
- 추가 유료 사용자 수(월)
- 추가 매출(월)
- 월 순효과
- 분석기간 누적 순효과
- ROI
- 회수기간
- 손익분기 목표 전환율

**Core Formula**
- `basePaid = activeUsers * baseRate`
- `targetPaid = activeUsers * targetRate`
- `incrementalPaid = targetPaid - basePaid`
- `incrementalRevenue = incrementalPaid * arpu`
- `incrementalContribution = incrementalRevenue * marginRate - incrementalPaid * serviceCostPerPaid`
- `monthlyNet = incrementalContribution - monthlyProgramCost`
- `termNet = monthlyNet * months - setupCost`

### FR-2 Creator Membership Tier Revenue Calculator
**목적:** 크리에이터 멤버십(티어 믹스) 모델의 월/누적 수익성과 회수 시점을 시뮬레이션한다.

**Inputs**
- 현재 유료 멤버 수
- 월 신규 멤버 유입 수
- 월 이탈률(%)
- Basic/Pro/VIP 가격 (KRW)
- Basic/Pro/VIP 티어 비중(%)
- 플랫폼 수수료율(%)
- 멤버당 월 운영비 (KRW)
- 월 고정 운영비 (KRW)
- 초기 세팅비 (KRW)
- 분석 기간 (개월)

**Outputs**
- 가중 평균 멤버십 단가
- 1개월차/최종 활성 멤버 수
- 최종 월 순이익
- 누적 순효과
- ROI
- 추정 회수 월
- 월 손익분기 신규 멤버 수

**Core Formula**
- `weightedPrice = Σ(price_i * mix_i)`
- `members_m = members_(m-1) * (1 - churn) + newMembers`
- `net_m = members_m * weightedPrice * (1 - platformFee) - members_m * variableCost - fixedCost`
- `termNet = Σ(net_m) - setupCost`

### FR-3 Wholesale vs DTC Margin Calculator
**목적:** 도매/직접판매(DTC) 채널 믹스 변경 시 공헌이익 변화와 손익분기 DTC 비중을 계산한다.

**Inputs**
- 월 판매 수량
- DTC 판매가 (KRW/개)
- 도매 할인율 (% of DTC price)
- 현재 DTC 비중(%)
- 목표 DTC 비중(%)
- 단위 원가 COGS (KRW)
- DTC 단위 변동비 (KRW)
- 도매 단위 변동비 (KRW)
- 믹스 전환 추가 월 운영비 (KRW)
- 초기 전환 비용 (KRW)
- 분석 기간 (개월)

**Outputs**
- 현재 채널 월 이익
- 목표 채널 월 이익
- 월 순이익 증감
- 분석기간 누적 순효과
- ROI
- 회수기간
- 손익분기 DTC 비중

**Core Formula**
- `wholesalePrice = dtcPrice * (1 - wholesaleDiscount)`
- `profitPerDTC = dtcPrice - cogs - dtcVarCost`
- `profitPerWholesale = wholesalePrice - cogs - wholesaleVarCost`
- `monthlyProfit = units*(dtcShare*profitPerDTC + (1-dtcShare)*profitPerWholesale)`
- `delta = targetMonthlyProfit - baseMonthlyProfit - extraMonthlyCost`

## 4) UX/UI Requirements
- 단일 파일(`index.html`) + 외부 라이브러리 없음
- 모바일 우선 반응형 (모바일 1열 / 데스크탑 2열)
- `href="/"` 포탈 링크 필수
- 실시간 재계산 (`input`/`change`)
- KO/EN 토글 버튼 제공
- Copy Summary 버튼으로 결과 텍스트 복사
- 유효성 오류 메시지 표시

## 5) Non-functional Requirements
- 정적 페이지에서 즉시 동작(브라우저-only)
- 숫자 포맷 안정성 (`Intl.NumberFormat`)
- NaN/Infinity 안전 처리

## 6) Acceptance Criteria
1. 3개 신규 slug가 기존 manifest에 없고 새 manifest에 추가된다.
2. 3개 도구가 단일 `index.html`로 동작하며 반응형/한영 토글/copy-summary를 제공한다.
3. `tools/index.html`, `tools/manifest.json`, `_data/tools-list.json`에 3개 모두 반영된다.
4. 로컬 `python3 -m http.server` + `curl`로 200 검증 완료.
5. 지정 커밋 메시지로 push 성공 후 라이브 URL 200 확인.
6. 체크포인트 파일이 `.state/p1-monetization-tools-trio/20260219-1300/`에 남는다.
