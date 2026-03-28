# Red Team — Venmo Fee Calculator

🔴 Red Team:
- [공격 1]: Business profile and charity profile share one rate shape, so the page may feel redundant and add little value.
- [공격 2]: Instant transfer fee caps can create unintuitive results; a bug here would destroy trust.
- [공격 3]: A break-even solver that ignores transfer-fee discontinuities would output wrong thresholds.
- [방어/완화]: Surface all four fee modes in one comparison table, unit-test the min/max transfer cases, and use deterministic search helpers that reuse the same production calculation path instead of parallel formula copies.
- [합의]: 🟢극복
