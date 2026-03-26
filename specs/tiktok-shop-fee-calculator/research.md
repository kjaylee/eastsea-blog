# Research — TikTok Shop Fee Calculator

## Sources
- TikTok Shop Academy — Referral Fee Updates (US)
  - URL: https://seller-us.tiktok.com/university/essay?knowledge_id=5982454398175018&lang=en
  - Key points:
    - Referral fee increased to **6% per order** starting Apr 1, 2024.
    - Referral fee formula: **6% × (Customer Payment + Platform Discount − Tax)**.
    - Refund administration fee is **20% of the referral fee** (cap $5 per SKU).
- Podbase — “TikTok Shop Fees: Seller Commission and Costs”
  - URL: https://www.podbase.com/blogs/tiktok-shop-fees
  - Key points:
    - Standard referral fee reiterated as **6%** of (Customer Payment + Platform Discount − Tax).
    - Notes a **new-seller promotion** with referral fee reduced to **3%** for a limited period.

## Takeaways for the tool
- Use **6% standard referral fee** as default with a **3% promo option** and **custom rate** input.
- Model referral fee base as **Customer Payment + Platform Discount − Tax** (equivalently item + shipping).
- Include optional processing fee inputs (rate + fixed) since payment processing may vary by seller setup.
- Keep UI copy explicit that rates vary by category/region and users should confirm their actual TikTok Shop fee schedule.
