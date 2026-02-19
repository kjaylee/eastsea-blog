# Plan — p1-monetization-tools-trio-20260219-1801

## Implementation Strategy
1. `tools/manifest.json`에서 slug 중복 여부를 확인하고 신규 3종 확정.
2. SDD/TDD 문서를 순서대로 작성 (`spec → plan → test-cases → tasks`).
3. 3개 계산기를 각각 single `index.html`로 구현:
   - 반응형 UI
   - KO/EN 토글
   - 입력 검증 → 계산 → 렌더
   - copy-summary + 포탈 링크 `href="/"`
4. 탐색/목록 동기화:
   - `tools/index.html` 카드 3개 추가
   - `_data/tools-list.json` 엔트리 3개 추가
   - `bash scripts/build-manifests.sh`로 `tools/manifest.json` 재생성
5. 검증:
   - JSON 파싱/slug 존재 확인
   - `python3 -m http.server` + `curl` 로컬 200 확인
6. 배포:
   - `git add/commit/push` (요청 메시지)
   - GitHub Pages 실 URL 200 폴링(최대 2분)
7. 체크포인트:
   - `.state/p1-monetization-tools-trio/20260219-1801/` 단계별 기록 + `_meta` 완료 처리

## Risk Controls
- **중복 slug 위험:** 구현 전 manifest 기반 사전 검증
- **수식 오류 위험:** 테스트 케이스에 정상/경계/불능 케이스 포함
- **탐색 누락 위험:** 카드 + tools-list + manifest를 한 번에 동기화
- **배포 지연 위험:** 2분 내 반복 폴링으로 라이브 상태 확인

## Definition of Done
- 문서 4종(spec/plan/test-cases/tasks) 작성 완료
- 신규 도구 3개 구현 완료
- discovery 파일 3종 업데이트 완료
- 로컬 HTTP 검증 + 라이브 200 확인 완료
- 지정 커밋 메시지로 원격 push 완료
- 체크포인트 파일 저장 및 `_meta.json` 상태 done
