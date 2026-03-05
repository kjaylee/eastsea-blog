# Research — Limited-time Offer Profit Calculator

## Source review

### tools/index.html
- Tool cards are `<a class="tool-card" href="{slug}/" data-tags="...">` blocks with nested `.tool-icon`, `.tool-name`, `.tool-description`, and `.tool-tags` spans.
- Search relies on text in `.tool-name`, `.tool-description`, and `data-tags`.
- New tools should add a card in the list to surface on the portal.

### tools/index.md
- Markdown index entries use: `- [도구명](./slug/) — 한 줄 설명`.
- ROI/수익 계산기들이 상단에 모여 있음; 신규 항목도 동일 패턴으로 추가.

### tools/manifest.json + scripts/build-manifests.sh
- Manifest schema: `{ "tools": [ {slug,title,url,size}... ], "count": N, "updatedAt": ISO }`.
- `scripts/build-manifests.sh` scans `tools/` directories, parses `<title>` and strips suffix after `|` or `–/—`, and sums all file sizes in the tool folder.
- 따라서 새 도구의 `<title>` 첫 구간이 manifest title로 사용됨.

### tools/creator-membership-churn-reduction-roi-calculator/index.html
- ROI 계산기 레이아웃: `header + .grid` two-column, `.inputs` grid, Copy/Reset buttons, summary textarea.
- Includes `/assets/analytics.js`.
- Uses external `app.mjs` + `logic.mjs` with localStorage persistence.

### tools/checkout-one-click-upsell-revenue-calculator/index.html
- Similar ROI UI pattern, KPI cards + details table + status pill, mobile breakpoint at `max-width:900px`.
- Validations and summary copy with clipboard API.
