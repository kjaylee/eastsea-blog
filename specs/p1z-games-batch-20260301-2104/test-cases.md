# Test Cases — P1z Games Batch (3)

## 공통 기능 테스트
- TC-COM-001: 각 게임 첫 화면이 오류 없이 렌더링된다.
- TC-COM-002: 모바일 뷰포트(390x844)에서 UI가 가로 스크롤 없이 표시된다.
- TC-COM-003: 키보드 입력으로 핵심 조작이 가능하다.
- TC-COM-004: 터치(버튼/패드/탭) 입력으로 동일 조작이 가능하다.
- TC-COM-005: 게임 플레이 중 Web Audio API 사운드가 재생된다.
- TC-COM-006: 최고 기록이 localStorage에 저장되고 재접속 시 복원된다.
- TC-COM-007: 배경/테마에 `#0a0a1a`가 적용된다.
- TC-COM-008: 각 `index.html` 파일 크기가 500KB 미만이다.
- TC-COM-009: 각 폴더에 `manifest.webmanifest`가 존재하며 start_url이 올바르다.

## 게임별 로직 테스트
### vector-vine-swing
- TC-VVS-001: 좌/우 이동(Arrow/A,D + 터치 버튼) 동작
- TC-VVS-002: 장애물 충돌 시 게임오버 처리
- TC-VVS-003: 링 수집 시 점수 증가 및 최고점 갱신

### prism-port-authority
- TC-PPA-001: 현재 규칙(rule)과 화물 속성(property)을 보고 정확 도크 선택 시 점수 증가
- TC-PPA-002: 오분류 시 stability 감소, 0 도달 시 종료
- TC-PPA-003: 라운드 증가에 따라 타이머/속도 압박 증가

### rune-resonance-smithy
- TC-RRS-001: 행/열 회전 입력(키보드 + 터치 버튼) 동작
- TC-RRS-002: 목표 패턴 일치 시 stage 상승
- TC-RRS-003: 제한 이동수 소진 시 라운드 실패 및 재시작 가능
