# Depth of Field Calculator — Spec

**Slug**: `depth-of-field-calculator`
**Date**: 2026-03-18
**Category**: Photography / Cinematography
**Target user**: Photographers, cinematographers, hobbyist shooters

## Search Intent
- "depth of field calculator" — high volume, clear buyer intent (camera gear research)
- "dof calculator online" / "hyperfocal distance calculator"
- Users planning lens purchases, shot composition, print-readiness

## Monetization Angles
- Camera/lens affiliate links (Amazon, B&H Photo)
- Ad placement for photography gear
- Lead-gen for photography courses

## Core Features
1. **Inputs**:
   - Camera sensor format (preset: Full Frame, APS-C Canon, APS-C Nikon/Sony, Micro 4/3, Medium Format, 1-inch, custom CoC)
   - Focal length (mm)
   - Aperture (f-stop)
   - Subject distance (m or ft, toggle)
2. **Outputs**:
   - Near focus limit
   - Far focus limit
   - Total depth of field
   - Hyperfocal distance
   - Circle of confusion used
   - DoF in front / behind subject
   - Percentage in front / behind
3. **Visual**: DoF diagram showing near/far limits, subject, and camera
4. **Bilingual**: EN/KO toggle
5. **Responsive**: Mobile-first
6. **No dependencies**: Vanilla JS, single HTML file + calculator.js

## Physics
- Circle of Confusion (CoC) per sensor size
- Hyperfocal distance H = (f² / (N × c)) + f
- Near limit Dn = (s × (H - f)) / (H + s - 2f)
- Far limit Df = (s × (H - f)) / (H - s) [if s < H, else ∞]
- DoF = Df - Dn

## Quality Checklist
- [ ] Correct DoF math verified against known references
- [ ] All sensor presets have correct CoC values
- [ ] Unit toggle (m/ft) works correctly
- [ ] Hyperfocal distance displayed
- [ ] Visual DoF diagram renders
- [ ] Bilingual EN/KO
- [ ] Mobile responsive
- [ ] analytics.js script tag present
- [ ] No external dependencies
- [ ] calculator.test.js passes all cases

## Test Cases (see test file)
- Full frame, 50mm, f/1.8, 3m → known DoF ~0.27m
- APS-C, 35mm, f/2.8, 5m → verify against reference
- Hyperfocal scenario: should show far limit = ∞
- Edge: very close distance, very wide aperture
- Edge: telephoto at distance (narrow DoF)
- Unit toggle preserves values correctly
