# Test Cases — p1j-games-batch-20260301-1532

## 공통 테스트
- **TC-COM-001**: 각 게임이 초기 렌더링되고 치명 JS 에러 없이 시작된다.
- **TC-COM-002**: 390x844 모바일에서 UI가 깨지지 않고 플레이 가능하다.
- **TC-COM-003**: 배경/테마가 `#0a0a1a` 기반 네온 다크 스타일이다.
- **TC-COM-004**: `manifest.webmanifest` 존재 + HTML `link rel="manifest"` 연결.
- **TC-COM-005**: Web Audio API(`AudioContext`) 호출 경로가 존재하고 효과음 재생이 트리거된다.
- **TC-COM-006**: localStorage 최고 기록 저장/복원 동작.

## Mirror Vault Heist
- **TC-MVH-001**: 방향키/터치 버튼으로 이동 가능.
- **TC-MVH-002**: Space/터치로 미러 모드 전환 가능.
- **TC-MVH-003**: 레이저 타일 충돌 시 페널티 적용.
- **TC-MVH-004**: 키 수집 후 출구 도달 시 스테이지 클리어.
- **TC-MVH-005**: 6스테이지 순차 진행 및 최고 스테이지 저장.

## Tidal Signal Operator
- **TC-TSO-001**: 키보드(1/2/3)와 터치 버튼으로 장비 상태 토글.
- **TC-TSO-002**: 환경 수치(파고/안개/조류) 변동에 위험지수가 갱신.
- **TC-TSO-003**: 위험지수 과다 시 선박 손실/게임오버 처리.
- **TC-TSO-004**: Shift 진행에 따라 난이도 상승.
- **TC-TSO-005**: 최고 Shift 또는 점수 저장.

## Skyline Seed Runner
- **TC-SSR-001**: 방향키/WASD + 터치 드래그로 드론 이동.
- **TC-SSR-002**: 캡슐 수거 시 보유량 증가, 목표지점 투하 시 점수 증가.
- **TC-SSR-003**: 바람/장애물 충돌 패널티 반영.
- **TC-SSR-004**: 연속 투하 콤보가 점수 배율에 반영.
- **TC-SSR-005**: 최고 점수 localStorage 저장/복원.

## 정적 검증
- **TC-VAL-001**: 각 `index.html` 파일 크기 < 500KB.
- **TC-VAL-002**: 각 게임 JS가 `node --check` 통과.

## 합격 기준
- 필수 테스트 90% 이상 통과 (목표 100%)
- 미달 시 자동 수정 후 재검증 (최대 3회)
