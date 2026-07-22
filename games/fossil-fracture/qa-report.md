# Fossil Fracture 큐에이 보고서

- 실행 시각: 2026-07-23 02:15 KST 사이클
- 대상: `games/fossil-fracture/`
- 기준 뷰포트: 390×844
- 최종 판정: 구현·로컬 출시 게이트 통과

## 자동 플레이 결과

```json
{
  "ok": true,
  "viewport": "390x844",
  "flow": "title → play → stress-line → draft → result/gameover → retry",
  "safeRemoval": 1,
  "fossilDamage": 4,
  "stage1": { "strength": 1, "branches": 1, "target": 38 },
  "stage4": { "strength": 3, "branches": 4, "target": 58 },
  "tools": ["fine", "clamp"],
  "wowFactors": 5,
  "museumParticles": 320,
  "storageRuns": 2,
  "finalState": "play",
  "pageErrors": 0,
  "consoleErrors": 0,
  "engine": "linkedom-fallback"
}
```

`node games/fossil-fracture/qa-harness.mjs`가 공개 `window.__GAME_QA__` 인터페이스를 통해 실제 게임 판정 함수를 실행했다. 별도 성공 값은 주입하지 않았다.

- 안전 응력선: 궤적 길이·분기 균열 생성, 암반 1셀 제거, 노출도 증가, 보존도 유지
- 화석 교차선: 실제 손상 4, 보존도 감소
- 상태 흐름: 타이틀 → 플레이 → 2층 완료 뒤 도구 초안 → 4층 완료 뒤 도구 초안 → 박물관 결과 → 게임오버 결과 → 재도전
- 도구 효과: 정밀 끌의 균열 반경·안전 배수와 석고 클램프의 손상 방어 상태 확인
- 저장: 성공·실패 후 실행 횟수 2, 일일 최고 기록과 표본 등급 생성, 같은 저장소로 재초기화 뒤 최고 기록 재표시 확인

## 와우 팩터 게이트

1. Stress-Line Fracture: 드래그 형상과 놓기 판정이 제거·손상·분기·먼지를 함께 만든다.
2. Faultline Escalation: 1층 `1/1/38`에서 4층 `3/4/58`로 강도·분기·목표가 모두 상승한다.
3. Conservator Draft: Fine Chisel, Resonance Mallet, Plaster Clamp가 동일 균열 판정의 modifier를 바꾼다.
4. Museum Reveal Freeze: 성공 결과에 표본 카드, 등급, 점수, 무손상 연쇄, 도구 조합, 먼지 320개가 기록된다.
5. Daily Stratum Cabinet: 날짜 기반 고정 seed와 daily best, runs, best streak, cabinet rank를 저장한다.

## 정적·카탈로그 게이트

- 인라인 자바스크립트 구문: 통과
- `games-list.json` 파싱: 통과, 총 400개 항목
- `fossil-fracture`: 맨 앞에 정확히 1회, canonical URL·태그·`polished: true` 확인
- 게임 파일 크기: 24,750바이트
- 금지 팔레트·접두사: 0건
- DOM/state의 `undefined`, `NaN`: 0건
- `git diff --check -- games/fossil-fracture games/games-list.json`: 통과

## 브라우저·시각 검증 상태

Playwright 패키지는 탐지됐지만 Chromium 실행 파일이 없어, 결정론적 문서 객체 모델 게임플레이 큐에이로 대체했다. 캔버스 크기 360×452, 문서 폭 390 이하, 터치 통합 pointer 핸들러와 safe-area 스타일을 검증했다. 실제 기기 픽셀·프레임 검증은 배포 주체가 런칭 게이트에서 보완해야 한다.

## Red Team

- 실제 물리 과설계 위험: 고정 12×14 격자와 결정론적 거리 판정으로 제한했다.
- 높은 지층 완주 불가 위험: 표시 강도는 1→4로 상승시키되 실제 셀 내구도는 최대 2회로 제한해 6~8회 타격 범위에 맞췄다.
- 가짜 하네스 위험: 실제 `begin → move → end → fracture` 경로와 상태·저장·DOM 결과를 교차 검증했다.
- dirty 워크트리 혼입 위험: 변경은 `games/fossil-fracture/`와 `games/games-list.json`에만 한정했다.
- 합의: 🟢 극복
- ✅ Anti-rationalization: Pass

## 남은 위험

로컬 Chromium이 없어 실제 픽셀 스크린샷과 실기기 프레임 속도는 확인하지 못했다. 배포 커밋·라이브 HTTP·바이트 일치는 상위 런칭 단계에서 검증해야 한다.
