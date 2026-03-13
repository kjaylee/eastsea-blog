# Spec: Wedding Budget Calculator

## Tool ID
`wedding-budget-calculator`

## Title
Wedding Budget Calculator | 결혼 예산 계산기

## Description
Plan your wedding budget with recommended category allocations. Enter total budget and guest count to get a detailed breakdown with per-guest costs.

## Inputs
- Total budget (currency, default $30,000)
- Number of guests (default 100)
- Custom % override per category (optional)

## Categories & Default %
| Category | Default % |
|----------|-----------|
| Venue & Catering | 45% |
| Photography & Video | 12% |
| Flowers & Decor | 8% |
| Music & Entertainment | 7% |
| Attire & Beauty | 7% |
| Stationery & Invitations | 3% |
| Transportation | 3% |
| Favors & Gifts | 3% |
| Wedding Planner | 5% |
| Miscellaneous Buffer | 7% |

## Outputs
1. Per-category dollar amounts
2. Per-guest cost
3. Visual pie/bar chart breakdown
4. Remaining/over-budget indicator
5. Print-friendly summary

## Non-functional
- Single HTML file, no external deps (except /assets/analytics.js)
- Dark/light theme toggle
- Responsive (mobile-first)
- Korean + English bilingual
- Matches site design system (gradient header, card layout, CSS variables)
