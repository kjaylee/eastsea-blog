# Test Cases — Whop Payments Fee Calculator

## Logic
1. **Domestic cards, no payout drag**
   - amount 100
   - domestic cards
   - hold/no payout fee
   - expected processing fee = 3.00
   - expected net = 97.00

2. **International + FX + instant bank payout**
   - amount 100
   - international + FX cards (5.2% + $0.30)
   - instant bank payout (4% + $1) amortized across 5 transactions
   - verify processing fee, payout allocation, net, effective rate, monthly totals

3. **ACH cap branch**
   - amount 500
   - ACH (1.5% would be 7.5, capped to 5)
   - ensure capped result = 5.00

4. **Financing path**
   - amount 200
   - financing fee = 30
   - verify payout drag can still apply correctly

5. **Reverse pricing**
   - target net 100 under one non-capped path
   - solve required gross, then feed it back and confirm approximate target net

6. **Validation**
   - negative amount rejected
   - transactionsPerPayout < 1 rejected
   - targetNet negative rejected

## Discovery
7. Exact-once slug presence in:
   - `tools/index.html`
   - `tools/index.md`
   - `tools/manifest.json`
   - `_data/tools-list.json`

## HTML / copy
8. HTML contains:
   - canonical URL
   - analytics include
   - formula note about payout balance basis
   - link to `logic.mjs`
