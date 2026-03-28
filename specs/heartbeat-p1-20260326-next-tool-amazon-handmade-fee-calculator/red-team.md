# Red Team — Amazon Handmade Fee Calculator

## 🔴 Red Team
- [공격 1]: This could be too close to the generic marketplace or Amazon FBA calculators and fail the “new exact-match” bar.
- [공격 2]: Amazon Handmade fee rules are easy to oversimplify; using the wrong fee basis would make the calculator misleading.
- [공격 3]: Discovery already had a placeholder entry, so shipping could silently duplicate wiring or leave manifest/catalog state inconsistent.
- [방어/완화]: Keep the tool explicitly scoped to Handmade, anchor the math to the public `15% or $0.30 minimum` rule, model the buyer charge basis visibly, and add exact-once discovery assertions in the automated test.
- [합의]: 🟢극복
