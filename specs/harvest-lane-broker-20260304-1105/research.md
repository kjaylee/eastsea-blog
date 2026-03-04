# Research — harvest-lane-broker

## Goal
신규 게임 vertical slice 1개를 제작/검증/커밋한다. 제약:
- 혼합 메카닉 2개 이상
- 리듬게임 금지
- neon dark 톤 금지
- 고유 메카닉 필수

## Related files reviewed
1. `games/sunlit-kite-mercantile/index.html`
   - 밝은 톤 모바일 레이아웃, HUD/캔버스/사이드패널 구성 참고.
2. `games/sunlit-kite-mercantile/logic.mjs`
   - 상태머신(dock/run), 계약 경제, 병합 로직 구조 참고.
3. `tests/unit/sunlit-kite-mercantile.test.mjs`
   - `node --test` 케이스 네이밍/검증 패턴 참고.
4. `scripts/build-manifests.sh`
   - `games/manifest.json` 재생성 방식 확인.
5. `specs/sunlit-kite-mercantile-20260304-1038/*`
   - research→spec→plan→test→verification→gap-analysis 산출물 포맷 참고.

## Design direction
- 장르: 실시간 레인 회피 + 병합 성장 + 계약 경제 의사결정 (비리듬)
- 화면 톤: warm light / pastel (neon dark 회피)
- 고유 메카닉: **Variety Dividend**
  - 런에서 T1/T2/T3를 모두 확보하면 정산 배당 보너스(+22%).
  - 반대로 한 티어 쏠림이 70% 이상(4개 이상 수집 시)이면 Oversupply 패널티(-22%).

## Chosen concept
- 게임명: **Harvest Lane Broker**
- 루프:
  1) 3레인에서 카트를 좌우 이동하며 상자 수집/까마귀 회피
  2) 런 종료 후 상자 인벤토리 및 코인/젬 정산
  3) 도크에서 상자 병합(Tn+Tn→Tn+1)
  4) 다음 런 계약 선택(Street/Brunch/Export)

## Test strategy
- 순수 로직 테스트 우선:
  - 초기 상태
  - 레인 클램프
  - 수집/피격 충돌
  - 병합 규칙
  - 계약 비용/배율 반영
  - Variety Dividend/Oversupply 패널티 발동 검증
- 정적 검증:
  - `node --check games/harvest-lane-broker/logic.mjs`
  - `node --check games/harvest-lane-broker/app.mjs`
- 통합 스모크:
  - `node --test tests/unit/harvest-lane-broker.test.mjs`
  - manifest 엔트리 확인
  - 로컬 서버 `curl` 타이틀 확인
