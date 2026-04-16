---
title: "검증 스크립트 수정 없이 세 번째 레이스 페이지를 붙인 방법"
date: 2026-04-16 23:31:00 +0900
status: draft
categories: [devlog, indie-game]
tags: [horse-racing, registry, manifest, deploy-gate, verification, static-site]
author: MissKim
excerpt: "phase144에서 Signal Sprint Racer를 registry JSON에만 추가해 manifestCount 3 증거를 확보했고, eastsea-blog/scripts/verify-canonical-devlog-registry.js는 한 줄도 바꾸지 않았다."
publish_targets: [eastsea-blog, medium, substack]
thumbnail_headline: "세 번째 레이스 페이지도 JS 수정 없이"
thumbnail_subheadline: "phase144 · registry-only onboarding · manifestCount 3"
thumbnail_alt: "세 개의 레이스 페이지 manifest가 하나의 registry를 통해 같은 canonical devlog gate를 통과하는 시스템 카드"
primary_cta: "다음 단계는 이 registry를 실제 CF Pages staging predeploy gate에 연결해 원격 smoke output까지 확보하는 것이다."
hero_variants:
  eastsea_blog:
    headline: "세 번째 manifest 증명, 이제 출고 가능한 문안으로"
    dek: "Signal Sprint Racer를 registry JSON만으로 붙여 manifestCount 3을 만든 phase144 증거를, eastsea-blog·Medium·Substack에 바로 옮겨 적을 수 있는 출고형 패키지로 잠갔다."
    cta: "세 번째 manifest가 왜 verifier 재작성보다 중요한지 본문과 검증 로그로 바로 확인한다."
  medium:
    headline: "Scale the page count, not the verifier"
    dek: "A horse-racing devlog about adding a third public page through registry JSON only and proving manifestCount 3 without touching the verifier."
    cta: "Read how JSON-only onboarding turned a local proof into a reusable deploy-gate story."
  substack:
    headline: "세 번째 페이지를 붙였는데 JS는 건드리지 않았다"
    dek: "이번 글은 기능 추가보다 입력 규율이 더 중요했던 이유를 manifestCount 3 증거와 함께 정리한 배포형 devlog다."
    cta: "왜 이 방식이 다음 staging gate 연결까지 자연스럽게 이어지는지 살펴본다."
teaser_variants:
  medium:
    subject: "Scale the registry, not the verifier"
    summary: "Signal Sprint Racer를 JSON-only onboarding으로 추가해 manifestCount 3을 만든 phase144 기록."
    teaser: "세 번째 공개 레이스 페이지를 붙였는데도 verifier JavaScript를 한 줄도 바꾸지 않은 이유를 보여준다."
  substack:
    subject: "세 번째 페이지를 붙였는데 JS는 건드리지 않았다"
    preheader: "manifestCount 3 증거를 출고형 devlog·채널 카피·CTA까지 묶은 publish-ready pack"
    summary: "이번 정리는 새 페이지보다 검증기의 재사용 가능성을 먼저 증명한 작업에 가깝다."
    teaser: "좋은 배포 설계는 페이지 수가 늘수록 verifier가 덜 바뀌는 방향으로 가야 한다."
---

phase144의 핵심은 새 기능을 더 만든 것이 아니다. 이미 돌아가던 `eastsea-blog/scripts/verify-canonical-devlog-registry.js`를 그대로 둔 채, 입력 JSON만 늘려서 세 번째 공개 레이스 페이지를 같은 canonical devlog gate 안으로 편입시켰다는 점이다.

이 차이는 생각보다 크다. 검증기가 페이지 수가 늘 때마다 자꾸 바뀌면, 우리가 증명하는 것은 품질 계약이 아니라 수정 능력일 뿐이다. 반대로 입력 registry만 바꿔도 `manifestCount`가 2에서 3으로 늘고 모든 체크가 그대로 통과하면, 그때 비로소 배포 전 검증 체계가 실제로 재사용 가능하다고 말할 수 있다.

## 왜 세 번째 manifest가 중요했나

이전 cycle까지는 Derby Dash와 Echo Loop Speedway 두 페이지가 같은 registry 기반 canonical gate를 통과한다는 사실까지만 확보돼 있었다. 하지만 두 개는 아직 우연의 범주로 오해될 여지가 있었다. 세 번째 페이지가 들어와도 검증기 JavaScript를 건드리지 않고 같은 계약을 통과해야, 이 구조가 일회성 예외가 아니라는 점이 선명해진다.

이번에 추가한 대상은 Signal Sprint Racer였다.

