# Research — harbor-thread-atelier

## Goal
신규 혼합 메카닉 게임 vertical slice 1개를 제작/검증/커밋한다.
제약:
- 메카닉 2개 이상 결합
- 리듬게임 금지
- neon 다크 톤 금지
- 고유 메카닉 필수

## Related files reviewed
1. `games/orchard-signal-caravan/index.html`
   - 모바일 우선 2패널 레이아웃, canvas+HUD 구조 참고.
2. `games/orchard-signal-caravan/logic.mjs`
   - dock/run 상태머신, 계약 경제, 병합 루프 구현 패턴 참고.
3. `tests/unit/orchard-signal-caravan.test.mjs`
   - 순수 로직 단위 테스트 케이스 설계 패턴 참고.
4. `specs/orchard-signal-caravan-20260304-1141/spec.md`
   - spec 문서 구성 및 제약 명시 포맷 참고.
5. `scripts/build-manifests.sh`
   - 신규 게임 등록 시 manifest 갱신 절차 확인.

## Design direction
- 장르: 실시간 레인 회피 + 병합 성장 + 계약 경제 (비리듬)
- 화면 톤: warm light / paper pastel (neon dark 회피)
- 고유 메카닉: **Cross-Stitch Dividend**
  - 런 수집 히스토리에서 4개 연속 홀짝 교차(예: 1-2-1-2) 시 배당 보너스(+26%)
  - 동일 티어 3연속 수집 시 Monotone Bolt 패널티(-23%)

## Chosen concept
- 게임명: **Harbor Thread Atelier**
- 루프:
  1) 3레인에서 바지선을 좌우 이동하며 스풀 수집/암초 회피
  2) 런 종료 후 계약/패턴 규칙 기반 정산
  3) 부두에서 스풀 병합(Tn+Tn→Tn+1)
  4) 다음 런 계약(Local/Boutique/Gallery) 선택

## Test strategy
- 순수 로직 테스트:
  - 초기값/레인클램프/충돌/병합/계약
  - Cross-Stitch Dividend + Monotone Bolt 패널티 검증
- 정적 검증:
  - `node --check games/harbor-thread-atelier/logic.mjs`
  - `node --check games/harbor-thread-atelier/app.mjs`
- 통합 스모크:
  - `node --test tests/unit/harbor-thread-atelier.test.mjs`
  - `bash scripts/build-manifests.sh`
  - manifest 엔트리 조회
  - 로컬 서버 + `curl` title 확인
