# Game Spec — Set Arc Stadium

## Current state
- 오늘의 단일 런치 후보는 **Set Arc Stadium — 셋아크 스타디움**이다.
- 런칭 리포지토리는 `eastsea-blog`이며 배포 경로는 `games/set-arc-stadium/`이다.
- 검토중 백로그 3건은 오늘 런칭 후보에서 제외했다.
  - `Merge & Rule: Kingdom TMA`: 기존 `merge-rule-kingdom` 실서비스와 너무 가깝고 1일 범위를 넘는다.
  - `Kingdom Merge: K-Story`: 기존 `games/kingdom-merge-k-story/` 작업 흔적과 충돌해 pathspec 런칭이 unsafe 하다.
  - `Infinite Dungeon Tap`: 기존 라이브 슬러그가 있고, 단순 탭 계열로 오해될 위험이 커 오늘의 와우 써클 목표와 맞지 않는다.

## Candidate review
### Candidate
- **Set Arc Stadium**: 세터 위치에서 한 번의 드래그로 세트 아크를 그려 스파이크 각과 템포를 동시에 정하고, 블로커 이동과 스포트라이트 존을 읽어 점수를 쌓는 모바일 스포츠 아케이드.

### Why this candidate
- 토요일 장르 로테이션의 스포츠 슬롯을 충족한다.
- 기존 페널티·골프·컬링과 다른 입력 차별점이 명확하다.
- 단일 HTML/Canvas로 구현 가능한 범위 안에서 쇼오프와 재도전 훅을 동시에 넣기 쉽다.

### Risks
- 배구 문법을 과도하게 넣으면 규칙 이해가 느려질 수 있다.
- 드래그 입력이 시각적으로만 예쁘고 채점 연결이 약하면 와우가 무너진다.
- 드래프트와 계약이 과밀하면 모바일 화면이 답답해질 수 있다.

### Mitigation
- 드래그의 높이와 방향이 템포, 블록 회피, 점수에 직접 연결되게 설계한다.
- 와우 팩터 5개 중 4개를 런타임에 구현하고, 나머지 1개도 결과/메타 루프에 연결한다.
- HUD는 상단 4지표 + 하단 3계약 카드만 유지해 390x844 가독성을 확보한다.

## One-line pitch
**Set Arc Stadium — 셋아크 스타디움**은 세터 위치에서 한 번의 세트 라인을 그려 스파이크 각과 템포를 동시에 정하고, Shift Block·Playbook Draft·Broadcast Freeze를 묶어 하이라이트 랠리를 만드는 모바일 스포츠 아케이드다.

## Core mechanic
1. 하단 세터 존에서 위로 드래그해 세트 아크를 그린다.
2. 드래그 방향은 공격 레인, 드래그 높이는 템포(퀵/미드/하이)를 결정한다.
3. 공이 네트를 지날 때 움직이는 블로커와 충돌하지 않으면 상대 코트에 착지한다.
4. 스포트라이트 존이나 크로스코트 조건을 맞추면 추가 점수와 하이라이트 연출이 발동한다.
5. 3득점마다 Playbook Draft에서 한 장을 골라 이번 런의 규칙을 바꾼다.

## Support systems
- 최고 점수 / 최고 랠리 / 최고 칭호 `localStorage` 저장
- 3개 일일 계약 카드 진행도 표시
- 결과 화면의 Highlight Card 텍스트 생성
- `?autotest=1` 자동 스모크 테스트 내장

## Game loop
- 타이틀 진입 → 시작
- 세트 아크 드래그 → 발사
- 블록 판정 → 득점/실패
- 랠리/계약/칭호 갱신
- 3득점마다 Playbook Draft
- 라이프 소진 시 게임오버 → 재시작

## Wow Factors
1. Set Arc Input
   - 왜 강한가: 첫 10초 안에 "세트를 그린다"는 입력 차별이 바로 체감된다.
   - 실제 구현 표면: 세터 위치에서 드래그 프리뷰 곡선, 높이별 템포 판정, 레인별 색상 피드백.
   - 리텐션/공유 효과: 드래그 실력이 곧 스코어로 연결돼 재도전 동기가 크다.
