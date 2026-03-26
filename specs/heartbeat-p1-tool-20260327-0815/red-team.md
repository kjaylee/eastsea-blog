# Red Team — Whop Payments Fee Calculator

🔴 Red Team:
- [공격 1]: Whop의 “platform fee”와 “payments fee”를 섞어 계산하면 거짓 정확도가 생긴다.
- [공격 2]: payout fee가 gross 기준인지 payout balance 기준인지 모호하면 계산 결과가 왜곡될 수 있다.
- [공격 3]: ACH cap / batch amortization / remainder payout math를 틀리면 고액 거래에서 신뢰가 무너진다.
- [방어/완화]:
  - 범위를 **Whop Payments Fee Calculator**로 축소해 payment-processing + payout fee만 모델링한다.
  - payout percentage는 **post-processing payout balance 기준**이라고 UI/notes/spec/tests에 명시한다.
  - ACH cap, batch size, reverse solve를 모두 deterministic tests로 고정한다.
  - “International local banks”는 country-specific라서 범위에서 제외한다.
- [합의]: 🟢극복
