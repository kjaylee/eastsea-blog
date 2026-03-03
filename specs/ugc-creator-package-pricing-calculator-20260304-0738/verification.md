# Verification Evidence — ugc-creator-package-pricing-calculator

## 1) Unit tests
Command:
```bash
node --test tests/unit/ugc-creator-package-pricing-calculator.test.mjs
```
Result:
- suites: 1
- tests: 6
- pass: 6
- fail: 0

## 2) Syntax checks
Command:
```bash
node --check tools/ugc-creator-package-pricing-calculator/app.mjs
node --check tools/ugc-creator-package-pricing-calculator/logic.mjs
```
Result:
- `app.mjs syntax: OK`
- `logic.mjs syntax: OK`

## 3) Local route availability (static serve + curl)
Command:
```bash
python3 -m http.server 4173
curl -s http://127.0.0.1:4173/tools/ugc-creator-package-pricing-calculator/ | grep -E "UGC Creator Package Pricing Calculator|크리에이터 UGC 패키지 단가 계산기"
```
Result snippet:
- `<title>UGC Creator Package Pricing Calculator | 크리에이터 UGC 패키지 단가 계산기</title>`
- `<h1>📈 크리에이터 UGC 패키지 단가 계산기</h1>`

## 4) Deterministic logic sample
Command:
```bash
node -e "import('./tools/ugc-creator-package-pricing-calculator/logic.mjs').then(m=>{const r=m.calculatePackageQuote(m.DEFAULT_INPUT); console.log(JSON.stringify({quoteToBrand:r.quoteToBrand,creatorTakeHome:r.creatorTakeHome,projectedBrandRoi:r.projectedBrandRoi,status:r.status},null,2));})"
```
Result:
```json
{
  "quoteToBrand": 6569167.06,
  "creatorTakeHome": 5583792,
  "projectedBrandRoi": 0.66,
  "status": "risky"
}
```
