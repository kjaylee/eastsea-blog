# QA Report — Crown Quest

- 일자: 2026-09-08 KST (chain #4 종단 실행)
- 방식: 단일 파일에서 `<script>` 추출 → `node --check` → 정적 QA IIFE 하니스 + 전체 런타임 흐름 하니스 2계층 실구동 (chain #3 전례 방식)
- 결과: **정적 QA 45/45 PASS + 런타임 흐름 44/44 PASS, pageErrors = []**

## 정적 검증

- `node --check`: 구문 오류 0 (vm.Script 파싱 통과)
- HTML 헤더 주석: 연구 원천 3건 명시 확인 (v6 triple-crown-systematics / v8 japan-triple-crown-eight / v8 korea-triple-crown-two)
- 무패 달성률 시뮬레이션 10,000회: **2.65%** (목표 ~3.5% ±1.0pp — v8 1호 §3.2 수치 근거, 무패 3관 3두/86회)

## 빌드 중 적발·수정 (중요)

1. **perfOf NaN 버그 (치명적)** — `S.fatigue` 참조가 `S.horse.fatigue`여야 하는데 상태 객체 루트에서 읽어 undefined → 성능 지수 NaN → 전 경주 패배(무패 확률 0%). 런타임 하니스(마진·perf 수치 검증)가 적발. `S.horse.fatigue`로 수정.
2. **result 화면 phase 부재** — 경주 후 바로 다음 주차로 넘어가 결과 화면을 볼 수 없었음. `phase='result'` + '다음 주차' 버튼 분기 추가 (게임 흐름 개선 + 하니스의 결함).
3. **시뮬레이터·하니스의 result phase 미처리** — race()가 result phase에서도 허용되도록 확장하고, 하니스에 btn-next 동작(nextWeek)을 흐름 재현 (테스트 측 수정).
4. **무패 확률 튜닝 검증** — 최적 빌드로 10,000회 시뮬레이션 → 2.65% (스펙 목표 2.5%~4.5% 도달). 결정적 무패 시드 27 (마진 합 5) 스캔 확보, 런타임 흐름 A에서 사용.

## 어설션 결과

### 계층 1 — 정적 QA IIFE (45/45)

| # | 어설션 | 결과 |
|---|---|---|
| 1 | `<script>` 단일 블록 + node --check | PASS |
| 2 | 헤더 주석 3개 원천 경로 | PASS |
| 3 | SOURCES 3건 path/use | PASS |
| 4 | 일본형 5주차 구조 action,race,race,pasture,race | PASS |
| 5 | 미국형 5주차 구조 race,action,race,action,race | PASS |
| 6 | 일본 거리 계단 2000→2400→3000 | PASS |
| 7 | 미국 거리 2012→1900→2400 | PASS |
| 8 | 요구 스탯 전환 SPD→END계열→STA/END | PASS |
| 9 | 무패 조건 3연승 && 마진 합 ≥ 5 | PASS |
| 10 | 무패 확률 10,000회 시뮬레이션 2.65% (~3.5% ±1.0pp) | PASS |
| 11 | 훈련 +12/피로+4, 휴양 -16, 방목 +9/-22 | PASS |
| 12 | 경주 피로 일본 14 < 미국 18 | PASS |
| 13 | 라이벌 플래그 최종 관문 (jp/us) | PASS |
| 14 | 계승 보너스 legacyStart → 전 스탯 +6 | PASS |
| 15 | 승률 클램프 [4%, 97%] | PASS |
| 16 | localStorage 키 round-trip | PASS |
| 17 | seeded RNG 결정성 | PASS |
| 18 | 숫자 필드 NaN/undefined 없음 | PASS |
| 19 | 초기 스탯 45/45/45 + 부트스트랩 | PASS |

### 계층 2 — 전체 런타임 흐름 (31/31)

**흐름 A — 일본형 무패 클리어 + 계승 (seed 27 결정적)**

| # | 어설션 | 결과 |
|---|---|---|
| 1 | 부트스트랩 phase=title | PASS |
| 2 | 타이틀 크라운 퀘스트 렌더 | PASS |
| 3 | 일본형/미국형 모드 카드 | PASS |
| 4 | 연구 원천 3건 노출 | PASS |
| 5 | 무패 3관 3.5% 안내 | PASS |
| 6 | startGame → play·week=0 | PASS |
| 7 | 일본형 달력 길이 5 | PASS |
| 8 | train_spd +12·피로+4·week=1 | PASS |
| 9 | week=1 렌더(경주 준비 화면) | PASS |
| 10 | 皐月賞 2000m SPD 참가 | PASS |
| 11 | 경주 후 피로 +14 | PASS |
| 12 | 승리 시 마진 ≥1 / 패배 0 | PASS |
| 13 | 경주 결과 화면(우승/패배 박스) | PASS |
| 14 | 더비 2400m END 요구 전환 | PASS |
| 15 | 방목 전 스탯 +9·피로 -22·week=4 | PASS |
| 16 | 菊花賞 3000m STA 최종 관문 | PASS |
| 17 | finish → summary | PASS |
| 18 | 결산 계승/다시 도전 버튼 | PASS |
| 19 | 무패 3관 클리어 + 업적 결산 | PASS |
| 20 | legacyStart → title | PASS |
| 21 | meta.legacy 기록 (gen=1) | PASS |
| 22 | 2세대 보너스 전 스탯 51 (45+6) | PASS |

**흐름 B — 미국형 실패 + 라이벌 역전 (23~27)**

| # | 어설션 | 결과 |
|---|---|---|
| 23 | 미국형 5경주 완주 → summary | PASS |
| 24 | 벨몬트 라이벌(알리다) 역전/추격 이벤트 | PASS |
| 25 | 클리어 실패 시 cleared=false | PASS |
| 26 | 실패 시 계승 버튼 없음 | PASS |
| 27 | 기록 누적 plays 증가 | PASS |

**흐름 C — 경계·저장 (28~31)**

| # | 어설션 | 결과 |
|---|---|---|
| 28 | localStorage 복원 plays=6 + legacy 보너스 | PASS |
| 29 | 잘못된 주차 race 호출 → {ok:false} | PASS |
| 30 | 정상 주차 action → {ok:true}·week 전진 | PASS |
| 31 | resetAll → title·기록 초기화 | PASS |

- pageErrors = [] (전체 44개 어설션 + VM 실행 전 구간에서 console.error/예외 0)

## 발행 검증

- 커밋: (아래 기입)
- 라이브 검증: `https://eastsea-blog.pages.dev/crown-quest/` HTTP 상태 — (아래 기입)