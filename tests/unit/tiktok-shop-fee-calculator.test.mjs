import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_INPUT,
  validateInputs,
  calculateTikTokShopFees,
  getReferralRate,
} from '../../tools/tiktok-shop-fee-calculator/logic.mjs';

describe('tiktok shop fee calculator logic', () => {
  it('tc_l1_negative_values_rejected', () => {
    const validation = validateInputs({ ...DEFAULT_INPUT, itemPrice: -1 });
    assert.equal(validation.valid, false);
    assert.match(validation.message, /itemPrice/);
  });

  it('tc_l2_standard_rate_reference_case', () => {
    const result = calculateTikTokShopFees({
      itemPrice: 50,
      shipping: 5,
      tax: 5,
      platformDiscount: 10,
      referralMode: 'standard',
      processingRate: 0,
      processingFixed: 0,
      ordersPerMonth: 100,
    });

    assert.equal(result.customerPayment, 50);
    assert.equal(result.referralBase, 55);
    assert.equal(result.referralFee, 3.3);
    assert.equal(result.netPayout, 46.7);
    assert.equal(result.effectiveFeeRate, 6.6);
    assert.equal(result.monthly.net, 4670);
  });

  it('tc_l3_custom_rate_applies', () => {
    const rate = getReferralRate('custom', 8);
    assert.equal(rate, 8);
    const result = calculateTikTokShopFees({
      ...DEFAULT_INPUT,
      referralMode: 'custom',
      customReferralRate: 8,
      itemPrice: 100,
      shipping: 0,
      tax: 0,
      platformDiscount: 0,
      processingRate: 0,
      processingFixed: 0,
    });
    assert.equal(result.referralFee, 8);
  });
});
