# Game Spec — lotus-switchboard

## Current state
- 오늘 사이클 대상은 신규 게임 1종이다.
- 런칭 리포지토리는 `eastsea-blog`이며 배포 경로는 `games/lotus-switchboard/`다.
- 기존 최근 런칭작이 머지/리본/항로 운영 계열이어서, 오늘 후보는 **회로를 손으로 비틀어 연등을 점등하는 실시간 라우팅 퍼즐**로 잡는다.

## Verification criteria
- `games/lotus-switchboard/index.html` 단일 파일로 모바일 플레이가 가능해야 한다.
- 타이틀 → 플레이 진입, 타일 회전, 신호 발사, 점수 반영, 게임오버/재시작이 실제 동작해야 한다.
- 와우 팩터 5개 중 최소 3개는 런타임 코드로 구현되어야 한다.
- `localStorage` 저장과 `pageerror 0` 검증이 필요하다.
- 라이브 URL까지 열어 실제 런칭 확인 전에는 완료로 보고하지 않는다.

## Completion criteria
- 게임 파일 생성
- `games-list.json` 등록
- QA 증거 작성
- git commit + push
- 라이브 URL 검증 완료

## Artifact path
- 게임: `games/lotus-switchboard/`
- 카탈로그: `games/games-list.json`
- QA/런칭 기록: `games/lotus-switchboard/qa-report.md`, `games/lotus-switchboard/launch-report.md`

## Candidate review
### 후보
**Lotus Switchboard — 연등 분전실**

### 한 줄 정의
연등 색상과 도착 도크를 맞추도록 스위치보드 타일을 회전시키고, 발사 순간마다 경로를 확정하는 모바일 실시간 라우팅 퍼즐.

### 왜 오늘 이 후보인가
- 최근 게임들과 메커닉 중복이 낮다.
- 1탭 회전 + 1버튼 발사로 모바일 적합성이 높다.
- 시각적으로 기억 남는 “연등 점등” 순간을 만들기 쉽다.
- 작은 슬라이스로도 전략성과 쇼케이스 포인트를 동시에 확보할 수 있다.

## Core mechanic
- 5x5 스위치보드의 타일을 탭해 회전한다.
- 좌측에서 들어오는 색상 신호를 우측의 같은 색 연등 도크로 보내면 성공이다.
- 성공 시 점수와 콤보가 오르고, 실패 시 스파크(생명)가 줄어든다.
- 매 턴 이후 일부 타일이 흔들려 보드가 미세하게 변한다.

## Support systems
- 다음 3개 신호를 보여주는 예보 큐
- 4턴마다 열리는 Festival Decree 선택 이벤트
- KST 기준 일일 과업과 진행도
- 종료 시 칭호/공유 카드 생성
- 최고 점수/최고 콤보/일일 기록 저장

## Game loop
1. 타이틀에서 시작
2. 현재 신호와 예보를 본다
3. 타일을 회전해 경로를 설계한다
4. `점등` 버튼으로 신호를 보낸다
5. 성공/실패 및 턴 후 변형을 확인한다
6. 필요 시 칙령을 고른다
7. 스파크가 모두 소진되면 결산 및 재시작

## Wow factors
1. **Forecast Ribbon** — 다음 3개 신호와 추천 오멘을 보여준다. *(실코드)*
2. **Lotus Bloom** — 3연속 성공 시 연등 만개 배너와 배수 보너스가 발동한다. *(실코드)*
3. **Festival Decree** — 4턴마다 3지선다 강화안을 고르게 한다. *(실코드)*
4. **KST Daily Lantern Duty** — 서울 시간 기준 일일 과업이 바뀌고 진행이 저장된다. *(실코드)*
5. **Chronicle Share Card** — 종료 시 칭호·점수·일일 완료 여부가 포함된 공유 문구를 생성한다. *(실코드/UI 메타)*

## Ban-rule audit
- 리듬/BPM 중심 게임 아님
- neon dark 팔레트 아님
- 외부 에셋 의존 없음
- 단일 HTML 파일 유지
- 파괴적 권한 필요 없음

## Launch path
1. 로컬 검증: `http://127.0.0.1:4173/games/lotus-switchboard/`
2. 프로덕션 검증: `https://eastsea-blog.pages.dev/games/lotus-switchboard/`

## 🔴 Red Team
- [공격 1]: 라우팅 규칙이 직관적이지 않으면 첫 턴 이탈이 생길 수 있다.
- [공격 2]: 계약/일일 과업까지 얹으면 UI가 과밀해질 수 있다.
- [방어/완화]: 타일 종류를 4종으로 제한하고, 예보/오멘/배너를 한 화면 상단 요약으로 압축한다. 계약은 4턴마다만 열어 빈도를 제한한다.
- [합의]: 🟢극복

✅ Anti-rationalization: Pass
