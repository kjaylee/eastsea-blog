# Bloodline Nexus — QA Report (2026-09-16, chain #5)

## 실행
- 하네스: `qa-harness.js` (Node VM + DOM shim, chain #3/#4 전례 방식)
- 커맨드: `node qa-harness.js`
- 환경: node v24.18.0, macOS

## 결과 요약

| 계층 | 결과 |
|---|---|
| 정적 어셜션 | 19/19 PASS |
| 런타임 DOM 하니스 | 67/67 PASS |
| **합계** | **86/86 PASS** |
| pageErrors | **[] (없음)** |
| render 평균 | ≤ 5ms (100회) |
| 교배 대량 시뮬레이션 | 100,000회 — NaN/Infinity 0건 (100,000회 성공) |

## QA가 적발·수정한 결함 (2건 — 하니스 실효 재입증)

1. **자마 카드 `anc` 누락 크래시** — G2 교배에서 자마를 씨수마로 승격(내 혈통 카드) 후 `calcCOI(sire, dam)`이 `sire.anc`를 순회하며 `sire.anc is not iterable` TypeError 발생 (chain #4의 스탯 NaN과 별개의 런타임 크래시 유형). 수정: 자마에 `anc: []` 명시 + `calcCOI`에 `(sire.anc || [])` 가드. 재검증으로 G2·G3 교배 전 구간 통과.
2. **foal-1 승격 카드의 부모 매칭 오작동** — `sireCard()`가 `horses[horses.length-1]`(최신 자마)를 반환해 G3에서 `foal-1` 선택 시 G2 자마가 잘못 전달되던 로직 버그. 수정: `parseInt(id.slice(5))`로 세대 직접 매칭(`horses.find(h => h.gen === g)`).

※ 하니스 측 검사식 4건도 게임 설계/원문 수치에 맞게 정정(동일 계열 NEUTRAL 판정·`const num` 선언·round4 반올림·직전 세대만 승격 노출 설계) — 게임 로직 변경 아님.

## 검증 범위 (스펙 대조)

- **부트스트랩** (chain #3 교훈): 로드 즉시 `newState()` + `render()` → phase=title + 타이틀 렌더 확인, 저장 복원 시 재부팅 안정성 확인
- **NaN 방지** (chain #4 교훈): 모든 스탯/COI 계산이 `num()`(Number.isFinite) 경유 + 완성 시 NaN 방어 재계산 — 10만 회 무작위 교배에서 0건
- **COI 공식** (v3 §3): `Σ(0.5)^(n1+n2+1)` — mp×native-girl 0.125(고도), deep×ss-girl 0.0625(중등), contrail×ss-girl 0.03125(경미), 무근친 0 정밀 검증
- **Nicks 테이블** (v3 §2): nd×htr GOOD(+8, G1 사례), mp×htr BAD(-4, 비호환), mp×rb GOOD
- **인브리딩 리스크-보상**: 밴드 보너스 3/7/12 vs 리스크 15%/30%/50% — 시드 스캔 200회에서 발현/미발현 양쪽 실재 + 발현군 평균 성능 < 미발현군 실증
- **잡종 강세** (v3 §4): 계통 상이 +3, 양쪽 평균 52+ 시 +4
- **부자 계승** (v8 1호 §3.1): 스코어 200+ 명마 → 다음 플레이 legacy 각인(딥→콘트레일 안내) + G1 전 스탯 +6 실증
- **3세대 교배**: 자마→씨수마 승격, G3 결산(성능+균형+닉+COI 고정) 등급 S/A/B/C, plays 누적, localStorage 복원/리셋

## 결론

- 완료 조건 충족: 정적 19/19 + 런타임 67/67 (합 86/86), pageErrors=[] → **발행 승인**