2. Shift Block Escalation
   - 왜 강한가: 랠리가 길어질수록 블로커가 빨라지고 레인 압박이 살아난다.
   - 실제 구현 표면: 스테이지 상승에 따른 블로커 속도/폭 증가, 스포트라이트 이동 가속.
   - 리텐션/공유 효과: "어디서 막혔는지"가 명확해 한 판 더 이유가 생긴다.
3. Playbook Draft
   - 왜 강한가: 3득점마다 플레이 성격을 바꾸는 선택이 들어가 단순 입력 반복을 막는다.
   - 실제 구현 표면: Quick Tempo / Late Float / Crowd Surge 등 3지선다 업그레이드 카드.
   - 리텐션/공유 효과: 매 런 빌드가 달라져 회차 가치가 생긴다.
4. Broadcast Freeze
   - 왜 강한가: 완벽한 크로스코트나 스포트라이트 적중 순간을 슬로모션과 배너로 증폭한다.
   - 실제 구현 표면: perfect/gold hit 시 프리즈 프레임, 배너, 파티클.
   - 리텐션/공유 효과: 스크린샷/자랑 포인트가 명확하다.
5. Call Sheet Contracts
   - 왜 강한가: 계약 3종이 단순 최고점 외의 목표를 만든다.
   - 실제 구현 표면: Perfect Arc, Spotlight Hit, Long Rally 카드와 결과 화면 달성 표시.
   - 리텐션/공유 효과: "다음엔 계약 3개 다 채운다"는 재도전 이유가 생긴다.

## Runtime implementation mapping
- 코드 구현 필수: 1) Set Arc Input, 2) Shift Block Escalation, 3) Playbook Draft, 4) Broadcast Freeze
- UI/메타 구현: 5) Call Sheet Contracts, Highlight Card, 최고 기록 저장

## Unique mechanic
- 이 게임의 고유 메카닉은 **세터 시점 드래그 한 번으로 공격 레인과 템포를 동시에 설계하는 것**이다.
- 기존 스포츠작의 스와이프 슛, 단일 탭 골프, 플릭 컬링과 달리 "볼을 치는 순간"이 아니라 "공격 라인을 설계하는 순간"이 플레이 핵심이다.

## Prohibited-rule check
- 리듬게임 아님
- `#0a0a1a` 네온 다크 테마 아님
- `neon-` 접두사 없음
- 클릭+웨이브 / 클릭+방치 / 클릭+카드 조합 아님
- 기존 스포츠작과 90% 이상 중복되지 않음

## Verification criteria
- `games/set-arc-stadium/index.html` 단일 파일로 모바일 플레이가 가능해야 한다.
- 타이틀 → 시작 → 드래그 프리뷰 → 발사 → 득점/실패 → 게임오버 → 재시작이 실제로 동작해야 한다.
- 와우 팩터 5개 중 최소 3개가 런타임에서 눈에 보이게 발동해야 한다.
- `localStorage` 저장, 390x844 레이아웃, `pageerror 0` 검증을 통과해야 한다.
- 라이브 URL `https://eastsea-blog.pages.dev/games/set-arc-stadium/` 확인 전에는 완료로 보고하지 않는다.

## Completion criteria
- 게임 파일 생성 완료
- `games/games-list.json` 반영 완료
- 로컬 브라우저 QA 통과
- 원격 배포 푸시 완료
- 라이브 URL 열림 및 핵심 텍스트 검증 완료

## Launch paths
1. `https://eastsea-blog.pages.dev/games/set-arc-stadium/`
2. 카탈로그 엔트리: `https://eastsea-blog.pages.dev/games/`

## Artifact path
- `eastsea-blog/games/set-arc-stadium/index.html`
- `eastsea-blog/games/set-arc-stadium/spec.md`
- `eastsea-blog/games/set-arc-stadium/test-cases.md`
- `eastsea-blog/games/set-arc-stadium/qa-report.md`
- `eastsea-blog/games/games-list.json`

## 🔴 Red Team
- [공격 1]: 세트 라인 드래그가 실제 판정과 멀면 예쁜 껍데기로 끝난다.
- [공격 2]: 블로커·드래프트·계약을 다 넣다가 핵심 입력 재미가 흐려질 수 있다.
- [방어/완화]: 입력→템포→블록 회피→스코어를 한 함수 흐름으로 묶고, 오버레이는 3득점 단위로만 열어 플레이를 끊지 않게 제한한다.
- [합의]: 🟢극복

✅ Anti-rationalization: Pass
