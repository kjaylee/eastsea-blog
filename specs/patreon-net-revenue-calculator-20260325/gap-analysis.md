# Gap Analysis — Patreon Net Revenue Calculator

Current state
- Static tool implemented with adjustable presets; plan and processing presets are user‑editable.
- Catalog wired across `_data/tools-list.json` and `tools/manifest.json`.
- Index pages already contained links; no edits made there.

Known gaps / trade‑offs
- Regional VAT/GST handling: not modeled; creators typically receive amounts net of tax where Patreon is MoR.
- Tier‑level pricing structures: not modeled; UI uses average values per bucket.
- Payout method nuances (percent caps, currency conversion): simplified to flat + percent.
- Churn/lifetime: out of scope; the tool models a single monthly period snapshot.

Next best iterations
- Add optional tier table (Bronze/Silver/Gold) with per‑tier count/price if demand grows.
- Add region tax toggle for information only.
- Persist inputs to `localStorage` like other tools.
- Add downloadable CSV of fee breakdowns.

