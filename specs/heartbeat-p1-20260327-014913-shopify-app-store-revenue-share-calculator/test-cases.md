# Test Cases — shopify-app-store-revenue-share-calculator

- [x] Baseline case remains fully inside the 0% band and shows zero revenue-share fee.
- [x] Threshold-crossing case splits recognized revenue between 0% and 15% bands.
- [x] Above-threshold case applies revenue share to the full recognized month.
- [x] Break-even can be solved before threshold exhaustion.
- [x] Break-even can be solved after threshold crossover.
- [x] Impossible break-even returns no target.
- [x] Invalid tax-reserve + revenue-share combinations are rejected.
- [x] HTML contains exact-match title and core labels.
- [x] `tools/index.html` contains exactly one link/card for the slug.
- [x] `tools/index.md` contains exactly one markdown row for the slug.
- [x] `tools/manifest.json` contains exactly one slug entry.
- [ ] Localhost smoke returns the expected page title if server launch is possible.
  - blocked by sandbox permission error when binding local port
