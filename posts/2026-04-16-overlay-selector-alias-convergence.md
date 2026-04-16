---
title: "Overlay Selector Alias를 공통 팩토리로 접으면서 계약을 지킨 4단계"
date: "2026-04-16"
categories: [devlog, indie-game]
tags: [horse-racing, html5, gamedev, overlay, selector-alias, refactor, regression]
author: MissKim
excerpt: "phase338~341에서 result/reset overlay의 thin alias 중복을 공통 selector factory로 수렴시키면서도 ordered payload, bridge contract, explicit override precedence를 회귀 없이 지켜낸 과정을 정리했다."
publish_targets: [eastsea-blog, medium, substack]
thumbnail: /images/devlog/overlay-selector-alias-convergence/overlay-selector-alias-thumb.svg
thumbnail_headline: "overlay selector alias 공통화"
thumbnail_subheadline: "phase338~341 · ordered payload · override precedence"
thumbnail_alt: "live, result, reset overlay selector alias가 하나의 공통 factory로 수렴되고 ordered payload와 override precedence 계약이 유지되는 구조도"
preview_assets:
  og: /images/devlog/overlay-selector-alias-convergence/overlay-selector-alias-og-preview.svg
  pinterest: /images/devlog/overlay-selector-alias-convergence/overlay-selector-alias-pinterest-preview.svg
  discord: /images/devlog/overlay-selector-alias-convergence/overlay-selector-alias-discord-preview.svg
hero_variants:
  eastsea_blog:
    preview_asset: og
    headline: "계약 보존 경로를 더 선명하게 만든 공통화"
    dek: "ordered payload·bridge contract·override precedence를 잃지 않은 overlay selector alias 수렴 기록"
    cta: "검증 스택까지 포함한 4단계 수렴 과정을 바로 확인하기"
  medium:
    preview_asset: og
    headline: "Refactor less, preserve more in one factory"
    dek: "live/result/reset alias를 공통 selector factory로 접으면서도 세 계약을 그대로 보존한 devlog"
    cta: "왜 공통화보다 경계 재설정이 더 중요했는지 4단계 메모 읽기"
  substack:
    preview_asset: og
    headline: "공통화 뒤에도 절대 바뀌면 안 되는 것들"
    dek: "thin alias를 줄이면서 quiet regression을 막기 위해 남겨둔 차이와 판단의 배경"
    cta: "이번 설계 판단이 다음 factory화 속도를 어떻게 바꾸는지 보기"
teaser_variants:
  medium:
    subject: "One selector factory, three contracts intact"
    summary: "thin alias 중복을 줄이면서 ordered payload·bridge contract·explicit override precedence를 잃지 않은 4단계 refactor devlog"
    teaser: "보기 좋은 정리보다 경계 재설정이 더 중요했던 이유를 카드·코드·검증 기준까지 한 번에 이어서 보여준다."
  substack:
    subject: "공통화 뒤에도 절대 바뀌면 안 되는 것들"
    preheader: "ordered payload·bridge contract·명시적 override 우선권을 지키며 overlay selector alias를 하나로 접은 기록"
    summary: "비슷해 보이는 helper를 하나로 모으는 일보다, 어떤 차이를 주입 경계로 남겨야 quiet regression을 막는지가 더 중요했다."
    teaser: "이번 글은 공통화 성공담이 아니라 계약 보존 경로를 잃지 않기 위해 무엇을 남기고 무엇을 접었는지에 대한 출고형 devlog다."
primary_cta: "다음 단계는 preview SVG를 PNG export 파이프라인으로 묶어 실제 업로드용 raster 패키지까지 닫는 것이다."
---

## Executive Summary

`horse-racing/index.html`의 live/result/reset overlay는 겉으로는 비슷한 helper wrapper를 반복하고 있었지만, 실제로는 아주 민감한 계약 세 개를 동시에 들고 있었습니다. 하나는 selector가 고른 **ordered payload 순서**, 하나는 bridge contract가 그 순서를 **끝까지 보존하는 경로**, 마지막 하나는 사용자가 직접 넘긴 resolver가 suite 기본값에 덮이지 않는 **explicit override precedence**입니다.

phase338~341의 작업은 단순 중복 제거가 아니었습니다. 얇은 alias를 하나의 공통 factory로 접으면서도, result/reset overlay만 갖고 있던 prefixed bridge ordering과 phase340에서 다시 세운 override 우선순위를 같이 지켜야 했습니다. 결과적으로 `createOverlaySemanticPayloadSelectorAlias(...)`를 중심으로 named/bridge selector alias의 fallback, helper delegation, `setHelpers/getHelpers` lifecycle을 한 군데로 수렴시켰고, 기존 회귀 검증도 그대로 통과했습니다.

이 글은 그 수렴 과정을 “코드가 좀 더 예뻐졌다”는 차원이 아니라, **왜 이 순서로 정리해야 계약을 잃지 않는지**에 초점을 맞춰 기록한 publish-ready devlog입니다.

---

## 시각 카드 팩

이번 cycle에서는 이 글을 바로 퍼블리시 카드로 넘길 수 있도록 3장짜리 SVG 시각 자료와 대표 썸네일까지 함께 묶었습니다.

### Card 1 — Before: thin alias 분산 상태

![Before card — thin alias가 live/result/reset overlay에 각각 흩어져 있고 helper wiring이 따로 존재하던 상태를 보여주는 카드](/images/devlog/overlay-selector-alias-convergence/overlay-selector-alias-card-01-before.svg)

세 overlay가 거의 같은 wrapper를 따로 들고 있던 상태를 보여줍니다. “겉모양은 비슷하지만 계약은 분산돼 있다”는 문제 정의를 한 장으로 압축한 카드입니다.

### Card 2 — After: 공통 selector factory 수렴

![Factory card — createOverlaySemanticPayloadSelectorAlias를 중심으로 live/result/reset overlay가 연결되고 result/reset 차이는 주입 경계로 남는 구조를 보여주는 카드](/images/devlog/overlay-selector-alias-convergence/overlay-selector-alias-card-02-factory.svg)

공통화의 핵심 메시지는 반복 로직을 중앙으로 모으되, result/reset의 bridge ordering 차이는 주입 경계로 남긴다는 점입니다. 블로그 본문의 phase341 설명과 바로 맞물리도록 구성했습니다.

### Card 3 — Contracts preserved: 순서·브리지·override 우선권 유지

![Contracts card — ordered payload, bridge contract, explicit override precedence 세 계약이 selector에서 target까지 보존되는 구조를 보여주는 카드](/images/devlog/overlay-selector-alias-convergence/overlay-selector-alias-card-03-contracts.svg)

마지막 카드는 이번 리팩터링의 진짜 성공 기준을 요약합니다. 줄 수 감소가 아니라 ordered payload, bridge contract, explicit override precedence를 동시에 잃지 않았다는 사실을 시각적으로 못 박는 용도입니다.

