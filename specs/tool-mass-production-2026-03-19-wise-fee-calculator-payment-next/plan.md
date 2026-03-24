# Implementation Plan — Wise Fee Calculator

**Date:** 2026-03-19
**Target file:** `tools/wise-fee-calculator/index.html`
**Estimated size:** ~12KB (inline HTML/CSS/JS)

---

## Phase 1 — HTML Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Wise Fee Calculator — TransferWise International Transfer Costs</title>
  <!-- SEO meta tags -->
  <!-- Inline CSS -->
</head>
<body>
  <header><!-- logo + title --></header>
  <main>
    <section id="controls">
      <!-- Mode toggle: You Send / Recipient Gets -->
      <!-- Amount input -->
      <!-- Currency selector (EUR/GBP/CAD/AUD/JPY/INR/MXN) -->
    </section>
    <section id="results">
      <!-- 4 method cards: Bank, Debit, Credit, Wire -->
      <!-- Each card: method name, fee amount, recipient net, fee % -->
    </section>
    <section id="comparison">
      <!-- Wise Bank vs Typical Bank Wire row -->
    </section>
    <footer><!-- disclaimer + link to wise.com --></footer>
  </main>
  <noscript><!-- static fee table --></noscript>
  <!-- Inline JS -->
</body>
</html>
```

### Checklist
- [ ] Semantic HTML5 elements
- [ ] `<meta>` SEO tags (description, og:title, og:description)
- [ ] `<noscript>` static fallback table (top 3 corridors)
- [ ] aria-label on all inputs and selectors

---

## Phase 2 — CSS Design System

### Color Tokens
```css
:root {
  --wise-green: #9FE870;
  --wise-dark: #163300;
  --wise-mid: #2D5A00;
  --text-primary: #163300;
  --text-secondary: #4A6741;
  --bg-main: #FFFFFF;
  --bg-card: #F4FAF0;
  --bg-card-active: #E8F5E0;
  --border: #D1E8C4;
  --warning-bg: #FFF8E1;
  --warning-border: #F59E0B;
  --cheapest-bg: #9FE870;
  --cheapest-text: #163300;
}
```

### Layout
- Controls section: max-width 600px, centered
- Results grid: CSS Grid, `grid-template-columns: repeat(4, 1fr)` desktop, `repeat(2, 1fr)` ≤640px, `1fr` ≤400px
- Method card: rounded corners, border, hover elevation
- Cheapest badge: green pill top-right of card

### Component Styles
- `.mode-toggle`: button pair with active state
- `.currency-select`: styled select with Wise green border
- `.method-card`: flex column, padding 16px, `box-shadow` on hover
- `.badge-cheapest`: absolute positioned, `background: var(--wise-green)`
- `.comparison-row`: two-column table with savings highlight
- `.card-warning`: orange dashed border, warning icon

---

## Phase 3 — JavaScript Architecture

### Fee Configuration Object
```javascript
const WISE_FEES = { /* 7 corridors × 4 methods — see spec.md */ };

const CARD_LIMIT = 15000;
const BANK_WIRE_FLAT = 35;
const BANK_WIRE_FX_PCT = 0.03; // typical 3% FX markup
```

### State Object
```javascript
const state = {
  mode: 'send',        // 'send' | 'receive'
  amount: 1000,
  currency: 'EUR',
};
```

### Core Calculation Functions

```javascript
// Forward: given send amount, compute fee + net for each method
function calcForward(sendAmount, currency) {
  const fees = WISE_FEES[currency];
  return Object.entries(fees).map(([method, { pct, fixed }]) => {
    const feeUSD = sendAmount * pct + fixed;
    const netUSD = sendAmount - feeUSD;
    const feePct = (feeUSD / sendAmount) * 100;
    return { method, feeUSD, netUSD, feePct };
  });
}

// Reverse: given desired net, compute required send amount
function calcReverse(netAmount, currency) {
  const fees = WISE_FEES[currency];
  return Object.entries(fees).map(([method, { pct, fixed }]) => {
    const sendAmount = (netAmount + fixed) / (1 - pct);
    const feeUSD = sendAmount * pct + fixed;
    const feePct = (feeUSD / sendAmount) * 100;
    return { method, feeUSD, sendAmount, feePct };
  });
}

// Bank wire comparison
function calcBankWire(sendAmount) {
  const flatFee = BANK_WIRE_FLAT;
  const fxCost = sendAmount * BANK_WIRE_FX_PCT;
  return flatFee + fxCost;
}
```

### Render Functions
```javascript
function renderCards(results) { /* update 4 method card DOMs */ }
function renderComparison(bankFee, wireFee) { /* update comparison row */ }
function renderCheapestBadge(results) { /* find min fee, add badge */ }
function renderWarning(amount) { /* show/hide card limit warning */ }
```

### Event Listeners
```javascript
document.getElementById('amount-input').addEventListener('input', recalculate);
document.getElementById('currency-select').addEventListener('change', recalculate);
document.querySelectorAll('.mode-btn').forEach(btn => btn.addEventListener('click', toggleMode));

function recalculate() {
  const amount = parseFloat(document.getElementById('amount-input').value) || 0;
  const currency = document.getElementById('currency-select').value;
  const results = state.mode === 'send'
    ? calcForward(amount, currency)
    : calcReverse(amount, currency);
  renderCards(results);
  renderComparison(calcForward(amount, currency)[0].feeUSD, calcBankWire(amount));
  renderCheapestBadge(results);
  renderWarning(amount);
}
```

---

## Phase 4 — Noscript Fallback

Static HTML table covering USD→EUR, USD→GBP, USD→CAD for $100, $1,000, $5,000 send amounts — bank transfer method only. Wrapped in `<noscript>` tag.

---

## Phase 5 — tools-list.json Registration

```json
{
  "id": "wise-fee-calculator",
  "title": "Wise Fee Calculator",
  "desc": "Wise(TransferWise) 국제 송금 수수료 계산기. 은행이체·직불·신용카드·SWIFT 방식별 수수료를 비교하고 순수령액과 역방향(수령액→발송액) 계산을 지원.",
  "url": "/tools/wise-fee-calculator/",
  "tags": ["wise", "transferwise", "fee", "international", "transfer", "payment", "finance"],
  "category": "Business & Finance"
}
```

---

## Phase 6 — Verification Checklist

- [ ] USD→EUR $1,000 bank: fee = $0.0041×1000 + $0.87 = **$4.97**, net = **$995.03**
- [ ] USD→CAD $1,000 debit: fee = $0.0066×1000 + $1.30 = **$7.90**, net = **$992.10**
- [ ] USD→INR $500 bank: fee = $0.01×500 + $1.30 = **$6.30**, net = **$493.70**
- [ ] USD→EUR $1,000 wire: fee = $0.0414×1000 + $5.00 = **$46.40**, net = **$953.60**
- [ ] Reverse: receive €900, USD→EUR bank → send = (900 + 0.87)/(1-0.0041) = **$904.58**
- [ ] Credit card shows cheapest badge on... never (always most expensive)
- [ ] Bank transfer gets cheapest badge for all corridors
- [ ] $20,000 input → orange card limit warning appears
- [ ] Mobile 320px: cards stack to 1-column, no horizontal scroll
- [ ] Noscript: static table renders correctly with JS disabled

---

## Delivery

Single file: `tools/wise-fee-calculator/index.html`
No external dependencies. No build step. Deploy by copying file.
