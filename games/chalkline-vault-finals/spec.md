# Chalkline Vault Finals

모바일 도마 체조 3라운드 결승. 도마판을 아래로 드래그해 반동을 만들고, 비행 중 포인터 세로 위치로 tuck/extend를 연속 제어한다. 물리는 래그돌이 아닌 단일 강체 위치·속도·각도·각속도로 제한한다.

## Wow Factors

1. **Springboard Pullthrough** — 드래그 거리·편차가 발사 속도와 회전량에 반영되며 중앙 115~140px는 초크 폭발을 만든다.
2. **Living Tuck** — 비행 중 포인터 Y가 몸 반경과 각속도에 매 프레임 반영된다.
3. **Routine Call** — Pike/Twist/Blind Moon의 목표 회전, 배율, 착지창이 다르다.
4. **Judge's Freeze** — 착지 순간 초크 잔상과 판정·점수 카드가 뜬다.
5. **Daily Three-Vault Meet** — 날짜 시드 바람과 localStorage 일일 최고 기록을 제공한다.

## 루프와 범위

타이틀 → 루틴 선언 → 압축/릴리스 → 공중 tuck/extend → 착지 → 3회 합산/메달 → 재시작. 따뜻한 아이보리·테라코타·코발트 팔레트이며 리듬, 네온 다크, 클릭+웨이브, 카드 조합을 사용하지 않는다. 출시 경로는 `/games/chalkline-vault-finals/`다.

## Red Team

- 공중 제어가 탭으로 퇴화할 위험은 pointermove Y를 각속도에 계속 연결해 방어한다.
- 래그돌 범위 폭증은 단일 강체 모델로 차단한다.
- 기존 스포츠 게임과 입력·상태·승리 조건이 달라 90% 중복이 아니다.
