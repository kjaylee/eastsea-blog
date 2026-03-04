# Research — orchard-signal-caravan

## Goal
신규 혼합 메카닉 게임 vertical slice 1개 제작/검증/커밋.
필수 제약:
- 메카닉 2개 이상 조합
- 리듬게임 금지
- neon dark 톤 금지
- 고유 메카닉 필수

## Related files reviewed
1. `games/harvest-lane-broker/logic.mjs`
   - 3레인 실시간 회피/수집 상태머신 구조, 계약 정산 흐름 확인.
2. `games/harvest-lane-broker/app.mjs`
   - 모바일 우선 캔버스 렌더 루프 및 입력 처리 패턴 참고.
3. `tests/unit/harvest-lane-broker.test.mjs`
   - pure logic 기반 단위 테스트 구성/네이밍 패턴 참고.
4. `scripts/build-manifests.sh`
   - 신규 게임 반영용 `games/manifest.json` 갱신 절차 확인.
5. `specs/harvest-lane-broker-20260304-1105/*`
   - research→spec→plan→test→verification→gap-analysis 산출물 구조 확인.

## Design direction
- 장르: 실시간 레인 주행 + 병합 성장 + 계약 경제 (비리듬).
- 비주얼 톤: warm daylight/pastel 배경(네온 다크 회피).
- 고유 메카닉: **Signal Chain Dividend**
  - 런 중 수집 티어 연속 패턴 `1→2→3` 달성 시 정산 배율 `x1.24`.
  - 동일 티어 3연속 수집 시 단조 패널티 `x0.79`.
  - 두 효과는 동시에 계산(곱연산).

## Chosen concept
- 게임명: **Orchard Signal Caravan**
- 코어 루프:
  1) 3레인에서 카트를 좌우 이동해 상자 수집/늑대 방해물 회피
  2) 런 종료 후 코인/젬 정산
  3) 도크에서 상자 병합(Tn+Tn→Tn+1)
  4) 다음 계약 선택(Village/Guild/Royal)

## Test strategy
- 로직 테스트 8개:
  - 초기 상태
  - 런 시작 초기화
  - 레인 클램프
  - 수집 충돌 반영
  - 3회 피격 강제 종료
  - 병합 규칙
  - 계약 비용/배율
  - Signal Chain 보너스 + 단조 패널티
- 검증 명령:
  - `node --check games/orchard-signal-caravan/logic.mjs`
  - `node --check games/orchard-signal-caravan/app.mjs`
  - `node --test tests/unit/orchard-signal-caravan.test.mjs`
  - `bash scripts/build-manifests.sh`
  - 로컬 `python3 -m http.server` + `curl` title smoke
