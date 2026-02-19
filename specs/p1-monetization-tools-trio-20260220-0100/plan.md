# Plan — p1-monetization-tools-trio-20260220-0100

## Implementation Strategy
1. `_data/tools-list.json` + `tools/` 디렉토리 기준 slug 중복을 먼저 확인한다.
2. SDD/TDD 문서를 순서대로 작성한다 (`spec → plan → test-cases → tasks`).
3. 신규 계산기 3종을 단일 HTML로 구현한다.
   - 반응형 2열/1열
   - KO/EN 토글
   - 입력 검증 + 계산 + 결과 렌더
   - summary + copy-summary
   - 포털 링크 `href="/"`
4. discovery/indexing 반영
   - `tools/index.html` 카드 3개 추가
   - `_data/tools-list.json` 엔트리 3개 추가
   - `bash scripts/build-manifests.sh`로 `tools/manifest.json` 재생성
5. 검증
   - 로컬 HTTP 서버로 신규 URL 3개 200 확인
6. 배포
   - `git add -A`
   - `git commit -m "feat(tools): add 3 monetization calculators (0100 wave)"`
   - `git push origin master`
7. 라이브 검증
   - GitHub Pages URL 3개 200 확인 (최대 2분 대기 + 1회 재시도)
8. 체크포인트 기록
   - `.state/p1-monetization-tools-trio/20260220-0100/` 단계별 JSON 저장

## Risk Controls
- **slug 충돌:** 구현 전후 두 번 점검
- **수식 실수:** 정상/오류/손익분기 불가 케이스 기준 점검
- **동기화 누락:** index + data + manifest 동시 확인
- **배포 지연:** 제한시간 폴링 + 1회 재시도

## Definition of Done
- SDD/TDD 문서 4종 작성 완료
- 신규 계산기 3개 구현 완료
- 인덱스/목록/manifest 반영 완료
- 로컬 200 및 라이브 200 확인 완료
- 지정 커밋 메시지로 push 완료
- 체크포인트 기록 완료
