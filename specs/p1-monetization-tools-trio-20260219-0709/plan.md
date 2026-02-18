# Plan — P1 Monetization Tools Trio (2026-02-19 07:09 KST)

1. 세 도구의 입력/공식/검증 규칙을 먼저 확정한다.
2. 각 도구를 단일 `index.html`로 구현한다(반응형 + inline 스크립트).
3. 입력 검증 실패 시 KPI 렌더링을 차단하고 오류 메시지를 노출한다.
4. 각 도구 상단 내비게이션에 `href="/"` 링크를 고정한다.
5. 로컬 정적 검증:
   - 기본값으로 유한 KPI 출력
   - 경계값/비정상값에서 오류 처리
6. `tools/manifest.json`에 신규 3개 slug/title/url/size 반영, count/updatedAt 갱신.
7. `_data/tools-list.json`에 신규 3개 메타 항목 추가.
8. 변경 파일만 선택적으로 커밋하고 push.
9. 라이브 URL 3개를 `curl -I`로 확인하여 HTTP 200 검증.