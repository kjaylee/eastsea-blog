# Game Spec — Lantern Longball League

## Current state
- 오늘의 단일 런치 후보는 **Lantern Longball League — 랜턴 롱볼 리그**다.
- 기존 `🔍 검토중` 백로그 32~34는 이미 카탈로그에 올라가 있어 신규성 점수가 낮다.
- 런칭 리포지토리는 `eastsea-blog`이며 배포 경로는 `games/lantern-longball-league/`다.

## Candidate review
### Reviewed candidate
- **Lantern Longball League**: 투수가 던진 유성구를 스와이프 배트로 쳐 올리고, 비행 중 좌우 훅으로 휘게 만들어 랜턴 링과 옥상 불꽃 홈런을 노리는 모바일 스포츠 아케이드.

### Why this candidate
- 첫 10초에 스와이프 각도와 비행 후 훅 입력이 곧바로 차별점으로 느껴진다.
- 스포츠 카테고리는 보유 풀이 얇아 장르 분산에도 유리하다.
- 캔버스 1파일 범위에서 업그레이드 드래프트, 쇼오프 연출, 재도전 미션을 모두 넣을 수 있다.

### Rejected alternatives
- **Merge & Rule: Kingdom TMA**: 이미 카탈로그 반영 이력이 있어 오늘 신작 사이클로 밀면 중복 위험이 크다.
- **Kingdom Merge: K-Story**: 머지 보드 재구현이 하루치 범위를 넘길 가능성이 높다.
- **Infinite Dungeon Tap**: 기존 슬러그와 메카닉이 이미 배포되어 신규 런치 명분이 약하다.

### Risks
- 배트 스와이프 판정이 어색하면 첫 훅이 무너진다.
- 업그레이드 드래프트가 실질 변화 없이 장식이 될 수 있다.
- 비행 연출이 길어지면 한 판 템포가 죽는다.

### Mitigation
- 스와이프 각도와 길이를 즉시 속도/탄도로 연결한다.
- 업그레이드는 스윗스팟, 훅 게이지, 링 보너스처럼 숫자로 체감되게 만든다.
- 투구 간격과 비행 시간을 짧게 유지해 90초 내 템포를 보장한다.

## One-line pitch
**Lantern Longball League — 랜턴 롱볼 리그**는 유성구를 스와이프 배트로 쳐 올린 뒤 좌우 훅으로 휘게 만들어 랜턴 링과 불꽃 홈런을 연쇄시키는 모바일 세로형 스포츠 아케이드다.

## Core mechanic
1. 투수가 던진 공이 스트라이크 창을 지나기 전에 위쪽 스와이프로 스윙한다.
2. 스와이프 각도와 길이가 타구의 초기 각도와 파워를 만든다.
3. 타구 비행 중 `HOOK L / HOOK R` 입력으로 공을 휘게 해 랜턴 링과 잭팟 링을 통과시킨다.
4. 성공 타구와 홈런으로 점수, 불꽃, 계약 진척을 올린다.
5. 일정 타수마다 Dugout Draft에서 업그레이드 하나를 골라 다음 타석 성격을 바꾼다.

## Support systems
- 최고 점수 / 최고 홈런 / 최고 칭호 / 플레이 수 `localStorage` 저장
- 세 개의 Pennant Contract 노출 및 달성 상태 표시
- 게임오버 시 불꽃 홈런/계약/칭호를 요약하는 Share Card 생성
- `?autotest=1` 자동 스모크 테스트 내장

## Game loop
- 타이틀 진입 → 시작
- 투구 확인 → 스와이프 스윙
- 공중 훅 입력 → 링/홈런 판정
- 점수·계약·드래프트 갱신
- 3아웃 게임오버 → 재시작

## Wow Factors
1. Arc Swipe Bat
   - 왜 강한가: 탭이 아니라 스와이프 각도 자체가 타구 궤적을 만들어 첫 타석부터 손맛이 선명하다.
   - 실제 구현 표면: 스윙 고스트, 스윗스팟 판정, 스와이프 벡터 기반 발사 속도.
   - 리텐션/공유 효과: "이번엔 더 예쁘게 걸렸다"는 숙련 욕구를 만든다.
