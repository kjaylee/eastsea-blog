# Spec — p1-monetization-tools-trio-20260219-1206

## 1) Objective
기존 slug와 중복되지 않는 신규 수익화 계산기 3개를 배포한다.
- Newsletter Sponsorship Pricing Calculator
- Creator Sponsorship Rate Calculator
- YouTube Ad Revenue Estimator

모든 도구는 단일 `index.html`로 구현하며, 반응형/한영 토글/요약 복사를 제공한다.

## 2) Scope
### In Scope
1. `tools/newsletter-sponsorship-pricing-calculator/index.html`
2. `tools/creator-sponsorship-rate-calculator/index.html`
3. `tools/youtube-ad-revenue-estimator/index.html`
4. 포탈/카탈로그 반영
   - `tools/index.html`
   - `tools/manifest.json`
   - `_data/tools-list.json`
5. 로컬 HTTP 검증 + 라이브 URL 200 확인

### Out of Scope
- 외부 API 연동
- 계정/DB 저장
- 기존 도구 리팩터링

## 3) Functional Requirements

### FR-1 Newsletter Sponsorship Pricing Calculator
**목적:** 뉴스레터 광고 단가(권장 고정가)를 데이터 기반으로 산출.

**Inputs**
- 구독자 수
- 평균 오픈율(%)
- 클릭률 CTR(%)
- 발송당 스폰서 링크 수
- 기준 CPM (오픈 1,000회당)
- 기준 CPC (클릭당)
- 배치 위치 가중치 (상단/중단/하단)
- 제작/운영비 (회당)

**Outputs**
- 예상 오픈 수
- 예상 클릭 수
- CPM 기반 단가
- CPC 기반 단가
- 비용 반영 순단가
- 권장 스폰서 고정가(보수/기준/공격)

**Formula**
- `opens = subscribers * openRate`
- `clicks = opens * ctr`
- `cpmPrice = (opens / 1000) * cpm * placementWeight`
- `cpcPrice = clicks * cpc * placementWeight`
- `basePrice = (cpmPrice + cpcPrice) / 2`
- `netPrice = max(0, basePrice - productionCost)`

### FR-2 Creator Sponsorship Rate Calculator
**목적:** 크리에이터 협찬/브랜디드 콘텐츠 캠페인 견적을 산출.

**Inputs**
- 팔로워 수
- 게시물당 평균 조회수
- 평균 참여율(%)
- 캠페인 게시물 수
- 기본 CPM
- 참여 보너스 단가(CPE)
- 제작 원가(건당)
- 에이전시/플랫폼 수수료율(%)
- 사용권/독점 멀티플라이어

**Outputs**
- 총 예상 조회수
- 총 예상 참여수
- 조회 기반 금액
- 참여 기반 금액
- 총 제안가(수수료 포함)
- 크리에이터 실수령액
- 유효 CPM

**Formula**
- `totalViews = avgViewsPerPost * posts`
- `engagements = totalViews * engagementRate`
- `viewValue = (totalViews/1000) * baseCpm`
- `engagementValue = engagements * cpe`
- `grossBeforeFee = (viewValue + engagementValue + productionCost*posts) * multiplier`
- `proposal = grossBeforeFee / (1 - feeRate)`
- `takeHome = proposal * (1 - feeRate)`

### FR-3 YouTube Ad Revenue Estimator
**목적:** 롱폼/쇼츠 혼합 채널의 월 광고 수익 범위를 추정.

**Inputs**
- 월 롱폼 조회수
- 롱폼 수익화 재생 비율(%)
- 롱폼 RPM
- 월 쇼츠 조회수
- 쇼츠 RPM
- 지역/시즌 가중치
- 월 고정 제작비

**Outputs**
- 롱폼 수익
- 쇼츠 수익
- 총 광고 매출
- 제작비 차감 순이익
- 손익분기 롱폼 조회수
- 민감도 시나리오(보수/기준/낙관)

**Formula**
- `longMonetizedViews = longViews * monetizedRate`
- `longRevenue = (longMonetizedViews/1000) * longRpm * seasonality`
- `shortRevenue = (shortViews/1000) * shortRpm * seasonality`
- `gross = longRevenue + shortRevenue`
- `net = gross - fixedCost`

## 4) UX/UI Requirements
- 단일 파일(`index.html`) + 외부 라이브러리 없음
- 모바일 우선 반응형(모바일 1열 / 데스크탑 2열)
- 실시간 재계산(`input` 이벤트)
- 한/영 토글 버튼 제공
- 요약 텍스트 + copy-summary 버튼 제공
- 포탈 복귀 링크는 반드시 `href="/"`
- 오류 입력 시 에러 메시지 표시

## 5) Acceptance Criteria
1. 3개 slug가 기존 manifest에 없음이 검증됨.
2. 각 도구가 `/tools/{slug}/index.html` 단일 파일로 동작.
3. 각 도구에 반응형/한영 토글/요약 복사 구현.
4. `tools/index.html`, `tools/manifest.json`, `_data/tools-list.json` 반영.
5. 로컬 HTTP + `curl` 200 확인.
6. git commit/push 완료.
7. GitHub Pages 라이브 URL 3개 200 확인.
8. 체크포인트 파일이 `.state/p1-monetization-tools-trio/20260219-1206/`에 저장.
