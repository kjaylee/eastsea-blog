# Spec — Wise Fee Calculator

**Date:** 2026-03-19
**Slug:** `wise-fee-calculator`
**Category:** Business & Finance
**Series:** Payment Processor Calculator Suite #4

---

## Product Description

A single-page, static, bidirectional Wise (TransferWise) fee calculator. Users enter a send amount (or desired receive amount) and instantly see the Wise fee breakdown, recipient net amount, and a comparison across all four payment methods (bank transfer, debit card, credit card, wire/SWIFT).

---

## User Stories

1. **As a freelancer**, I enter the USD amount I'm sending to see how much arrives in EUR — so I know what to invoice.
2. **As a business owner**, I compare bank transfer vs credit card to choose the cheapest method for a $10,000 CAD payment.
3. **As a recipient**, I use reverse mode: I enter the EUR amount I need delivered, and get the USD send amount required.
4. **As a researcher**, I compare Wise fees to a typical bank wire in a side-by-side column.

---

## Functional Requirements

### F1 — Send/Receive Toggle
- Two modes: **"You send"** (forward) and **"Recipient gets"** (reverse)
- Toggling mode swaps the input role, recalculates immediately

### F2 — Currency Pair Selector
- Source currency: USD (fixed for v1)
- Destination currency: EUR, GBP, CAD, AUD, JPY, INR, MXN (7 options via dropdown)
- Default: USD → EUR

### F3 — Amount Input
- Numeric input with $ prefix (or destination currency prefix in reverse mode)
- Live calculation on every keystroke (no submit button needed)
- Constraints: $1 minimum; $15,000 max for card methods (show warning above)

### F4 — Method Comparison Table
Four columns displayed simultaneously:
| Method | Variable Rate | Fixed Fee |
|--------|-------------|-----------|
| Bank Transfer | corridor-specific | corridor-specific |
| Debit Card | corridor-specific | corridor-specific |
| Credit Card | corridor-specific | corridor-specific |
| Wire/SWIFT | 4.14% | $5.00 |

Each column shows:
- Fee amount in USD
- Recipient amount in destination currency (using placeholder 1:1 rate display)
- Total fee % of send amount
- "Cheapest" badge on lowest-fee method

### F5 — Wise vs Bank Wire Comparison Row
Below the method table, one summary row:
- **Wise (Bank Transfer):** fee amount + %
- **Typical Bank Wire:** ~$35 flat + 3% FX markup (estimated total cost)
- **You save with Wise:** dollar amount difference

### F6 — Reverse Calculation
Given desired recipient amount R in destination currency:
- `send_amount = (R + fixed_fee) / (1 - variable_rate)`
- Display required send amount, fee breakdown, total cost

### F7 — Card Limit Warning
If amount > $15,000 and card method selected: show inline orange warning "Card transfers capped at $15,000 — use bank transfer or wire for larger amounts."

### F8 — No-JS Fallback
`<noscript>` section renders a static fee table for top 3 corridors × 4 methods.

---

## Fee Data (v1 — USD source only)

```javascript
const WISE_FEES = {
  EUR: { bank: { pct: 0.0041, fixed: 0.87 }, debit: { pct: 0.0041, fixed: 0.87 }, credit: { pct: 0.0201, fixed: 0.87 }, wire: { pct: 0.0414, fixed: 5.00 } },
  GBP: { bank: { pct: 0.0041, fixed: 0.87 }, debit: { pct: 0.0041, fixed: 0.87 }, credit: { pct: 0.0201, fixed: 0.87 }, wire: { pct: 0.0414, fixed: 5.00 } },
  CAD: { bank: { pct: 0.0041, fixed: 1.30 }, debit: { pct: 0.0066, fixed: 1.30 }, credit: { pct: 0.0226, fixed: 1.30 }, wire: { pct: 0.0414, fixed: 5.00 } },
  AUD: { bank: { pct: 0.0051, fixed: 1.30 }, debit: { pct: 0.0076, fixed: 1.30 }, credit: { pct: 0.0236, fixed: 1.30 }, wire: { pct: 0.0414, fixed: 5.00 } },
  JPY: { bank: { pct: 0.0061, fixed: 0.87 }, debit: { pct: 0.0086, fixed: 0.87 }, credit: { pct: 0.0246, fixed: 0.87 }, wire: { pct: 0.0414, fixed: 5.00 } },
  INR: { bank: { pct: 0.0100, fixed: 1.30 }, debit: { pct: 0.0125, fixed: 1.30 }, credit: { pct: 0.0285, fixed: 1.30 }, wire: { pct: 0.0414, fixed: 5.00 } },
  MXN: { bank: { pct: 0.0138, fixed: 1.30 }, debit: { pct: 0.0163, fixed: 1.30 }, credit: { pct: 0.0323, fixed: 1.30 }, wire: { pct: 0.0414, fixed: 5.00 } },
};
```

---

## Design Requirements

### Visual Identity
- Wise brand colors: `#9FE870` (Wise green), `#163300` (Wise dark), `#FFFFFF` background
- Clean, minimal aesthetic matching Wise's own UI language
- Method cards in a responsive 2×2 grid on mobile, 4-column row on desktop

### Layout
```
[Header: Wise Fee Calculator]
[Mode Toggle: You Send | Recipient Gets]
[Amount Input] [Currency Selector]
────────────────────────────────
[Bank Transfer] [Debit] [Credit] [Wire]
  Fee: $X.XX    $X.XX   $X.XX   $X.XX
  Net: ...      ...     ...     ...
  [CHEAPEST badge on lowest]
────────────────────────────────
[Wise vs Bank Wire comparison row]
[Disclaimer: rates approximate, verify at wise.com]
```

### Accessibility
- WCAG 2.1 AA contrast
- Keyboard navigable (tab between inputs, dropdown)
- aria-labels on all interactive elements

### Performance
- Single HTML file, no external deps
- Inline CSS + JS < 15KB total
- Sub-100ms calculation response

---

## Non-Functional Requirements

- Mobile-responsive, 320px minimum viewport
- Works offline (no API calls for core logic)
- Graceful degradation with `<noscript>` fallback table
- Compatible: Chrome, Firefox, Safari, Edge (last 2 versions)

---

## Out of Scope (v1)

- Multi-currency source (non-USD send)
- Real-time exchange rate API integration
- Historical fee comparison
- Batch/bulk transfer calculation
- Wise Business account rates
