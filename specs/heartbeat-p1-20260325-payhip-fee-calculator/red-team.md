# Red Team — Payhip Fee Calculator

## 🔴 Red Team
- [공격 1]: PayPal fixed-fee data is country/currency-specific, so a hard-coded preset could look falsely official.
- [공격 2]: Discovery already contains a Payhip placeholder entry; implementation could accidentally duplicate the slug or desync manifest/catalog state.
- [공격 3]: Upgrade-threshold math could be reported incorrectly if processor/refund/fixed costs are mixed into what should be a plan-only threshold.
- [방어/완화]: Label PayPal as a USD planning baseline, keep Stripe/PayPal clearly separate from Payhip fees, add exact-once discovery tests, and compute upgrade thresholds only from published Payhip plan deltas.
- [합의]: 🟢극복
