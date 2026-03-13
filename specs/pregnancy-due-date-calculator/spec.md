# Spec: Pregnancy Due Date Calculator

## Input
- Method selector: LMP date / Conception date
- Date picker for selected method

## Output
- Estimated Due Date (EDD)
- Current gestational age (weeks + days)
- Current trimester (1st/2nd/3rd)
- Weeks remaining
- Visual progress bar (40 weeks)
- Trimester milestone timeline

## Test Cases
1. LMP = today → EDD = today + 280 days, gestational age = 0w0d
2. LMP = 10 weeks ago → EDD = today + 210 days, gestational age = 10w0d, trimester 1
3. LMP = 28 weeks ago → trimester 3, 12 weeks remaining
4. Conception date = 10 weeks ago → EDD = conception + 266 days = LMP+14 + 266 = same as LMP + 280
5. Future date → show error
6. Date > 42 weeks ago → show "past due date" message

## Design
- Match existing tool design (dark/light theme, gradient accent, card layout)
- Korean language primary
- Mobile responsive
