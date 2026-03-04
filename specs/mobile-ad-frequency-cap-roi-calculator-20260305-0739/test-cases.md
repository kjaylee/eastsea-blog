# Test Cases — mobile-ad-frequency-cap-roi-calculator

## Validation
1. 퍼센트 입력(0~100) 범위 초과 시 오류 노출
2. DAU/기간/노출수 음수 입력 시 오류 노출

## Calculation behavior
3. 목표 노출수 증가 시 광고 이익 변화량(adDelta)이 증가
4. 리텐션 개선폭 증가 시 월 순효과(monthlyNet) 증가
5. 월 운영비 증가 시 monthlyNet 감소

## Edge handling
6. `k * unitMarginCpm <= 0`이면 손익분기 목표 노출수를 계산 불가로 표시
7. `monthlyNet <= 0`이면 회수기간을 ‘회수 불가’로 표시

## Output quality
8. 요약 텍스트에 월 순효과, 기간 순효과, ROI, 손익분기 노출수가 포함
