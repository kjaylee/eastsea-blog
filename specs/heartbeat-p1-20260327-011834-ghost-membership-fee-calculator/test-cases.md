# Test Cases

- TC-01: Default Publisher scenario returns expected gross revenue, fees, net take-home, and target-member outputs.
- TC-02: Self-hosted preset removes Ghost monthly plan cost and emits self-hosted warning text.
- TC-03: Ghost(Pro) Starter rejects paid monetization inputs.
- TC-04: Custom monthly Ghost cost overrides preset pricing.
- TC-05: One-time revenue without one-time payment count is rejected.
- TC-06: Negative contribution margin returns `null` for break-even and target gross outputs.
- TC-07: Summary includes take-home and target fields.
- TC-08: Catalog discovery wiring includes the slug exactly once in each required file.
