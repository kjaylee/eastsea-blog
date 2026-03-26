# Red Team — cash-discount-early-payment-calculator

## Main risks
1. The tool could collapse into a near-duplicate of `early-payment-discount-apr-calculator`.
2. Break-even adoption math could silently become nonsense when the per-dollar contribution is zero or negative.
3. Processing fees could be double-counted or ignored if the model mixes volume-based and invoice-count-based costs incorrectly.
4. Users may treat the result as accounting advice or a universal cash-discount rule.

## Defenses
1. Keep the page centered on program planning inputs the sibling page does not foreground:
   - eligible share
   - projected adoption
   - average invoice amount
   - payment-processing drag
   - break-even adoption
2. Return explicit `null`/`Not attainable` states for payback and break-even when the denominator is non-positive.
3. Separate discount cost, processing fees, financing benefit, and bad-debt savings as named outputs.
4. Add a scope note that this is a planning model for seller-side ROI, not tax/accounting advice.
5. Add a sibling-tool note for users who specifically need implied APR framing.

## Ship blockers
- Do not ship if the slug appears more than once in any discovery surface.
- Do not ship if the new page requires modifying unrelated files.
- Do not ship if git commit/push cannot be attempted; record the exact failure instead.

