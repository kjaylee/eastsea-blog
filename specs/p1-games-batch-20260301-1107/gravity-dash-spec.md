# Game Spec — gravity-dash

## Core Loop
- Input: 터치/클릭/스페이스/방향키로 중력 전환, X/Shift/Z로 Pulse 발동.
- Action: 상·하 레일 사이를 반전하며 장애물을 회피하고 코어를 수집.
- Reward: 생존 거리 기반 점수, 스테이지 상승, 크레딧 획득.

## Systems
- Progression: 무한 러너(스테이지/속도 지속 상승).
- Economy: 런 종료 시 크레딧 획득, 실드 업그레이드 구매.
- Save/Load: localStorage(STORAGE_KEY: gravityDashSave_v1)에 최고점/크레딧/언어/업그레이드 저장.

## Constraints
- Single HTML: games/gravity-dash/index.html
- Mobile-first: 반응형 캔버스 + 안전영역 패딩
- Asset budget: 외부 이미지 미사용, 단일 파일 30,103 bytes
- Theme: Neon dark base #0a0a1a
- PWA: rel="manifest" => /games/manifest.json
