# QA Report — odds-rush

- 일자: 2026-09-02 22:2x KST (일일 Plan-Do-See 크론 내 실행)
- 방식: 단일 파일에서 `<script>` 추출 → `node --check` → 정적 QA IIFE 하니스 + 전체 런타임 흐름 하니스 2계층 실구동
- 결과: **정적 QA 19/19 PASS + 런타임 흐름 28/28 PASS, pageErrors = []**

## 정적 검증

- `node --check`: 구문 오류 0 (초안 1건 — mulberry32 내 `>>>` 축약 표기 파싱 오류 → 명시적 괄호 표기로 수정 후 통과)
- HTML 헤더 주석: 연구 원천 3건 명시 확인 (v6 사례 3건 — 2012-Arc·2022-BC Classic·2024-Korean Derby)

## 빌드 중 적발·수정 (중요)

1. **부트스트랩 누락 (치명적 버그)** — 페이지 로드 시 `S = newState(...)`·`render()` 호출이 없어 게임이 시작되지 않는 문제를 런타임 하니스가 적발. `S.phase === null` 참조로 빈 화면이 되는 사례였다. 부트스트랩 코드 추가로 해결. 이는 정적 QA IIFE(순수 로직만 검사)로는 잡히지 않고, 전체 흐름(runtime) 하니스에서만 드러났다.
2. **mulberry32 `t>>>7` 축약 파싱 오류** — node --check에서 적발, 명시 표기로 수정.

## 어설션 결과

### 계층 1 — 정적 QA IIFE (19/19)

| # | 어설션 | 결과 |
|---|---|---|
| 1 | seeded RNG determinism | PASS |
| 2 | 6 horses generated | PASS |
| 3 | exactly 1 pick per round | PASS |
| 4 | all odds positive int | PASS |
| 5 | score calc (odds*10+streak*5+time*2) | PASS |
| 6 | streak bonus grows | PASS |
| 7 | ROUND_TIME=30 | PASS |
| 8 | TOTAL_ROUNDS=5 | PASS |
| 9 | 3 hint cards | PASS |
| 10 | all hints have label+text+source | PASS |
| 11 | horse pool >= 16 | PASS |
| 12 | 3 source refs | PASS |
| 13 | round determinism (seed 99) | PASS |
| 14 | pick always exists in round | PASS |
| 15 | pick odds >= 8 | PASS |
| 16 | non-pick can have low odds (<4) | PASS |
| 17 | no NaN in horse names | PASS |
| 18 | no undefined in horse names | PASS |
| 19 | localStorage round-trip | PASS |

### 계층 2 — 전체 런타임 흐름 (28/28)

타이틀 부트스트랩 → startGame → togglePick/confirmPick → nextRound → revealHint → toggleFav → 5라운드 완주 → summary 렌더까지 실경로 검증.

| # | 어설션 | 결과 |
|---|---|---|
| 1 | bootstrap sets phase=title | PASS |
| 2 | title screen rendered (오즈 러시) | PASS |
| 3 | title screen has 시작 button | PASS |
| 4 | title screen shows study sources | PASS |
| 5 | phase=play after startGame | PASS |
| 6 | round=0 after start | PASS |
| 7 | 6 horses in round | PASS |
| 8 | app has 출주표 text | PASS |
| 9 | app has odds label | PASS |
| 10 | togglePick sets _picked | PASS |
| 11 | round advanced after confirmPick | PASS |
| 12 | results has 1 entry | PASS |
| 13 | score is non-negative | PASS |
| 14 | phase=result | PASS |
| 15 | result has horseName | PASS |
| 16 | result has odds number | PASS |
| 17 | result points matches correct flag | PASS |
| 18 | new round after nextRound (round=1) | PASS |
| 19 | hintRevealed reset | PASS |
| 20 | timeLeft reset to 30 | PASS |
| 21 | _picked null | PASS |
| 22 | revealHint(0) reveals | PASS |
| 23 | toggleFav marks favorite | PASS |
| 24 | favorite clears picked | PASS |
| 25 | reached summary after 5 rounds | PASS |
| 26 | results has 5 entries | PASS |
| 27 | summary shows 최종 결과 | PASS |
| 28 | summary shows R1: | PASS |

## 발행 검증

- 커밋: `b4a8ca1623e8a27a79f819b6826d1277fe2e5c10` (master push, 2026-09-02)
- 라이브 검증: `https://eastsea-blog.pages.dev/odds-rush/` HTTP **200** (2026-09-02 22:2x KST curl 확인)
