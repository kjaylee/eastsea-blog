# Test Cases — ai-retainer-profit-planner

## Logic / unit
- TC-L-01: `targetMarginPct` out of range should fail validation.
- TC-L-02: Higher target margin should increase Growth tier suggested price.
- TC-L-03: Higher close rate should increase projected new clients and gross revenue.
- TC-L-04: Higher churn should reduce net revenue after churn.
- TC-L-05: Default scenario should produce finite, positive break-even clients.
- TC-L-06: Summary text should contain tier stack labels (Starter/Growth/Scale).

## Integration / smoke
- TC-I-01: `node --check` on `app.mjs` succeeds.
- TC-I-02: Local HTTP GET for `/tools/ai-retainer-profit-planner/` returns 200.
- TC-I-03: Served HTML contains `AI Retainer Profit Planner` title marker.
- TC-I-04: `tools/manifest.json` includes `ai-retainer-profit-planner` slug after manifest rebuild.
