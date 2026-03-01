# P1 Games Batch Plan — 20260301-230256

## Phase 1 — Precheck
1. 기존 slug 충돌 검사 (`ls games/` 기반)
2. 카테고리/컨셉 중복 최소화

## Phase 2 — Build (Spec-driven)
1. `games/driftglass-parry/`
   - 캔버스 액션 루프, lane 이동 + parry mechanic
   - 키보드(←/→/Space), 터치(좌/중/우 탭)
2. `games/nebula-noise-cartographer/`
   - 패턴 생성/재생/입력 검증
   - 키보드(1/2/3/4), 터치 패드
3. `games/quasar-quota-keeper/`
   - 실시간 지표 감소 + 액션 복구 시스템
   - 키보드(Q/W/E + 1/2/3), 터치 버튼

## Phase 3 — PWA
- 각 slug별 `manifest.webmanifest` 생성
- `start_url`, theme/background `#0a0a1a`

## Phase 4 — Verification
1. 파일 크기 측정 (<500KB)
2. 정적 점검 (touch/keyboard/audio/localStorage/PWA/테마)
3. Gap Analysis 점수화
4. 90% 미만 시 자동 수정 (최대 3회)

## Phase 5 — Registry + Git
1. `games/manifest.json` prepend + count/updatedAt 갱신
2. `git status`로 변경 파일 확인
3. 지정 커밋 메시지로 commit
4. `git push origin master`
