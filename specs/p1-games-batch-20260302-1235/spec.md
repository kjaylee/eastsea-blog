# P1 Games Batch Spec — 20260302-1235

## 목표
`eastsea-blog/games/`에 기존 354개와 겹치지 않는 신규 HTML5 게임 3종을 제작하고, 카탈로그(`games/manifest.json`, `games/games-list.json`)에 등록한다.

## 중복 회피 확인
- 기존 디렉터리/slug 스캔: `ls games/` (354개)
- 신규 slug(미존재 확인):
  1. `phase-strike-conductor` (rhythm/timing)
  2. `neon-catapult-atelier` (physics puzzle)
  3. `midnight-market-idle` (resource management/idle hybrid)

## 게임별 스펙

### 1) phase-strike-conductor (rhythm)
- 콘셉트: 4레인 리듬 + Phase(Inner/Outer) 전환을 동시에 맞추는 하이브리드 타이밍 게임.
- 코어 루프: 노트 낙하 → 레인 입력 + 위상 일치 → 콤보/점수 상승.
- 입력: A/S/D/F(또는 ←↓↑→), Space(Phase), 터치 레인+Phase 버튼.

### 2) neon-catapult-atelier (physics puzzle)
- 콘셉트: 각도/파워를 조절해 물체를 발사, 제한 샷 안에 타깃 파괴.
- 코어 루프: 조준/발사 → 물리 궤적/충돌 → 퍼즐 타깃 해결.
- 입력: 방향키(각도/파워), Space 발사, R 리셋, N 다음 레벨, 터치 드래그+버튼.

### 3) midnight-market-idle (idle hybrid)
- 콘셉트: 3개 상점 라인을 운영하는 방치형 + 수동 부스트 하이브리드.
- 코어 루프: 자동 수익 생성 → 업그레이드 투자 → 수동 버스트로 수익 증폭.
- 입력: 1/2/3(고용), Q/W/E(업글), Space(수동 버스트), 터치 버튼.

## 공통 제약
- 단일 파일: 각 게임 `index.html` 단일 파일
- 용량: 각 파일 500KB 미만
- 디자인: 네온 다크 (`#0a0a1a` 배경)
- 기능: 터치 + 키보드, Web Audio API SFX, localStorage 최고 기록/진행 저장
- 품질: 모바일 반응형, JS 에러 0

## 산출물
- `games/phase-strike-conductor/index.html`
- `games/neon-catapult-atelier/index.html`
- `games/midnight-market-idle/index.html`
- `games/manifest.json` (신규 3개 prepend + count/updatedAt)
- `games/games-list.json` (신규 3개 prepend)
- `specs/p1-games-batch-20260302-1235/{plan.md,test-cases.md,gap-analysis.md,launch-report.md}`

## 완료 정의
- 3개 게임이 모두 요구사항 체크리스트 90% 이상 (목표 100%)
- 브라우저 로드 시 console/page JS error 0
- git add/commit/push 완료
