# Research — Wise Fee Calculator (Payment Next)

**Date:** 2026-03-19
**Slug:** wise-fee-calculator
**Series:** Payment Processor Calculator Suite (Stripe → PayPal → Square → **Wise**)

---

## Overlap Scan

### Existing tools (tools/*/index.html)
Scanned full tools directory — no `wise*`, `transferwise*`, or `international-transfer*` slug found.

### Existing specs (specs/tool-mass-production-*)
- stripe-fee-calculator ✅ spec'd
- paypal-fee-calculator ✅ spec'd
- square-fee-calculator ✅ spec'd
- mercari-fee-calculator ✅ spec'd
- poshmark, grailed, whatnot, buy-me-a-coffee, teachers-pay-teachers ✅ spec'd
- **wise-fee-calculator** ❌ NOT spec'd — clear green field

### tools-list.json
No entry for Wise or TransferWise. Category "Business & Finance" has room.

---

## Why Wise

Wise (formerly TransferWise) is the dominant non-bank international money transfer service used by:
- Freelancers receiving payment cross-border (Upwork, Fiverr payouts)
- Remote workers paid in foreign currencies
- Businesses paying international contractors
- Digital nomads managing multi-currency finances

Unlike Stripe/PayPal (domestic-first), Wise's value proposition is **low-cost international transfers** with transparent fees — making a fee calculator especially valuable since the fee varies by:
1. Transfer corridor (USD→EUR vs USD→GBP vs USD→JPY etc.)
2. Payment method (bank debit, credit card, wire)
3. Transfer amount (tiered % + fixed fee)

Wise does NOT have an interactive fee calculator on their site that lets you model "what will I net after fees?" — they show "how much will recipient get" but not a bidirectional profit calculator with method comparison.

---

## Wise Fee Structure (2026)

### Standard Fee Formula
`fee = (amount × variable_rate) + fixed_fee`

Variable rates and fixed fees differ by:
- **Source corridor** (sending currency)
- **Payment method** (bank transfer, debit card, credit card, wire/SWIFT)

### USD → Major Currencies (2026 rates)

| Destination | Bank Transfer | Debit Card | Credit Card | Wire/SWIFT |
|-------------|--------------|------------|-------------|------------|
| EUR | 0.41% + $0.87 | 0.41% + $0.87 | 2.01% + $0.87 | 4.14% + $5.00 |
| GBP | 0.41% + $0.87 | 0.41% + $0.87 | 2.01% + $0.87 | 4.14% + $5.00 |
| CAD | 0.41% + $1.30 | 0.66% + $1.30 | 2.26% + $1.30 | 4.14% + $5.00 |
| AUD | 0.51% + $1.30 | 0.76% + $1.30 | 2.36% + $1.30 | 4.14% + $5.00 |
| JPY | 0.61% + $0.87 | 0.86% + $0.87 | 2.46% + $0.87 | 4.14% + $5.00 |
| INR | 1.00% + $1.30 | 1.25% + $1.30 | 2.85% + $1.30 | 4.14% + $5.00 |
| MXN | 1.38% + $1.30 | 1.63% + $1.30 | 3.23% + $1.30 | 4.14% + $5.00 |

**Note:** Exchange rates use Wise's mid-market rate (no markup on exchange rate itself — the fee IS the cost).

### Minimum Transfer: $1.00
### Maximum Transfer: $1,000,000 per transfer (bank), $15,000 (card)

---

## Competitive Landscape

| Service | Comparable Fee | Calculator Tool? |
|---------|---------------|-----------------|
| Wise | 0.41–1.38% + fixed | Basic estimator only |
| PayPal Int'l | 5% + fixed + 3–4% FX | None |
| Western Union | 0–4.99% + FX markup 2–3% | Basic |
| Bank Wire | $25–$45 flat + 3–5% FX | None |
| Remitly | 0–2.99% + varies | Basic |

Wise consistently wins on cost for bank transfers — this makes a comparison calculator valuable for showing WHY Wise is cheaper.

---

## Tool Opportunity

**Primary use case:** Freelancer receives $5,000 USD from US client, wants to know how much arrives in EUR after Wise fees.
**Secondary use case:** Which payment method is cheapest for this transfer?
**Tertiary use case:** Reverse calculation — "I need €4,500 delivered, how much do I send?"

**Differentiator vs Wise's own site:** Method comparison table + bidirectional + "vs bank wire" comparison column.

---

## SEO Keywords
- wise fee calculator
- transferwise fee calculator
- international wire transfer fee calculator
- wise transfer cost calculator
- how much does wise charge
- wise vs paypal fees
- wisepay fees calculator

---

## Conclusion

**Recommendation: BUILD** — Wise fee calculator fills a gap in the payment processor series, targets high-value freelancer/nomad audience, has complex enough fee structure to justify an interactive tool, and has no existing equivalent in the tools catalog.
