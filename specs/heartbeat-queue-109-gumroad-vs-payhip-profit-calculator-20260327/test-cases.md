# Test Cases — queue #109 Gumroad vs Payhip Profit Calculator

## Deterministic math
1. Default inputs return `ok=true`, select the best Payhip plan, and produce stable net / delta / payback values.
2. Invalid `averageOrderValue` is rejected.
3. Payback is `null` when no Payhip plan beats Gumroad.
4. Tie-breaking prefers higher net, then lower fee total.
5. `breakEvenGrossVsGumroad` is finite when a monthly-fee plan has better unit economics.
6. `breakEvenGrossVsGumroad` is `null` when a plan never catches up.
7. Custom processor overrides change outputs deterministically.

## HTML / SEO anchors
8. HTML includes:
   - exact-match title copy
   - canonical URL
   - analytics include
   - summary textarea anchor
   - adjacent Gumroad / Payhip related links

## Discovery wiring
9. `tools/index.html` contains `gumroad-vs-payhip-profit-calculator` exactly once.
10. `tools/index.md` contains `gumroad-vs-payhip-profit-calculator` exactly once.
11. `_data/tools-list.json` contains `/tools/gumroad-vs-payhip-profit-calculator/` exactly once.
12. `tools/manifest.json` contains one structured object with:
    - `slug = gumroad-vs-payhip-profit-calculator`
    - `url = /tools/gumroad-vs-payhip-profit-calculator/`

## Localhost smoke
13. `curl -I` to the localhost path returns `200 OK`.
14. Page body contains:
    - `Gumroad vs Payhip Profit Calculator`
    - `Best Payhip plan`
    - `Gumroad net`
    - `Payhip fee calculator`
