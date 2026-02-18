# Plan — P1 Monetization Tools Trio (2026-02-19 07:18 KST)

1. 신규 3개 툴의 입력값, 수식, 검증 범위를 확정한다.
2. 각 슬러그 디렉터리에 단일 `index.html`을 구현한다.
3. 공통 UX 적용: 반응형 레이아웃, 오류 박스, 요약 복사 버튼.
4. 상단 포털 링크를 모두 정확히 `href="/"`로 고정한다.
5. 로컬 스모크 테스트:
   - 기본값 계산 정상
   - 잘못된 입력 시 오류 표시 및 KPI 미출력
6. `tools/manifest.json` 재생성(신규 3개 포함).
7. `_data/tools-list.json`에 신규 3개 메타 항목 추가.
8. 변경 파일만 git add/commit/push 수행.
9. 배포 후 라이브 URL 3개를 `curl -I`로 확인해 HTTP 200 검증.
