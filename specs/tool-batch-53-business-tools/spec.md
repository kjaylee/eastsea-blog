# Spec — Tool Batch 53 Business Productivity

## Goal
- Deliver/refresh business-focused web tools in `/tools/` with Korean-first UI.
- Ensure each tool is a single `index.html` (inline HTML/CSS/JS), mobile responsive, and contains portal link `href="/"`.
- Raise tool manifest count to 300.

## Scope
- Refresh existing slugs: `ab-test-calculator`, `cagr-calculator`, `meeting-cost-calculator`, `freelance-rate-calculator` (UX/link consistency).
- Add new business tools: `break-even-analyzer`, `email-subject-tester`, `churn-rate-calculator`, `runway-calculator`, `pricing-strategy-tool`, `customer-acquisition-cost`, `debt-payoff-planner`.
- Add supplemental business tools required for 300 target: `ltv-calculator`, `burn-rate-calculator`, `gross-margin-calculator`.
- Update `tools/manifest.json`.

## Functional Requirements
1. 계산 결과는 즉시 재계산(input/change 이벤트) 또는 계산 버튼으로 갱신 가능해야 한다.
2. 숫자 입력 검증(0 이하/NaN/불가능 조합)을 처리하고 안내 문구를 제공해야 한다.
3. 주요 KPI(핵심 지표)를 카드 형태로 노출해야 한다.
4. 각 도구 상단에 `Back to Portal` 링크(href="/")를 제공해야 한다.
5. 모바일(<= 768px)에서 단일 컬럼 중심 레이아웃이어야 한다.

## Non-Functional Requirements
- No external dependencies/CDN required for core logic.
- Works in modern mobile/desktop browsers.
- Keep source readable and maintainable.
