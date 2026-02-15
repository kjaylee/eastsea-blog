# IMPLEMENTATION_PLAN

## 2026-02-11 — Novels 서비스 장애 핫픽스 (Ralph Loop v2)

### Objective
- `novels/view.html` 에피소드 본문 미로딩 장애를 긴급 복구한다.

### Tasks
1. [x] 장애 재현 및 원인 확정
2. [x] `.nojekyll` 기반 핫픽스 구현
3. [x] eastsea-blog에서만 커밋/푸시
4. [ ] 실서버 재검증(curl + browser)
5. [ ] 증거 포함 완료 보고

### Constraints
- 작업 디렉토리: `$WORKSPACE/.openclaw/workspace/eastsea-blog`
- Git 작업: eastsea-blog 내부만
- 과도한 변경 금지(YAGNI)

### Failure Policy
- 같은 방식으로 3회 검증 실패 시 대안 아키텍처 제시:
  - `novels/_data` → `novels/data`로 리네이밍 + 뷰어 fetch 경로 전환
