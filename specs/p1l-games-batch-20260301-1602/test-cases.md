# Test Cases — p1l-games-batch-20260301-1602

## 공통 테스트
- **TC-COM-001**: 각 게임이 로드 직후 플레이 가능한 상태로 렌더링된다.
- **TC-COM-002**: 터치 입력과 키보드 입력이 모두 동작한다.
- **TC-COM-003**: Web Audio API(`AudioContext`) 효과음이 트리거된다.
- **TC-COM-004**: localStorage 최고 기록이 저장/복원된다.
- **TC-COM-005**: 390x844 기준 모바일 반응형 레이아웃이 유지된다.
- **TC-COM-006**: `#0a0a1a` 기반 네온 다크 테마가 적용된다.
- **TC-COM-007**: `manifest.webmanifest` 존재 및 HTML 연결이 확인된다.
- **TC-COM-008**: JS 문법 에러 없이 파싱된다.
- **TC-COM-009**: 각 `index.html` 파일 용량이 500KB 미만이다.

## Aurora Threadline Pilot
- **TC-ATP-001**: 좌우 이동(키보드 + 터치) 동작
- **TC-ATP-002**: 부스트(스페이스 + 터치) 동작
- **TC-ATP-003**: 오브 수집 시 점수 증가 / 폭풍 충돌 시 생명 감소
- **TC-ATP-004**: 최고 점수 저장/복원

## Kintsugi Circuit
- **TC-KC-001**: 타일 선택 이동(키보드) 및 회전(Enter/Space) 동작
- **TC-KC-002**: 타일 탭 회전(터치) 동작
- **TC-KC-003**: Source→Sink 연결 성립 시 클리어 판정
- **TC-KC-004**: 최고 클리어 레벨 저장/복원

## Mycelium Signal Lab
- **TC-MSL-001**: 구역 선택(1/2/3, 터치) 동작
- **TC-MSL-002**: 조절 액션(Q/W/E, 터치 버튼) 동작
- **TC-MSL-003**: 안정도 계산 및 실패 조건(붕괴) 동작
- **TC-MSL-004**: 최고 생존 사이클 저장/복원

## 합격 기준
- 전체 항목 90% 이상 통과(목표 100%)
- 90% 미만 시 자동 보정 후 재검증(최대 3회)
