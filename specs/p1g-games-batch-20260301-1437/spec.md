# Spec — p1g-games-batch-20260301-1437

## 1) Objective
`eastsea-blog/games/`에 신규 HTML5 게임 3종을 제작/추가한다.

1. **phase-weaver-rails** — 위상(Phase) 전환 + 레일 스위칭 무한 러너
2. **pulse-orchard** — 수확/정화 모드 전환형 네온 오차드 디펜스 러시
3. **ion-drift-warden** — 중심 코어 방어형 회전 실드 액션

## 2) Global Constraints (All 3)
- 단일 `index.html` (인라인 CSS/JS)
- 파일 크기 `< 500KB`
- 터치 + 키보드 입력 모두 지원
- Web Audio API 사운드 피드백
- localStorage 점수 저장/로드
- 모바일 반응형(390x844 기준 플레이 가능)
- 네온 다크 테마(핵심 배경 `#0a0a1a`)
- 에러 없는 HTML/JS (`node --check` 기준)
- 5+ 레벨 또는 무한 모드
- `manifest.webmanifest` 제공 + `<link rel="manifest">` 연결

## 3) Scope
### In Scope
- `games/phase-weaver-rails/index.html`
- `games/pulse-orchard/index.html`
- `games/ion-drift-warden/index.html`
- 각 게임 `manifest.webmanifest`
- `games/manifest.json` 신규 3개 엔트리 추가 + count 동기화
- Gap Analysis 및 Launch Report 작성

### Out of Scope
- 외부 라이브러리/이미지/오디오 의존
- 기존 게임 파일 리팩터링
- 서버/백엔드 연동

## 4) Game Specs

### 4.1 Phase Weaver Rails
- Core Loop:
  - Input: 좌/우 레일 이동 + 위상(0/1) 토글
  - Action: 도착 게이트의 레일/위상 조건을 맞춰 통과
  - Reward: 점수/콤보 획득, 속도 상승
- Systems:
  - 3레일 무한 모드
  - 위상 불일치 또는 레일 미스 시 생명 감소
  - 점수에 따라 Tier 상승(속도·스폰 빈도 증가)
- Save/Load:
  - `localStorage.phaseWeaverRailsBest`

### 4.2 Pulse Orchard
- Core Loop:
  - Input: 5레인 이동 + 모드 전환(Harvest/Purge)
  - Action: 익은 열매(ripe)와 가시 씨앗(thorn)에 맞는 모드로 처리
  - Reward: 점수/콤보, 시즌(Tier) 진행
- Systems:
  - 무한 낙하 패턴 + 난이도 가중(가시 비율/속도 증가)
  - 오처리/충돌 시 생명 감소
  - 시즌 게이지로 Tier 시각화
- Save/Load:
  - `localStorage.pulseOrchardBest`

### 4.3 Ion Drift Warden
- Core Loop:
  - Input: 회전 실드 각도 조작
  - Action: 외곽에서 유입되는 이온탄을 실드 아크로 반사
  - Reward: 반사 점수 누적, 난이도 상승
- Systems:
  - 중심 코어 체력(생명) 3 기반 무한 방어
  - Tier 상승 시 탄속/스폰 증가
  - 반사 성공/실패에 따른 시청각 피드백
- Save/Load:
  - `localStorage.ionDriftWardenBest`

## 5) Acceptance Criteria
1. 게임 3개 모두 플레이 가능하고 핵심 루프 동작
2. 터치 + 키보드 입력 둘 다 확인 가능
3. Web Audio API 호출 포함
4. localStorage 점수 저장/로드 키 존재
5. 3개 모두 무한 모드 제공
6. `manifest.webmanifest` 3개 존재 + link 연결
7. 각 `index.html` 파일 크기 `< 500KB`
8. 인라인 JS 추출 후 `node --check` 통과
9. `games/manifest.json` 신규 3개 추가 + `count === games.length`
10. Gap Analysis 점수 90% 이상 달성(최대 3회 반복)
