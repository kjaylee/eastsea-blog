# Test Cases: Wedding Budget Calculator

## TC1: Default calculation
- Input: $30,000 budget, 100 guests, default %
- Expected: Venue=$13,500, Photo=$3,600, per-guest=$300, total=100%

## TC2: Custom percentage override
- Change Venue to 50%, verify other categories adjust, total %=100% warning if over

## TC3: Zero budget
- Input: $0 budget → all categories show $0, no errors

## TC4: Large budget
- Input: $500,000, 500 guests → per-guest=$1,000, no overflow

## TC5: Mobile responsive
- Verify layout works at 375px width

## TC6: Dark mode toggle
- Click theme button → all elements readable in dark mode

## TC7: HTML validity
- `node --check` equivalent: no syntax errors in script block
