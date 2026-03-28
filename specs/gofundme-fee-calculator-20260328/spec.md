# Spec — GoFundMe Fee Calculator

## Slug
`gofundme-fee-calculator`

## Title
GoFundMe Fee Calculator | 고펀드미 수수료 계산기

## Primary user
Fundraiser organizers estimating how much they actually keep after public transaction fees and campaign-side costs.

## Scope
Build one static, client-only calculator under `tools/gofundme-fee-calculator/` that:
1. models public US individual/business fundraiser fee assumptions
2. distinguishes organizer net from donor checkout total in recurring mode
3. computes break-even and target average donation amounts
4. ships with deterministic test coverage
5. is wired into `tools/manifest.json` via manifest rebuild

## Inputs
- `donationCount` integer >= 0
- `averageDonationAmount` currency >= 0
- `recurringMonthlyDonation` boolean
- `transactionFeeRatePct` default 2.9
- `transactionFixedFee` default 0.30
- `recurringDonorFeePct` default 5
- `campaignCosts` default 150
- `targetNetAmount` default 3000
- `currency` formatting only
- `lang` summary/status only

## Core math
- `grossDonations = donationCount * averageDonationAmount`
- `transactionFees = grossDonations * feeRate + donationCount * fixedFee`
- `organizerNetBeforeCosts = grossDonations - transactionFees`
- `campaignNetAfterCosts = organizerNetBeforeCosts - campaignCosts`
- `donorExtraRecurringFee = recurring ? grossDonations * recurringFeeRate : 0`
- `donorCheckoutTotal = grossDonations + donorExtraRecurringFee`
- `effectiveOrganizerFeeRatePct = grossDonations > 0 ? (transactionFees / grossDonations) * 100 : 0`
- `netPerDonationAfterCosts = donationCount > 0 ? campaignNetAfterCosts / donationCount : 0`
- `breakEvenAverageDonation = (campaignCosts + donationCount * fixedFee) / (donationCount * (1 - feeRate))`
- `targetAverageDonation = (targetNetAmount + campaignCosts + donationCount * fixedFee) / (donationCount * (1 - feeRate))`
- For zero donations or non-positive denominator, break-even / target outputs return `null`.

## Validation
- counts must be finite integers >= 0
- monetary values must be finite >= 0
- percentages must be finite >= 0 and < 100

## Outputs
- gross donations
- transaction fees
- organizer net before costs
- campaign net after costs
- donor extra recurring fee
- donor checkout total
- effective organizer fee rate
- net per donation after costs
- break-even average donation
- target average donation
- summary block

## Deliverables
- `tools/gofundme-fee-calculator/index.html`
- `tools/gofundme-fee-calculator/calculator.js`
- `tools/gofundme-fee-calculator/calculator.test.js`
- rebuilt `tools/manifest.json`

## Non-goals
- GoFundMe Pro custom pricing
- charity-specific pricing
- international FX / AMEX / processor exceptions
- donor-tip modeling
- catalog-surface wiring in `tools/index.html`, `tools/index.md`, `_data/tools-list.json`
