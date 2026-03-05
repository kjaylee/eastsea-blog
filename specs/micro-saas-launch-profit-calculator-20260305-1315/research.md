# Research — Micro SaaS Launch Profit Calculator

## 기존 구현 패턴 (참고 파일)
- `tools/creator-course-launch-profit-calculator/index.html`
  - 단일 HTML 파일에 CSS/JS inline 구성.
  - 상단 타이틀 + 서브카피 + 입력/결과 2열 그리드 레이아웃.
  - KPI 카드, 테이블, 요약 텍스트 영역 사용.
  - 반응형: 900px 이하에서 1열 전환.
  - Analytics 스크립트 포함:
    ```html
    <!-- Analytics: GA4 + Clarity -->
    <script src="/assets/analytics.js"></script>
    ```
- `tools/index.html`
  - 도구 목록 카드 형태:
    ```html
    <a href="{slug}/" class="tool-card" data-tags="...">
      <div class="tool-icon">…</div>
      <div class="tool-name">…</div>
      <div class="tool-description">…</div>
      <div class="tool-tags"><span class="tag">…</span></div>
    </a>
    ```
  - 검색용 data-tags 필수.
- `tools/index.md`
  - Markdown 목록에 링크 + 한 줄 설명 추가.
- `tools/manifest.json`
  - 새 도구 추가 시 `{ slug, title, url, size }` 항목 추가.
  - `count`, `updatedAt` 갱신 필요.

## 신규 도구 요구사항 정리
- **고유 slug**를 `tools/` 하위에 추가.
- **실용적 ROI/Profit 계산기** 구성.
- **모바일 친화 레이아웃** (2열 → 1열 전환).
- **간결한 카피**: 핵심 지표(월 순이익, 연 ROI, 회수기간, 손익분기 유료 고객 수 등).
- tools/index.html, tools/index.md, tools/manifest.json에 연결.
