# Spec — p1-monetization-tools-trio-20260219-1100

## 1) Objective
P1 monetization wave로 **중복 없는 신규 계산기 3종**을 출시한다.

- SaaS: **Proration Revenue Leakage**
- E-commerce: **Coupon Stack Margin Guardrail**
- Fintech: **Interchange vs Reward Spend**

모든 도구는 single `index.html`, 반응형, 한/영 지원, 요약 복사(copy-summary)를 제공한다.

## 2) Scope
### In Scope
1. `tools/saas-proration-revenue-leakage-calculator/index.html`
2. `tools/ecommerce-coupon-stack-margin-guardrail-calculator/index.html`
3. `tools/fintech-interchange-vs-reward-spend-calculator/index.html`
4. 카탈로그 반영
   - `tools/index.html`
   - `tools/manifest.json`
   - `_data/tools-list.json`

### Out of Scope
- 백엔드/DB 연동
- 회원 기능/저장 동기화
- 기존 툴 리팩터링

## 3) Functional Requirements

### FR-A: SaaS Proration Revenue Leakage Calculator
**Problem**: 업그레이드 시 잔여기간 크레딧을 과하게 부여하면 매출 누수가 발생한다.

**Inputs**
- Active Accounts (월)
- Monthly Upgrade Rate (%)
- Avg Days Remaining at Upgrade
- Old Plan MRR
- Current Credit Policy (% of unused value)
- Target Credit Policy (% of unused value)
- Value Utilization (% of credited value actually consumed)
- Annual Platform Cost

**Outputs**
- Monthly Upgrades
- Current Leakage / month
- Target Leakage / month
- Recovered Revenue / year
- Net Annual Impact
- ROI (%)
- Break-even Target Credit Policy (%)

**Core Logic**
- `upgrades = activeAccounts × upgradeRate`
- `unusedValuePerUpgrade = oldPlanMrr × (daysRemaining / 30)`
- `currentCredit = unusedValuePerUpgrade × currentCreditPolicy`
- `targetCredit = unusedValuePerUpgrade × targetCreditPolicy`
- `economicValue = currentCredit × utilizationRate`
- `currentLeakage = max(0, currentCredit - economicValue) × upgrades`
- `targetLeakage = max(0, targetCredit - targetCredit×utilizationRate) × upgrades`
- `recoveredAnnual = (currentLeakage - targetLeakage) × 12`
- `netAnnual = recoveredAnnual - annualPlatformCost`

---

### FR-B: E-commerce Coupon Stack Margin Guardrail Calculator
**Problem**: 쿠폰 중복 적용으로 주문당 마진이 훼손된다.

**Inputs**
- Monthly Orders
- AOV
- Gross Margin (%)
- Base Discount (%)
- Stacked Orders Share (%)
- Extra Stack Discount (%p)
- Payment Fee (%)
- Fulfillment Cost per Order
- Guardrail Effectiveness (%)
- Annual Guardrail Cost

**Outputs**
- Current Monthly Contribution Profit
- Monthly Stack Leakage
- Monthly Recovered Profit
- Annual Recovered Profit
- Net Annual Impact
- ROI (%)
- Break-even Effectiveness (%)

**Core Logic**
- `baselineProfitPerOrder = AOV × (1-baseDiscount) × grossMargin - AOV×paymentFee - fulfillmentCost`
- `stackProfitPerOrder = AOV × (1-baseDiscount-extraStackDiscount) × grossMargin - AOV×paymentFee - fulfillmentCost`
- `leakPerStackOrder = max(0, baselineProfitPerOrder - stackProfitPerOrder)`
- `stackOrders = monthlyOrders × stackedShare`
- `monthlyLeakage = stackOrders × leakPerStackOrder`
- `monthlyRecovered = monthlyLeakage × effectiveness`
- `annualRecovered = monthlyRecovered × 12`
- `netAnnual = annualRecovered - annualGuardrailCost`

---

### FR-C: Fintech Interchange vs Reward Spend Calculator
**Problem**: 카드 프로그램에서 reward 정책이 interchange 수익을 초과하는지 빠르게 판단하기 어렵다.

**Inputs**
- Active Cards
- Monthly Spend per Card
- Interchange Rate (%)
- Reward Earn Rate (%)
- Redemption Rate (%)
- Network & Processing Cost (%)
- Fraud & Loss Cost (%)
- Annual Program Fixed Cost

**Outputs**
- Monthly GMV
- Monthly Interchange Revenue
- Monthly Reward Cost
- Monthly Contribution
- Contribution Margin (bps)
- Net Annual Impact
- Break-even Reward Rate (%)

**Core Logic**
- `gmv = activeCards × spendPerCard`
- `interchange = gmv × interchangeRate`
- `rewardCost = gmv × rewardRate × redemptionRate`
- `networkCost = gmv × networkCostRate`
- `fraudCost = gmv × fraudCostRate`
- `monthlyContribution = interchange - rewardCost - networkCost - fraudCost`
- `netAnnual = monthlyContribution×12 - annualFixedCost`
- `breakEvenRewardRate = (interchangeRate - networkRate - fraudRate) / redemptionRate`

## 4) UX/UI Requirements
- Mobile-first (<=900px single column)
- 실시간 계산 (`input` 이벤트)
- 한/영 토글 제공
- 요약 텍스트 + Copy Summary 버튼
- Portal 링크는 반드시 `href="/"`

## 5) Non-Functional Requirements
- 외부 라이브러리 없음 (Pure HTML/CSS/JS)
- Python script는 stdlib만 사용
- 숫자 검증 및 0 나눗셈 방어

## 6) Acceptance Criteria
- 신규 3개 slug가 기존 manifest에 없음
- 각 도구 로컬 HTTP 200
- `tools/index.html`, `tools/manifest.json`, `_data/tools-list.json` 반영
- git commit + push 완료 (repo: `eastsea-blog/` only)
- 라이브 URL 3개 모두 HTTP 200
- 체크포인트 JSON 저장 완료