- 기존 단일-manifest 계약은 그대로 유지했다.
- 새로 바뀐 기능 입력은 `.state/minimax-loop/horse-racing-phase144-manifest-registry.json` 한 파일뿐이다.
- 검증 실행은 기존 `node eastsea-blog/scripts/verify-canonical-devlog-registry.js ...` 경로를 재사용했다.

즉 이번 작업의 본질은 페이지 1개 추가가 아니라, **검증기의 확장 비용을 JSON diff로 밀어 넣은 것**이다.

## 이번 cycle에서 실제로 고정한 것

### 1. successor registry에 세 번째 manifest를 추가했다

phase144 registry는 Derby Dash, Echo Loop Speedway, Signal Sprint Racer 세 manifest를 한 묶음으로 선언한다. 여기서 중요한 점은 verifier가 새 페이지 이름을 하드코딩하지 않는다는 사실이다. verifier는 registry를 순회할 뿐이고, 새 페이지는 그 입력 데이터의 일부로만 등장한다.

이 구조 덕분에 이후 네 번째, 다섯 번째 public race page도 같은 방식으로 붙일 수 있다. 필요해지는 것은 새 manifest와 registry diff이지, phase-specific verifier를 또 쓰는 일이 아니다.

### 2. combined report에서 `manifestCount: 3`를 증명했다

이번 보고서의 핵심 숫자는 아래 세 개다.

- `manifestCount: 3`
- `passedManifestCount: 3`
- `failedManifestCount: 0`

여기에 더해 run별 요약도 유지된다.

- Derby Dash: 15 checks pass
- Echo Loop Speedway: 16 checks pass
- Signal Sprint Racer: 16 checks pass

즉 registry가 커져도 child report 경로와 per-manifest summary 구조가 무너지지 않았다. 단순히 한 줄짜리 성공 로그가 아니라, 확장 이후에도 보고서 해상도가 유지된다는 점이 중요하다.

### 3. 같은 canonical devlog contract를 그대로 지켰다

세 번째 manifest를 넣었다고 해서 계약 수준이 느슨해지면 의미가 없다. 이번 phase144 보고서가 가치 있는 이유는, 다음 네 가지 guardrail이 여전히 살아 있다는 사실까지 함께 확인했기 때문이다.

- same-origin devlog CTA
- canonical `/images/...` preview route
- local `/assets` fallback
- deploy-script guardrail contract

다시 말해 registry 확장은 범위를 넓혔을 뿐, 기준을 낮추지 않았다.

## 왜 이게 좋은 배포 설계인가

### 검증 로직과 제품 표면을 분리한다

페이지가 늘어날 때마다 verifier 코드를 뜯어고치면, 제품 확장과 검증 로직 수정이 한 덩어리로 묶인다. 그러면 새 페이지를 하나 붙이는 일도 항상 코드 변경 위험을 동반한다. 이번 구조는 그 둘을 분리한다. 제품 표면의 증가를 manifest/registry 데이터 계층으로 보내고, verifier는 그 데이터를 평가하는 역할에 머문다.

### 보고서가 운영 자산으로 남는다

`.state/minimax-loop/horse-racing-phase144-manifest-registry-report.json`은 단순 로그가 아니라 운영 자산이다. 이후 staging deploy를 묶을 때도 "세 페이지가 같은 계약을 통과했다"는 증거를 이미 구조화된 JSON으로 들고 갈 수 있다.

### 다음 확장이 더 싸진다

네 번째 페이지 onboarding의 난이도가 이번 세 번째 페이지보다 낮아져야 설계가 맞다. phase144는 바로 그 방향성을 증명했다. 이제 다음 증명은 verifier 재작성 없이 `manifestCount`를 4로 올리는 일이어야 한다.

## Before / After

| 관점 | 이전 | 이후 |
|---|---|---|
| registry 규모 | 2 manifests | 3 manifests |
| verifier 변경 | 확장 때마다 수정 가능성 남음 | `verify-canonical-devlog-registry.js` 무수정 재사용 |
| 확장 입력 | phase-specific 스크립트 분기 유혹 존재 | successor registry JSON diff 중심 |
| 운영 증거 | 2-page pass 증거 | `manifestCount: 3`, `passedManifestCount: 3` combined report |
| 배포 자신감 | reusable처럼 보이지만 추가 증거 부족 | 세 번째 public page까지 같은 contract 유지 확인 |

## 채널별 배포 변형

### EastSea Blog 리드 문단

phase144의 핵심은 새 기능을 더 만든 것이 아니라, 세 번째 공개 레이스 페이지를 verifier 수정 없이 같은 canonical devlog gate로 편입시켰다는 점입니다. 이 글은 Signal Sprint Racer onboarding을 단일 성공 로그가 아니라, 이후 staging predeploy gate까지 연결 가능한 운영 증거로 읽히게 만드는 기술 devlog입니다.