## Preview 비율 파생 세트

이번 cycle에서는 같은 메시지를 배포면별 기본 비율에 맞춰 바로 재사용할 수 있도록 preview 썸네일 3종도 추가했습니다. 핵심은 새 카피를 늘린 것이 아니라, cycle60에서 정리한 채널별 문안 계층을 OG/Pinterest/Discord 표지 면으로 옮겨 **문안과 시각 자산의 톤 불일치를 줄인 것**입니다.

- **OG preview (1200×630)**: `overlay selector alias 공통화` / `ordered payload · bridge contract · override precedence`
- **Pinterest preview (1000×1500)**: `세 개의 계약을 지키며 하나로 접다` / `thin alias → common factory`
- **Discord preview (1200×675)**: `One selector factory, three contracts intact` / `Refactor less, preserve more`

이제 eastsea-blog/Medium/Substack 공유 카드, Pinterest pin, Discord teaser가 모두 같은 자산 계층에서 파생되므로 채널별 재편집 비용이 크게 줄어듭니다.

## Hero 카피·CTA 미세조정

preview 자산이 생긴 뒤 남은 일은 각 발행면에서 제목과 CTA가 어디서 잘리는지까지 맞추는 것이었습니다. 이번 cycle에서는 같은 OG preview를 재사용하더라도 채널별로 **허용 길이, 첫 줄 훅, CTA 약속의 무게**를 분리해 hero 문안을 고정했습니다.

| 채널 | 연결 preview | headline 예산 | 확정 hero copy | CTA | 미세조정 이유 |
|---|---|---:|---|---|---|
| EastSea Blog | OG 1200×630 | 24~30자 | 계약 보존 경로를 더 선명하게 만든 공통화 | 검증 스택까지 포함한 4단계 수렴 과정을 바로 확인하기 | 이미지 아래에서 바로 본문으로 진입하므로 기술 키워드를 더 직접적으로 유지해도 읽힘 손실이 작다. |
| Medium | OG 1200×630 | 36~42자 | Refactor less, preserve more in one factory | 왜 공통화보다 경계 재설정이 더 중요했는지 4단계 메모 읽기 | 피드 카드에서는 첫 줄 훅이 먼저 보여 영문 hook를 살리고 dek를 더 짧게 접는 편이 유리하다. |
| Substack | OG 1200×630 | 22~28자 | 공통화 뒤에도 절대 바뀌면 안 되는 것들 | 이번 설계 판단이 다음 factory화 속도를 어떻게 바꾸는지 보기 | 이메일·웹 preview에서는 설명보다 판단의 긴장감을 먼저 주는 편이 오픈 동기를 더 강하게 만든다. |

### 채널별 hero deck 고정본

- **EastSea Blog deck**: `ordered payload·bridge contract·override precedence를 잃지 않은 overlay selector alias 수렴 기록`
- **Medium deck**: `live/result/reset alias를 공통 selector factory로 접으면서도 세 계약을 그대로 보존한 devlog`
- **Substack deck**: `thin alias를 줄이면서 quiet regression을 막기 위해 남겨둔 차이와 판단의 배경`

이번 조정으로 preview 자산과 본문 진입 문구가 같은 메시지 계층을 공유하게 됐습니다. 즉 카드에서는 “왜 봐야 하는가”를, hero에서는 “무엇을 잃지 않았는가”를 바로 이어서 말하게 됩니다.

## 발행 직전 subject·summary·teaser 팩

hero copy를 잠근 뒤에도 실제 배포 직전에는 플랫폼 입력창에 넣는 **subject, summary, teaser 한 줄**이 마지막으로 흔들리기 쉽습니다. 이번 cycle에서는 Medium과 Substack에 대해 그 세 줄을 front matter와 본문 둘 다에 고정해, 발행 직전 다시 카피를 짜는 비용을 더 줄였습니다.

| 채널 | subject | summary | teaser 운용 메모 |
|---|---|---|---|
| Medium | One selector factory, three contracts intact | thin alias 중복을 줄이면서 ordered payload·bridge contract·explicit override precedence를 잃지 않은 4단계 refactor devlog | 피드/공유 카드의 첫 줄 hook로 바로 쓸 수 있도록 영문 subject를 유지하고, summary는 기술 키워드를 앞단에 배치했다. |
| Substack | 공통화 뒤에도 절대 바뀌면 안 되는 것들 | 비슷해 보이는 helper를 하나로 모으는 일보다, 어떤 차이를 주입 경계로 남겨야 quiet regression을 막는지가 더 중요했다. | 메일 제목은 긴장감을 먼저 주고, preheader와 teaser가 판단 배경과 실무 의미를 이어받도록 분리했다. |

### Medium 고정본

- **subject**: `One selector factory, three contracts intact`
- **summary**: `thin alias 중복을 줄이면서 ordered payload·bridge contract·explicit override precedence를 잃지 않은 4단계 refactor devlog`
- **teaser**: `보기 좋은 정리보다 경계 재설정이 더 중요했던 이유를 카드·코드·검증 기준까지 한 번에 이어서 보여준다.`

### Substack 고정본

- **subject**: `공통화 뒤에도 절대 바뀌면 안 되는 것들`
- **preheader**: `ordered payload·bridge contract·명시적 override 우선권을 지키며 overlay selector alias를 하나로 접은 기록`
- **summary**: `비슷해 보이는 helper를 하나로 모으는 일보다, 어떤 차이를 주입 경계로 남겨야 quiet regression을 막는지가 더 중요했다.`
- **teaser**: `이번 글은 공통화 성공담이 아니라 계약 보존 경로를 잃지 않기 위해 무엇을 남기고 무엇을 접었는지에 대한 출고형 devlog다.`

이제 preview 카드, hero, summary, teaser가 모두 같은 메시지 계층을 공유합니다. 즉 카드에서는 훅을 만들고, hero는 판단 기준을 밝히며, teaser는 발행면별 첫 클릭 이유를 고정하는 구조가 완성됐습니다.

## 발행 버튼 직전 입력 순서 런북

카피를 잠가도 실제 발행 직전에는 입력 순서 자체가 흔들리면 다시 임시 판단이 들어옵니다. 이번 cycle에서는 eastsea-blog / Medium / Substack 각각에 대해 **무엇을 어떤 순서로 넣고, 어디서 멈춰 검증할지**를 런북 형태로 고정했습니다.

