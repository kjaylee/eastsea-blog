# Hinge Halo Warden — Spec

## Phase 0 Review
- Reviewed candidate: `#34 Infinite Dungeon Tap`
- Verdict: Rejected
- Why:
  - 단순 탭 중심 코어라 `클릭+방치/클릭+웨이브` 금지 규칙과 충돌
  - 기존 탭형/러너형 게임과 차별성이 약함
  - 화요일 로테이션(`action/defense`)에 맞는 쇼오프 포인트가 부족함
- Selected replacement: `hinge-halo-warden`

## One-Line Definition
세 개의 경첩 셔터를 손가락으로 젖혀 반원 궤적을 그리며 돌진 입자를 쳐내고, `Brace Draft`와 `Daily Oath`로 기록을 남기는 모바일 원형 액션 디펜스.

## Unique Mechanic
- 플레이어는 3개의 고정 포탑을 두는 대신, **3개의 경첩 셔터를 각기 다른 각도로 접고 펴며 즉시 방어선을 조형**한다.
- 입력은 "어느 셔터를 누르고 어디로 젖혔다가 놓는가"에 집중된다.
- 완벽한 각도에서 적을 맞히면 `Perfect Hinge`가 발동하며 짧은 정지 연출과 금색 잔광이 남는다.

## Core Mechanics
1. 셔터 선택
   - 캔버스에서 셔터 손잡이 근처를 터치하면 해당 셔터가 활성화된다.
2. 각도 조절
   - 드래그 각도로 셔터가 미리보기 각도를 잡는다.
3. 스냅 방어
   - 손을 떼면 셔터가 해당 각도로 빠르게 닫히며 적을 튕기거나 격파한다.
4. Perfect 판정
   - 좁은 중심각과 적정 반경에서 맞히면 보너스 점수, 콤보, 금색 연출이 들어간다.

## Support Systems
- `Brace Draft`
  - 2웨이브마다 3택 업그레이드
- `Pulse Battery`
  - 에너지를 모아 화면 중심에서 광역 펄스를 사용
- `Daily Oath`
  - 날짜 기반 목표와 일일 최고 메달 저장
- `Local Ledger`
  - localStorage 기반 최고 기록/최근 런 통계 저장

## Game Loop
1. Title
2. Start
3. 적 스폰과 셔터 방어
4. Perfect/Combo/에너지 축적
5. 웨이브 종료
6. `Brace Draft` 선택
7. 다음 웨이브 진입
8. 코어 내구도 0 → Result
9. Retry / Title

## Wow Factors
1. Crescent Flick Input
   - 왜 강한가: 첫 10초 안에 "셔터를 젖혀 닫는" 촉감이 바로 느껴진다.
   - 실제 구현 표면: 손잡이 선택, 드래그 각도 미리보기, 릴리스 시 초승달 스윕.
   - 리텐션/공유 효과: 손맛이 명확해 첫인상 유지에 유리.
2. Panic Ring Escalation
   - 왜 강한가: 30~90초 구간에서 적 속도와 혼합 패턴이 급상승한다.
   - 실제 구현 표면: 웨이브 상승에 따른 `lancer`/`burst` 조합, 스폰 템포 증가.
   - 리텐션/공유 효과: "여기서부터 어렵다"는 명확한 재도전 구간 형성.
3. Brace Draft
   - 왜 강한가: 매 런의 방어 스타일을 플레이 도중 바꿀 수 있다.
   - 실제 구현 표면: `Wide Arc`, `Echo Pulse`, `Spare Brace`, `Amber Meter`, `Mercy Glass`, `Gilded Chain`.
   - 리텐션/공유 효과: 빌드 얘깃거리와 다시 해볼 이유 제공.
4. Perfect Hinge Freeze
   - 왜 강한가: 완벽 판정 순간 화면이 잠깐 얼며 금색 잔광이 남는다.
   - 실제 구현 표면: frame freeze, banner, golden trail, 결과 카드 요약 문구.
   - 리텐션/공유 효과: 스크린샷/GIF 자랑에 적합.
5. Daily Oath Ledger
   - 왜 강한가: 오늘 목표가 고정되어 일일 재방문 이유가 생긴다.
   - 실제 구현 표면: 날짜 기반 계약, 일일 최고 점수, 결과 등급.
   - 리텐션/공유 효과: "오늘 계약 클리어" 문맥으로 재접속 유도.

## Implemented Wow Factors
- Core loop direct: 1, 2, 3, 4
- Meta / retention: 5

## Banned-Rule Check
- 리듬게임 아님
- `#0a0a1a` 네온 다크 사용 안 함
- `neon-` 접두사 없음
- 단순 클릭+웨이브/방치/카드 아님
- 기존 `fan`, `prism`, `anchor-link` 메카닉과 90% 이상 중복 아님

## Visual Direction
- 아이보리 종이, 사프란 금속, 슬레이트 블루, 브릭 레드
- 둥근 유리 HUD + 금박 셔터 잔광
- 밝은 배경의 원형 방어장

## Launch Path
- Game file: `games/hinge-halo-warden/index.html`
- Supporting assets: `games/hinge-halo-warden/og-image.svg`
- Docs in game path: `SPEC.md`, `TEST-CASES.md`, `QA-REPORT.md`
- Catalog entry: `games/games-list.json`
- Launch URL: `https://eastsea-blog.pages.dev/games/hinge-halo-warden/`
