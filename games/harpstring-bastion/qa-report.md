# Harpstring Bastion — QA Report

- 검증 날짜: 2026-07-28
- 검증 환경: 로컬 정적 서버 + Playwright Chromium 390x844
- 검증 결과: PASS

## 확인 항목
- title → play → draft → gameover → retry 흐름 동작
- 낮은 장력에서는 `iron` 적 무피해, 높은 장력에서는 피해 적용
- CHORD 공명파 생성 및 결과 화면 기록 확인
- 기본 한국어 모드에서 `오늘 #050`, `공명 0 · 최고 기록 0` 노출 확인
- EN 전환 시 `Daily #050`, `CHORD 0 · BEST 0` 노출 확인
- `undefined` 텍스트 0, `pageerror` 0, `console error` 0
- 언어 버튼 높이 46px 확인
- localStorage `harpstringBastionSave_v1`에 `2026-07-28` 일일 기록 저장 확인

## 비고
- 일일 시드는 UTC 날짜 기준으로 고정해 미래 날짜 저장을 방지했다.
