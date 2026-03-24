# Test Cases — App Store vs Web Checkout Profit Calculator

## TC01 Golden default scenario
Given the default fixture, calculator returns stable gross, recognized revenue, fee, net, monthly delta, annual delta, break-even capture, and required web price values.

## TC02 Better web capture improves economics
Holding all else constant, higher `webCaptureRatePct` must increase `webNetTakeHome` and improve monthly delta.

## TC03 Low web capture can make App Store win
With severe app-to-web leakage, App Store net must exceed web net even when App Store fee rate is high.

## TC04 Break-even capture behaves as threshold
If current capture is below break-even, web under-earns vs App Store. If above break-even, web out-earns App Store.

## TC05 Required web price increases when current setup under-earns
When current web assumptions trail App Store, `requiredWebPrice` should be greater than current `webPrice`.

## TC06 Validation rejects invalid fields
Zero/negative prices, negative fixed cost, non-integer customer count, and percentage values above 100 should fail validation.

## Manual smoke
- Open the page locally through a static server.
- Confirm HTML title loads.
- Confirm the page renders default KPI output without console-required build steps.
