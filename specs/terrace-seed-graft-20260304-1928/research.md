# Research — terrace-seed-graft

## Goal
새 혼합형(vertical slice) 게임 1개를 제작/검증/커밋한다. 필수 조건:
- 메카닉 2개 이상 조합
- 리듬게임 금지
- neon dark 비주얼 금지
- 고유 메카닉 포함

## References reviewed
1. `games/lantern-loom-bazaar/logic.mjs`
   - lane 이동, mode 전환, 충돌 판정, merge/economy 구조를 재사용 가능한 형태로 분석.
2. `games/lantern-loom-bazaar/app.mjs`
   - 모바일 우선 입력(버튼 + 포인터 + 키보드), HUD 갱신 루프 패턴 확인.
3. `games/lantern-loom-bazaar/index.html`
   - 밝은 톤 UI 토큰과 반응형 2-column 레이아웃 참고.
4. `tests/unit/lantern-loom-bazaar.test.mjs`
   - 초기화/경계/충돌/경제/고유규칙 중심 테스트 구조 확인.
5. `scripts/build-manifests.sh`
   - 신규 게임 등록을 위한 `games/manifest.json` 갱신 절차 확인.

## Design direction
- 게임명: **Terrace Seed Graft**
- 기본 조합 메카닉:
  1) **Real-time lane survival** (3레인 이동 + hazard 회피)
  2) **Tool stance switching** (Clip/Bind 일치 수집)
  3) **Merge progression** (동일 tier 2개 병합)
  4) **Route economy** (비용/배율 경로 선택)
- 고유 메카닉:
  - **Graft Pair Chain**: Dock에서 2종 graft plan 선택.
  - run 수집 species 로그에서 연속 2개 조합이 계획과 정순 일치하면 +12% (누적 상한 +45%), 역순 일치 +5%.
  - 동일 species 3연속 시 wilt penalty ×0.76.

## Risks and mitigations
- 위험: 정순/역순/패널티 동시 발생 시 배율 계산 충돌.
  - 대응: 케이스별 unit test 분리.
- 위험: dirty repo에서 커밋 오염.
  - 대응: 이번 작업 파일만 pathspec add/commit.

## Verification plan (predefined)
```bash
node --check games/terrace-seed-graft/logic.mjs && node --check games/terrace-seed-graft/app.mjs && echo 'syntax_ok'
node --test tests/unit/terrace-seed-graft.test.mjs
bash scripts/build-manifests.sh
node -e "const m=require('./games/manifest.json'); const e=m.games.find(g=>g.slug==='terrace-seed-graft'); if(!e) throw new Error('missing'); console.log(JSON.stringify({count:m.count,entry:e},null,2));"
PORT=48379; python3 -m http.server "$PORT" --bind 127.0.0.1 >/tmp/terrace_seed_graft_server.log 2>&1 & PID=$!; sleep 1; curl -s "http://127.0.0.1:${PORT}/games/terrace-seed-graft/" | grep -o '<title>[^<]*</title>' | head -n 1; kill "$PID" 2>/dev/null || true
```
