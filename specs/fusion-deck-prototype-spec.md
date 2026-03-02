# Game Spec — fusion-deck-prototype

## Goal
Telegram Mini App 호환 가능한 단일 HTML 로그라이크 덱빌더 프로토타입 제작.
핵심 카피: **"7초 이해: 3장 중 1장 고르고, 적을 부수고, 카드 2장을 융합해 다음 층으로."**

## Core Loop
- Input: 전투마다 3장 카드 제시(터치/클릭/키보드 1~3)
- Action: 카드 1장 선택 즉시 효과 적용(공격/방어/상태이상/시너지)
- Reward: 적 처치 시 보상 카드 3장 중 1장 획득 → 다음 층 진입

## Differentiator: Fusion Mechanic
- 덱(인벤토리)에서 카드 2장을 선택해 상위 카드 1장으로 융합
- 융합 성공 시 재료 제거 + 결과 카드 추가 + 시청각 피드백
- 전투/보상 화면에서 Fusion 모드 진입 가능

## Systems
- Progression:
  - 5층 구조 고정
  - 층 진행마다 적 체력/공격 스케일 상승
  - 3종 적 타입(Drone, Brute, Witch) 순환
- Combat:
  - 적 Intent(다음 행동) 명시 노출
  - 플레이어 Block/Charge/Poison 상태 처리
- Card Pool:
  - 기본 카드 + 고급 카드 + 융합 카드 포함 최소 10종 이상
- Save/Load:
  - localStorage에 진행도(진행 층/덱/HP) 저장
  - 최고 기록(최고 층/최고 점수) 저장

## UX/Visual Constraints
- 단일 파일: `/static/games/fusion-deck/index.html`
- Canvas 2D 렌더링
- 네온 다크 테마 배경 `#0a0a1a`
- 모바일 세로 우선 반응형
- Web Audio API 효과음 3종 이상(드로우/공격/융합)
- 파일 크기 < 500KB

## Technical Constraints
- 외부 라이브러리/에셋 없이 순수 HTML/CSS/JS
- Telegram WebApp 브리지 존재 시 `ready/expand` 호출
- JS 에러 0 목표
