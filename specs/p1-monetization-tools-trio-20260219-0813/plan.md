# Plan — P1 Monetization Tools Trio (2026-02-19 08:13 KST)

1. 세 도구의 입력 필드/수식/검증 경계를 확정한다.
2. 각 슬러그별 단일 `index.html` 구현(인라인 CSS/JS, KPI/요약 복사 포함).
3. 공통 안전장치 적용:
   - 강한 입력 검증
   - 오류 박스와 안전한 출력 리셋
   - `href="/"` 고정
4. 로컬 스모크 테스트 수행:
   - 정상 입력 계산
   - 경계/오류 입력 차단
   - 출력에 `NaN`, `Infinity` 미노출 확인
5. `tools/index.html`에 신규 3개 카드 추가.
6. `scripts/build-manifests.sh`로 `tools/manifest.json` 재생성.
7. `_data/tools-list.json`에 신규 3개 항목 반영.
8. 변경 파일만 git add/commit/push 수행.
9. 배포 반영 후 3개 라이브 URL HTTP 200 확인.
