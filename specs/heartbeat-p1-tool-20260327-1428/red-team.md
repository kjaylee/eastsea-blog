# Red Team — Fractional CMO Pricing Calculator

🔴 Red Team:
- [공격 1]: 기존 `white-label-agency-margin-calculator` 와 너무 비슷하면 검색/제품 포지셔닝이 겹쳐 내부 중복만 늘릴 수 있다.
- [공격 2]: `fractional CMO pricing`은 시세가 넓어 계산 결과가 '정답'처럼 보이면 신뢰를 잃을 수 있다.
- [공격 3]: 카탈로그 파일이 이미 많이 더럽혀져 있어 exact-once 삽입을 잘못하면 목록 중복/깨짐이 날 수 있다.
- [공격 4]: 계산 로직을 한 파일에 섞어 넣으면 테스트가 약해지고, 브라우저에서는 보이는데 회귀가 숨어버릴 수 있다.
- [방어/완화]:
  - 화이트라벨/에이전시가 아닌 `fractional CMO` 역할에 맞는 입력(전략·리더십·채널 리뷰·온보딩·계약개월)을 중심으로 설계한다.
  - 설명문과 FAQ에서 “heuristic pricing tool” 성격을 명확히 하고, 사용자 입력 기반 견적 보조 도구로 포지셔닝한다.
  - 카탈로그는 Python으로 exact-once 검사 가능한 방식으로 삽입하고, 테스트에서 4개 파일 모두 검증한다.
  - 계산 로직을 `calculator.js` 로 분리하고 Node 단위 테스트로 고정값 검증을 건다.
- [합의]: 🟢극복
