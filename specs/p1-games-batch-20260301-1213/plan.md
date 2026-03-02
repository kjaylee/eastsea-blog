# Plan — p1-games-batch-20260301-1213

1. **Spec/TDD 선행 작성**
   - `spec.md` 작성
   - `test-cases.md` 작성

2. **게임 구현 (3종)**
   - `games/echo-chamber/` 생성 + `index.html`, `manifest.webmanifest`
   - `games/fractal-forest/` 생성 + `index.html`, `manifest.webmanifest`
   - `games/tempo-tiles/` 생성 + `index.html`, `manifest.webmanifest`

3. **체크리스트 기반 QA**
   - 파일 크기 측정
   - `node --check` (인라인 script 추출 후)
   - 입력/사운드/localStorage/반응형/모드 요건 점검

4. **카탈로그 동기화**
   - `games/manifest.json`에 신규 3개 엔트리 추가
   - 기존 엔트리 삭제 금지

5. **품질 루프**
   - 1차 점수화(체크리스트)
   - 미달(<90) 항목 보완
   - 재점수화 후 보고

6. **산출물 정리**
   - `gap-analysis.md`
   - `launch-report.md`