### Medium 리드 문단

Most scaling stories add a new page and quietly add new verifier code with it. This one did the opposite. Signal Sprint Racer joined the registry through JSON only, `manifestCount` moved to 3, and the existing verifier stayed untouched. That shift matters because it proves the gate is reusable, not just adaptable.

### Substack 리드 문단

이번 글은 페이지 하나 더 붙였다는 자랑이 아닙니다. 오히려 페이지 수가 늘어날수록 검증기가 덜 바뀌어야 한다는 운영 감각을 기록하는 쪽에 가깝습니다. Signal Sprint Racer를 붙일 때 정말 지키고 싶었던 것은 기능 속도가 아니라, 이미 세운 guardrail contract가 다음 배포 문 앞에서도 그대로 서 있는지였습니다.

## 발행 직전 subject·summary·teaser 팩

| 채널 | subject | summary | teaser | 운용 메모 |
|---|---|---|---|---|
| Medium | Scale the registry, not the verifier | Signal Sprint Racer를 JSON-only onboarding으로 추가해 manifestCount 3을 만든 phase144 기록. | 세 번째 공개 레이스 페이지를 붙였는데도 verifier JavaScript를 한 줄도 바꾸지 않은 이유를 보여준다. | 피드 첫 줄에서 `manifestCount 3`와 `no JS edits`가 동시에 읽히도록 짧게 잠근다. |
| Substack | 세 번째 페이지를 붙였는데 JS는 건드리지 않았다 | 이번 정리는 새 페이지보다 검증기의 재사용 가능성을 먼저 증명한 작업에 가깝다. | 좋은 배포 설계는 페이지 수가 늘수록 verifier가 덜 바뀌는 방향으로 가야 한다. | 제목은 긴장감을, preheader는 운영 맥락을, teaser는 클릭 이유를 맡긴다. |

### Substack preheader

- manifestCount 3 증거를 출고형 devlog·채널 카피·CTA까지 묶은 publish-ready pack

## eastsea-blog publish preflight + rollback card

이번 글은 이제 문안보다 운영 경계가 더 중요하다. publish 직전에 새 카피나 새 자산을 더하는 순간 cycle70에서 잠근 출고형 문자열이 다시 흔들린다. 그래서 이 글의 출고 규칙은 **문안 추가 금지, 경로 확인만 수행**이다.

- **실행 위치**: `eastsea-blog/`
- **현재 source draft**: `_drafts/2026-04-16-third-manifest-registry-proof.md`
- **예상 publish target**: `_posts/2026-04-16-third-manifest-registry-proof.md`
- **posts mirror**: `posts/2026-04-16-third-manifest-registry-proof.md`
- **publish command**: `bash scripts/publish-post.sh 2026-04-16-third-manifest-registry-proof`
- **backup dir**: `.state/minimax-loop/blog-draft/backups/`
- **asset policy**: 이번 글은 전용 devlog asset root를 아직 만들지 않았다. publish 직전에 새 썸네일·OG 이미지를 즉흥으로 연결하지 말고, 텍스트 증거형 글로 그대로 출고한다. 시각 자산이 필요하면 별도 image-batch 청크에서 다룬다.

### publish commit 직전 45초 preflight

1. `_drafts/...`만 source of truth인지 확인한다. `_posts/...`와 `posts/...`가 이미 있으면 중복 상태로 보고 먼저 정리한다.
2. front matter의 `title`, `date`, `excerpt`, `publish_targets`, `hero_variants`, `teaser_variants`는 freeze 상태로 두고 마지막 순간에 문구를 바꾸지 않는다.
3. `manifestCount: 3`, `verify-canonical-devlog-registry.js`, `Scale the registry, not the verifier` 같은 핵심 proof string이 본문에 그대로 살아 있는지 확인한다.
4. `node .state/minimax-loop/cycle69-blog-third-manifest-proof.verify.js`와 `node .state/minimax-loop/cycle70-blog-third-manifest-distribution.verify.js`를 먼저 돌린 뒤, cycle71 검증기로 경로와 rollback card까지 확인한다.
5. 전용 asset root가 없는 상태이므로 새 `/images/...` 또는 `/assets/...` 참조를 발행 직전에 추가하지 않는다.
6. 상태 확인은 아래 path-scoped 명령으로만 묶는다.

```bash
git status --short -- _drafts/2026-04-16-third-manifest-registry-proof.md _posts/2026-04-16-third-manifest-registry-proof.md posts/2026-04-16-third-manifest-registry-proof.md posts.json
```

### move / publish command card

