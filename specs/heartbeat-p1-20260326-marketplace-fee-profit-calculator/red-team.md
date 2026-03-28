# 🔴 Red Team — Marketplace Fee Profit Calculator Logic/Test Hardening

- 공격 1: 이미 페이지가 동작하므로 JS 추출 과정에서 DOM id나 이벤트 바인딩이 틀어지면 오히려 실사용 페이지를 깨뜨릴 수 있다.
- 공격 2: 테스트가 수식 복사 수준에 그치면, 실제로는 브라우저 동작이 깨졌는데도 통과하는 허위 안정성에 빠질 수 있다.
- 공격 3: 이 작업은 신규 툴 생산이 아니라 기존 툴 보수처럼 보일 수 있어 heartbeat의 "productive-work enforcement" 의도에서 벗어났다고 해석될 수 있다.
- 방어/완화:
  - HTML id/anchor 존재 테스트와 HTTP 200 smoke를 함께 넣어 브라우저 wiring 훼손을 잡는다.
  - 순수 수학 테스트 + HTML anchor + exact-once catalog wiring까지 묶어 단순 수식 복사 테스트를 넘긴다.
  - `tool-opportunity-ranker-20260326`가 이 slug를 현재 최우선 후보로 명시했고, 결손이 logic/tests 라는 점을 근거로 "가장 빨리 출하 가능한 P1 slice" 로 정당화한다.
- 합의: 🟢극복
