# Research — mobile-ad-frequency-cap-roi-calculator

## Goal
새 수익화 도구 1개를 추가한다: 모바일 앱/게임의 광고 빈도 캡 조정이 순이익과 ROI에 미치는 영향을 계산.

## Existing patterns reviewed
1. `tools/api-minimum-commit-overage-profit-calculator/`
   - 입력/검증/요약복사/UI 패턴 재사용 가능.
2. `tools/index.html`
   - 신규 툴 카드 노출 패턴 확인.
3. `scripts/build-manifests.sh`
   - tools manifest 재생성 표준 경로 확인.

## Monetization rationale
- 광고 노출을 늘리면 단기 매출은 오르지만 리텐션이 손상될 수 있음.
- 반대로 빈도 캡을 낮추면 즉시 광고 매출은 줄지만 잔존 유저 가치가 개선될 수 있음.
- 운영팀은 두 효과를 합산한 월 순효과/ROI를 빠르게 산출할 필요가 있음.

## Scope
- 신규 slug: `tools/mobile-ad-frequency-cap-roi-calculator/`
- 파일: `index.html`, `script.js`
- KPI: 현재/목표 월 광고이익, 월 순효과, 기간 순효과, ROI, 회수기간, 손익분기 목표 노출수
- discoverability 반영: `tools/index.html`, `tools/index.md`, `tools/manifest.json`

## Risks
- 분모 0/음수로 손익분기 계산 불능 가능
- 입력값 비정상(음수/퍼센트 범위 초과)

## Mitigation
- 범위 검증 + 오류 패널 노출
- 손익분기 분모가 0 이하일 때 ‘계산 불가’ 처리
