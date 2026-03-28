# Test Cases — Amazon KDP Royalty Calculator

## Logic tests
1. `tc_kdp_01_ebook_35_percent_matches_public_example_style`
   - Input: US ebook, list price 0.99, VAT 0, 35% plan.
   - Expect: royalty per sale = 0.35 × 0.99 = 0.3465 → rounded output path stays ≈ 0.35.

2. `tc_kdp_02_ebook_70_percent_subtracts_delivery_cost`
   - Input: US ebook, list price 2.99, file size 2 MB, VAT 0, 70% plan, 100% eligible.
   - Expect: delivery cost = 0.30, royalty per sale ≈ 1.88.

3. `tc_kdp_03_ebook_partial_eligible_share_blends_35_and_70`
   - Input: 70% plan with eligible share below 100%.
   - Expect: blended royalty is between all-35 and all-70 outcomes.

4. `tc_kdp_04_paperback_us_below_threshold_uses_50_band`
   - Input: US paperback price 8.99.
   - Expect: Amazon royalty rate = 50%.

5. `tc_kdp_05_paperback_us_at_999_uses_60_band`
   - Input: US paperback price 9.99.
   - Expect: Amazon royalty rate = 60%.

6. `tc_kdp_06_paperback_expanded_distribution_uses_40_percent`
   - Input: paperback expanded distribution units.
   - Expect: expanded royalty per sale = 0.40 × list price - printing cost.

7. `tc_kdp_07_summary_contains_key_kdp_outputs`
   - Expect: summary mentions KDP, royalty per sale, monthly royalty, and relevant band/plan.

## Structural tests
8. `tc_kdp_08_structural_metadata_present`
   - Expect: canonical, JSON-LD WebApplication, aria-live results region, and KDP warning copy exist.

9. `tc_kdp_09_catalog_wiring_exact_once`
   - Expect: tool slug exists exactly once in `tools/index.html`, `tools/index.md`, `_data/tools-list.json`, and `tools/manifest.json`.

## Verification tests
10. `tc_kdp_10_local_http_serves_expected_page_copy`
   - Expect: local HTTP response includes `Amazon KDP Royalty Calculator`, `35%`, `70%`, `Expanded Distribution`.
