# Employee Cost Calculator - Test Cases

## TC-01: Baseline US employee ($75,000 salary)
- Input: defaults (salary=75000, SS=6.2%, cap=168600, Medicare=1.45%, FUTA=0.6%/7000, SUTA=2.7%/7000, health=7500, dental=600, 401k=4%, WC=1%, equip=3000, office=5000, training=1000, other=0, PTO=15d, 40h/wk, 52wk)
- SS tax: 75000*0.062 = 4650
- Medicare: 75000*0.0145 = 1087.50
- FUTA: 7000*0.006 = 42
- SUTA: 7000*0.027 = 189
- Total tax: 5968.50
- Retirement: 75000*0.04 = 3000
- WC: 75000*0.01 = 750
- Total benefits: 7500+600+3000+750 = 11850
- Total overhead: 3000+5000+1000+0 = 9000
- Total cost: 75000+5968.50+11850+9000 = 101818.50
- Monthly: 101818.50/12 = 8484.88
- Productive hours: 52*40 - 15*8 = 2080-120 = 1960
- Hourly: 101818.50/1960 = 51.95
- Multiplier: 101818.50/75000 = 1.3576

## TC-02: High earner above SS wage cap ($200,000)
- salary=200000, SS capped at 168600
- SS: 168600*0.062 = 10453.20
- Medicare: 200000*0.0145 = 2900
- FUTA: 7000*0.006=42, SUTA: 7000*0.027=189
- Tax total: 13584.20
- Retirement: 200000*0.04 = 8000
- WC: 200000*0.01 = 2000
- Benefits: 7500+600+8000+2000 = 18100
- Overhead: 9000
- Total: 200000+13584.20+18100+9000 = 240684.20

## TC-03: Minimum wage / part-time (salary=$20,000, 20h/wk)
- SS: 20000*0.062 = 1240
- Medicare: 20000*0.0145 = 290
- FUTA: 7000*0.006=42, SUTA: 7000*0.027=189
- Tax: 1761
- Retirement: 20000*0.04=800, WC: 20000*0.01=200
- Benefits: 7500+600+800+200 = 9100
- Overhead: 9000
- Total: 20000+1761+9100+9000 = 39861
- Hours: 52*20 - 15*4 = 1040-60 = 980
- Hourly: 39861/980 = 40.67

## TC-04: Zero benefits and overhead
- salary=50000, all benefits=0, all overhead=0, retirement=0%, WC=0%
- Tax only: SS=3100, Medicare=725, FUTA=42, SUTA=189 => 4056
- Total: 54056

## TC-05: No PTO (PTO=0 days)
- salary=75000, PTO=0
- Productive hours: 52*40 = 2080
- Total cost same as TC-01 = 101818.50
- Hourly: 101818.50/2080 = 48.95

## TC-06: High state taxes (SUTA rate=5.4%, cap=56500)
- salary=75000, sutaRate=5.4, sutaWageCap=56500
- SUTA: 56500*0.054 = 3051
- vs baseline 189 => significant increase

## TC-07: No retirement match (retirementMatchRate=0)
- salary=75000, retirementMatchRate=0
- Benefits drop by 3000

## TC-08: Validation rejects salary=0
- Input: salary=0 -> error

## TC-09: Validation rejects negative values
- Input: salary=-1 -> error

## TC-10: Validation rejects invalid hours
- Input: workingHoursPerWeek=0 -> error
- Input: workingHoursPerWeek=200 -> error

## TC-11: Summary contains required fields
- Check summary text includes key labels and values

## TC-12: Salary exactly at SS wage cap
- salary=168600
- SS: 168600*0.062 = 10453.20 (exactly at cap)
