# Red Team — 2026-03-28 Tool Catalog Sync

🔴 Red Team:
- [공격 1]: tools-list 전체 재작성 시 기존 수동 메타데이터가 유실될 수 있음.
- [공격 2]: landing count regex가 잘못 동작하면 `tools/index.html`의 unrelated 숫자까지 깨질 수 있음.
- [공격 3]: manifest 재생성이 title 추출을 망치면 SEO title 품질이 하락할 수 있음.
- [방어/완화]: 기존 entry를 기본 베이스로 merge하고, canonical 필드만 보정. landing 업데이트는 count-specific 패턴만 제한적으로 치환. title은 generic suffix 제거 + fallback slug title만 사용. dry-run default 유지. 테스트로 merge/title/landing 동작 검증.
- [합의]: 🟢극복
