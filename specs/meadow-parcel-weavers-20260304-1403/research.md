# Research — meadow-parcel-weavers

## Goal
신규 혼합 메카닉 게임 vertical slice 1개를 제작/검증/커밋한다.
제약:
- 메카닉 2개 이상 결합
- 리듬게임 금지
- neon 다크 톤 금지
- 고유 메카닉 필수

## Related files reviewed
1. `games/harbor-thread-atelier/index.html`
   - 모바일 우선 2패널 레이아웃 + 캔버스 HUD 구조 참고.
2. `games/harbor-thread-atelier/logic.mjs`
   - dock/run 상태머신, 계약 경제, 병합 루프 패턴 참고.
3. `tests/unit/harbor-thread-atelier.test.mjs`
   - 순수 로직 단위 테스트(초기값/충돌/정산/패턴) 구성 방식 참고.
4. `specs/harbor-thread-atelier-20260304-1230/spec.md`
   - 혼합 메카닉 명시 및 제약 문서화 형식 참고.
5. `scripts/build-manifests.sh`
   - 신규 게임 등록 후 manifest 갱신 절차 확인.

## Design direction
- 장르: 실시간 레인 회피 + 병합 성장 + 계약 경제 (비리듬)
- 화면 톤: warm light / pastel paper (neon dark 회피)
- 고유 메카닉: **Ribbon Arc Dividend**
  - 수집된 레인 히스토리에서 3연속 스윕(0→1→2 또는 2→1→0) 성립 시 배당 보너스(+24%)
  - 동일 레인 3연속 수집 시 Route Rut 패널티(-21%)

## Chosen concept
- 게임명: **Meadow Parcel Weavers**
- 루프:
  1) 3레인에서 카트를 좌우 이동하며 Parcel 수집 / Puddle 회피
  2) 런 종료 시 계약/패턴 규칙 기반 정산
  3) 부두에서 Parcel 병합(Tn+Tn→Tn+1)
  4) 다음 런 계약(Local/Market/Festival) 선택

## Test strategy
- 순수 로직 테스트:
  - 초기값/레인클램프/충돌/병합/계약
  - Ribbon Arc Dividend + Route Rut 패널티 검증
- 정적 검증:
  - `node --check games/meadow-parcel-weavers/logic.mjs`
  - `node --check games/meadow-parcel-weavers/app.mjs`
- 통합 스모크:
  - `node --test tests/unit/meadow-parcel-weavers.test.mjs`
  - `bash scripts/build-manifests.sh`
  - manifest 엔트리 조회
  - 로컬 서버 + `curl` title 확인
