# Red Team — Stan Store Fee Calculator

## 🔴 Red Team
- [공격 1]: Stan charges 0% transaction fees, so a naïve “fee calculator” could feel too thin or redundant.
- [공격 2]: PayPal fixed fees vary by currency, so a hard-coded flat fee could look falsely precise.
- [공격 3]: Creator Pro does not have a pure fee-rate break-even because Stan’s plan delta is fixed, not percentage-based.
- [공격 4]: Adding a new slug can create discovery duplication if all four catalog surfaces are not updated carefully.
- [방어/완화]:
  - Make the tool decision-oriented, not just fee-rate-only: compare four billing options, compute target price, and compute the extra gross sales required for Creator Pro to pay back.
  - Label PayPal as a USD planning baseline and keep custom fees editable.
  - Express Pro upgrade economics as extra gross/orders needed under the current margin mix, not as a fake platform-fee threshold.
  - Add an exact-once discovery test in the tool’s own Node test file.
- [합의]: 🟢극복
