# Test Cases — P1 Games Batch (20260302-000951)

## A. orbital-packet-weaver
- **TC-A-001**: 초기 렌더 시 HUD/캔버스/버튼 노출
- **TC-A-002**: `←/→` 이동 동작
- **TC-A-003**: 터치 Left/Right 버튼 이동 동작
- **TC-A-004**: `A/S/D` 또는 `1/2/3` 채널 전환 동작
- **TC-A-005**: 터치 채널 버튼 전환 동작
- **TC-A-006**: 채널 일치 수신 시 점수 증가 + Web Audio 재생
- **TC-A-007**: 실패 시 Shield 감소, 0이면 게임오버
- **TC-A-008**: 최고점 localStorage 저장/재로드

## B. treaty-terminal-director
- **TC-B-001**: 이벤트 카드 생성 및 남은시간 카운트다운
- **TC-B-002**: 키보드 `1/2/3` 액션 입력 처리
- **TC-B-003**: 터치 액션 버튼 입력 처리
- **TC-B-004**: 정답/오답 판정 후 자원(Trust/Budget/Stability) 갱신
- **TC-B-005**: 판정 시 Web Audio 재생
- **TC-B-006**: 자원 0 도달 시 종료
- **TC-B-007**: 최고점 localStorage 저장/재로드

## C. balance-beacon-foundry
- **TC-C-001**: 균형 바/플랫폼 렌더
- **TC-C-002**: 키보드 `←/→` 위치 이동 및 `Space` 드롭 동작
- **TC-C-003**: 터치 Left/Right/Drop 버튼 동작
- **TC-C-004**: 블록 드롭 시 tilt 변화 반영
- **TC-C-005**: 균형 유지 시 점수 증가, 한계 초과 지속 시 종료
- **TC-C-006**: 효과음(Web Audio) 재생
- **TC-C-007**: 최고점 localStorage 저장/재로드

## D. Global Checklist
- **TC-G-001**: 각 `index.html` 파일 크기 < 500KB
- **TC-G-002**: 모든 게임 배경/테마에 `#0a0a1a` 기반 네온 다크 사용
- **TC-G-003**: 각 게임 `manifest.webmanifest` 존재 + start_url/테마 설정
- **TC-G-004**: 모바일 뷰(폭 390px 기준)에서 레이아웃 파손 없음
- **TC-G-005**: 외부 의존성 없음 (외부 script/link 미사용)
- **TC-G-006**: `games/manifest.json` 신규 3개가 배열 맨 앞 prepend
- **TC-G-007**: `count` 값 +3, `updatedAt` 갱신
