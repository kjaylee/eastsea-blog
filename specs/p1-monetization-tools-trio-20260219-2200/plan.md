# Plan — p1-monetization-tools-trio-20260219-2200

## Implementation Strategy
1. `_data/tools-list.json`에서 기존 slug를 추출해 신규 3종 후보의 중복 여부를 확인한다.
2. SDD/TDD 문서를 순서대로 작성한다 (`spec → plan → test-cases → tasks`).
3. 신규 3개 계산기를 단일 HTML로 구현한다.
   - 반응형 2열/1열
   - KO/EN 토글
   - 입력 검증 + 계산 + 렌더
   - summary + copy-summary + 포털 링크 `href="/"`
4. 탐색/인덱싱 동기화
   - `tools/index.html` 카드 3개 추가
   - `_data/tools-list.json` 엔트리 3개 추가
   - `bash scripts/build-manifests.sh` 실행
5. 검증
   - JSON 및 파일 존재/slug 반영 확인
   - 로컬 HTTP 서버에서 신규 URL 200 확인
6. 배포
   - `git add -A`
   - `git commit -m "feat(tools): add 3 monetization calculators (2200 wave)"`
   - `git push origin master`
7. 라이브 검증
   - GitHub Pages 신규 URL 200 확인 (최대 2분, 1회 재시도)
8. 체크포인트
   - `.state/p1-monetization-tools-trio/20260219-2200/` 단계별 JSON 기록

## Risk Controls
- **Slug 충돌 위험:** 구현 전/후 이중 검사
- **수식 오류 위험:** 정상/경계/불가 시나리오 테스트케이스 기반 수동 검증
- **동기화 누락 위험:** index + data + manifest 동시 검증
- **배포 지연 위험:** 시간 제한 폴링 + 1회 재시도

## Definition of Done
- SDD/TDD 문서 4종 작성 완료
- 신규 도구 3개 구현 완료
- 인덱스/목록/manifest 동기화 완료
- 로컬 200, 라이브 200 확인 완료
- 지정 커밋 메시지로 push 완료
- 체크포인트 기록 완료
