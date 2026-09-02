# Derby Sprint QA Report

Date: 2026-08-17 KST

## Result

- Built-in QA (`?qa=1`, Node VM DOM-shim 실행): **`window.__qaResult.pass === true` — 12/12 어설션 통과**
- JavaScript page errors: 0
- Rendered `undefined` / `NaN`: 0
- `node --check` (script 추출): PASS
- Implemented wow factors: 4 (Weather-Read Draft / One-Button Pacing / 지진 Collapse / Spur Zone Finish)

## Assertion Evidence (runQA 출력 원문)

```
meta-structure ok
horse-stats-differ ok
heat-drain-applied ok (3.00→4.68)
cold-early-seal ok (0.59 vs 0.36)
rain-grip-aptitude ok (0.58 vs 1.04)
exhaustion-collapse ok (v=7.45)
ai-monotonic-finish ok (6/6)
finish-time ok (71.7s)
result-screen ok
localStorage ok (best=1460)
pageerror ok
finite-state ok
```

## Static Evidence

### 1. 구문 검증

```
$ awk '/<script>/{flag=1;next}/<\/script>/{flag=0}flag' index.html > /tmp/derby-sprint.js
$ node --check /tmp/derby-sprint.js   → exit 0 (PASS)
```

### 2. 연구 원천 인용 (index.html 최상단 주석)

```
$ sed -n '1,6p' index.html
<!--
  Derby Sprint — 더비 스프린트
  연구 원천: research/horse-racing/GAME_CONNECTION.md 매핑 1행(v4/경주마-체형분류와-달리기스타일.md), 2행(v4/계절-날씨별-경주-전략.md + v7/climate-impact-on-racehorses.md)
  ...
-->
```

### 3. 말 3종 스탯 상이성 (grep)

```
topSpeed: 27.6 / 25.6 / 24.0   (모두 다름)
staminaMax: 78 / 100 / 124     (모두 다름)
spurMult: 1.06 / 1.26 / 1.58   (모두 다름)
```

### 4. 날씨 4종 계수가 로직에 반영 (grep + 시뮬레이션)

```
clear: drain:1.0, grip:1.0, early:1.0
heat:  drain:1.2, grip:1.0, early:1.0   ← 폭염 소모 +20%
rain:  drain:1.05, grip:0.8, early:1.0  ← 접지력 저하
cold:  drain:1.05, grip:1.0, early:0.6  ← 초반 200m 가속 봉인
```

- 폭염 실측: 스프린터 1초 hold 소모 3.00 → 4.68 (×1.56 = 1.2 전역 × 1.30 체형)
- 한파 실측: 초반 유효 가속 비율 스프린터 0.59 vs 스테이어 0.36 (스프린터 상대 우세 — 연구 매핑 반영)
- 강우 실측: 스퍼트 접지계수 스프린터 0.58 vs 스테이어 1.04 (스테이어 상대 유리 — 연구 매핑 반영)

### 5. HTML 구조

- `og:title` ✅ / `canonical https://eastsea-blog.pages.dev/games/derby-sprint/` ✅ / `viewport` ✅ (grep 확인)

### 6. 로직 단위 테스트

- 지진 현상: stamina 0·v=20 상태에서 2초 후 v=7.45 (5m/s 수렴 — 심한 감속 페널티 확인)
- AI 단조성: 전 레이스 0.5s 스텝 검사에서 6마리 위치 전 구간 단조 증가, 6/6 완주
- 완주 시간: 오토파일럿 기준 71.7s (목표 60~80s 밴드 내)

### 7. 밸런스 스윕 (3 체형 × 4 날씨, 오토파일럿 고정 페이싱)

```
sprinter clear 72.8s 5위 | heat 73.1s 3위 | rain 73.5s 4위 | cold 74.0s 4위
miler    clear 70.7s 4위 | heat 70.8s 2위 | rain 71.0s 3위 | cold 73.0s 2위
stayer   clear 71.7s 3위 | heat 71.7s 3위 | rain 71.6s 4위 | cold 75.2s 5위
```

- 12/12 조합 완주, 시간 70~76s 밴드, 날씨×체형 상성이 순위에 실제로 반영됨(스테이어 한파 최악, 마일형 전천후 안정 — 연구 근거와 일치).

## Remaining Risk

- 실기기 멀티터치·노치 안전영역은 DOM 규약(430px, safe-area-inset, touch-action:none)으로 대응했으나 물리 기기 미검증.
- 게이트 역학(출주 지연)은 의도적으로 미구현(스코프 외).
