# Research — sunlit-buoy-forge

## Goal
혼합 메카닉(2개 이상) 기반 신규 게임 vertical slice 1개를 제작/검증/커밋한다.
필수 제약:
- 리듬게임 금지
- neon dark 톤 금지
- 고유 메카닉 필수

## Related files reviewed
1. `games/harvest-lane-broker/logic.mjs`
   - 상태 중심 pure logic 구조, run/dock 전환, 계약 정산 파이프라인 참고.
2. `games/harvest-lane-broker/app.mjs`
   - 모바일 캔버스 입력(버튼+터치) 및 HUD 렌더 패턴 참고.
3. `tests/unit/harvest-lane-broker.test.mjs`
   - `node:test` 기반 로직 단위테스트 케이스 조직 방식 참고.
4. `scripts/build-manifests.sh`
   - 신규 게임 slug를 `games/manifest.json`에 반영하는 표준 절차 확인.
5. `specs/orchard-signal-caravan-20260304-1141/*`
   - research→spec→plan→test-cases→verification→gap-analysis→launch-report 산출물 구조 확인.

## Chosen concept
- 게임명: **Sunlit Buoy Forge**
- 장르: 실시간 4레인 파일럿 + 병합 제작 + 전세(차터) 경제
- 비주얼: 라이트 샌드/코랄/스카이 계열(네온 다크 회피)

## Unique mechanic
**Wake Echo Draft**
- 이동 입력 마지막 4회가 교차 패턴(`L-R-L-R` 또는 `R-L-R-L`)이면 `Wake Echo` 충전 1회 생성.
- 충전 상태에서 다음 부표 코어 수집 시 수집량 2배 + 가치 증폭.
- 단, 같은 레인에서 연속 3회 수집하면 `Drag Tax` 페널티 적용(정산 배율 감소).

## Core loop draft
1) 4레인 항로에서 좌우 이동하며 코어 수집/암초 회피
2) 런 종료 후 코인/보석 정산(차터 + Wake Echo/Drag Tax 반영)
3) 도크에서 같은 티어 코어 병합
4) 다음 차터 선택 후 반복

## Test strategy
- 로직 테스트 8개:
  - 초기 상태
  - 런 시작 초기화
  - 레인 경계 + 교차 이동 Wake Echo 충전
  - Wake Echo 적용 수집 2배 반영
  - 3회 암초 충돌 강제 종료
  - 병합 규칙
  - 차터 비용/배율
  - Wake Echo 보너스 + Drag Tax 페널티
- 검증 명령:
  - `node --check games/sunlit-buoy-forge/logic.mjs`
  - `node --check games/sunlit-buoy-forge/app.mjs`
  - `node --test tests/unit/sunlit-buoy-forge.test.mjs`
  - `bash scripts/build-manifests.sh`
  - `python3 -m http.server` + `curl` title smoke