| 채널 | 1차 입력 | 2차 입력 | 3차 입력 | 최종 멈춤점 |
|---|---|---|---|---|
| EastSea Blog | front matter `title` / `excerpt` 확인 | `thumbnail`, `preview_assets.og`, `hero_variants.eastsea_blog` 확인 | `primary_cta`와 본문 `## Release Note` 확인 | draft → post 승격 또는 publish commit 직전 diff 재확인 |
| Medium | `hero_variants.medium.headline` → 제목 훅 | `hero_variants.medium.dek` + `teaser_variants.medium.summary` → 부제/설명 | `teaser_variants.medium.subject` + `teaser_variants.medium.teaser` → 공유용 hook/teaser | preview 카드와 첫 문단이 같은 메시지 계층인지 확인 후 publish |
| Substack | `teaser_variants.substack.subject` → 메일 제목 | `teaser_variants.substack.preheader` + `hero_variants.substack.dek` → preheader/deck | `teaser_variants.substack.summary` + `teaser_variants.substack.teaser` → summary/teaser | 메일 제목-본문 첫 단락 긴장감이 이어지는지 확인 후 publish |

### EastSea Blog runbook

1. `title`, `excerpt`가 현재 본문 메시지와 어긋나지 않는지 먼저 본다.
2. `thumbnail`, `preview_assets.og`, `hero_variants.eastsea_blog.headline/dek/cta`가 같은 문장을 말하는지 확인한다.
3. `primary_cta`와 `## Release Note`의 다음 단계가 충돌하지 않는지 확인한다.
4. 마지막으로 draft → post 승격 또는 publish commit 직전 diff에서 front matter 변경 누락이 없는지만 보고 종료한다.

### Medium runbook

1. 제목 훅은 `hero_variants.medium.headline`을 기준으로 고정한다.
2. 설명 줄은 `hero_variants.medium.dek`와 `teaser_variants.medium.summary` 중 더 짧고 선명한 쪽을 우선하고, 문장을 새로 짜지 않는다.
3. 공유용 첫 줄은 `teaser_variants.medium.subject`, 공유 teaser는 `teaser_variants.medium.teaser`를 그대로 쓴다.
4. publish 전 마지막 확인은 preview 카드 문구, 첫 문단, 공유 teaser가 모두 “공통화보다 계약 보존이 중요했다”는 한 메시지로 수렴하는지만 본다.

### Substack runbook

1. 메일 제목은 `teaser_variants.substack.subject`를 그대로 사용한다.
2. preheader는 `teaser_variants.substack.preheader`, deck은 `hero_variants.substack.dek`로 역할을 분리한다.
3. `teaser_variants.substack.summary`는 요약, `teaser_variants.substack.teaser`는 클릭 이유로 고정한다.
4. publish 전 마지막 확인은 제목의 긴장감 → preheader의 맥락 → 본문 첫 단락의 설계 판단이 끊기지 않는지만 본다.

### 30초 최종 체크리스트

- preview 카드 / hero / summary / teaser가 서로 다른 약속을 하지 않는다.
- Medium은 headline과 subject를 혼용하지 않고, 각 역할을 분리한다.
- Substack은 subject와 preheader를 같은 문장으로 복제하지 않는다.
- EastSea Blog는 썸네일 경로와 preview asset 경로가 실제 front matter와 일치한다.
- 새 문장을 즉흥으로 추가하지 않고, 이미 잠근 문자열만 재사용한다.

## eastsea-blog publish commit preflight checklist

입력 순서를 잠근 뒤에도 실제 출고 직전에는 **어떤 파일을 어디로 옮기고, 무엇을 절대 건드리지 말아야 하는지**가 마지막 흔들림으로 남습니다. 이번 cycle에서는 eastsea-blog 기준 publish commit 바로 전에 확인할 프리플라이트를 고정했습니다.

- **예상 publish target**: `_posts/2026-04-16-overlay-selector-alias-convergence.md`
- **현재 source draft**: `_drafts/2026-04-16-overlay-selector-alias-convergence.md`
- **이동 원칙**: draft 내용을 publish 직전에 새로 다듬지 말고, 이미 잠근 front matter와 본문을 그대로 post로 승격한다.

| 체크 항목 | 무엇을 확인하나 | 왜 중요한가 |
|---|---|---|
| Target path 고정 | `_posts/2026-04-16-overlay-selector-alias-convergence.md` 경로와 slug가 draft 제목/날짜와 충돌하지 않는지 확인 | 이동 직전 slug를 다시 바꾸면 썸네일·배포 팩·릴리스 노트 연결이 같이 흔들린다. |
| Front matter freeze | `title`, `excerpt`, `publish_targets`, `thumbnail`, `preview_assets`, `hero_variants`, `teaser_variants`, `primary_cta`를 새로 쓰지 않고 재사용 | 마지막 순간에 문장을 다시 짜면 채널별 메시지 계층이 어긋난다. |
| Asset linkage freeze | `/images/devlog/overlay-selector-alias-convergence/...` 경로와 실제 `assets/images/devlog/overlay-selector-alias-convergence/` 파일 집합이 모두 존재하는지 확인 | draft→post 이동 뒤에도 루트 기준 자산 경로가 그대로 살아야 한다. |
| Release note parity | `## Release Note`의 다음 단계 설명과 cycle65 릴리스 노트의 설명이 충돌하지 않는지 확인 | 출고 기록과 초안 본문이 서로 다른 약속을 하면 후속 cycle 추적이 깨진다. |
| Diff scope discipline | publish 직전 diff에는 draft→post 승격, 관련 메타 정리, 검증 산출물만 남기고 즉흥 본문 수정은 넣지 않는다 | 커밋 범위가 넓어질수록 발행 실수 원인 추적이 어려워진다. |

### publish commit 직전 45초 체크

1. `_drafts/2026-04-16-overlay-selector-alias-convergence.md`가 실제 source of truth인지 다시 확인한다.
2. `_posts/2026-04-16-overlay-selector-alias-convergence.md`로 이동해도 `thumbnail`, `preview_assets.*` 경로가 그대로 유효한지 본다.
3. `hero_variants`와 `teaser_variants` 문자열을 새로 고치지 않고 그대로 가져갈 준비가 되었는지 확인한다.
4. `## Release Note`의 다음 단계가 cycle65 배포 팩 설명과 같은 방향인지 확인한다.
5. 마지막으로 publish commit에는 글 출고와 직접 관계없는 잡수정이 섞이지 않았는지만 본다.

## draft→post 이동 후 검증 순서

publish commit이 끝났다면 이제 중요한 것은 “올라갔다”가 아니라 **이동 뒤에도 메시지와 자산 연결이 그대로 살아 있는지**를 확인하는 일입니다.

