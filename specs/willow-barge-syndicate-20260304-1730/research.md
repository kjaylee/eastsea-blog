# Research — willow-barge-syndicate

## Goal
새 hybrid 게임 vertical slice 1개를 빠르게 제작하되, 리듬게임 금지 / neon dark 금지 / 고유 메카닉 필수 조건을 만족한다.

## References reviewed
1. `games/amber-harbor-ledger/logic.mjs`
   - 상태 머신(`dock`/`run`), lane 이동, 모드 전환, 충돌/정산, 병합, 저장 구조 레퍼런스 확인.
2. `games/amber-harbor-ledger/app.mjs`
   - 모바일 입력(버튼/키보드/터치 분기), HUD 바인딩, 캔버스 렌더링 루프 구조 확인.
3. `games/amber-harbor-ledger/index.html`
   - 라이트 톤 UI, 모바일 우선 2-컬럼 반응형 레이아웃 확인.
4. `tests/unit/amber-harbor-ledger.test.mjs`
   - 논리 검증 범위(초기화, 경계, 모드, 충돌, 경제, 고유 메카닉) 템플릿 파악.
5. `scripts/build-manifests.sh`
   - 신규 게임 등록을 위한 manifest 재생성 절차 확인.

## Design decisions
- 기본 프레임은 검증된 lane survival + mode matching + merge progression + route economy 구조를 재사용.
- 고유 메카닉은 기존 lane-only 패턴과 다르게, **lane+mode 동시 조건**으로 변경:
  - **Canal Relay Bonus**: 최근 3회 성공 수집에서 lane이 모두 다르고 mode가 번갈아 나오면 `x1.34`.
  - **Silt Lock Penalty**: 최근 3회 성공 수집이 모두 동일 lane 이거나 모두 동일 mode면 `x0.72`.
- 시각 톤은 밝은 크림/샌드/윌로우 계열로 구성(neon dark 회피).

## Risks and mitigations
- 위험: 패턴 계산 로직이 조건 충돌 시 오적용될 수 있음.
  - 대응: unit test에서 bonus/penalty 케이스 분리 검증.
- 위험: 기존 repo가 dirty 상태이므로 커밋 오염 가능.
  - 대응: pathspec으로 신규 게임 관련 파일만 add/commit.

## Verification plan (predefined)
```bash
node --check games/willow-barge-syndicate/logic.mjs
node --check games/willow-barge-syndicate/app.mjs
node --test tests/unit/willow-barge-syndicate.test.mjs
bash scripts/build-manifests.sh
node -e "const m=require('./games/manifest.json'); const e=m.games.find(g=>g.slug==='willow-barge-syndicate'); if(!e) throw new Error('missing'); console.log(JSON.stringify({count:m.count,entry:e},null,2));"
PORT=48331; python3 -m http.server "$PORT" --bind 127.0.0.1 >/tmp/willow_barge_syndicate_server.log 2>&1 & PID=$!; sleep 1; curl -s "http://127.0.0.1:${PORT}/games/willow-barge-syndicate/" | grep -o '<title>[^<]*</title>' | head -n 1; kill "$PID" 2>/dev/null || true
```
