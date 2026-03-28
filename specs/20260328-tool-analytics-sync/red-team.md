# Red Team — 2026-03-28 Tool Analytics Sync

🔴 Red Team:
- [공격 1]: 문자열 치환이 거칠면 `<head>` 구조를 깨거나 CSP/JSON-LD 순서를 망가뜨릴 수 있다.
- [공격 2]: 이미 analytics가 있는 페이지에 중복 삽입되면 측정 이벤트가 이중 집계될 수 있다.
- [공격 3]: 전체 repo 쓰기 실행은 범위가 넓어서 예상치 못한 페이지까지 건드릴 수 있다.
- [방어/완화]:
  - 삽입 규칙을 `<head>` 내부의 첫 `<script>` 직전, 없으면 `</head>` 직전으로 고정한다.
  - `/assets/analytics.js` substring 존재 시 무조건 skip 하여 idempotency를 보장한다.
  - `tools/*/index.html` 만 대상으로 제한하고, 기본값은 dry-run 으로 둔다.
  - `--slug` 필터와 unit test로 범위 제어를 검증한다.
  - 실제 repo 적용 후 `tool-catalog-guard.py` 로 warning bucket 감소를 반드시 재검증한다.
- [합의]: 🟢극복
