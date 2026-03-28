# Test Cases — teachable-vs-thinkific-profit-calculator

## TC1: Basic calculation at $100 × 20 sales/mo, monthly billing
- Teachable Starter: sub=$39, txFee=20×100×7.5%=$150, proc=20×100×2.9%+20×0.30=$64, total=$253, net=$2000-$253=$1747
- Teachable Builder: sub=$89, txFee=$0, proc=$64, total=$153, net=$1847
- Thinkific Basic: sub=$49, txFee=2000×5%=$100, proc=$64, total=$213, net=$1787
- Thinkific Start: sub=$99, txFee=2000×2%=$40, proc=$64, total=$203, net=$1797
- Best Teachable: Builder ($1847), Best Thinkific: Start ($1797)
- Winner: Teachable by $50

## TC2: Low volume $50 × 5 sales/mo, monthly billing
- Gross: $250
- Teachable Starter: sub=$39, tx=$18.75, proc=$250×2.9%+5×0.30=$8.75, total=$66.50, net=$183.50
- Teachable Builder: sub=$89, tx=$0, proc=$8.75, total=$97.75, net=$152.25
- Thinkific Basic: sub=$49, tx=$12.50, proc=$8.75, total=$70.25, net=$179.75
- Best Teachable: Starter ($183.50), Best Thinkific: Basic ($179.75)
- Winner: Teachable by $3.75

## TC3: High volume $200 × 100 sales/mo, annual billing
- Gross: $20,000
- Teachable Builder: sub=$69, tx=$0, proc=$20000×2.9%+100×0.30=$610, total=$679, net=$19321
- Teachable Growth: sub=$139, tx=$0, proc=$610, total=$749, net=$19251
- Thinkific Basic: sub=$36, tx=$1000, proc=$610, total=$1646, net=$18354
- Thinkific Start: sub=$74, tx=$400, proc=$610, total=$1084, net=$18916
- Thinkific Grow: sub=$149, tx=$200, proc=$610, total=$959, net=$19041
- Best Teachable: Builder ($19321), Best Thinkific: Grow ($19041)
- Winner: Teachable by $280

## TC4: Zero sales should show negative net (subscription only)
- Teachable Starter: net = -$39
- Thinkific Basic: net = -$49

## TC5: Course price = 0 should be handled gracefully (free course)
