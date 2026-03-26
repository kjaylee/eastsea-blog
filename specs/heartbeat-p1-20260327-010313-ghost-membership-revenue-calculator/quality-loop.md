# Quality Loop

## Pass 1
- Choose the lowest-overlap exact-match slug.
- Keep the model narrow and platform-specific.

## Pass 2
- Ensure the tool stays evergreen by avoiding baked-in official plan tables.
- Add exact-once catalog assertions to prevent discovery drift.

## Pass 3
- Verify mobile-first layout, copy-summary flow, and bilingual labels.
- Confirm output explains monthly-equivalent treatment for annual members.

## Fixes During Verification
- Corrected a duplicated result-card DOM id so Ghost plan cost and plan break-even outputs render separately.
- Corrected test expectations for the monthly-equivalent Stripe fixed-fee model and the annual-heavy target scenario.
- Recorded localhost smoke as blocked by sandbox port-binding restrictions instead of leaving it ambiguous.
