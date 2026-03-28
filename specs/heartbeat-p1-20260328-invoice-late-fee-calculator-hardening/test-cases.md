# Test Cases — Invoice Late Fee Calculator Hardening

## Logic
1. **TC-ILF-01 baseline default case**
   - Input: defaults from page
   - Expect: billable days 23, positive interest, total due > principal, status = warning/mid.
2. **TC-ILF-02 grace period blocks both interest and fixed fee**
   - Input: days late <= grace
   - Expect: billable days 0, late interest 0, fixed fee with tax 0, total due = principal.
3. **TC-ILF-03 invalid negative amount rejected**
   - Expect: validation error, null result.
4. **TC-ILF-04 scenario override recalculates independently**
   - Input: same base values, custom scenario 90 days
   - Expect: larger late interest and total due than default case.
5. **TC-ILF-05 summary text includes decision-ready outputs**
   - Expect: summary contains principal, days late, rate, late interest, fee, total due.

## Discovery
6. **TC-ILF-06 catalog exact-once**
   - Expect: exact-one URL entry in `_data/tools-list.json` and exact-one markdown link in `tools/index.md`.
