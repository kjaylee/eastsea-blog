# Etsy Shipping Calculator - Research

## Problem
Etsy sellers need to estimate shipping costs before listing items. Shipping cost depends on package weight, dimensions, origin/destination, and carrier. Undercharging shipping eats into profit; overcharging loses sales.

## Etsy Shipping Fee Structure (2026)
- Etsy offers integrated shipping labels (USPS, FedEx, UPS in US; Royal Mail in UK, etc.)
- Sellers get discounted rates through Etsy Labels
- Etsy charges a 6.5% transaction fee ON the shipping amount charged to buyers
- Free shipping guarantee threshold: $35 USD (US domestic) - optional but boosts search rank

## Key Shipping Variables
1. **Package weight** (oz/lbs or g/kg)
2. **Package dimensions** (L x W x H) - for dimensional weight calculation
3. **Origin country/zip**
4. **Destination country/zip**
5. **Carrier** (USPS, UPS, FedEx, Royal Mail, Canada Post, Australia Post)
6. **Service level** (First Class, Priority, Express, Ground, etc.)

## Dimensional Weight Formula
- USPS: (L x W x H) / 166 (for Priority Mail)
- UPS/FedEx: (L x W x H) / 139
- Billable weight = max(actual weight, dimensional weight)

## USPS Rate Tiers (simplified 2025-2026 estimates)
- First Class Mail (under 13 oz): $3.50 - $6.00
- Priority Mail (1-70 lbs): $8.00 - $45.00+ by zone
- Priority Mail Express: $27.00+
- Parcel Select Ground: $7.50+

## Etsy Transaction Fee on Shipping
- 6.5% of the shipping amount charged to the buyer
- This is often overlooked by new sellers

## Target Users
- New Etsy sellers setting shipping prices
- Existing sellers optimizing shipping costs
- Sellers deciding between free shipping and charged shipping

## Monetization Angle
- High search volume: "etsy shipping calculator", "etsy shipping cost"
- Practical tool every Etsy seller needs
- Complements existing etsy-fee-profit-calculator
