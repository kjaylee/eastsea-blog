# Red Team — Creator Brand Deal Take-home Calculator

## Attacks
- **Attack 1:** “This duplicates the sponsorship-rate calculator.”
  - Counter: that tool estimates a price from audience performance. This tool starts from deal terms and answers take-home + target-net quote math.
- **Attack 2:** “The page could imply tax certainty.”
  - Counter: tax is modeled only as a user-entered reserve percentage with explicit planning-only copy.
- **Attack 3:** “Rep/platform deductions might be stacked incorrectly.”
  - Counter: v1 treats all percentage deductions as gross-quote percentages and surfaces them individually in the breakdown so the assumption is visible.
- **Attack 4:** “A target-net solver can silently return nonsense when deductions are too high.”
  - Counter: validation blocks combined percentage deductions at or above 100%, and impossible states return unavailable/infinite outputs instead of fake values.
- **Attack 5:** “Creators may expect audience benchmarking or usage-right presets.”
  - Counter: scope copy explicitly says this is deal-economics math, not market-rate benchmarking. Adjacent tools handle benchmarking-style questions.

## Residual risk acceptance
- The tool is intentionally generic and same-currency. It does not know jurisdiction-specific tax rules or platform-specific contract clauses.
- That is acceptable for v1 because the primary job is transparent negotiation arithmetic, not legal/compliance automation.
