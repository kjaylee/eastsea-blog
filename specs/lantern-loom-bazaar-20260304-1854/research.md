# Research — lantern-loom-bazaar

## Goal
새 혼합형(vertical slice) 게임 1개를 제작/검증/커밋한다. 필수 조건은 다음과 같다.
- 메카닉 2개 이상 조합
- 리듬게임 금지
- neon dark 비주얼 금지
- 고유 메카닉 포함

## References reviewed
1. `games/willow-barge-syndicate/logic.mjs`
   - lane 이동, mode 전환, 충돌 판정, run 정산, merge, route 경제의 상태 머신 구조 확인.
2. `games/willow-barge-syndicate/app.mjs`
   - 모바일 우선 입력(버튼+포인터+키보드)과 HUD 렌더 루프 구조 확인.
3. `games/willow-barge-syndicate/index.html`
   - 밝은 톤 UI 패턴과 반응형 2-column 레이아웃 확인.
4. `tests/unit/willow-barge-syndicate.test.mjs`
   - 핵심 로직 단위 테스트 구성(초기화/경계/충돌/경제/고유 규칙) 확인.
5. `scripts/build-manifests.sh`
   - 신규 게임 엔트리를 `games/manifest.json`에 반영하는 재생성 절차 확인.

## Design direction
- 게임명: **Lantern Loom Bazaar**
- 기본 조합 메카닉:
  1) **Real-time lane survival** (3레인 이동 + hazard 회피)
  2) **Lantern phase switching** (Dawn/Dusk phase와 crate phase 일치 수집)
  3) **Merge progression** (동일 tier 2개 병합)
  4) **Route economy** (계약 비용/배율)
- 고유 메카닉:
  - **Loom Contract Sequence**: Dock에서 계약 문양(3개 시퀀스) 선택.
  - Run 중 성공 수집의 문양 로그가 계약과 **정순 일치**하면 보너스, **역순 일치**면 부분 보너스, 동일 문양 3연속이면 Tangle penalty.

## Risks and mitigations
- 위험: 시퀀스 판정(정순/역순/패널티) 충돌 가능.
  - 대응: 전용 unit test로 각각 독립 검증.
- 위험: 기존 repo dirty 상태(다른 변경 존재)에서 커밋 오염 가능.
  - 대응: 이번 작업 파일만 pathspec으로 add/commit.

## Verification plan (predefined)
```bash
node --check games/lantern-loom-bazaar/logic.mjs
node --check games/lantern-loom-bazaar/app.mjs
node --test tests/unit/lantern-loom-bazaar.test.mjs
bash scripts/build-manifests.sh
node -e "const m=require('./games/manifest.json'); const e=m.games.find(g=>g.slug==='lantern-loom-bazaar'); if(!e) throw new Error('missing'); console.log(JSON.stringify({count:m.count,entry:e},null,2));"
PORT=48341; python3 -m http.server "$PORT" --bind 127.0.0.1 >/tmp/lantern_loom_bazaar_server.log 2>&1 & PID=$!; sleep 1; curl -s "http://127.0.0.1:${PORT}/games/lantern-loom-bazaar/" | grep -o '<title>[^<]*</title>' | head -n 1; kill "$PID" 2>/dev/null || true
```
