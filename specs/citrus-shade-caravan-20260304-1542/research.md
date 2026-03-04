# Research — citrus-shade-caravan

## Goal
혼합 메카닉(2개 이상) 기반 신규 게임 vertical slice를 빠르게 제작/검증/커밋한다.

## References reviewed
1. `games/sunlit-buoy-forge/logic.mjs`
   - phase 기반 상태 전이(`dock`/`run`)
   - lane survival + merge + charter economy 결합 구조
   - deterministic 주입 테스트를 위한 `withInjectedTokens` 패턴
2. `games/sunlit-buoy-forge/app.mjs`
   - 캔버스 렌더 루프/입력 이벤트/저장 흐름
3. `games/sunlit-buoy-forge/index.html`
   - 모바일 우선 레이아웃, HUD + 경제 패널 배치
4. `tests/unit/sunlit-buoy-forge.test.mjs`
   - node:test 기반 8개 케이스 템플릿
5. `specs/sunlit-buoy-forge-20260304-1457/*`
   - spec→test-cases→verification→gap-analysis 산출물 포맷

## Design decision
- **Game slug**: `citrus-shade-caravan`
- **Mechanic A (실시간 회피)**: 3레인 카트 회피 + 런 타이머
- **Mechanic B (성장/병합)**: 수확 상자 티어 병합(T1~T5)
- **Mechanic C (경제)**: 계약 선결제 + 정산 배율
- **Unique mechanic**: `Shade Swap Ledger`
  - 수확 태그(`sun`/`shade`)를 4연속 교차(ABAB)로 맞추면 charge 1 획득
  - charge 상태의 다음 수확은 2배 적재 + 가치 증폭
  - 같은 레인 3연속 수확 시 crowd penalty 배율 적용

## Constraint checks (pre-implementation)
- 리듬/BPM/박자 판정 요소 사용하지 않음
- neon dark 팔레트 배제(밝은 크림/시트러스 톤)
- 외부 API/네트워크 의존 없음
- 모바일 터치 입력 지원

## Verification plan (to execute)
- `node --check games/citrus-shade-caravan/logic.mjs`
- `node --check games/citrus-shade-caravan/app.mjs`
- `node --test tests/unit/citrus-shade-caravan.test.mjs`
- `bash scripts/build-manifests.sh`
- `curl` 로컬 서버 타이틀 스모크
- `node -e`로 unique mechanic 결과 스냅샷 확인
