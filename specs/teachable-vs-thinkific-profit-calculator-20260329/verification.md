# Verification — teachable-vs-thinkific-profit-calculator

## File exists
- ✅ `tools/teachable-vs-thinkific-profit-calculator/index.html` — 21.5KB single HTML

## JS syntax
- ✅ `node -e "new Function(scriptContent)"` — passes

## Test case validation
### TC1: $100 × 20, monthly
- ✅ Teachable Builder: net=$1847 (best Teachable)
- ✅ Thinkific Start: net=$1797 (best Thinkific)
- ✅ Winner: Teachable by $50

### TC2: $50 × 5, monthly
- ✅ Teachable Starter: net=$183.50 (best Teachable)
- ✅ Thinkific Basic: net=$179.75 (best Thinkific)
- ✅ Winner: Teachable by $3.75

### TC3: $200 × 100, annual
- ✅ Teachable Builder: net=$19,321 (best Teachable)
- ✅ Thinkific Grow: net=$19,041 (best Thinkific)
- ✅ Winner: Teachable by $280

### TC4: Zero sales
- ✅ Teachable Starter: net=-$39
- ✅ Thinkific Basic: net=-$49

## Catalog wiring
- ✅ `_data/tools-list.json` — entry present (735 total)
- ✅ `tools/manifest.json` — entry present (735 total)

## Metadata
- ✅ Canonical URL
- ✅ OG tags
- ✅ Twitter card
- ✅ JSON-LD WebApplication schema
- ✅ Analytics script

## Git
- ✅ Committed: 87b11e2
- ✅ Pushed to origin/master
