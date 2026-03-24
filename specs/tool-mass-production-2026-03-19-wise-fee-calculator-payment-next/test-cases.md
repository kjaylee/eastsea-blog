# Test Cases — Wise Fee Calculator

**Date:** 2026-03-19
**File under test:** `tools/wise-fee-calculator/index.html`

---

## TC-01: Forward Calc — USD→EUR Bank Transfer

| Input | Expected |
|-------|----------|
| Mode: Send, Amount: $1,000, Currency: EUR, Method: Bank | Fee: $4.97, Net: $995.03, Fee%: 0.50% |
| Mode: Send, Amount: $100, Currency: EUR, Method: Bank | Fee: $1.28, Net: $98.72, Fee%: 1.28% |
| Mode: Send, Amount: $10,000, Currency: EUR, Method: Bank | Fee: $41.87, Net: $9,958.13, Fee%: 0.42% |

**Formula:** `fee = 10000 * 0.0041 + 0.87 = 41.87`

---

## TC-02: Forward Calc — USD→GBP (All Methods)

Amount: $2,000

| Method | Pct | Fixed | Fee | Net |
|--------|-----|-------|-----|-----|
| Bank | 0.41% | $0.87 | $9.07 | $1,990.93 |
| Debit | 0.41% | $0.87 | $9.07 | $1,990.93 |
| Credit | 2.01% | $0.87 | $41.07 | $1,958.93 |
| Wire | 4.14% | $5.00 | $87.80 | $1,912.20 |

**Cheapest badge:** Bank Transfer and Debit (tied — show on both or first)

---

## TC-03: Forward Calc — USD→CAD

Amount: $500

| Method | Fee | Net |
|--------|-----|-----|
| Bank | 0.0041×500+1.30 = $3.35 | $496.65 |
| Debit | 0.0066×500+1.30 = $4.60 | $495.40 |
| Credit | 0.0226×500+1.30 = $12.60 | $487.40 |
| Wire | 0.0414×500+5.00 = $25.70 | $474.30 |

---

## TC-04: Forward Calc — USD→INR (High % corridor)

Amount: $500

| Method | Fee | Net |
|--------|-----|-----|
| Bank | 0.01×500+1.30 = $6.30 | $493.70 |
| Debit | 0.0125×500+1.30 = $7.55 | $492.45 |
| Credit | 0.0285×500+1.30 = $15.55 | $484.45 |
| Wire | 0.0414×500+5.00 = $25.70 | $474.30 |

---

## TC-05: Forward Calc — USD→MXN (Highest variable rate)

Amount: $300

| Method | Fee |
|--------|-----|
| Bank | 0.0138×300+1.30 = $5.44 |
| Credit | 0.0323×300+1.30 = $10.99 |
| Wire | 0.0414×300+5.00 = $17.42 |

---

## TC-06: Reverse Calc — USD→EUR, Bank Transfer

**Goal:** Recipient receives $900 USD equivalent (in EUR)

Formula: `send = (900 + 0.87) / (1 - 0.0041) = 900.87 / 0.9959 ≈ $904.58`

| Input | Expected |
|-------|----------|
| Mode: Receive, Amount: 900, Currency: EUR, Method: Bank | Send: $904.58, Fee: $4.58, Fee%: 0.51% |

---

## TC-07: Reverse Calc — USD→GBP, Credit Card

**Goal:** Recipient receives $500

Formula: `send = (500 + 0.87) / (1 - 0.0201) = 500.87 / 0.9799 ≈ $511.15`
Fee: $511.15 * 0.0201 + 0.87 = $11.15

| Input | Expected |
|-------|----------|
| Mode: Receive, Amount: 500, Currency: GBP, Method: Credit | Send: ~$511.15, Fee: ~$11.15 |

---

## TC-08: Wire/SWIFT Fixed Rate (All Corridors Same)

Amount: $1,000, Method: Wire

All 7 corridors:
`fee = 0.0414 × 1000 + 5.00 = $46.40` (identical for all)

