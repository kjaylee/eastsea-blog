# Red Team — queue #85 upwork-fee-calculator recovery

- Failure mode 1: I append the tool again in a file that already contains it, creating duplicate discovery entries.
  - Mitigation: verify current counts first; insert only into files with zero structured matches; test exact-once by URL/object, not naive substring count.

- Failure mode 2: I backfill the wrong catalog copy and create SEO/discovery drift versus the page title/intent.
  - Mitigation: reuse the page/canonical wording from the existing HTML entry and keep the JSON description focused on tiered 20%/10%/5%, reverse calc, withdrawal comparison.

Agreement: 🟢 Proceed with surgical recovery only.
