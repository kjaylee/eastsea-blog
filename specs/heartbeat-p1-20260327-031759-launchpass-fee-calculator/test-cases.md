# Test Cases — LaunchPass Fee Calculator

## TC01 Golden default scenario
Default inputs produce stable gross, refund loss, LaunchPass fees, Stripe fees, take-home, net profit, break-even gross, and required gross values.

## TC02 Higher refund rate lowers profit
Holding gross and charge count constant, raising `refundRatePct` must reduce monthly net profit and worsen effective fee drag.

## TC03 International processor preset increases fee drag
Switching from domestic to international Stripe assumptions must lower take-home.

## TC04 Custom processor override works
Custom rate and flat fee must flow through processor fees, net profit, and target gross math.

## TC05 Break-even unavailable for impossible economics
If refund rate and fee stack push contribution margin to zero or below, break-even and target gross outputs must be `null`.

## TC06 Validation rejects invalid fields
Zero or negative gross sales, non-integer charges, negative fixed fees, and percentage inputs at or above 100 must fail validation.

## TC07 Discovery exact-once wiring
The slug appears exactly once in:
- `_data/tools-list.json`
- `tools/index.html`
- `tools/index.md`
- `tools/manifest.json`

## Manual smoke
- Load the page via localhost static server.
- Confirm title string is correct.
- Confirm default KPI output renders without a build step.
