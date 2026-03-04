# Research — sunlit-kite-mercantile

## Goal
신규 게임 vertical slice 1개를 제작하고 커밋한다. 제약:
- 혼합 메카닉 2개 이상
- 리듬게임 금지
- neon dark 톤 금지
- 고유 메카닉 포함

## Related files reviewed
1. `games/relay-merge-raiders/index.html`
   - 현재 다크 기반 UI. 이번 작업에서는 밝은 팔레트로 전환 필요.
2. `games/relay-merge-raiders/logic.mjs`
   - 상태 머신(`dock`/`wave`), 순수 로직 분리, 저장/정산 구조 참고.
3. `tests/unit/relay-merge-raiders.test.mjs`
   - `node --test` 기반 케이스 네이밍/검증 패턴 참고.
4. `specs/relay-merge-raiders-20260304-1004/spec.md`
   - 메카닉/경제/검증 문서화 형식 참고.
5. `specs/relay-merge-raiders-20260304-1004/verification.md`
   - `node --check`, `node --test`, manifest 등록 검증 포맷 참고.

## Design direction
- 장르: 실시간 회피 + 경제 의사결정 + 병합 성장 (비리듬)
- 화면 톤: light, warm, pastel (neon/dark 회피)
- 고유 메카닉: **Tailwind Tax**
  - 한 런에서 레인 변경(조작) 횟수가 임계치 이상이면 수익에 자동 감세 적용.
  - 즉, 생존을 위한 과도한 지그재그가 경제 효율을 깎아 플레이 스타일 선택을 강제.

## Chosen concept
- 게임명: **Sunlit Kite Mercantile**
- 루프:
  1) 3레인에서 연(카트) 조작, 과일 바구니 수집/까마귀 회피
  2) 런 종료 후 수집물 인벤토리 반영
  3) 도크에서 바구니 병합(Tn+Tn→Tn+1)
  4) 다음 런 계약 선택(마켓/호텔/페스티벌)으로 수익 배율 및 비용 결정

## Test strategy
- 순수 로직 테스트 우선:
  - 초기 상태
  - 레인 이동 클램프
  - 수집/피해 충돌 처리
  - 병합 규칙
  - 계약 비용/수익 배율 반영
  - Tailwind Tax 발동 검증
- 정적 검증:
  - `node --check` (logic/app)
- 통합 스모크:
  - manifest 엔트리 확인
  - 로컬 서버 `curl` 타이틀 확인
