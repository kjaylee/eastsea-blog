# Test Cases — Patreon Net Revenue Calculator

Notation: values rounded to 2 decimals unless noted.

TC-PAT-01 Baseline Pro plan, standard processing
- Input: monthlyMembers=800, monthlyPrice=5; annualMembersBilled=40, annualPrice=50; oneTimeGrossSales=1000, oneTimeOrders=50; plan=pro (8%); standard 2.9%+$0.30; micro 5%+$0.10; microThreshold=$3; refundRate=2%; payoutFlat=$0.25, payoutPercent=0%, payouts=1; otherCost=$200.
- Expect: no error; monthly processing uses standard; one‑time avg=$20>3 uses standard.
- Assert ranges (±0.5% tolerance):
  - totalGross ≈ 800*5 + 40*50 + 1000 = 4000 + 2000 + 1000 = 7000
  - platformFees ≈ 560
  - processingFees ≈ (4000*2.9%+800*0.3) + (2000*2.9%+40*0.3) + (1000*2.9%+50*0.3) = 116 + 240 + 58 + 12 + 29 + 15 = 470
  - refundLoss ≈ 140
  - payoutFees ≈ 0.25
  - netRevenue ≈ 7000 - (560+470+140+0.25+200) = 7000 - 1370.25 = 5629.75
  - effectiveFeeRate ≈ (1370.25/7000)*100 ≈ 19.57%

TC-PAT-02 Micro tier kicks in for low monthly price
- Input: monthlyMembers=800, monthlyPrice=2.5 (≤3), others as baseline with oneTimeOrders=0 and gross=0.
- Expect: processing ≈ 800*(2.5*5% + 0.10) = 800*(0.125+0.10)=180; vs standard would be 800*(2.5*2.9% + 0.30)=800*(0.0725+0.30)=298; micro < standard for low price.

TC-PAT-03 Validation rejects impossible inputs
- Negative counts or money, rates ≥100, orders=0 while oneTimeGross>0.

TC-PAT-04 Payout percent applies to payout base
- Input: baseline + payoutPercent=1%.
- Expect: payoutFees ≈ 0.25 + 0.01*(gross - platform - processing - refund).

TC-PAT-05 Target net solver
- Input: baseline + desiredMonthlyNet=6000.
- Expect: `requiredGrossForTargetNet` > totalGross; `breakEvenMonthlyPrice` increases when other costs rise.

TC-PAT-06 HTML anchors & catalog wiring
- `index.html` includes `script defer src="./calculator.js"` and `/assets/analytics.js`.
- `tools/index.html` and `tools/index.md` contain exactly one `patreon-net-revenue-calculator` link.
- `_data/tools-list.json` includes exactly one `/tools/patreon-net-revenue-calculator/` entry.
- `tools/manifest.json` includes exactly one tool entry with slug and url; size within 500..1,048,576 in integration tests.

