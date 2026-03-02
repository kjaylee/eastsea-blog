# Plan — p1-games-batch-20260301-1230

1. **Spec 확정**: 3개 게임 코어 루프/입력/저장 요구 정의
2. **Test Cases 작성**: 공통 제약 + 게임별 기능 테스트 케이스 작성
3. **구현**:
   - `games/quantum-bounce/{index.html,manifest.webmanifest}`
   - `games/ink-flow/{index.html,manifest.webmanifest}`
   - `games/gear-train/{index.html,manifest.webmanifest}`
4. **카탈로그 반영**: `games/manifest.json` 신규 3개 엔트리 추가
5. **검증**:
   - 파일 크기/키워드/manifest 링크
   - 인라인 JS `node --check`
   - manifest JSON 파싱/count 검증
6. **Gap Analysis**: 점수화(>=90 PASS), 미달 시 수정 후 재검증
7. **Launch Report**: 출하 결과/검증 요약/리스크 기록
