# Payroll Tax Calculator - Test Cases

## TC-01: Baseline $75,000 salary
- SS employee: 75000 * 0.062 = 4650.00
- Medicare employee: 75000 * 0.0145 = 1087.50
- Additional Medicare: 0 (below threshold)
- Total employee: 5737.50
- SS employer: 4650.00
- Medicare employer: 1087.50
- FUTA: 7000 * 0.006 = 42.00
- SUTA: 7000 * 0.027 = 189.00
- Total employer: 5968.50
- Total payroll: 11706.00
- Net take-home: 75000 - 5737.50 = 69262.50

## TC-02: High earner $250,000 (above SS wage base and Medicare threshold)
- SS employee: 176100 * 0.062 = 10918.20
- Medicare employee: 250000 * 0.0145 = 3625.00
- Additional Medicare: (250000 - 200000) * 0.009 = 450.00
- Total employee: 14993.20
- SS employer: 10918.20
- Medicare employer: 3625.00
- FUTA: 42.00, SUTA: 189.00
- Total employer: 14774.20

## TC-03: Minimum wage (~$15,080/yr)
- All wages below all caps
- SS: 15080 * 0.062 = 934.96
- Medicare: 15080 * 0.0145 = 218.66
- FUTA: 7000 * 0.006 = 42.00
- SUTA: 7000 * 0.027 = 189.00

## TC-04: Exactly at SS wage base ($176,100)
- SS: 176100 * 0.062 = 10918.20 (exactly at cap)

## TC-05: Multiple employees (3 employees at $50,000)
- Per-employee SS: 50000 * 0.062 = 3100
- Per-employee FUTA: 42, SUTA: 189
- Annual totals x3

## TC-06: Custom SUTA rate (5.4% on $10,000 base)
- SUTA: 10000 * 0.054 = 540.00

## TC-07: Zero FUTA/SUTA rates
- FUTA=0, SUTA=0 -> employer taxes = SS + Medicare only

## TC-08: Wages exactly at additional Medicare threshold ($200,000)
- Additional Medicare = 0 (not exceeded)

## TC-09: Wages just above Medicare threshold ($200,001)
- Additional Medicare: 1 * 0.009 = 0.01 (rounded)

## TC-10: Validation - negative wages rejected
## TC-11: Validation - zero employees rejected
## TC-12: Very high salary ($1,000,000) - all caps applied correctly