| 순서 | 이동 후 확인 항목 | 합격 기준 |
|---|---|---|
| 1 | 파일 위치 전환 | `_drafts/2026-04-16-overlay-selector-alias-convergence.md`는 제거되고 `_posts/2026-04-16-overlay-selector-alias-convergence.md`가 존재한다. |
| 2 | Front matter 보존 | title/excerpt/thumbnail/preview_assets/hero_variants/teaser_variants/primary_cta가 draft 시점과 같은 메시지 계층을 유지한다. |
| 3 | 자산 연결 | `overlay-selector-alias-thumb.svg`, `overlay-selector-alias-og-preview.svg`, `overlay-selector-alias-pinterest-preview.svg`, `overlay-selector-alias-discord-preview.svg`가 모두 그대로 참조 가능하다. |
| 4 | 본문 섹션 보존 | 시각 카드 팩, Hero 카피·CTA, subject·summary·teaser, 발행 런북, Release Note 섹션이 post에도 그대로 남아 있다. |
| 5 | 배포 팩 일치 | cycle60/64/65 배포 팩의 설명과 실제 post 파일 상태가 서로 다른 경로를 가리키지 않는다. |

### post-move smoke check

- draft 삭제와 post 생성이 동시에 반영됐는지 본다.
- post front matter가 채널별 hero/teaser 문자열을 그대로 유지하는지 본다.
- 자산 경로가 상대경로가 아니라 루트 기준 경로로 유지돼 이동 뒤에도 깨지지 않는지 본다.
- 배포 팩 문서가 여전히 `_drafts/`를 source로 설명하는 부분은 없는지 훑는다.
- 문제가 생기면 본문을 새로 고치기보다 이동 경로와 메타 연결부터 되돌아본다.

## 실제 publish move command / rollback note

preflight와 post-move 검증 순서를 잠근 뒤에도 운영자는 마지막에 **어떤 명령을 어떤 경계에서 멈출지**, 그리고 **어디까지가 되돌릴 수 있는 로컬 변경인지**를 알아야 합니다. 이번 cycle에서는 eastsea-blog 저장소가 이미 다른 변경으로 바쁜 상태에서도 헷갈리지 않도록, 이번 글 출고에 직접 관계있는 경로만 좁혀 보는 path-scoped 오퍼레이션 카드를 추가합니다.

### 출고 오퍼레이션 카드

| 단계 | 실제 명령 | 멈춤점 | 목적 |
|---|---|---|---|
| 1. 백업 잠금 | `mkdir -p .state/minimax-loop/blog-draft/backups && cp posts.json .state/minimax-loop/blog-draft/backups/2026-04-16-overlay-selector-alias-convergence.posts.json.bak && cp _drafts/2026-04-16-overlay-selector-alias-convergence.md .state/minimax-loop/blog-draft/backups/2026-04-16-overlay-selector-alias-convergence.draft.bak.md` | 백업 파일 2종 생성 직후 | posts.json과 source draft를 로컬에서 즉시 되돌릴 수 있게 만든다. |
| 2. 범위 한정 상태 확인 | `git status --short -- _drafts/2026-04-16-overlay-selector-alias-convergence.md _posts/2026-04-16-overlay-selector-alias-convergence.md posts/2026-04-16-overlay-selector-alias-convergence.md posts.json assets/images/devlog/overlay-selector-alias-convergence/` | 예상 경로만 보이는지 확인 후 다음 단계 | 저장소 전체 noise와 무관하게 이번 출고 범위만 본다. |
| 3. draft → post 승격 | `mkdir -p _posts && mv _drafts/2026-04-16-overlay-selector-alias-convergence.md _posts/2026-04-16-overlay-selector-alias-convergence.md && git add _posts/2026-04-16-overlay-selector-alias-convergence.md && git rm --cached --ignore-unmatch _drafts/2026-04-16-overlay-selector-alias-convergence.md >/dev/null 2>&1` | `_drafts` 제거 / `_posts` 생성 확인 | source draft가 tracked면 index에서 삭제를 명시적으로 반영하고, untracked여도 pathspec 오류 없이 같은 카드로 계속 진행한다. |
| 4. posts 미러 생성 | `mkdir -p posts && cp _posts/2026-04-16-overlay-selector-alias-convergence.md posts/2026-04-16-overlay-selector-alias-convergence.md` | `posts/` 복사본 생성 직후 | `scripts/publish-post.sh`가 기대하는 posts/ 입력 경로까지 맞춘다. |
| 5. 원샷 publish 스크립트 실행 | `bash scripts/publish-post.sh 2026-04-16-overlay-selector-alias-convergence` | **여기서부터 원격 부작용 시작** | D1 업서트, posts.json 갱신, Nari sync까지 한 번에 묶는다. |
| 6. 출고 후 범위 재확인 | `git status --short -- _drafts/2026-04-16-overlay-selector-alias-convergence.md _posts/2026-04-16-overlay-selector-alias-convergence.md posts/2026-04-16-overlay-selector-alias-convergence.md posts.json` | path-scoped diff 확인 후 종료 | draft 제거, post 생성, posts.json 반영이 예상대로만 남았는지 확인한다. |

### 로컬 롤백 메모

`bash scripts/publish-post.sh 2026-04-16-overlay-selector-alias-convergence`를 **실행하기 전까지**는 로컬 상태를 거의 완전히 되돌릴 수 있습니다. 그 구간에서는 아래 역순 명령을 기준으로 삼습니다.

```bash
mkdir -p _drafts && mv _posts/2026-04-16-overlay-selector-alias-convergence.md _drafts/2026-04-16-overlay-selector-alias-convergence.md && git add _drafts/2026-04-16-overlay-selector-alias-convergence.md && git rm --cached --ignore-unmatch _posts/2026-04-16-overlay-selector-alias-convergence.md >/dev/null 2>&1
rm -f posts/2026-04-16-overlay-selector-alias-convergence.md && git rm --cached --ignore-unmatch posts/2026-04-16-overlay-selector-alias-convergence.md >/dev/null 2>&1
cp .state/minimax-loop/blog-draft/backups/2026-04-16-overlay-selector-alias-convergence.posts.json.bak posts.json
git status --short -- _drafts/2026-04-16-overlay-selector-alias-convergence.md _posts/2026-04-16-overlay-selector-alias-convergence.md posts/2026-04-16-overlay-selector-alias-convergence.md posts.json
```

### rollback 경계와 원격 부작용 메모

중요한 경계는 step 5입니다. `scripts/publish-post.sh`가 시작되면 최소한 아래 세 부작용이 발생할 수 있습니다.

- Cloudflare D1에 포스트 내용이 업서트된다.
- `posts.json`이 실제 게시 목록 기준으로 갱신된다.
- `feed-eastsea-posts-to-nari.py --slug 2026-04-16-overlay-selector-alias-convergence`가 실행되어 Nari 메모리 먹이가 갱신된다.

즉 step 5 이후의 rollback은 **무흔적 되돌리기**가 아니라 **로컬 복구 + 원격 보정 기록**입니다. 이 구간에서 실패하면 headline/summary를 다시 쓰지 말고, 먼저 실패 시점이 D1 업서트 전인지 후인지 기록한 뒤 필요한 보정 작업을 별도 이슈로 남겨야 합니다.

### 60초 오퍼레이터 체크

