# Novels Hotfix Spec (2026-02-11)

## 1) Incident Summary
- 증상: `view.html`에서 `❌ 소설을 찾을 수 없습니다.` 표시
- 재현 URL:
  - ✅ `https://eastsea.monster/novels/index.html`
  - ✅ `https://eastsea.monster/novels/manifest.json`
  - ❌ `https://eastsea.monster/novels/view.html?series=king-of-myriad-worlds&episode=001`
  - ❌ `https://eastsea.monster/novels/_data/king-of-myriad-worlds-001.md` (404)

## 2) Scope / Non-goal
- Scope: novels 에피소드 원문 로드 장애의 원인 확정 및 핫픽스
- Non-goal: novels 아키텍처 전면 개편, 데이터 디렉토리 리네이밍, UI 개선

## 3) Root Cause Hypothesis
- GitHub Pages(Jekyll) 기본 동작에서 `_`로 시작하는 디렉토리는 정적 산출물에서 제외됨.
- `novels/view.html`은 `_data/{series}-{episode}.md`를 fetch하도록 구현되어 있으나,
  배포 산출물에는 `novels/_data/*`가 포함되지 않아 404 발생.
- 저장소 루트에 `.nojekyll`이 없어 Jekyll bypass가 활성화되지 않은 상태.

## 4) Hotfix Strategy (YAGNI)
- 루트에 `.nojekyll` 파일 추가하여 Jekyll 처리 우회.
- 기존 `novels/_data/*` 경로/코드 유지(최소 변경).

## 5) Ralph Loop Task Breakdown

### Task 1. 재현 및 원인 확정
- [x] curl로 `_data` 404 확인
- [x] 브라우저에서 뷰어 에러 메시지 확인
- [x] `.nojekyll` 부재 확인

#### 2-Stage Review
- Spec 준수: 재현 URL과 동일 케이스 검증 완료
- 품질 리뷰: 단순 캐시 문제 아님(직접 `_data` URL 404) 확인

### Task 2. 핫픽스 구현
- [x] `.nojekyll` 생성

#### 2-Stage Review
- Spec 준수: 루트 `.nojekyll` 1파일만 추가(기능 변경 최소화)
- 품질 리뷰: `novels/view.html`의 기존 `_data/...` fetch 경로를 그대로 유지하므로 호환성 영향 없음

### Task 3. Git 커밋/푸시 (eastsea-blog only)
- [x] 관련 파일만 커밋
- [x] origin/master push

#### 2-Stage Review
- Spec 준수: `/Users/kjaylee/.openclaw/workspace/eastsea-blog` 내부에서만 Git 수행
- 품질 리뷰: 커밋 포함 파일 `.nojekyll`, `IMPLEMENTATION_PLAN.md`, `specs/novels-hotfix-2026-02-11.md` 3개로 제한

### Task 4. 실서버 검증 (증거 필수)
- [ ] `novels/_data/*.md` HTTP 200 확인
- [ ] `view.html?...` 브라우저 본문 로드 확인
- [ ] 검증 로그 첨부

#### 2-Stage Review
- Spec 준수: curl + browser 증거 확보 여부
- 품질 리뷰: 캐시/전파 지연 고려한 재시도 기록

## 6) Rollback
- `.nojekyll` 삭제 커밋 후 재배포

## 7) Risk Notes
- `.nojekyll`은 사이트 전역에 적용됨. 기존 Jekyll 빌드 의존 페이지가 있다면 영향 가능.
- 단, 현재 장애 복구 우선으로 최소 변경 핫픽스 적용 후 모니터링.
