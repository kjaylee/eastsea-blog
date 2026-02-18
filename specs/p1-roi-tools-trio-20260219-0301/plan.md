# Plan — P1 ROI Business Tools Trio (2026-02-19 03:01 KST)

1. SDD/TDD 문서 순서 고정: `spec.md` → `plan.md` → `test-cases.md` → `tasks.md`.
2. 3개 도구를 각각 단일 `index.html`로 구현 (인라인 CSS/JS, 모바일 반응형, Back to Portal).
3. 도구별 계산식 구현 및 validation 처리.
4. 로컬 검증: 정상 시나리오 + 오류 시나리오에서 KPI/에러 문구 확인.
5. `tools/manifest.json` 재생성.
6. `_data/tools-list.json` 재생성(제목/설명/URL 동기화).
7. Git add/commit/push (`eastsea-blog` 내부에서만).
8. 배포 URL 3개 `HTTP 200` 확인 후 결과 보고.
