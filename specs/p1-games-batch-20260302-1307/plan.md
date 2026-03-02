# Plan — p1-games-batch-20260302-1307

1. **Spec 확정**: 장르/메카닉/팔레트 확정 + 금지 규칙 준수 체크
2. **TC 선작성**: 공통 TC + 게임별 고유 메카닉 TC 정의
3. **구현**: 3개 게임 index.html 작성 (각 20~50KB 목표)
4. **정적 검증**:
   - 파일 크기 범위 체크
   - JSON 파싱 체크
   - 금지 키워드(`rhythm`, `#0a0a1a`, `neon-`) 체크
5. **Playwright QA (MiniPC)**:
   - pageerror/console error 0
   - Canvas 렌더링 정상
   - 기본 입력 반응
   - 스크린샷 증거 생성
6. **Gap 분석 & 보정**:
   - TC PASS율 산정
   - 미달 시 수정 후 재검증
7. **카탈로그 업데이트**:
   - manifest/games-list prepend
   - count/size 갱신
