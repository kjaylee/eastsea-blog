# Test Cases — P1 Monetization Tools Trio

## Global
- [ ] Pages render on mobile width (≤ 420px) with single-column layout.
- [ ] Top portal link exists with `href="/"`.
- [ ] Summary textarea populates and copy CTA works.
- [ ] Invalid inputs show error and KPIs reset safely.

## 1) Sales Capacity Plan Calculator
- [ ] With target bookings 120,000,000; avg deal 30,000,000; win rate 25% -> expected won deals = 4.
- [ ] Pipeline coverage 3x -> required pipeline = target / winRate * 3.
- [ ] Current pipeline below required -> coverage ratio < 1 and gap message shown.
- [ ] Ramping reps > total reps -> validation error.
- [ ] Win rate > 100 or <= 0 -> validation error.

## 2) Subscription Gross/Net Retention Calculator
- [ ] Starting MRR 100, expansion 20, contraction 5, churn 10 -> GRR = 85%, NRR = 105%.
- [ ] Ending existing-base MRR = 105, ending total adds new MRR.
- [ ] Gross margin 80% and program cost 5 -> ROI computed; payback months when retention profit positive.
- [ ] Churn + contraction > starting + expansion -> validation error.

## 3) Cash Discount Early Payment Calculator
- [ ] Invoice volume 500,000,000; eligible 60%; adoption 40% -> early-pay volume = 120,000,000.
- [ ] Discount 2% -> discount cost = 2,400,000.
- [ ] Cost of capital 12%, acceleration 20 days -> financing benefit = volume * 0.12 * (20/365).
- [ ] Early-pay volume zero (eligible=0 or adoption=0) -> validation error.
- [ ] Percent inputs outside 0~100 -> validation error.