# Red Team — eBay vs Poshmark Profit Calculator

🔴 Red Team:
- [공격 1]: eBay and Poshmark are not true apples-to-apples because shipping economics differ; a vague comparator could mislead sellers.
- [공격 2]: If the comparator uses list price on one side and discounted price on the other, the “winner” becomes fake.
- [공격 3]: Reverse-solved match prices can silently become unstable if the underlying profit functions are not monotonic under the chosen assumptions.
- [방어/완화]: Use Poshmark realized sale price as eBay sold price, expose shipping assumptions separately, and keep reverse solves limited to one changing price variable while all other assumptions stay fixed. Add deterministic tests for baseline, tie/edge behavior, and exact numeric match targets.
- [합의]: 🟢극복
