# Payroll Tax Calculator - Research

## Overview
A US payroll tax calculator that computes employer and employee payroll tax obligations based on gross wages.

## Key Tax Components (2024/2025 rates used as baseline)

### Social Security (OASDI)
- Rate: 6.2% each for employer and employee (12.4% total)
- Wage base limit: $168,600 (2024) / $176,100 (2025)
- We use $176,100 as the default (2025)

### Medicare
- Rate: 1.45% each for employer and employee (2.9% total)
- No wage base limit
- Additional Medicare Tax: 0.35% on wages over $200,000 (employee only, single filer threshold)

### FUTA (Federal Unemployment Tax Act)
- Gross rate: 6.0% on first $7,000 of wages per employee
- Standard credit: 5.4% (if state taxes paid on time)
- Effective rate: 0.6% (employer only)

### SUTA (State Unemployment Tax Act)
- Varies by state; typically 0.5% to 5.4%
- Wage base varies by state ($7,000 to $56,500+)
- Default: 2.7% on first $7,000 (common new employer rate)

### Federal Income Tax Withholding
- Not computed here (too complex with W-4 variables)
- Calculator focuses on payroll taxes specifically

## Target Users
- Small business owners calculating labor costs
- Freelancers transitioning to hiring employees
- HR professionals estimating payroll budgets
- Accountants doing quick estimates

## Monetization
- High search volume: "payroll tax calculator", "employer payroll tax", "FICA calculator"
- Ad revenue from organic traffic
- Evergreen content (tax rates update annually)

## Competitive Landscape
- ADP, Gusto, QuickBooks all have payroll calculators but require signup
- Free standalone calculators are limited and often outdated
- Opportunity: clean, fast, no-signup calculator with employer+employee split view