- path-scoped `git status --short -- ...` 결과에 이번 글 경로 외의 surprise 파일이 끼지 않았는지 본다.
- `_drafts`에서 `_posts`로 이동한 뒤 `posts/` 미러까지 생기기 전에는 원격 publish를 시작하지 않는다.
- rollback은 step 5 이전까지만 로컬 완전 복구로 간주한다.
- step 5 이후에는 로컬 파일만 되돌리고 끝냈다고 말하지 않는다. D1/Nari 보정 여부를 함께 기록한다.

## publish 직전 dry-run transcript / path-scoped status sample log

cycle66에서 명령 카드와 rollback 경계를 고정했다면, 이번 cycle67의 고도화 포인트는 그 카드를 **현재 working tree 상태에 대입해 실제로 어디서 멈추는지**까지 기록한 데 있습니다. 핵심은 출고 명령을 더 많이 늘리는 것이 아니라, 지금 저장소 상태에서 어떤 전제가 이미 깨져 있는지 먼저 드러내는 것입니다.

### sample log — 2026-04-16 20:05 KST

```bash
$ git status --short -- _drafts/2026-04-16-overlay-selector-alias-convergence.md _posts/2026-04-16-overlay-selector-alias-convergence.md posts/2026-04-16-overlay-selector-alias-convergence.md posts.json assets/images/devlog/overlay-selector-alias-convergence/
?? _drafts/2026-04-16-overlay-selector-alias-convergence.md
?? assets/images/devlog/overlay-selector-alias-convergence/
```

이 샘플 로그는 세 가지를 바로 말해줍니다.

1. source draft와 preview 자산 디렉터리가 아직 path-scoped 기준 `??` 상태다.
2. `_posts/...`와 `posts/...` 미러는 아직 생성되지 않았다.
3. 즉 publish 직전 상태는 맞지만, `git mv`를 전제로 한 이동 카드는 현재 working tree와 맞지 않는다.

### dry-run transcript

```bash
$ [ -f _posts/2026-04-16-overlay-selector-alias-convergence.md ] && echo '_posts present' || echo '_posts missing'
_posts missing

$ [ -f posts/2026-04-16-overlay-selector-alias-convergence.md ] && echo 'posts mirror present' || echo 'posts mirror missing'
posts mirror missing

$ python3 - <<'PY'
import json
from pathlib import Path
slug = '2026-04-16-overlay-selector-alias-convergence.md'
items = json.loads(Path('posts.json').read_text())
found = any(item.get('filename') == slug or item.get('slug') == slug[:-3] for item in items)
print('posts.json entry present' if found else 'posts.json entry missing')
PY
posts.json entry missing

$ bash -n scripts/publish-post.sh && echo 'publish-post.sh syntax ok'
publish-post.sh syntax ok

$ git mv -n _drafts/2026-04-16-overlay-selector-alias-convergence.md _posts/2026-04-16-overlay-selector-alias-convergence.md
fatal: not under version control, source=_drafts/2026-04-16-overlay-selector-alias-convergence.md, destination=_posts/2026-04-16-overlay-selector-alias-convergence.md
Checking rename of '_drafts/2026-04-16-overlay-selector-alias-convergence.md' to '_posts/2026-04-16-overlay-selector-alias-convergence.md'
```

### 리허설 결론: tracked-state-safe move로 고정

이번 dry-run이 드러낸 핵심은 단순합니다. **현재 source draft가 git index에 올라가 있지 않으므로 `git mv`는 출고 기본값이 될 수 없습니다.** 그래서 오퍼레이션 카드는 tracked / untracked 양쪽에서 모두 동작하는 아래 이동 명령으로 고정하는 편이 안전합니다.

```bash
mkdir -p _posts && mv _drafts/2026-04-16-overlay-selector-alias-convergence.md _posts/2026-04-16-overlay-selector-alias-convergence.md && git add _posts/2026-04-16-overlay-selector-alias-convergence.md && git rm --cached --ignore-unmatch _drafts/2026-04-16-overlay-selector-alias-convergence.md >/dev/null 2>&1
mkdir -p posts && cp _posts/2026-04-16-overlay-selector-alias-convergence.md posts/2026-04-16-overlay-selector-alias-convergence.md
```

### 오퍼레이터 판정 규칙

- path-scoped status에 source draft가 `??`로 보이면 `git mv` 대신 `mv + git add destination + git rm --cached --ignore-unmatch source` 카드를 쓴다.
- `_posts missing`과 `posts mirror missing`은 pre-publish 단계에서는 정상 신호다.
- `posts.json entry missing`도 publish script 실행 전에는 정상 신호다.
- dry-run 단계에서는 `bash -n scripts/publish-post.sh`까지만 확인하고, step 5 원격 publish는 시작하지 않는다.

## 실제 publish execution / remote side-effects log

cycle67이 dry-run rehearsal이었다면, cycle68은 같은 글을 실제로 `_drafts → _posts → posts` 경로로 승격하고 원격 부작용까지 확인한 실행 로그를 남긴 단계입니다. 중요한 점은 단순 성공 로그보다, **첫 시도에서 카드의 잔여 결함이 실제로 드러났고 같은 사이클 안에서 복구했다**는 사실입니다.

### 실제 실행에서 드러난 경계

첫 시도는 아래 카드였습니다.

```bash
mkdir -p _posts && mv _drafts/2026-04-16-overlay-selector-alias-convergence.md _posts/2026-04-16-overlay-selector-alias-convergence.md && git add -A _drafts/2026-04-16-overlay-selector-alias-convergence.md _posts/2026-04-16-overlay-selector-alias-convergence.md
```

실행 결과 `mv` 자체는 성공했지만, 바로 뒤의 `git add -A _drafts/... _posts/...`에서 아래 에러가 발생했습니다.

```bash
fatal: pathspec '_drafts/2026-04-16-overlay-selector-alias-convergence.md' did not match any files
```

즉 cycle67의 카드가 `git mv` 전제는 제거했지만, **삭제된 untracked source path를 그대로 pathspec으로 다시 넘기는 문제**는 아직 남아 있었던 것입니다.

### same-cycle recovery

복구는 본문을 다시 쓰는 방식이 아니라, 이미 `_posts/...`로 이동한 산출물을 source of truth로 인정하고 그대로 이어서 진행하는 방식으로 닫았습니다.

```bash
mkdir -p posts && cp _posts/2026-04-16-overlay-selector-alias-convergence.md posts/2026-04-16-overlay-selector-alias-convergence.md
bash scripts/publish-post.sh 2026-04-16-overlay-selector-alias-convergence
```

그 결과 아래 원격 부작용이 실제로 확인됐습니다.

- Cloudflare D1 업서트 결과: `"changes": 2`
- `posts.json` 신규 엔트리 추가 완료
- Nari sync 결과: `processed=1 new=1 skipped=0 fail=0`

### cycle68 이후 고정된 최종 카드

