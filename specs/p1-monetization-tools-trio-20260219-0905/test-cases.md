# Test Cases — p1-monetization-tools-trio-20260219-0905

## A) Enterprise Seat Expansion ROI Calculator

### Case A1 — 정상 시나리오 (양의 ROI)
**Inputs**
- Target accounts: 40
- Expansion take rate: 35%
- Expansion seats per account: 12
- Price per seat per month: ₩50,000
- Discount: 10%
- Gross margin: 80%
- Commission: 8%
- Support cost per expanded account: ₩120,000
- Analysis months: 12
- Enablement cost: ₩24,000,000

**Expected**
- Monthly expansion revenue: ₩7,560,000
- Expansion ARR: ₩90,720,000
- Monthly gross profit: ₩6,048,000
- Monthly net impact: ₩3,763,200
- Net impact (period): ₩21,158,400
- ROI: ~41.13%
- Payback: ~6.38 months
- Break-even take rate: ~18.6%

### Case A2 — 단위 마진 음수 (손익분기 N/A)
**Inputs**
- Target accounts: 10
- Expansion take rate: 20%
- Expansion seats per account: 5
- Price per seat per month: ₩30,000
- Discount: 0%
- Gross margin: 60%
- Commission: 10%
- Support cost per expanded account: ₩250,000
- Analysis months: 6
- Enablement cost: ₩10,000,000

**Expected**
- Monthly net impact: negative
- Payback: N/A
- Break-even take rate: N/A (unit margin ≤ 0)

---

## B) Partner MDF ROI Calculator

### Case B1 — 정상 시나리오
**Inputs**
- MDF budget: ₩50,000,000
- Partner co-invest: ₩20,000,000
- Internal ops cost: ₩8,000,000
- Leads: 600
- Lead → Opp rate: 25%
- Win rate: 22%
- Avg deal size (ACV): ₩18,000,000
- Gross margin: 70%
- Rebate: 5%
- Sales cycle: 4 months

**Expected**
- Opportunities: 150
- Closed-won deals: 33
- Expected revenue: ₩594,000,000
- Gross profit: ₩415,800,000
- Net profit: ₩328,100,000
- ROI: ~565.69%
- Payback: ~5.67 months
- Break-even win rate: ~3.30%

### Case B2 — 마진 < 리베이트 (손익분기 N/A)
**Inputs**
- MDF budget: ₩20,000,000
- Partner co-invest: ₩0
- Internal ops cost: ₩5,000,000
- Leads: 200
- Lead → Opp rate: 10%
- Win rate: 10%
- Avg deal size: ₩10,000,000
- Gross margin: 20%
- Rebate: 25%
- Sales cycle: 3 months

**Expected**
- Net profit: negative
- ROI: negative
- Break-even win rate: N/A (gross margin ≤ rebate)

---

## C) Professional Services Utilization & Margin Calculator

### Case C1 — 정상 시나리오
**Inputs**
- Headcount: 18
- Hours per consultant: 160
- Utilization: 72%
- Billable rate: ₩180,000
- Monthly cost per consultant: ₩7,500,000
- Subcontractor mix: 15%
- Subcontractor cost per hour: ₩110,000
- Overhead rate: 18%
- Tooling cost per consultant: ₩250,000
- Target margin: 25%

**Expected**
- Billable hours: 2,073.6h
- Monthly billings: ₩373,248,000
- Operating profit: ₩132,348,960
- Operating margin: ~35.46%
- Break-even utilization: ~36.94%
- Required rate for 25% margin: ~₩147,000/h

### Case C2 — 저가동/적자
**Inputs**
- Headcount: 10
- Hours per consultant: 160
- Utilization: 30%
- Billable rate: ₩120,000
- Monthly cost per consultant: ₩6,000,000
- Subcontractor mix: 0%
- Subcontractor cost per hour: ₩0
- Overhead rate: 25%
- Tooling cost per consultant: ₩200,000
- Target margin: 20%

**Expected**
- Monthly billings: ₩57,600,000
- Operating profit: -₩18,800,000
- Operating margin: ~-32.64%
- Break-even utilization: ~43.06%
- Required rate for 20% margin: ~₩235,000/h
