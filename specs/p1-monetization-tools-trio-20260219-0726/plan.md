# Plan — P1 Monetization Tools Trio (2026-02-19 07:26 KST)

1. 3개 도구의 입력 필드/수식/검증 범위를 확정한다.
2. 각 슬러그별 단일 `index.html`(인라인 CSS/JS) 구현.
3. 공통 UX 적용: 반응형 레이아웃, 오류 박스, KPI 카드, 요약 복사 버튼.
4. 상단 포털 링크를 모두 정확히 `href="/"`로 고정한다.
5. 로컬 스모크 테스트 수행:
   - 정상 입력 계산
   - 범위 오류/NaN 입력 차단
   - 오류 시 KPI 안전 출력
6. `scripts/build-manifests.sh`로 `tools/manifest.json` 갱신.
7. `_data/tools-list.json`에 신규 3개 도구 메타 추가.
8. 변경 파일만 git add/commit/push 수행.
9. 배포 반영 후 라이브 URL 3개 HTTP 200 확인.
