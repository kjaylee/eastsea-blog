# Waxline Verdict QA 보고서 — 2026-07-19

## 통과

- 인라인 자바스크립트와 `qa-harness.mjs` 구문 검사 통과.
- 게임 목록 제이슨 파싱 및 `waxline-verdict` 식별자 1개 확인.
- 결정론적 전체 흐름 17개 검사 통과.
  - 타이틀과 시작
  - 유효 한 획과 자기교차 거부
  - 2·4사건 맹세와 실제 효과
  - 3사건 큰 원 실패, 잉크 손실, 같은 사건 재시도, 오목 해법 성공
  - 5사건 결과, 저장, 페이지 오류 0, 재시작
- 등록된 실제 `pointerdown → pointermove → pointerup` 이벤트 체인으로 25개 점의 유효 봉인을 제출해 피드백 상태 진입 확인.
- 로컬 정적 서버 HTTP 200 및 제공 파일과 원본의 SHA-256 일치 확인.
- 게임 경로의 금지 팔레트·접두사 0, `git diff --check` 통과.

## 브라우저 제한

MiniPC SSH를 사전 점검 2회와 최종 QA 2회 시도했으나 모두 8초 안에 포트 22 연결 시간 초과로 실패했다. 노드 브라우저 프록시도 현재 런타임에 등록되지 않았다. Mac Studio 브라우저는 정책상 사용하지 않았다.

따라서 실제 Chromium 390×844 스크린샷, 브라우저 렌더 기반 넘침 검사, 실기기 터치 감각은 검증하지 못했다. Game Wow Launch Circle에서 허용하는 로컬 정적 검사와 실행형 스모크 흔적을 대체 증거로 사용했다.

## 실행 증거

```text
WAXLINE_QA_PASS 17 checks
PASS round3-convex-rejected
PASS round3-retry-same-case
PASS five-round-result
PASS saved
PASS page-errors
PASS restart
PASS actual-pointer-chain points=25 verdict=증거가 분리되었습니다. 왕실 인장을 내립니다.
INLINE_JS_PARSE_PASS
LOCAL_HTTP 200
SHA256 15ddfb1ea25f4ace3365c87246e2b9a660c6bb8ae479302f5080a1c0884ee4d0
```

## 출시 판정

기능·상태·입력 이벤트·저장·정적 제공 경로에는 알려진 오류가 없어 출시 가능하다. 다만 실제 모바일 시각·터치 QA는 MiniPC 복구 후 후속 확인이 필요하다.
