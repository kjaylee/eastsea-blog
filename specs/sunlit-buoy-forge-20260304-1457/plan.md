# Plan — sunlit-buoy-forge

1. `games/sunlit-buoy-forge/` 생성 후 `index.html`, `logic.mjs`, `app.mjs` 구현.
2. pure logic에 런 상태, 차터, 병합, Wake Echo/Drag Tax 계산 분리.
3. `tests/unit/sunlit-buoy-forge.test.mjs` 작성 (8개 케이스).
4. 정적 검증 수행:
   - `node --check games/sunlit-buoy-forge/logic.mjs`
   - `node --check games/sunlit-buoy-forge/app.mjs`
5. 단위 테스트 수행:
   - `node --test tests/unit/sunlit-buoy-forge.test.mjs`
6. manifest 갱신:
   - `bash scripts/build-manifests.sh`
7. 라우트 스모크:
   - `python3 -m http.server` + `curl` title 확인.
8. 검증결과를 `verification.md`, 품질루프를 `gap-analysis.md`, 요약을 `launch-report.md`에 기록.
