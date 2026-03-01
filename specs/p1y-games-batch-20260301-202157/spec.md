# P1y Games Batch Spec — 20260301-202157

## 목표
신규 HTML5 게임 3종을 `games/{slug}/index.html` + `games/{slug}/manifest.webmanifest`로 제작하고,
`games/manifest.json`에 3개 항목을 **배열 맨 앞 prepend** 후 `count: 155`로 갱신한다.

## 신규 게임 라인업 (장르 다양화)
1. **sonic-loom-switchyard** (rhythm)
   - 콘셉트: 4개 레인의 비트 신호를 스위치 전환으로 올바른 채널에 라우팅하는 리듬 퍼즐.
   - 코어 루프: 입력(레인 전환) → 비트 판정(Perfect/Good/Miss) → 속도/난이도 상승.

2. **abyssal-archive-diver** (action)
   - 콘셉트: 심해 기록 보관소에서 잠수정을 조종해 잔해를 피하고 유물 캡슐을 회수하는 생존 아케이드.
   - 코어 루프: 입력(이동/부스트) → 산소·내구 관리 → 거리/회수 점수 갱신.

3. **voltaic-kite-rigger** (simulation)
   - 콘셉트: 번개 폭풍 속 3개 전력 연을 각도 조절해 발전량을 유지하는 실시간 운영 시뮬레이션.
   - 코어 루프: 입력(연 선택/각도 보정) → 바람·전압 반영 → 시스템 안정화 점수 누적.

## 공통 기술/품질 제약
- 단일 파일: 각 게임 로직/CSS/HTML를 `index.html` 1개에 내장 (외부 의존성 없음)
- 입력: 키보드 + 터치 동시 지원
- 사운드: Web Audio API로 SFX 재생
- 저장: localStorage 최고기록/최고라운드/최고점수 저장
- UI: 모바일 반응형 + 네온 다크 테마 (`#0a0a1a` 기반)
- 용량: 각 `index.html` 500KB 미만
- PWA: 각 폴더 `manifest.webmanifest` 작성

## 산출물
- `games/sonic-loom-switchyard/index.html`
- `games/sonic-loom-switchyard/manifest.webmanifest`
- `games/abyssal-archive-diver/index.html`
- `games/abyssal-archive-diver/manifest.webmanifest`
- `games/voltaic-kite-rigger/index.html`
- `games/voltaic-kite-rigger/manifest.webmanifest`
- `games/manifest.json` (prepend + count + updatedAt)

## 완료 정의
- 3개 게임 실행 가능, 필수 체크리스트(터치+키보드/Web Audio/localStorage/반응형/PWA/#0a0a1a/<500KB) 충족
- 갭 분석 점수 90% 이상
- 커밋/푸시: `feat: +3 games (sonic-loom-switchyard, abyssal-archive-diver, voltaic-kite-rigger) — total 155`
