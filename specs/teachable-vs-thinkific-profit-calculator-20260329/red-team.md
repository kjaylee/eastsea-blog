# 🔴 Red Team — teachable-vs-thinkific-profit-calculator

## Attack 1: "Pricing data could be outdated"
- Defense: Data sourced from existing verified calculators (March 2026). Disclaimer included.
- 합의: 🟢극복

## Attack 2: "Thinkific has extra fee layers (subscription surcharge, sales tax VAT solution) not in simplified model"
- Defense: We use the dominant path (third-party gateway fee) which is the main cost differentiator. Note mentions optional add-on fees exist.
- 합의: 🟡위험수용

## Attack 3: "Teachable Starter's 7.5% tx fee makes it always lose — comparison is obvious"
- Defense: At very low volumes, Starter's lower subscription cost can still win. The calculator surfaces this nuance quantitatively.
- 합의: 🟢극복

## Attack 4: "Single payment method assumption limits accuracy"
- Defense: US card (Stripe 2.9% + $0.30) is the dominant path for both platforms. Adding more methods adds complexity without changing the relative comparison significantly.
- 합의: 🟡위험수용
