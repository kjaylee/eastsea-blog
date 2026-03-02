# Test Cases — p1h-games-batch-20260301-1501

## 공통 테스트
- **TC-COM-001**: 각 게임 페이지가 초기 렌더링되고 콘솔 치명 오류 없이 시작된다.
- **TC-COM-002**: 모바일 뷰포트(390x844)에서 UI 오버플로우 없이 플레이 가능하다.
- **TC-COM-003**: 배경/테마에 `#0a0a1a` 계열 네온 다크 스타일이 반영된다.
- **TC-COM-004**: `manifest.webmanifest` 파일이 존재하고 HTML에서 `link rel="manifest"`로 참조된다.
- **TC-COM-005**: Web Audio API(`AudioContext`) 기반 효과음 호출이 동작한다.

## Timeline Switchyard (Puzzle)
- **TC-TS-001**: 방향키 입력으로 플레이어 이동.
- **TC-TS-002**: 터치 버튼/스와이프로 이동 가능.
- **TC-TS-003**: `T` 키/터치 버튼으로 타임라인 전환.
- **TC-TS-004**: 오브를 모두 수집 후 출구 도달 시 레벨 클리어.
- **TC-TS-005**: 6개 레벨 순차 진행.
- **TC-TS-006**: 최고 해금 레벨이 localStorage에 저장/복원.

## Neon Courier Drift (Action)
- **TC-NC-001**: WASD/방향키로 이동.
- **TC-NC-002**: 터치 드래그로 이동 벡터 제어.
- **TC-NC-003**: 패킷 수집 시 점수 증가 + SFX 재생.
- **TC-NC-004**: 드론 충돌 시 HP 감소, 0이면 게임오버.
- **TC-NC-005**: 점수 증가에 따라 드론 수/속도 증가(무한 모드).
- **TC-NC-006**: 최고 점수 localStorage 저장/복원.

## Gridshift Overseer (Simulation)
- **TC-GO-001**: 키보드 `1~5`로 발전기 on/off 토글.
- **TC-GO-002**: 터치 버튼으로 발전기 제어.
- **TC-GO-003**: 수요-공급 차가 커지면 정전 리스크가 증가.
- **TC-GO-004**: 과열 누적 시 발전기 트립/냉각 메커니즘 작동.
- **TC-GO-005**: 시간 경과에 따라 티어 상승(무한 운영).
- **TC-GO-006**: 최고 day/credit 기록 localStorage 저장/복원.

## 정적 검증
- **TC-VAL-001**: 모든 `index.html` 파일 크기 < 500KB.
- **TC-VAL-002**: 각 게임 JS 코드가 `node --check` 통과.

## 합격 기준
- 필수 TC 90% 이상 통과(목표 100%)
- 미달 시 수정 후 최대 3회 재검증