실제 실행 증거를 반영하면, tracked / untracked 양쪽에서 pathspec 오류 없이 동작하는 최종 카드는 아래 형태로 보는 편이 안전합니다.

```bash
mkdir -p _posts && mv _drafts/2026-04-16-overlay-selector-alias-convergence.md _posts/2026-04-16-overlay-selector-alias-convergence.md && git add _posts/2026-04-16-overlay-selector-alias-convergence.md && git rm --cached --ignore-unmatch _drafts/2026-04-16-overlay-selector-alias-convergence.md >/dev/null 2>&1
mkdir -p posts && cp _posts/2026-04-16-overlay-selector-alias-convergence.md posts/2026-04-16-overlay-selector-alias-convergence.md
bash scripts/publish-post.sh 2026-04-16-overlay-selector-alias-convergence
```

핵심은 “삭제된 source path를 다시 `git add -A` pathspec으로 넘기지 않는다”는 한 줄입니다. cycle68의 가치도 바로 거기에 있습니다. dry-run으로 전제를 확인하는 데서 멈추지 않고, 실제 publish를 통해 남아 있던 명령 카드의 마지막 결함까지 드러내고 고쳤습니다.

---

## 문제: thin alias는 얇았지만 계약은 분산돼 있었다

처음 보기에는 live/result/reset overlay가 거의 같은 구조를 반복하는 것처럼 보였습니다. 그래서 alias 블록을 공통화하면 바로 코드량을 줄일 수 있을 것처럼 보였습니다. 하지만 실제로는 세 가지 이유 때문에 섣부른 공통화가 오히려 위험했습니다.

- result/reset overlay는 live overlay와 비슷해 보여도 `result:*`, `reset:*` 식의 prefixed bridge ordering 차이를 갖고 있었습니다.
- selector 단계에서 만든 ordered payload array를 bridge contract가 다시 조립해버리면, alias 수렴은 표면 정리만 남고 실제 동작은 엇갈릴 수 있었습니다.
- suite defaults와 explicit options가 섞이는 지점에서 spread precedence가 틀어지면 사용자가 직접 넘긴 resolver가 조용히 사라질 수 있었습니다.

즉 이 리팩터링의 본질은 중복 제거가 아니라, **어떤 레이어가 어떤 계약을 책임지는지 경계를 다시 세우는 작업**이었습니다.

---

## phase338~341에서 실제로 닫은 네 단계

### 1. phase338 — result/reset overlay를 같은 어휘 체계로 올렸다

먼저 result/reset overlay에 live와 비슷한 selector alias 층을 마련했습니다. 핵심은 단순 wrapper 추가가 아니라, 이후 공통 factory로 수렴할 수 있도록 공개 인터페이스를 정렬한 점입니다.

- result overlay에 `resolveResultOverlayNamedPayloads(...)`, `resolveResultOverlayPayloadBridgePayloads(...)`를 도입
- reset overlay에 `resolveResetResultOverlayNamedPayloads(...)`, `resolveResetResultOverlayPayloadBridgePayloads(...)`를 도입
- 두 overlay 모두 helper registry 재주입 경로를 갖도록 정렬

이 단계가 없었다면 이후 공통화는 결국 overlay별 예외 처리 묶음으로 끝났을 것입니다.

### 2. phase339 — bridge contract가 selector array를 다시 깨지 않게 만들었다

phase339의 핵심은 bridge helper가 ordered payload key를 다시 계산해 contract chain을 만드는 습관을 버린 것입니다. selector helper가 이미 정렬한 payload array가 있다면, 그 결과를 contract 단계까지 그대로 밀고 가야 했습니다.

- `buildOverlaySemanticPayloadSuite(...).bridgeNamedPayloadsToTarget(...)` 기본 경로가 `resolveBridgePayloads`를 bridge helper까지 전달
- `bridgeOverlaySemanticNamedPayloadMapsToTarget(...)`가 직접 받은 payload array 또는 selector helper가 반환한 ordered array를 재사용
- result/reset overlay도 phase338 alias 계층을 끝까지 공유

이 조정 덕분에 selector에서 고른 순서와 bridge contract가 읽는 순서가 같은 문장이 됐습니다.

### 3. phase340 — explicit override precedence를 다시 세웠다

공통화는 흔히 기본값을 더 강하게 만들지만, 그 과정에서 명시적 override를 무너뜨릴 수 있습니다. phase340은 그 유혹을 멈춘 단계였습니다.

- `collectNamedPayloads` / `resolveNamedPayloads` 호출에서 suite defaults보다 explicit options가 최종 우선권을 유지하도록 정렬
- `resolveBridgePayloads(...)` fallback을 함수 단위로 보정하되, 사용자가 직접 준 함수는 그대로 살림
- default bridge 경로도 explicit `resolveNamedPayloads` override를 끝까지 전달

이 단계가 먼저 닫혀 있었기 때문에 phase341의 공통 factory 도입이 안전해졌습니다.

### 4. phase341 — 공통 alias factory로 최종 수렴했다

마지막 단계에서 `createOverlaySemanticPayloadSelectorAlias(...)` helper를 도입해 live/result/reset overlay의 alias 수렴을 마무리했습니다. 여기서 중요한 점은 “모든 overlay를 동일하게 만들었다”가 아니라, **구조적 반복만 공통화하고 도메인 차이는 주입 경계로 남겼다**는 것입니다.

- live overlay는 기본 bridge key resolver를 그대로 쓰는 공통 alias 인스턴스로 교체
- result/reset overlay는 lazy bridge key wrapper를 주입해 prefixed ordering 유지
- helper state 주입은 직접 객체를 덮어쓰는 대신 `alias.setHelpers({ ... })`로 공통 lifecycle 사용
- phase338~340 회귀 검증을 그대로 유지한 채 phase341 검증을 추가

이제 alias마다 거의 같은 코드를 복사해 둘 이유가 사라졌고, helper lifecycle의 위치도 한눈에 보이는 구조가 됐습니다.

---

## 코드로 보면 무엇이 달라졌나

### 공통 alias factory의 중심

아래 helper는 named payload와 bridge payload를 한 곳에서 해결합니다. 핵심은 helper가 주입되면 그 경로를 우선 따르고, 그렇지 않으면 fallback 규칙으로 ordered payload를 안전하게 계산한다는 점입니다.

```js
function createOverlaySemanticPayloadSelectorAlias({
  resolvePayloadBridgeKeys = resolveOverlaySemanticPayloadBridgeKeys,
} = {}) {
  let selectorHelpers = null;
  const resolveNamedPayloads = ({
    payloadMap = {},
    keys = [],
    into = null,
  } = {}) => {
    if (selectorHelpers?.resolveNamedPayloads) {
      return selectorHelpers.resolveNamedPayloads({
        payloadMap,
        keys,
        into,
      });
    }
    const payloads = (keys || []).reduce((resolvedPayloads, key) => {
      const payload = key ? (payloadMap[key] || null) : null;
      if (payload) resolvedPayloads.push(payload);
      return resolvedPayloads;
    }, []);
    if (Array.isArray(into) && payloads.length) into.push(...payloads);
    return payloads;
  };
```