2. Sky Curve Hooks
   - 왜 강한가: 타구 후에도 조작이 남아 있어 일반 홈런 게임보다 입력 수명이 길다.
   - 실제 구현 표면: `HOOK L / HOOK R` 버튼, 훅 게이지, 곡선 잔상.
   - 리텐션/공유 효과: 다중 링 관통 장면이 GIF 포인트가 된다.
3. Dugout Draft
   - 왜 강한가: 매 런마다 빌드 방향을 바꾸어 같은 타석도 다르게 느껴진다.
   - 실제 구현 표면: 3지선다 업그레이드 오버레이, 스윗스팟/훅/보너스 수치 즉시 반영.
   - 리텐션/공유 효과: "이번엔 훅 빌드" 같은 재도전 이유를 만든다.
4. Firework Homer Freeze
   - 왜 강한가: 잭팟 링을 뚫은 순간이 결과보다 더 기억에 남는 쇼오프 장면이 된다.
   - 실제 구현 표면: 프리즈 프레임, 폭죽 파티클, 홈런 배너.
   - 리텐션/공유 효과: 스크린샷·점수 자랑이 쉬운 순간을 만든다.
5. Pennant Contracts
   - 왜 강한가: 점수 외 목표를 주어 짧은 세션에도 다시 들어올 이유를 남긴다.
   - 실제 구현 표면: 3개 계약 카드, 결과 화면 Share Card, 최고 칭호 저장.
   - 리텐션/공유 효과: 계약 달성/미달성이 다음 판 동기를 만든다.

## Runtime implementation mapping
- 런타임 필수 구현: 1) Arc Swipe Bat, 2) Sky Curve Hooks, 3) Dugout Draft, 4) Firework Homer Freeze
- 메타/UI 구현: 5) Pennant Contracts, Share Card, 최고 기록 저장

## Verification criteria
- `games/lantern-longball-league/index.html` 단일 게임 파일로 모바일 플레이가 가능해야 한다.
- 타이틀 → 시작 → 투구 → 스와이프 타격 → 공중 훅 → 점수 반영 → 게임오버 → 재시작이 실제로 동작해야 한다.
- 와우 팩터 5개 중 최소 3개가 런타임에서 눈에 보이게 발동해야 한다.
- `localStorage` 저장, 390x844 레이아웃, `pageerror 0` 검증을 통과해야 한다.
- 라이브 URL `https://eastsea-blog.pages.dev/games/lantern-longball-league/` 확인 전에는 완료로 보고하지 않는다.

## Completion criteria
- 게임 파일 생성 완료
- `games/games-list.json` 반영 완료
- 로컬 QA 통과
- `master` 커밋 및 푸시 완료
- 라이브 URL 열림 및 타이틀 텍스트 확인 완료

## Launch paths
1. `https://eastsea-blog.pages.dev/games/lantern-longball-league/`
2. 카탈로그 엔트리: `https://eastsea-blog.pages.dev/games/`

## Prohibited-rule check
- 리듬게임 아님
- `#0a0a1a` 네온 다크 테마 미사용
- `neon-` 접두사 미사용
- 단순 클릭+웨이브/방치/카드 조합 아님
- 기존 카탈로그에 동일 메카닉/슬러그 없음

## Artifact path
- `eastsea-blog/games/lantern-longball-league/index.html`
- `eastsea-blog/games/lantern-longball-league/spec.md`
- `eastsea-blog/games/lantern-longball-league/test-cases.md`
- `eastsea-blog/games/lantern-longball-league/qa-report.md`
- `eastsea-blog/games/games-list.json`

## 🔴 Red Team
- [공격 1]: 타격 판정이 느슨하면 숙련 게임이 아니라 운빨 게임처럼 보일 수 있다.
- [공격 2]: 홈런 연출만 화려하고 득점 루프가 얕으면 첫 판 후 재도전 이유가 약하다.
- [방어/완화]: 스윙 벡터와 스윗스팟을 수치로 분리하고, 업그레이드/계약/링 점수를 같은 루프에 묶어 점수 외 목표를 남긴다.
- [합의]: 🟢극복

✅ Anti-rationalization: Pass
