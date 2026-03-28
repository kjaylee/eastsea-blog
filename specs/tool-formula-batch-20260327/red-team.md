# Red Team — tool-formula-batch-20260327

- [공격 1]: 이미 `tool-formula-scaffold.py`가 있는데 wrapper를 추가하면 유지비만 늘 수 있다.
  - [방어/완화]: 새 스크립트는 렌더링 로직을 재구현하지 않고 기존 scaffold를 import 해서 재사용한다. 역할은 단일 생성기 vs 배치 감사/백필로 분리한다.
- [공격 2]: `--write-missing` 구현이 잘못되면 기존 `app.js`를 덮어써서 로컬 수정분을 손상시킬 수 있다.
  - [방어/완화]: 기본은 dry-run, `--write-missing` 는 누락 파일만 기록, 기존 파일 overwrite 는 `--force` 없이는 금지한다.
- [공격 3]: 현재 config-driven tool 수가 적어 ROI가 작을 수 있다.
  - [방어/완화]: 현재도 mixed-state backfill이 즉시 필요하고, 향후 config-driven 도구 추가 속도를 올리는 기반이라는 점에서 작은 코드로 반복 비용을 제거한다.
- [합의]: 🟢극복
