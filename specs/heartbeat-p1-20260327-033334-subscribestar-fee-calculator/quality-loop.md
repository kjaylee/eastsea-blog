# Quality Loop — SubscribeStar Fee Calculator

## Pass 1 checklist
- Exact-match slug chosen with repo overlap check
- Official pricing assumptions documented
- Calculator engine separated into testable JS
- Bilingual UI included
- Discovery surfaces updated exactly once

## Pass 2 checklist
- Validate labels against actual modeled behavior
- Confirm reserve copy distinguishes cash timing vs true cost
- Confirm target/break-even outputs null out on invalid margins
- Re-run exact-once guard after manifest update

## Ship criteria
- All targeted checks green
- No unrelated file edits
- Commit scoped to this tool only
