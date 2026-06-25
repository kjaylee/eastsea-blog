# Game Spec — apex-ribbon-rally

## Current state
- 오늘 1회 런칭 대상은 `Apex Ribbon Rally — 에이펙스 리본 랠리`다.
- 런칭 리포지토리는 clean worktree의 `eastsea-blog`이며 배포 경로는 `games/apex-ribbon-rally/`다.
- 기존 미출시 초안은 있었지만, 오늘 사이클에서 와우 팩터 5개 기준으로 재구성해 실제 런칭 가능한 모바일 슬라이스로 승격한다.

## Verification criteria
- `games/apex-ribbon-rally/index.html` 단일 파일로 390x844 모바일 화면에서 플레이 가능해야 한다.
- 시작 → 리본 드로우 → 섹터 판정 → 피트 보드 선택 → 결과 화면 → 재시작이 실제 동작해야 한다.
- 와우 팩터 5개 중 최소 3개는 런타임 로직으로 구현하고, 나머지 2개도 UI/메타/런칭 훅으로 확인 가능해야 한다.
- `localStorage` 저장, `pageerror 0`, 모바일 가로 오버플로우 없음이 autotest와 브라우저 검증에서 확인되어야 한다.
- 로컬 HTTP 확인과 프로덕션 URL 확인 전에는 완료로 보고하지 않는다.

## Completion criteria
- 구현 파일: `games/apex-ribbon-rally/index.html`
- 문서: `games/apex-ribbon-rally/spec.md`, `test-cases.md`, `qa-report.md`, `launch-report.md`
- 카탈로그: `games/games-list.json`
- git 범위는 `games/apex-ribbon-rally/*` 와 `games/games-list.json`만 유지한다.

## One-line definition
1.4초 안에 레이싱 리본을 그려 6개 섹터를 통과하고, 계약 게이트·에이펙스·피니시를 한 번에 연결해 오늘의 포스트카드를 만드는 모바일 랠리 아케이드.

## Core mechanic
- 플레이어는 각 섹터 시작점에서 손가락으로 리본 라인을 그린다.
- 라인은 계약 게이트, 에이펙스, 피니시를 통과해야 성공한다.
- 2개 이상 게이트 + 계약 게이트 + 에이펙스 + 피니시를 만족하면 섹터 클리어다.
- 실패하면 Grip이 감소하고, 0이 되면 즉시 종료된다.

## Support systems
- 일자 기반 데일리 시드로 오늘의 코스가 고정된다.
- 3섹터 클리어 후 `Pit Board Draft` 3지선다 업그레이드가 열린다.
- `localStorage`에 최고 점수, 최고 콤보, 일일 메달, 마지막 포스트카드를 저장한다.

## Game loop
1. 타이틀에서 오늘 루트 확인
2. Forecast Ribbon으로 다음 3섹터 예보 확인
3. 리본 드로우로 현재 섹터 해결
4. 성공 시 콤보/점수/에코 갱신, 실패 시 Grip 감소
5. 3섹터 후 Draft 선택
6. 6섹터 완료 또는 Grip 0에서 결과/포스트카드 표시
7. Retry 또는 Title로 재진입

## Wow factors
1. **Forecast Ribbon**
   - 다음 3개 섹터의 계약 라인과 날씨를 미리 보여준다.
2. **Apex Echo**
   - 직전 섹터의 이상적인 유령 라인과 유사도를 퍼센트로 보여준다.
3. **Pit Board Draft**
   - 3섹터 후 3지선다 업그레이드로 후반 3섹터의 감각을 바꾼다.
4. **Crowd Flash**
   - 3콤보 이상일 때 배너와 추가 점수 배율이 터진다.
5. **Finish Postcard**
   - 완주 또는 실패 결과를 텍스트 카드로 저장/복사한다.

## Ban/risk review
- 외부 네트워크 의존 게임 로직 없음.
- 계정/결제/민감 정보 처리 없음.
- 단일 HTML + 기본 analytics 경로만 사용.
- 위험은 기존 dirty worktree와 git 범위 오염뿐이며, 이번 사이클은 별도 launch worktree로 격리한다.

## Launch path
### Local
- `http://127.0.0.1:4173/games/apex-ribbon-rally/`
- `http://127.0.0.1:4173/games/apex-ribbon-rally/?autotest=1`

### Production target
- `https://eastsea-blog.pages.dev/games/apex-ribbon-rally/`

## 🔴 Red Team
- [공격 1]: 드로우 판정이 너무 엄격하면 모바일에서 좌절감이 크다.
- [공격 2]: Forecast와 Draft가 있어도 실제 플레이 손맛이 약하면 “와우”가 UI 문구에 그칠 수 있다.
- [방어/완화]: 판정 반경을 넉넉하게 두고, 최소 3개 와우를 런타임에 직접 연결했다. autotest와 실브라우저에서 시작→성공→Draft→종료를 모두 통과시킨다.
- [합의]: 🟢극복

✅ Anti-rationalization: Pass
