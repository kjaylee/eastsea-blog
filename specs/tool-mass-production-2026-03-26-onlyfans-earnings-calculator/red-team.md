# Red Team — OnlyFans Earnings Calculator

🔴 Red Team:
- [공격 1]: OnlyFans math may be oversimplified if users expect taxes, agency splits, or banking fees to be included.
- [공격 2]: Searchers looking for "earnings calculator" may want total income projection, not just fee subtraction.
- [공격 3]: Required-subscriber math can be misleading if non-subscription revenue does not scale with subscriber count.
- [공격 4]: Adult-platform branding may create trust concerns if the page tone is sensational or imprecise.
- [공격 5]: Catalog wiring can silently break if the new directory is added but manifest/index entries are missed.
- [공격 6]: Payout drag could be misunderstood as an official OnlyFans fee rather than an optional working-capital estimate.
- [공격 7]: Zero-subscriber or ultra-high refund inputs can create divide-by-zero / impossible economics edge cases.

- [방어/완화]:
  1. Keep disclaimer explicit: v1 models public 20% platform fee only; taxes / agency splits / withdrawal fees excluded.
  2. Frame the page as an earnings + take-home calculator, including gross revenue, take-home before ops, and net after creator costs.
  3. Label subscriber-target math as "assuming current revenue mix scales with subscribers".
  4. Keep copy neutral, businesslike, and creator-economy focused.
  5. Add exact-once wiring tests for manifest/tools-list/index entries.
  6. Name payout drag clearly as an optional cash-cost estimate.
  7. Add validation + null outputs for impossible subscriber-target scenarios.

- [합의]: 🟢극복

## Failure scenarios for this plan
1. Catalog update omitted → tool exists locally but is undiscoverable or fails manifest integrity.
2. Calculation engine bundled only in inline HTML → testability drops and verification becomes weak.

## Defensive response
- Keep pure logic in `calculator.js` with Node-exported API.
- Include wiring assertions inside `calculator.test.js` plus repo manifest integration test.
