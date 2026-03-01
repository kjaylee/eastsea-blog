# Test Cases — p1u-games-batch-20260301-190210

## 공통 테스트 (모든 신규 게임)

### Functional
- TC-F001: 타이틀/HUD가 초기 렌더링된다.
- TC-F002: 시작 후 실제 플레이 상태로 전환된다.
- TC-F003: 핵심 조작(키보드)이 의도대로 동작한다.
- TC-F004: 핵심 조작(터치/클릭)이 의도대로 동작한다.
- TC-F005: 게임오버/실패 후 재시작이 가능하다.

### Audio / Persistence
- TC-A001: 사용자 입력 이후 Web Audio API 효과음이 재생된다.
- TC-D001: 최고기록이 localStorage에 저장된다.
- TC-D002: 새로고침 후 최고기록이 복원된다.

### UI / Performance
- TC-U001: 390x844 뷰포트에서 레이아웃 깨짐 없이 플레이 가능하다.
- TC-U002: 테마가 #0a0a1a 기반 네온 다크를 유지한다.
- TC-P001: 콘솔 치명 오류 없이 루프가 유지된다.
- TC-P002: `index.html` 파일 크기가 500KB 미만이다.

### PWA
- TC-W001: `manifest.webmanifest`가 존재하고 start_url이 slug 경로와 일치한다.

---

## 게임별 핵심 시나리오

### Crystal Echo Luthier
- TC-G1-001: A/S/D/F 또는 터치 패드로 4레인 입력 가능
- TC-G1-002: 정확 판정 시 콤보/점수 증가
- TC-G1-003: 오입력/타임아웃 시 라이프 감소 및 종료 가능

### Midnight Harbor Pilotage
- TC-G2-001: 좌우 이동 + Space 부스트 + 터치 버튼 동작
- TC-G2-002: 장애물 충돌 시 내구도 감소
- TC-G2-003: 부이 연속 수집 시 스트릭 보너스 적용

### Archive Automata Curator
- TC-G3-001: 1/2/3 섹션 선택 + Q/W/E/R 액션 동작
- TC-G3-002: 섹션 지표가 시간 경과로 변화하고 액션으로 보정됨
- TC-G3-003: 무결성 임계치 하락 시 게임 종료 및 기록 저장

---

## 합격 기준
- 공통 테스트 12개 + 게임별 9개 = 총 21개 항목 중 19개 이상 통과(>=90%)
- 필수 항목(입력, 오디오, localStorage, 모바일, PWA, 용량)은 전부 통과해야 함