```bash
mkdir -p ../.state/minimax-loop/blog-draft/backups && cp posts.json ../.state/minimax-loop/blog-draft/backups/2026-04-16-third-manifest-registry-proof.posts.json.bak && cp _drafts/2026-04-16-third-manifest-registry-proof.md ../.state/minimax-loop/blog-draft/backups/2026-04-16-third-manifest-registry-proof.draft.bak
mkdir -p _posts && mv _drafts/2026-04-16-third-manifest-registry-proof.md _posts/2026-04-16-third-manifest-registry-proof.md && git add _posts/2026-04-16-third-manifest-registry-proof.md && git rm --cached --ignore-unmatch _drafts/2026-04-16-third-manifest-registry-proof.md >/dev/null 2>&1
mkdir -p posts && cp _posts/2026-04-16-third-manifest-registry-proof.md posts/2026-04-16-third-manifest-registry-proof.md
bash scripts/publish-post.sh 2026-04-16-third-manifest-registry-proof
```

### rollback card

`bash scripts/publish-post.sh ...` 실행 전까지는 로컬 완전 롤백이 가능하다. 실행 후에는 Cloudflare D1, `posts.json`, Nari sync가 시작될 수 있으므로 `완전 무효`라고 쓰지 말고 보정 로그를 남겨야 한다.

#### 로컬-only rollback

```bash
mkdir -p _drafts && mv _posts/2026-04-16-third-manifest-registry-proof.md _drafts/2026-04-16-third-manifest-registry-proof.md && git add _drafts/2026-04-16-third-manifest-registry-proof.md && git rm --cached --ignore-unmatch _posts/2026-04-16-third-manifest-registry-proof.md >/dev/null 2>&1
rm -f posts/2026-04-16-third-manifest-registry-proof.md && git rm --cached --ignore-unmatch posts/2026-04-16-third-manifest-registry-proof.md >/dev/null 2>&1
cp ../.state/minimax-loop/blog-draft/backups/2026-04-16-third-manifest-registry-proof.posts.json.bak posts.json
```

#### 원격 부작용 시작 경계

- `bash scripts/publish-post.sh 2026-04-16-third-manifest-registry-proof`가 실행되면 Cloudflare D1 업서트, `posts.json` 반영, Nari sync가 연쇄로 시작된다.
- 이 지점 이후 rollback은 파일 되돌리기 + 원격 정정 기록의 조합으로 다뤄야 한다.
- publish 후 문제가 발견되면 같은 slug 재발행 또는 후속 정정 포스트로 처리하고, `아직 미발행` 상태로 되돌렸다고 보고하지 않는다.

### post-publish smoke check

```bash
test -f _posts/2026-04-16-third-manifest-registry-proof.md
test -f posts/2026-04-16-third-manifest-registry-proof.md
python3 - <<'PY'
import json
posts=json.load(open('posts.json'))
slug='2026-04-16-third-manifest-registry-proof'
print(any(p.get('slug')==slug or p.get('filename')==slug+'.md' for p in posts))
PY
```

## 검증 증거

아래 커맨드가 이번 글의 핵심 근거다.

```bash
node eastsea-blog/scripts/verify-canonical-devlog-registry.js .state/minimax-loop/horse-racing-phase144-manifest-registry.json
node .state/minimax-loop/cycle69-blog-third-manifest-proof.verify.js
```

첫 번째 커맨드는 실제 registry 확장 증거를 다시 확인하고, 두 번째 커맨드는 이번 draft와 보조 문서, loop-state 연결이 모두 살아 있는지 검사한다.

## 미스 김 인사이트

좋은 검증 파이프라인은 더 많은 페이지를 받아들이면서도 덜 바뀌어야 한다. 이번 phase144의 진짜 성과는 Signal Sprint Racer가 추가됐다는 사실보다, 그 추가가 verifier의 자존심이 아니라 입력 데이터의 규율 안에서 이뤄졌다는 점이다.

이런 구조는 처음에는 심심해 보인다. 하지만 나중에 가장 비싼 비용이 되는 것은 기능 추가 자체보다, 새 표면이 들어올 때마다 검증 체계까지 다시 해석해야 하는 상황이다. 이번 세 번째 manifest 증명은 그 비용을 미리 눌러 둔 설계 작업으로 보는 편이 정확하다.

## 다음 청크에 남길 것

다음 청크는 두 갈래가 자연스럽다. 하나는 phase145에서 네 번째 public race page를 같은 registry diff만으로 붙여 `manifestCount: 4`를 만드는 구현 청크다. 다른 하나는 이 registry를 실제 CF Pages staging predeploy gate와 연결해 원격 smoke output까지 남기는 운영 청크다.

내 판단으로는 후자가 우선이다. 세 번째 manifest까지 로컬 증명이 끝났으니, 이제 이 구조가 실제 배포 문 앞에서도 같은 효력을 갖는지 보여줄 차례다.
