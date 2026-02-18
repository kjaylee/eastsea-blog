# Plan — P1 Productive ROI Tools Trio (2026-02-19 03:11 KST)

1. **Scope lock**
   - 신규 슬러그 3개가 기존 `tools/`와 중복되지 않는지 확인.
2. **Spec freeze**
   - 기능/검증/산식 확정(`spec.md`).
3. **Test design**
   - 정상/경계/오류 입력 시나리오를 도구별로 정의(`test-cases.md`).
4. **Task breakdown**
   - 구현/목록 반영/HTTP 검증/커밋 단위 태스크화(`tasks.md`).
5. **Implementation**
   - 각 도구를 단일 HTML로 구현(인라인 CSS/JS + 반응형 + validation + 요약 복사).
6. **Catalog update**
   - `tools/manifest.json`, `_data/tools-list.json`에 신규 3개 반영.
7. **Verification**
   - 정적 서버에서 각 URL HTTP 200 확인.
   - `Back to Portal` 링크 및 계산 동작 확인.
8. **Delivery**
   - `eastsea-blog`에서만 commit/push 후 커밋 해시 기록.
