# Test Cases — decision-fatigue-check

## 범위
- 대상 URL: `/tools/decision-fatigue-check/`
- 필수 검증: `TC-F001~F010 + TC-I001 + TC-U001 + TC-P001 + TC-P002`

## 기능 테스트 (Functional)

| ID | 검증 항목 | 기대 결과 |
|---|---|---|
| TC-F001 | 인트로 화면 표시 | 테스트명/설명/시작 버튼 노출 |
| TC-F002 | 시작 클릭 | 첫 질문 화면으로 전환 |
| TC-F003 | 선택지 클릭 | 다음 질문으로 자동 전환 |
| TC-F004 | 프로그레스바 업데이트 | 문항 진행도 및 진행 바 비율 업데이트 |
| TC-F005 | 마지막 문항 완료 | 분석 중 화면(로딩/퍼센트) 노출 후 결과 화면 전환 |
| TC-F006 | 결과 카드 표시 | 유형명 + 상세 해석(300자+) + 피로 지수 표시 |
| TC-F007 | 차트 렌더링 | Canvas 차트가 실제 렌더링됨 |
| TC-F008 | 공유 버튼 3개 | 카카오/트위터 URL 오픈 + 링크복사 동작 |
| TC-F009 | 다시 하기 | 인트로 화면 복귀 |
| TC-F010 | 결과 저장 | localStorage에 결과 키 저장 (`svc:decision-fatigue-check:last`) |

## 통합/사용성/성능 테스트

| ID | 검증 항목 | 기대 결과 |
|---|---|---|
| TC-I001 | i18n 한국어/문구 안정성 | 주요 UI가 한국어이며 `undefined` 텍스트 0 |
| TC-U001 | 모바일 390x844 | 레이아웃 깨짐 없이 조작 가능 |
| TC-P001 | 로딩 성능 | 페이지 로드 5초 이내 |
| TC-P002 | 런타임 안정성 | JS `pageerror` 0건 |

## 실행 로그 (검증 후 업데이트)

| ID | Status | Evidence |
|---|---|---|
| TC-F001 | PASS | Intro에서 제목 `의사결정 피로도 체크`, 설명, `시작하기` 확인 |
| TC-F002 | PASS | `시작하기` 클릭 후 `Q1` 화면 표시 |
| TC-F003 | PASS | Q1 첫 선택지 클릭 즉시 Q2 질문 표시 (`Q1 → Q2`) 확인 |
| TC-F004 | PASS | 진행도 로그 `1/10,2/10,3/10,...,10/10` 순차 증가 확인 |
| TC-F005 | PASS | 자동 응답 검증에서 `analyzingSeen=true`, 이후 `finalSeen=true`로 결과 화면 전환 확인 |
| TC-F006 | PASS | 결과 카드에 유형명(예: `회복 설계자`)과 300자+ 상세 해석 표시 |
| TC-F007 | PASS | `#resultChart` canvas width/height > 0 및 막대 차트 렌더링 확인 |
| TC-F008 | PASS | 카카오/트위터 클릭 시 `window.open` 호출, 링크복사 클릭 시 토스트 `링크가 복사되었습니다.` |
| TC-F009 | PASS | `다시 하기` 클릭 시 Intro 복귀 |
| TC-F010 | PASS | localStorage `svc:decision-fatigue-check:last` 저장값(JSON, type 포함) 확인 |
| TC-I001 | PASS | 페이지 본문 텍스트 한국어 중심, `undefined` 문자열 검색 결과 0 |
| TC-U001 | PASS | viewport 390x844에서 단일 열/버튼 터치 영역 정상 확인 |
| TC-P001 | PASS | Navigation Timing 기준 `loadMs=100ms` (5초 이내) |
| TC-P002 | PASS | 테스트 세션 pageerror 카운트 0 |
