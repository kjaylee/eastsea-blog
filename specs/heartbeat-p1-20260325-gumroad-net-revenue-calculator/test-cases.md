# Test Cases — Gumroad Net Revenue Calculator

## Functional math cases
1. **TC-GR-01 baseline mixed sales**
   - Input: direct gross 3000 / 80 orders, Discover gross 1500 / 30 orders, Stripe domestic 2.9% + $0.30, payout delay 7 days, annual cash cost 8%
   - Expect: deterministic net revenue, fee totals, payout drag, take-home per order, comparison rows

2. **TC-GR-02 direct-only scenario**
   - Input: Discover gross/orders = 0
   - Expect: Discover outputs gracefully resolve to zero or N/A without validation failure

3. **TC-GR-03 discover-only scenario**
   - Input: direct gross/orders = 0
   - Expect: direct processing fee = 0 and net is based only on Discover 30%

4. **TC-GR-04 PayPal preset increases direct fee drag vs Stripe**
   - Expect: processor fees higher and net revenue lower than Stripe baseline

5. **TC-GR-05 custom processor override**
   - Expect: result uses manual rate and flat fee

6. **TC-GR-06 payout drag sensitivity**
   - Compare 0-day vs 21-day payout delay
   - Expect: 21-day delay has higher payout drag and lower net

7. **TC-GR-07 invalid inputs rejected**
   - Negative gross
   - Gross > 0 with zero orders
   - Unknown preset
   - Custom rate >= 100
   - Delay > 365
   - Both direct and Discover gross = 0

## Discovery and scaffold cases
8. **TC-GR-08 HTML scaffold**
   - Expect page includes title, canonical, core field ids, summary textarea, comparison body, analytics include, calculator include

9. **TC-GR-09 discovery exact-once**
   - Expect slug exists exactly once in `tools/index.html`, `tools/index.md`, `_data/tools-list.json`, and `tools/manifest.json`

10. **TC-GR-10 SEO copy present**
   - Expect HTML contains `10% + $0.50`, `30% Discover`, and `Merchant of Record` explanatory copy
