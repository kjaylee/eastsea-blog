# P1 Games Batch Spec (2026-03-02 23:21 KST)

## Scope
신규 HTML5 게임 2종을 `games/{slug}/index.html` 단일 파일로 추가한다.

## New Games
1. **pulp-route-allocator** (strategy/sim)
   - 컨셉: 제한된 펄프 공급을 여러 마을 수요에 배분하는 분배 전략.
   - 핵심 메커닉: 마을별 수요 바를 드래그/키보드로 배분 → 하루 결산 → 신뢰도/점수 누적.
   - 팔레트: 우드/페이퍼 (따뜻한 베이지, 브라운).
2. **tether-shield-ward** (action/defense)
   - 컨셉: 중앙 코어를 보호하는 테더형 실드 각도/반경을 조작해 발사체를 튕겨내는 방어.
   - 핵심 메커닉: 드래그로 실드 각도+반경 조정, 연속 스폰되는 위협을 반사.
   - 팔레트: 카툰 스타일의 밝은 색조.

## Mandatory Constraints
- LittleJS `<script>` 태그 포함 (엔진 요건) — 실제 렌더/입력은 Canvas 2D만 사용
- `engineInit` 금지
- 단일 파일 게임 (`index.html`만)
- 모바일 레터박스 대응 (고정 해상도 + 중앙 정렬)
- 네온/리듬/단순클릭 금지, 고유 메카닉 유지
- 파일 크기 < 500KB

## Deliverables
- `games/pulp-route-allocator/index.html`
- `games/tether-shield-ward/index.html`