| Currency | Fee | Net |
|----------|-----|-----|
| EUR | $46.40 | $953.60 |
| GBP | $46.40 | $953.60 |
| JPY | $46.40 | $953.60 |
| INR | $46.40 | $953.60 |

**Expected:** All wire cards show identical fee regardless of destination currency.

---

## TC-09: Card Limit Warning

| Amount | Expected Behavior |
|--------|------------------|
| $14,999 | No warning shown |
| $15,000 | No warning shown (at limit) |
| $15,001 | Orange warning: "Card transfers capped at $15,000" |
| $50,000 | Warning visible, card method fees still calculated |

---

## TC-10: Cheapest Badge Logic

| Scenario | Badge On |
|----------|----------|
| USD→EUR, any amount | Bank Transfer (tied with Debit for EUR/GBP) |
| USD→CAD, any amount | Bank Transfer |
| USD→MXN, any amount | Bank Transfer |
| USD→GBP, any amount | Bank Transfer (and/or Debit, tied) |

**Rule:** Badge appears on method with lowest `feeUSD`. If tied, badge on first tied method.

---

## TC-11: Wise vs Bank Wire Comparison Row

Amount: $1,000, Currency: EUR

- Wise Bank Transfer fee: $4.97
- Typical bank wire: $35 flat + $30 FX (3% of $1,000) = **$65.00**
- Savings: $65.00 - $4.97 = **$60.03**

| Expected Element | Value |
|-----------------|-------|
| "Wise (Bank Transfer)" | $4.97 |
| "Typical Bank Wire" | ~$65.00 |
| "You save with Wise" | ~$60.03 |

---

## TC-12: Edge Cases

| Input | Expected Behavior |
|-------|------------------|
| Amount: 0 | All fees show $0.00, no division errors |
| Amount: 0.01 | Fee = $0.87 (fixed dominates), net negative — show $0.00 net with note |
| Amount: 1000000 | Calculates without overflow, bank shows correct large fee |
| Invalid input (letters) | Input rejects non-numeric, last valid value used |
| Empty input | Treated as $0, all zeros shown |

---

## TC-13: Currency Switch Recalculation

1. Set amount to $500, Currency: EUR → verify TC-01 values
2. Switch currency to JPY → fees update immediately
3. `USD→JPY bank: 0.0061×500+0.87 = $3.92` — verify without page reload

---

## TC-14: Mode Toggle

1. Set mode to "You Send", amount $1,000 → note net result
2. Switch to "Recipient Gets"
3. Enter same $1,000 as receive amount
4. Resulting send amount should be > $1,000 (to cover fees)
5. `Send = (1000 + 0.87) / (1 - 0.0041) ≈ $1,005.02` for EUR bank

---

## TC-15: Mobile Responsiveness

| Viewport | Expected |
|----------|----------|
| 320px width | Cards stack to 1-column, no horizontal overflow |
| 414px width | Cards 2×2 grid or 1-column |
| 768px width | 4-column row layout |
| 1200px width | 4-column row, centered max-width |

---

## TC-16: Noscript Fallback

1. Disable JavaScript in browser
2. Load `wise-fee-calculator/index.html`
3. Expected: static fee table renders for EUR/GBP/CAD at $100/$1,000/$5,000
4. Interactive elements not visible (hidden via CSS `display:none` removed by JS)

---

## TC-17: Keyboard Accessibility

| Action | Expected |
|--------|----------|
| Tab from amount input | Focus moves to currency selector |
| Tab from currency selector | Focus moves to mode toggle buttons |
| Enter on mode toggle | Toggles mode, recalculates |
| Arrow keys in currency select | Changes currency, recalculates |

---

## TC-18: Performance

| Metric | Target |
|--------|--------|
| File size | < 15KB |
| Time to interactive | < 500ms on 3G |
| Calculation response | < 100ms on any input event |
| No layout shift | CLS = 0 |

---

## Pass Criteria

All TC-01 through TC-18 must pass.
Critical failures (TC-01, TC-06, TC-09) block shipping.
Non-critical (TC-17, TC-18) are best-effort for v1.
