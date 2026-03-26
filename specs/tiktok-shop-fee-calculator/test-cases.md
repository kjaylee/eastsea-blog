# Test Cases — TikTok Shop Fee Calculator

## Logic
1. **tc_l1_negative_values_rejected**
   - Input: itemPrice = -1
   - Expect: validation fails.
2. **tc_l2_standard_rate_reference_case**
   - Input: itemPrice 50, shipping 5, tax 5, platformDiscount 10, standard 6%, processing 0, fixed 0
   - Expect: customerPayment 50, referralBase 55, referralFee 3.30, netPayout 46.70, effectiveFeeRate 6.6%.
3. **tc_l3_custom_rate_applies**
   - Input: custom rate 8%
   - Expect: referralFee = referralBase × 0.08.

## UI smoke
4. **tc_ui_1_dom_updates_on_input**
   - Change item price; output fields update without error.
5. **tc_ui_2_custom_rate_toggle**
   - Select custom rate; custom input enabled and used in calculation.
