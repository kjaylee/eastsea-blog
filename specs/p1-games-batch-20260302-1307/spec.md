# P1 Games Batch Spec — 20260302-1307

## 목표
`eastsea-blog/games/`에 규칙 위반 없는 신규 HTML5 게임 3종을 제작하고 카탈로그(`games/manifest.json`, `games/games-list.json`)에 등록한다.

- 리듬게임 장르 미포함
- `#0a0a1a` 네온 다크 미사용
- 게임 이름에 `neon-` 접두사 미사용
- 단순 클릭+웨이브/방치/카드 조합 미사용
- 각 게임에 고유 메카닉 명시

## 신규 게임 목록 (중복 미존재 slug)
1. `paper-gate-arbiter` — strategy/simulation
2. `echo-loop-speedway` — racing/arcade
3. `inkfield-bastion` — defense/sandbox hybrid

## 게임별 설계

### 1) paper-gate-arbiter
- **장르**: strategy / simulation
- **컬러 팔레트**: 페이퍼/우드 톤
  - 배경 `#f3e9d2`
  - 패널 `#e4d3b0`
  - 잉크 `#3d2b1f`
  - 강조 `#9e5b3a`, `#3b7a57`
- **코어 루프**: 서류 확인 → 판정(Approve / Inspect / Deny) → 규정 갱신 대응
- **진행 시스템**: score, strike, level(규정 복잡도), localStorage 최고 기록
- **이 게임만의 고유 메카닉**:
  - `Inspect 토큰`이 제한되어 있어 무조건 검사가 불가
  - 라운드마다 규정이 바뀌며, **애매한 케이스를 검사에 태울지 즉시 판정할지 리스크 판단**이 핵심
  - 단순 OX가 아니라 “정보 획득 비용” 자체가 전략 자원

### 2) echo-loop-speedway
- **장르**: racing / arcade
- **컬러 팔레트**: 레트로 8bit 선셋
  - 배경 `#fff7d6`
  - 도로 `#30323d`
  - 차체 `#ff9f1c`
  - 포인트 `#2ec4b6`, `#6a4c93`
- **코어 루프**: 3레인 주행 → 장애물 회피 → 동기화 게이트 통과
- **진행 시스템**: 루프(랩) 수, 속도 증가, localStorage 최고 랩
- **이 게임만의 고유 메카닉**:
  - 한 루프 동안의 입력이 녹화되어 다음 루프의 `고스트`로 재생
  - 특정 게이트는 **현재 플레이어 + 이전 루프 고스트가 같은 레인에 동시에 존재해야 통과 가능**
  - 과거의 자신의 입력과 협업해야 생존 가능한 시간 시너지 메카닉

### 3) inkfield-bastion
- **장르**: defense / sandbox hybrid
- **컬러 팔레트**: 수채화 카툰
  - 배경 `#f6f1e1`
  - 그리드 `#d7cfba`
  - 잉크A(전류) `#2a9d8f`
  - 잉크B(수지) `#f4a261`
  - 적 `#7f5539`
- **코어 루프**: 타일 페인팅 → 적 경로 제어(감속/포탑 활성) → 업그레이드
- **진행 시스템**: wave, base HP, 코인 업그레이드, localStorage 최고 wave
- **이 게임만의 고유 메카닉**:
  - 플레이어가 직접 공격하지 않고 **지형(타일)의 속성을 칠해서 전장을 재구성**
  - 전류 잉크: 포탑 사격 조건 생성 / 수지 잉크: 이동 감속
  - 즉, 공격력보다 “환경 조작 레이어”가 승패를 좌우

## 공통 구현 요구
- 단일 파일 `index.html` (20~50KB)
- Canvas 렌더링, 터치 + 키보드 입력
- 상태머신(title → play → gameover)
- Web Audio 기반 SFX 3종 이상
- i18n (ko/en 토글)
- localStorage 저장/로드
- 모바일 viewport-fit=cover 대응
- SEO 메타 + Schema.org VideoGame

## 산출물
- `games/paper-gate-arbiter/index.html`
- `games/echo-loop-speedway/index.html`
- `games/inkfield-bastion/index.html`
- `games/manifest.json` 업데이트
- `games/games-list.json` 업데이트
- `specs/p1-games-batch-20260302-1307/{spec.md,plan.md,test-cases.md,qa.md,gap-analysis.md,launch-report.md}`
