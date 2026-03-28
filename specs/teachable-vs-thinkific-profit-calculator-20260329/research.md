# Research — teachable-vs-thinkific-profit-calculator

## Decision target
Build a side-by-side comparison calculator for Teachable vs Thinkific — the two most popular course platforms creators compare.

## 1) 누구의 문제인가?
- Online course creators choosing between Teachable and Thinkific
- Existing users of one platform considering switching
- Business coaches, educators, and knowledge entrepreneurs

## 2) 구체적 사례
- "If I sell a $200 course with 50 students/month, do I keep more on Teachable or Thinkific?"
- "At what volume does Thinkific Grow become better than Teachable Growth?"
- "Which platform's annual billing saves me more?"

## 3) 현재 해결 방식
- Manual spreadsheet comparison
- Reading separate pricing pages and doing mental math
- Blog posts with outdated pricing info

## 4) 이상적 결과
Single-page tool where user enters price + monthly sales, sees both platforms' plans side-by-side with net revenue, effective fee rates, and a winner badge.

## 5) 제약 조건
- Static HTML, inline CSS/JS, single file
- No backend, no framework
- Must reference verified 2026 pricing data from existing calculators

## 6) 성공 지표
- Page ships at `tools/teachable-vs-thinkific-profit-calculator/`
- Wired into catalog
- Formulas grounded in existing verified fee data from both calculators

## Fee data (from existing verified calculators)

### Teachable Plans (2026-03 verified)
| Plan     | Monthly | Annual/mo | Tx Fee |
|----------|---------|-----------|--------|
| Starter  | $39     | $29       | 7.5%   |
| Builder  | $89     | $69       | 0%     |
| Growth   | $189    | $139      | 0%     |
| Advanced | $399    | $309      | 0%     |

### Thinkific Plans (2026-03 verified)
| Plan  | Monthly | Annual/mo | 3rd-party Gateway Fee |
|-------|---------|-----------|----------------------|
| Basic | $49     | $36       | 5%                   |
| Start | $99     | $74       | 2%                   |
| Grow  | $199    | $149      | 1%                   |

### Payment Processing (common baseline)
US Card: 2.9% + $0.30/tx (Stripe-based)

## Comparison approach
Pick best plan per platform at given volume, show side-by-side:
- Monthly subscription cost
- Platform/transaction fee
- Payment processing fee
- Total monthly cost
- Net monthly revenue
- Take-home per sale
- Net margin %
- Winner indicator
