# Game Spec — Moonbell Madrigal

## Current state
- 오늘의 단일 런치 후보는 **Moonbell Madrigal — 문벨 매드리갈**이다.
- 런칭 리포지토리는 `eastsea-blog`이며 배포 경로는 `games/moonbell-madrigal/`이다.
- 최근 라우팅 퍼즐 라인의 강점은 유지하되, 이번 사이클은 **달빛 종루 합주**라는 기억 포인트를 더해 “예쁜 퍼즐”이 아니라 “한 번 더 눌러보고 싶은 공연형 퍼즐”로 승격한다.

## Candidate review
### Candidate
- **Moonbell Madrigal**: 거울 타일을 회전해 달빛 종음을 맞는 종루로 보내고, 연속 합주와 칙령 선택으로 밤하늘 공연을 완성하는 모바일 라우팅 퍼즐.

### Why this candidate
- 짧은 세션에 맞고 터치 입력이 직관적이다.
- 기존 검증된 라우팅 코드 패턴을 재사용할 수 있어 하루 런칭 안전성이 높다.
- 시각 테마, 콤보 연출, 칭호/기록 훅을 얹기 쉬워 “와우”를 만들기 좋다.

### Risks
- 라우팅 퍼즐이 기존작과 너무 비슷해 보일 수 있다.
- 연출만 바뀌고 플레이 차별점이 약할 수 있다.
- 모바일에서 보드와 보조 UI가 과밀해질 수 있다.

### Mitigation
- 음악/종루/별자리 메타를 코어 피드백 루프에 직접 연결한다.
- 와우 팩터 5개 중 최소 3개를 런타임 메카닉으로 구현한다.
- 390x844 기준 UI를 한 컬럼으로 압축하고 자동 테스트까지 포함한다.

## One-line pitch
**Moonbell Madrigal — 문벨 매드리갈**은 거울 타일을 회전해 달빛 종음을 맞는 종루로 보내고, Midnight Decree와 Constellation Encore로 점점 더 화려한 야간 합주를 만드는 모바일 퍼즐 아케이드다.

## Core mechanic
1. 5x5 거울 보드의 타일을 탭해 90도씩 회전한다.
2. 현재 종음 색과 예보 큐를 보고 경로를 정렬한다.
3. `Ring the Bell` 버튼으로 중앙 발진 종루에서 종음을 발사한다.
4. 올바른 종루로 도착하면 점수·콤보·별자리가 쌓이고, 틀리면 스파크를 잃는다.
5. 4턴마다 Midnight Decree 중 하나를 골라 이번 런의 성격을 바꾼다.

## Support systems
- 최고 점수 / 최고 콤보 / 칭호 `localStorage` 저장
- 오늘의 과업 1종 노출 및 달성 표시
- 결과 화면의 Chronicle Share Card 텍스트 생성
- `?autotest=1` 자동 스모크 테스트 내장

## Game loop
- 타이틀 진입 → 시작
- 예보 확인 → 보드 회전
- 종음 발사 → 성공/실패 판정
- 콤보/칙령/별자리 갱신
- 게임오버 또는 재시작

## Wow factors (5)
1. **Lunar Forecast Ribbon**
   - 다음 3개의 종음과 추천 오멘을 한 줄로 보여준다.
2. **Moon Chorus**
   - 3연속 성공부터 합주 배너와 추가 점수 보너스가 발동한다.
3. **Midnight Decree**
   - 4턴마다 3지선다 칙령이 열려 다음 수턴의 규칙을 바꾼다.
4. **Constellation Encore**
   - 성공할 때마다 별자리가 켜지고, 누적 성과에 따라 칭호가 진화한다.
5. **Chronicle Share Card**
   - 게임오버 시 점수/칭호/오늘 과업 결과를 텍스트 카드로 요약한다.

## Runtime implementation mapping
- 코드 구현 필수: 1) Lunar Forecast Ribbon, 2) Moon Chorus, 3) Midnight Decree, 4) Constellation Encore
- UI/메타 구현: 5) Chronicle Share Card, 오늘의 과업, 최고 기록 저장

## Verification criteria
- `games/moonbell-madrigal/index.html` 단일 파일로 모바일 플레이가 가능해야 한다.
- 타이틀 → 시작 → 회전 → 발사 → 점수 반영 → 게임오버 → 재시작이 실제로 동작해야 한다.
- 와우 팩터 5개 중 최소 3개가 런타임에서 눈에 보이게 발동해야 한다.
- `localStorage` 저장, 390x844 레이아웃, `pageerror 0` 검증을 통과해야 한다.
- 라이브 URL `https://eastsea-blog.pages.dev/games/moonbell-madrigal/` 확인 전에는 완료로 보고하지 않는다.

## Completion criteria
- 게임 파일 생성 완료
- `games/games-list.json` 반영 완료
- 로컬 브라우저 QA 통과
- 원격 배포 푸시 완료
- 라이브 URL 열림 및 핵심 텍스트 검증 완료

## Launch paths
1. `https://eastsea-blog.pages.dev/games/moonbell-madrigal/`
2. 카탈로그 엔트리: `https://eastsea-blog.pages.dev/games/`

## Prohibited-rule check
- 외부 에셋 의존 없음
- 서버 백엔드 의존 없음
- 단일 HTML로 즉시 배포 가능
- 다른 게임 경로 수정 없이 신규 경로와 `games-list.json`만 반영

## Artifact path
- `eastsea-blog/games/moonbell-madrigal/index.html`
- `eastsea-blog/games/moonbell-madrigal/spec.md`
- `eastsea-blog/games/moonbell-madrigal/test-cases.md`
- `eastsea-blog/games/moonbell-madrigal/qa-report.md`
- `eastsea-blog/games/games-list.json`

## 🔴 Red Team
- [공격 1]: 기존 라우팅 퍼즐과 차별점이 약하면 신규작 의미가 흐려진다.
- [공격 2]: 칙령/별자리/공유 카드가 장식으로만 남으면 와우가 아니라 잡음이 된다.
- [방어/완화]: 예보·합주·칙령·별자리를 모두 점수/콤보/생존과 직접 연결하고, 자동 테스트에서 해당 상태 변화를 검증한다.
- [합의]: 🟢극복

✅ Anti-rationalization: Pass
