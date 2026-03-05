# Test Cases — In-app Tip Jar Profit Calculator

1. **Valid defaults render**
   - Load tool with default values.
   - Expect KPIs populated (no dashes), ROI numeric, status message visible.

2. **Validation: conversion > 100%**
   - Set 팁 전환율 to 150.
   - Expect error message and KPI placeholders.

3. **Validation: net per tip <= 0**
   - Set 평균 팁 금액 very low and fees high so net per tip <= 0.
   - Expect break-even conversion to show `N/A` and status to warn.

4. **Payback when monthly net <= 0**
   - Set 월 운영비 extremely high.
   - Expect payback to show `N/A` and ROI negative.

5. **Summary copy**
   - Click “요약 복사”.
   - Expect clipboard contains summary block (manual check).
