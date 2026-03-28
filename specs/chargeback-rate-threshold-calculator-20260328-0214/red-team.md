# Red Team — Chargeback Rate Threshold Calculator

🔴 Red Team:
- [공격 1]: Public web guides disagree on whether the denominator should be current-month or prior-month transactions. Hard-coding one network claim could make the tool wrong on day one.
- [공격 2]: Threshold policies change. Shipping rigid “official Visa/Mastercard compliance” copy would create false certainty and reputational risk.
- [공격 3]: A ratio-only tool can miss count-based tripwires. Merchants could be below 1% yet still feel operational pain at 100+ disputes.
- [방어/완화]: Compute both same-month and lagged ratios, label them as estimator views, expose editable thresholds, and include a separate dispute-count threshold input + warning state. Avoid brand-specific legal claims in UI copy.
- [합의]: 🟢극복
