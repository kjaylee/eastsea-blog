# Research — Creator Membership Platform Fee Comparator catalog wiring

## Scope
Wire the already-created tool into repo discovery surfaces only for:
- `tools/manifest.json`
- `_data/tools-list.json`
- `tools/index.html`
- `tools/index.md`

No calculator logic or unrelated refactors.

## Findings before edits
- Tool directory exists: `tools/creator-membership-platform-fee-comparator/`
- `tools/manifest.json` already had an exact-once entry for slug/url pair, so this slice did **not** rewrite manifest.
- `_data/tools-list.json` did **not** contain the tool.
- `tools/index.html` did **not** contain the tool.
- `tools/index.md` did **not** contain the tool.

## Selected catalog copy
- Display title: `크리에이터 멤버십 플랫폼 수수료 비교기`
- Data title: `Creator Membership Platform Fee Comparator | 크리에이터 멤버십 플랫폼 수수료 비교기`
- Summary: compare Direct Stripe, Patreon, Substack, and App Store recurring-membership fees/take-home and target price to match net revenue.

## Minimal plan
1. Leave `tools/manifest.json` untouched because it is already correct and exact-once.
2. Insert one JSON item in `_data/tools-list.json` near the existing creator membership tools.
3. Insert one tool card in `tools/index.html` near the existing creator membership retention tool.
4. Insert one markdown list item in `tools/index.md` near the same cluster.
5. Verify exact-once counts and HTTP 200 for the tool page.

## Lightweight Red Team
- Attack 1: existing dirty worktree could cause accidental unrelated edits in shared catalog files.
- Attack 2: adding the entry twice across mixed manual/generated surfaces would create duplicate discovery rows.
- Defense: only insert when slug is absent; verify exact-once counts after edit; avoid manifest rebuild because manifest was already correct.
- Agreement: 🟢 overcome for this narrow slice.

## Test cases
- `manifest exact matches == 1`
- `tools-list exact matches == 1`
- `tools/index.html href matches == 1`
- `tools/index.md href matches == 1`
- `curl -I /tools/creator-membership-platform-fee-comparator/` returns `200 OK`
