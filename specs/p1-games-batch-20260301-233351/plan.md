# Plan — P1 Games Batch (3)

1. **Precheck**
   - `ls games/` 로 slug 중복 검증
   - `games/manifest.json` 구조/필드 확인

2. **Implement 3 games**
   - 각 slug 디렉토리 생성
   - `index.html` 구현 (single-file: CSS/JS inline)
   - `manifest.webmanifest` 작성

3. **Checklist QA (per game)**
   - 터치+키보드 입력 동작 코드 존재
   - Web Audio API 호출 존재
   - localStorage read/write 존재
   - 모바일 반응형 스타일 존재
   - 네온 다크 `#0a0a1a` 사용
   - index 파일 크기 < 500KB

4. **Gap Analysis Loop**
   - 점수화 (0~100)
   - 90 미만 항목 자동 수정
   - 최대 3회 반복

5. **Manifest Integration**
   - 신규 3개 prepend
   - count/updatedAt 갱신
   - JSON 유효성 검증

6. **Git Delivery**
   - 변경 파일 확인
   - 커밋: `feat: +3 games (neon-kite-telegraph, quantum-kimchi-courier, tidal-signal-cartographer) — total 188`
   - push
