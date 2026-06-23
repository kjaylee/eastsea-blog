# Game Spec — signal-tea-house

## Current state
- 오늘 1회 런칭 대상은 신규 게임 **Signal Tea House — 시그널 티하우스**다.
- 런칭 리포지토리는 `eastsea-blog`이며 산출물 경로는 `games/signal-tea-house/`다.
- 최근 라우팅 퍼즐 계열과 겹치지 않도록, 이번 슬라이스는 **타일 회전 + 찻물 온도 조절**을 함께 요구하는 다과 라우팅 퍼즐로 차별화한다.

## Verification criteria
- `games/signal-tea-house/index.html` 단일 파일로 모바일 390x844에서 시작, 플레이 진입, 타일 회전, 온도 변경, 서빙 판정, 게임오버, 재시작이 실제 동작해야 한다.
- 와우 팩터 5개를 모두 문서화하고, 그중 최소 3개 이상은 런타임 코드로 작동해야 한다.
- `localStorage` 저장, JS `pageerror 0`, 라이브 URL 확인 전에는 완료로 보고하지 않는다.

## Completion criteria
- 게임 파일 생성
- `games/games-list.json` 신규 항목 추가
- 스펙/테스트케이스/QA/런칭 리포트 작성
- 로컬 QA 통과 후 git은 아래 범위만 커밋
  - `games/signal-tea-house/*`
  - `games/games-list.json`
- 원격 반영 후 `https://eastsea-blog.pages.dev/games/signal-tea-house/` 실제 응답 검증

## Artifact path
- `games/signal-tea-house/index.html`
- `games/signal-tea-house/spec.md`
- `games/signal-tea-house/test-cases.md`
- `games/signal-tea-house/qa-report.md`
- `games/signal-tea-house/launch-report.md`

## Game line
깃발 주문이 들어오는 찻집에서 스위치 타일을 돌리고 찻물 온도를 맞춰 손님에게 정확한 차를 배달하는 모바일 라우팅 퍼즐.

## Core mechanic
- 보드는 **3행 x 4열 스위치 타일**로 구성된다.
- 신호는 항상 가운데 행에서 출발한다.
- 각 열에서 현재 행의 타일 상태(`위로`, `직진`, `아래로`)에 따라 다음 행으로 이동한다.
- 플레이어는 타일을 탭해 방향을 바꾸고, `냉차 / 미지근 / 뜨거움` 중 하나로 kettle heat를 맞춘 뒤 `서빙` 버튼을 눌러 판정한다.
- 주문의 **찻종류(도착 행)** 와 **온도(heat)** 를 동시에 맞추면 성공이다.

## Support systems
- 점수 / 콤보 / 생명 4개
- 4턴마다 강화안 선택
- 일일 과업 진행도와 최고 기록 저장
- 게임오버 후 결산 카드 복사

## Game loop
1. 주문 확인
2. 예보 큐와 오멘 문구 확인
3. 타일 회전으로 경로 맞춤
4. 찻물 온도 조절
5. 서빙 판정
6. 성공이면 콤보/블룸/점수 상승, 실패면 생명 감소
7. 4턴마다 칙령 선택
8. 생명이 0이 되면 결산 카드와 재시작

## Wow factors (5)
1. **Forecast Tray** — 현재 주문 포함 다음 3명의 손님과 오멘 문구를 미리 보여준다.
2. **Aroma Bloom** — 3연속 성공 시 향기 만개 배너가 뜨고 다음 서빙 점수 배율이 상승한다.
3. **Tea House Decree** — 4턴마다 3지선다 강화안을 열어 남은 런의 규칙을 바꾼다.
4. **Daily Guest Seal** — KST 날짜 기준 일일 과업 `완벽한 다과 3회`를 저장하고, 달성 시 전용 문구를 남긴다.
5. **Ledger Share Card** — 게임오버 시 점수/최대 콤보/선택 칙령/칭호를 카드 형태로 정리해 복사한다.

## Decree pool
- `Gilded Tray`: 서빙 기본 점수 +8
- `Kind Kettle`: 실패 1회 무효 보호막 1개
- `Borrowed Steam`: 온도 불일치 1회 자동 보정
- `Lotus Coupon`: 즉시 생명 +1
- `Quiet Notes`: 일일 과업 진행 +1 보너스

## Prohibited-rule review
- 외부 라이브러리 의존 금지
- 외부 API 호출 금지
- 숨겨진 autoplay 오디오 금지
- 모바일 한 손 조작을 해치는 멀티터치 필수 규칙 금지
- 런칭 검증 없이 아이디어 단계에서 중단 금지

## Launch path
- Local: `http://127.0.0.1:4173/games/signal-tea-house/`
- Production: `https://eastsea-blog.pages.dev/games/signal-tea-house/`

## 🔴 Red Team
- [공격 1]: 경로 퍼즐이 너무 단순하면 이전 라우팅 게임과 차별성이 약해질 수 있다.
- [공격 2]: 온도 조건이 과도하면 클릭 수만 늘고 손맛이 줄 수 있다.
- [방어/완화]: 타일 4열 최소 해법 + 온도 1탭 전환 + 4턴 칙령 + 블룸 연출로 즉시성 유지.
- [합의]: 🟢극복

✅ Anti-rationalization: Pass