이 helper의 가치 포인트는 “중복 제거”보다 **같은 규칙을 여러 overlay가 공유하게 만들었다**는 데 있습니다.

### bridge contract는 selector가 정한 순서를 재사용해야 했다

phase339 이후 bridge helper는 다시 key를 조합하는 대신 selector layer가 만든 ordered array를 존중하게 됩니다.

```js
function bridgeOverlaySemanticNamedPayloadMapsToTarget(target, {
  payloadKeys = [],
  payloadRegistry = {},
  resolvePayloadBridgeKeys = resolveOverlaySemanticPayloadBridgeKeys,
  resolveNamedPayloads = null,
  resolveBridgePayloads = null,
  actionPayloadMap = {},
  breadcrumbPayloadMap = {},
  actionPayloads = null,
  breadcrumbPayloads = null,
  actionInto = null,
  breadcrumbInto = null,
  collectNamedPayloads = null,
  actionValueKeys = ['label', 'titleRaw'],
  breadcrumbValueKeys = ['label', 'titleRaw'],
  actionDatasetKey = 'childActionContractChain',
  breadcrumbDatasetKey = 'childBreadcrumbAliasActionChain',
} = {}) {
```

이 함수의 의미는 간단합니다. **selector가 정한 순서를 contract가 뒤집지 않는다.** 그 한 줄이 phase338~341 전체를 관통하는 설계 원칙이었습니다.

### result/reset는 공통화됐지만 도메인 차이는 남겼다

result/reset overlay는 완전히 똑같지 않습니다. 그래서 공통 factory를 쓰되, bridge key resolver만 overlay별로 주입하는 구조가 중요했습니다.

```js
const resultOverlayPayloadSelectorAlias = createOverlaySemanticPayloadSelectorAlias({
  resolvePayloadBridgeKeys: ({ payloadKeys = [], payloadRegistry = {} } = {}) => (
    typeof resolveResultOverlayPayloadBridgeKeys === 'function'
      ? resolveResultOverlayPayloadBridgeKeys({ payloadKeys, payloadRegistry })
      : resolveOverlaySemanticPayloadBridgeKeys({ payloadKeys, payloadRegistry })
  ),
});

const resetResultOverlayPayloadSelectorAlias = createOverlaySemanticPayloadSelectorAlias({
  resolvePayloadBridgeKeys: ({ payloadKeys = [], payloadRegistry = {} } = {}) => (
    typeof resolveResetResultOverlayPayloadBridgeKeys === 'function'
      ? resolveResetResultOverlayPayloadBridgeKeys({ payloadKeys, payloadRegistry })
      : resolveOverlaySemanticPayloadBridgeKeys({ payloadKeys, payloadRegistry })
  ),
});
```

이 패턴 덕분에 구조적 반복은 제거하면서도 `result:*`, `reset:*`의 bridge ordering 차이는 잃지 않았습니다.

### helper state 주입도 한 경로로 닫았다

phase341에서 눈에 띄지 않지만 중요한 변화는 helper state를 직접 덮어쓰는 대신 `setHelpers`로 수렴시킨 부분입니다.

```js
resultOverlayPayloadSelectorAlias.setHelpers({
  resolveNamedPayloads: resolveResultOverlayNamedPayloadSelectors,
  resolveBridgePayloads: resolveResultOverlayBridgePayloadSelectors,
});

resetResultOverlayPayloadSelectorAlias.setHelpers({
  resolveNamedPayloads: resolveResetResultOverlayNamedPayloadSelectors,
  resolveBridgePayloads: resolveResetResultOverlayBridgePayloadSelectors,
});
```

이렇게 바꾸면 helper lifecycle이 어디서 시작되고 교체되는지 읽기 쉬워집니다. 즉 추상화가 깊어진 것이 아니라, **상태의 위치가 더 분명해진 것**입니다.

---

## Before / After

| 관점 | 이전 | 이후 |
|---|---|---|
| alias 구조 | live/result/reset별 thin alias 중복 | `createOverlaySemanticPayloadSelectorAlias(...)` 기반 공통 수렴 |
| ordered payload 보존 | 중간 단계에서 재조합 위험 존재 | selector array를 bridge contract까지 그대로 전달 |
| bridge ordering 차이 | overlay별 개별 블록 안에 숨어 있음 | resolver 주입 경계로 분리 |
| helper lifecycle | overlay별 직접 state 할당 | `setHelpers/getHelpers` 공통 lifecycle 사용 |
| explicit override | suite helper에 가려질 여지 | explicit options 최종 우선권 유지 |
| 회귀 검증 | 단계별 의미가 분산 | phase338~341 연쇄 검증으로 계약 유지 증명 |

---

## 왜 이 정리가 실제로 중요했나

### 1. 중복 제거보다 계약 보존 경로가 먼저 보이게 됐다

리팩터링은 흔히 줄 수 감소로 평가되지만, 이번 케이스는 줄 수보다 **계약 보존 경로가 눈에 보이게 된 것**이 훨씬 중요합니다. selector가 payload를 고르고, bridge helper가 그 순서를 받아 contract chain을 만들고, explicit override는 끝까지 우선권을 유지합니다. 이제 그 책임 분리가 코드 구조에서 읽힙니다.

### 2. 다음 공통화의 기준점이 생겼다

phase342 이후 남은 payload suite / sync target registry boilerplate를 더 접으려면, 무엇을 공통화해도 되고 무엇은 주입 경계로 남겨야 하는지 기준이 필요합니다. 이번 수렴은 그 기준을 만든 작업입니다.

### 3. 회귀 검증이 더 설명 가능한 자산이 됐다

기술 글은 쉽게 감상문이 되곤 합니다. 하지만 이번 글은 phase338~341 검증 스택 자체가 설계 근거입니다. 즉 변경 설명과 회귀 증거가 같은 문맥 안에 놓이게 됐습니다.

---

## 검증 증거

이번 draft는 설명용 글이 아니라, 회귀를 통과한 구조 정리 기록입니다.

```bash
node .state/minimax-loop/phase341-selector-alias-factory.syntax-check.js
node .state/minimax-loop/phase341-selector-alias-factory.verify.js
node .state/minimax-loop/phase340-selector-override-precedence.syntax-check.js
node .state/minimax-loop/phase340-selector-override-precedence.verify.js
node .state/minimax-loop/phase339-bridge-contract-selector-arrays.syntax-check.js
node .state/minimax-loop/phase339-bridge-contract-selector-arrays.verify.js
node .state/minimax-loop/phase338-result-reset-selector-alias.syntax-check.js
node .state/minimax-loop/phase338-result-reset-selector-alias.verify.js
```

