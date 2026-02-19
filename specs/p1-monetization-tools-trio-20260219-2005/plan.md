# Plan — p1-monetization-tools-trio-20260219-2005

## Implementation Strategy
1. `_data/tools-list.json`에서 slug 목록을 파싱하고 후보 3종 중복 여부를 확정한다.
2. SDD/TDD 문서를 순서대로 작성한다 (`spec → plan → test-cases → tasks`).
3. 3개 도구를 각각 단일 HTML로 구현한다.
   - 반응형 레이아웃
   - KO/EN 토글
   - 입력 검증/계산/렌더
   - copy-summary + 포탈 링크 `href="/"`
4. 탐색 데이터 동기화
   - `tools/index.html` 카드 3개 추가
   - `_data/tools-list.json` 엔트리 3개 추가
   - `bash scripts/build-manifests.sh`로 `tools/manifest.json` 재생성
5. 검증
   - JSON 파싱 및 slug 포함 여부 확인
   - 로컬 HTTP 서버 실행 후 `curl` 3개 URL 200 확인
6. 배포
   - `git add -A`
   - `git commit -m "feat(tools): add 3 monetization calculators (2005 wave)"`
   - `git push origin master`
7. 라이브 확인
   - GitHub Pages 200 폴링(최대 2분, 1회 재시도)
8. 체크포인트 기록
   - `.state/p1-monetization-tools-trio/20260219-2005/` 단계별 JSON 작성 및 `_meta.json` done 처리

## Risk Controls
- **Slug 중복 위험:** 구현 전 목록 파싱 + 중복 검사 결과를 체크포인트에 기록
- **수식 오류 위험:** 정상/경계/불가능 케이스 테스트 정의 및 수동 검증
- **동기화 누락 위험:** 카드, tools-list, manifest를 한 세트로 반영 후 grep 검증
- **배포 반영 지연:** 라이브 URL을 시간 제한 내 폴링 + 1회 재시도

## Definition of Done
- SDD/TDD 문서 4종 작성 완료
- 신규 도구 3개 구현 완료
- 인덱스/목록/manifest 동기화 완료
- 로컬 200 및 라이브 200 검증 완료
- 지정 커밋 메시지로 원격 push 완료
- 체크포인트 기록 완료
