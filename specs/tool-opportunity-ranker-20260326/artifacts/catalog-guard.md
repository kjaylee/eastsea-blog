# Tool Catalog Guard Report

Generated at: `2026-03-25T23:13:49+00:00`

Audited root: `/Users/kjaylee/.openclaw/workspace/eastsea-blog`

Overall status: **error**

Fail threshold: `none`

## Counts

| Metric | Value |
| --- | ---: |
| filesystem | 681 |
| manifestEntries | 681 |
| manifestDeclaredCount | 681 |
| toolsListEntries | 498 |
| landingClaimMin | 650 |
| landingStructuredDataCount | 664 |

## Issue Summary

| Severity | Non-zero issue types | Total items |
| --- | ---: | ---: |
| error | 1 | 190 |
| warn | 8 | 319 |

## tools_list_missing_entries

- Severity: `error`
- Count: **190**
- Summary: Filesystem tools are absent from _data/tools-list.json.
- Examples:
  - `ab-test-sample-calculator`
  - `ad-free-upgrade-roi-calculator`
  - `affiliate-cookie-window-roi-calculator`
  - `ai-retainer-profit-planner`
  - `ai-support-deflection-roi-calculator`
  - `ai-system-prompt-builder`
  - `animal-personality`
  - `api-credit-pack-breakage-roi-calculator`
  - `api-minimum-commit-overage-profit-calculator`
  - `api-rate-limit-budget-planner`

## tools_list_extra_entries

- Severity: `warn`
- Count: **7**
- Summary: Tools list contains slugs that do not exist on disk.
- Examples:
  - `affiliate-commission-calculator`
  - `amazon-handmade-fee-calculator`
  - `cash-discount-early-payment-calculator`
  - `compound-interest-calculator`
  - `facebook-marketplace-fee-profit-calculator`
  - `shopify-app-store-revenue-share-calculator`
  - `stock-option-profit-calculator`

## tools_list_blank_description

- Severity: `warn`
- Count: **198**
- Summary: Tools list entries have blank descriptions.
- Examples:
  - `adsense-revenue-simulator`
  - `age-calculator`
  - `ascii-art-gen`
  - `aspect-ratio`
  - `aspect-ratio-calc`
  - `audio-trimmer`
  - `audio-visualizer`
  - `base-converter-workbench`
  - `base64-converter`
  - `base64-encoder-decoder`

## tools_list_generic_title

- Severity: `warn`
- Count: **90**
- Summary: Tools list titles still use generic or stale title markers.
- Examples:
  - `age-calculator`
  - `ai-prompt-builder`
  - `aspect-ratio-calc`
  - `audio-visualizer`
  - `bmi-calculator`
  - `box-shadow-gen`
  - `budget-tracker`
  - `calendar-gen`
  - `chmod-calculator`
  - `clamp-font-generator`

## tools_list_placeholder_text

- Severity: `warn`
- Count: **2**
- Summary: Tools list title/description contains obvious template placeholders.
- Examples:
  - `game-metadata-builder`
  - `meta-tag-gen`

## tools_list_suspicious_description

- Severity: `warn`
- Count: **2**
- Summary: Tools list description looks wrong, stale, or category-mismatched.
- Examples:
  - `{"description": "A collection of free, fast browser tools for developers and creators.", "slug": "meta-tag-analyzer"}`
  - `{"description": "소환과 성장, 자동 전투를 결합한 방치형 RPG. 브라우저에서 바로 플레이하세요.", "slug": "seo-meta-checker"}`

## landing_stale_count_claims

- Severity: `warn`
- Count: **8**
- Summary: Landing page public count copy undersells the filesystem corpus.
- Examples:
  - `{"count": 650, "source": "body", "text": "650+ 무료 웹 도구 모음 | Free Online Tools Collection – eastsea.monster 🌓 🛠️ 웹 도구 모음 개발자와 크리에이터를 위한 유용한 도구들 총 664개의 도구 🔍 📱 앱스토어 구독 실수령액 계산기 70%/85% proceeds 버킷, 월간/연간 "}`
  - `{"count": 650, "source": "meta:description", "text": "650개 이상의 무료 온라인 도구 모음. 실무형 계산기, 디지털 마케팅, 디자인, 개발용 유틸리티까지 한 곳에 정리했습니다."}`
  - `{"count": 650, "source": "og:description", "text": "650개 이상의 무료 온라인 도구 모음. 설치 없이 브라우저에서 바로 사용하세요."}`
  - `{"count": 650, "source": "og:title", "text": "650+ 무료 웹 도구 모음 | Free Online Tools"}`
  - `{"count": 650, "source": "title", "text": "650+ 무료 웹 도구 모음 | Free Online Tools Collection – eastsea.monster"}`
  - `{"count": 650, "source": "twitter:description", "text": "650개 이상의 무료 웹 도구를 카테고리별로 빠르게 검색하고 바로 활용하세요."}`
  - `{"count": 650, "source": "twitter:title", "text": "650+ 무료 웹 도구 모음 | Free Online Tools"}`
  - `{"count": 664, "source": "body", "text": "650+ 무료 웹 도구 모음 | Free Online Tools Collection – eastsea.monster 🌓 🛠️ 웹 도구 모음 개발자와 크리에이터를 위한 유용한 도구들 총 664개의 도구 🔍 📱 앱스토어 구독 실수령액 계산기 70%/85% proceeds 버킷, 월간/연간 "}`

## landing_structured_data_mismatch

- Severity: `warn`
- Count: **1**
- Summary: Landing page JSON-LD numberOfItems undersells the filesystem corpus.
- Examples:
  - `{"count": 664, "field": "numberOfItems"}`

## tool_missing_analytics_include

- Severity: `warn`
- Count: **11**
- Summary: Tool page is missing the /assets/analytics.js include.
- Examples:
  - `baking-ingredient-converter`
  - `calorie-burn-calculator`
  - `career-fit`
  - `cpm-calculator`
  - `decision-style`
  - `email-marketing-roi-calculator`
  - `eventbrite-fee-calculator`
  - `impermanent-loss-calculator`
  - `jet-lag-planner`
  - `rent-vs-mortgage-breakeven`

## Recommended next actions

- Backfill _data/tools-list.json so every filesystem tool slug is discoverable exactly once.
- Refresh landing page public counts and JSON-LD numberOfItems to stop underselling the current corpus.
- Restore /assets/analytics.js on the affected tool pages before the next publish cycle.
- Repair placeholder and obviously wrong catalog copy before using tools-list.json as a discovery source.
