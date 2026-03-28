# Red Team — GoFundMe Fee Calculator

🔴 Red Team:
- [공격 1]: GoFundMe pricing varies by region and product. A tool that overclaims universal accuracy will lose trust.
- [공격 2]: The recurring 5% fee could be mis-modeled as organizer revenue loss when the official copy frames it as donor-paid.
- [공격 3]: Editing shared discovery files during concurrent repo churn could create duplicate cards or merge noise.
- [방어/완화]:
  - Scope the tool to US individual/business public pricing and label all rates editable.
  - Treat the recurring 5% as donor checkout lift in v1, not organizer fee drag.
  - Keep the first slice surgical: page + tests + manifest only.
- [합의]: 🟢극복
