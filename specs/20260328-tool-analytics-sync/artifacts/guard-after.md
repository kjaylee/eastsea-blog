# Tool Catalog Guard Report

Generated at: `2026-03-28T12:19:40+00:00`

Audited root: `/Users/kjaylee/.openclaw/workspace/eastsea-blog`

Overall status: **error**

Fail threshold: `none`

## Counts

| Metric | Value |
| --- | ---: |
| filesystem | 732 |
| manifestEntries | 732 |
| manifestDeclaredCount | 732 |
| toolsListEntries | 731 |
| landingClaimMin | 727 |
| landingStructuredDataCount | 728 |

## Issue Summary

| Severity | Non-zero issue types | Total items |
| --- | ---: | ---: |
| error | 1 | 1 |
| warn | 2 | 8 |

## tools_list_missing_entries

- Severity: `error`
- Count: **1**
- Summary: Filesystem tools are absent from _data/tools-list.json.
- Examples:
  - `gofundme-fee-calculator`

## landing_stale_count_claims

- Severity: `warn`
- Count: **7**
- Summary: Landing page public count copy undersells the filesystem corpus.
- Examples:
  - `{"count": 727, "source": "og:description", "text": "727개의 무료 온라인 도구 모음. 설치 없이 브라우저에서 바로 사용하세요."}`
  - `{"count": 727, "source": "twitter:description", "text": "727개의 무료 웹 도구를 카테고리별로 빠르게 검색하고 바로 활용하세요."}`
  - `{"count": 728, "source": "body", "text": "728개의 무료 웹 도구 모음 | Free Online Tools Collection – eastsea.monster 🌓 🛠️ 웹 도구 모음 개발자와 크리에이터를 위한 유용한 도구들 총 728개의 도구 🔍 📱 앱스토어 구독 실수령액 계산기 70%/85% proceeds 버킷, 월간/연간"}`
  - `{"count": 728, "source": "meta:description", "text": "728개의 무료 온라인 도구 모음. 실무형 계산기, 디지털 마케팅, 디자인, 개발용 유틸리티까지 한 곳에 정리했습니다."}`
  - `{"count": 728, "source": "og:title", "text": "728개의 무료 웹 도구 모음 | Free Online Tools"}`
  - `{"count": 728, "source": "title", "text": "728개의 무료 웹 도구 모음 | Free Online Tools Collection – eastsea.monster"}`
  - `{"count": 728, "source": "twitter:title", "text": "728개의 무료 웹 도구 모음 | Free Online Tools"}`

## landing_structured_data_mismatch

- Severity: `warn`
- Count: **1**
- Summary: Landing page JSON-LD numberOfItems undersells the filesystem corpus.
- Examples:
  - `{"count": 728, "field": "numberOfItems"}`

## Recommended next actions

- Backfill _data/tools-list.json so every filesystem tool slug is discoverable exactly once.
- Refresh landing page public counts and JSON-LD numberOfItems to stop underselling the current corpus.
