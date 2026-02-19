# Plan — P1 Monetization Tools Trio (2026-02-19 07:37 KST)

1. 툴 3종의 입력/수식/KPI/검증 규칙을 확정한다.
2. 각 slug 디렉터리에 단일 `index.html`을 구현한다.
3. 공통 UX 패턴 적용: 반응형 카드, 오류 안내, KPI 카드, 요약 복사 CTA.
4. `tools/index.html`에 카드 3개 추가해 포털 노출을 보장한다.
5. `scripts/build-manifests.sh` 실행으로 `tools/manifest.json` 갱신.
6. `_data/tools-list.json`에 신규 3개 항목 반영.
7. 로컬 스모크 테스트(기본값 계산 + 오류 입력 차단).
8. 변경 파일만 git add/commit/push.
9. `curl -I`로 live URL 3개 HTTP 200 검증 후 로그 기록.