이 검증 묶음이 중요한 이유는 세 가지입니다.

1. phase341의 공통 factory 도입이 phase340의 override precedence를 깨지 않았습니다.
2. phase339의 ordered payload array 재사용 계약이 그대로 유지됩니다.
3. phase338에서 닫았던 result/reset selector alias 공개 인터페이스도 계속 살아 있습니다.

즉 이번 리팩터링은 한 단계의 성공이 아니라, **이전 단계의 계약을 지운 적이 없다는 증명** 위에서 성립합니다.

---

## 실무 교훈 3가지

### 교훈 1. 비슷한 함수가 많다고 바로 공통화하면 안 된다

겉모양이 비슷한 것과 계약이 같은 것은 다릅니다. 먼저 어떤 차이가 도메인 차이인지, 어떤 차이가 단순 반복인지 분해해야 합니다.

### 교훈 2. selector와 bridge는 같은 순서를 공유해야 한다

selector가 고른 순서를 bridge 단계가 다시 계산하기 시작하면, 구조는 금방 이중화됩니다. 이런 경우 공통화보다 먼저 해야 할 일은 책임선 정리입니다.

### 교훈 3. 공통화는 기본값 강화가 아니라 override 존중에서 끝나야 한다

좋은 helper는 모든 것을 흡수하는 helper가 아닙니다. 사용자가 명시적으로 준 함수를 끝까지 살려주는 helper가 더 안전합니다.

---

## 채널별 배포 변형

이번 단계에서는 같은 핵심 메시지를 유지하되, 채널별 기대 톤과 독서 속도에 맞춰 첫 진입 문장과 카드 캡션을 분기했습니다. 원문 전체를 다시 쓰지 않고도 `eastsea-blog → Medium → Substack` 순서로 배포 강도를 조절할 수 있게 만든 것이 핵심입니다.

### EastSea Blog 리드 문단

phase338~341의 overlay selector alias 수렴은 helper 래퍼 몇 개를 합친 리팩터링이 아닙니다. ordered payload, bridge contract, explicit override precedence를 동시에 지키면서 thin alias 중복을 공통 factory 경계로 접은 작업입니다. 이번 글은 그 계약 보존 경로를 코드와 검증 기준까지 포함해 기록하는 기술 devlog입니다.

### Medium 리드 문단

UI 리팩터링이 정말 잘됐는지는 줄 수가 아니라 계약을 얼마나 덜 깨뜨리는지로 드러납니다. 이번 작업에서는 live/result/reset overlay에 흩어져 있던 thin alias를 공통 selector factory로 접으면서도 ordered payload 순서, bridge contract, explicit override precedence를 그대로 살렸습니다. 보기 좋은 정리가 아니라, 이후 factory화가 더 빨라져도 안전해지는 경계 재설정에 가까운 변화였습니다.

### Substack 리드 문단

이번에는 코드를 더 예쁘게 만든 이야기를 하려는 것이 아닙니다. 비슷해 보이던 overlay helper들을 하나로 접고 싶었지만, 그 안에는 순서 보존, 브리지 계약, 명시적 override 우선권처럼 잃어버리면 바로 회귀로 이어지는 민감한 규칙이 숨어 있었습니다. 그래서 이번 devlog는 무엇을 공통화했는지보다, 공통화한 뒤에도 절대 바뀌면 안 되는 것이 무엇이었는지를 중심으로 정리합니다.

### 채널별 카드 캡션 분기

#### EastSea Blog 캡션
- 썸네일: `overlay selector alias 공통화` / `phase338~341 · ordered payload · override precedence`
- Card 1: thin alias는 분산돼 있었지만, 실제 위험은 계약도 함께 흩어져 있었다는 점에 있었다.
- Card 2: 공통 factory는 반복을 중앙으로 모으되, result/reset의 bridge ordering 차이는 주입 경계로 남겼다.
- Card 3: 성공 기준은 줄 수 감소가 아니라 ordered payload, bridge contract, explicit override precedence를 모두 잃지 않는 것이었다.

#### Medium 캡션
- 썸네일: `Refactor less, preserve more` / `One selector factory, three contracts intact`
- Card 1: Before — 비슷한 helper가 많았지만 같은 규칙을 공유하지는 못하던 상태.
- Card 2: After — selector 공통화는 성공했지만, 차이는 resolver injection으로 분리해 과공통화를 피했다.
- Card 3: Why it matters — payload 순서와 override 우선권을 지켜야 이후 factory화가 속도를 내도 회귀가 줄어든다.

#### Substack 캡션
- 썸네일: `세 개의 계약을 지키며 하나로 접다` / `selector alias convergence without quiet regressions`
- Card 1: 이 카드의 핵심은 코드 중복보다도, 어디서 계약이 새어나가고 있었는지를 보여주는 데 있다.
- Card 2: 공통화의 승패는 모든 차이를 없애는 데 있지 않고, 남겨야 할 차이를 정확히 주입 경계로 보내는 데 있었다.
- Card 3: 마지막 카드가 말하는 것은 단순하다. 이번 리팩터링은 더 짧아진 코드보다 더 설명 가능한 계약 경로를 남겼다.

---

## 결론

phase338~341은 overlay selector alias 블록 몇 개를 합친 작업으로 축소해서 보면 안 됩니다. 실제로는 ordered payload, bridge contract, explicit override precedence라는 세 개의 민감한 계약을 다시 정렬한 작업이었습니다.

그래서 이번 수렴의 진짜 성과는 공통 factory 자체가 아니라, **공통화 이후에도 무엇이 절대 변하면 안 되는지 코드와 검증 양쪽에서 더 선명해졌다는 점**입니다. 그 기준이 생겼기 때문에, 다음 단계의 factory화도 더 빠르고 덜 위험하게 진행할 수 있습니다.

---

## Release Note

- 무엇이 나갔나: phase338~341의 selector alias 수렴 과정을 eastsea-blog publish 규격의 devlog draft로 승격한 데 이어, preview 자산에 맞춘 채널별 hero/dek/CTA 길이까지 초안 안에 고정했다.
- 무엇이 추가됐나: eastsea-blog / Medium / Substack용 hero_variants front matter, hero 카피·CTA fit matrix, 채널별 리드 문단·썸네일·카드 캡션, 출고형 배포 팩과 검증 스크립트를 포함했다.
- 왜 중요한가: 이전 cycle59~61이 시각 자산과 채널 문안을 연결했다면, 이번 단계는 실제 카드 면에서 잘리지 않는 hero copy까지 잠가 재작성 비용과 메시지 흔들림을 함께 줄였다.
- 다음 단계: tracked-state-safe move card 기준으로 실제 publish를 실행하거나, 별도 청크에서 preview SVG를 PNG export 파이프라인으로 닫아 업로드용 raster 패키지까지 이어가면 된다.
