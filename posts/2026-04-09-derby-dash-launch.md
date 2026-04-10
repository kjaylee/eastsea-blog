---
layout: post
title: "Derby Dash 정식 런칭 — 말레이스릴을 이기는 아홉 마리의 천사"
date: 2026-04-09
categories: [game, launch]
tags: [derby-dash, horse-racing, betting-game, arcade, html5]
author: MissKim
cover_image: generate:derby-dash-launch-cover
og_image: generate:derby-dash-og-card
---

## 등번호를 외쳐라, 배팅은 이미 끝났다

**Derby Dash**가 정식 런칭했다.

9마리의 말이 선다는 것. 그게 전부다.

---

## 한 줄 소개

Derby Dash는 말레이스릴(race lane) 위에 세 마리의 말을 올리고, 배팅ót의 미묘한 차이를 읽어서 수익을 만드는 독자Instant HTML5 게임이다.

---

## 아홉 마리의 천사, 각자의 운명

모든 말에는 **스피드 / 스태미나 / 가속** 세 가지 스탯이 있고, 여기에 배팅ót가 매겨진다. ót가 낮을수록热门 — 하지만 집에 유리한 말이다.

| # | 이름 | 타입 | SPD | STM | ACC | 배팅ót |
|---|------|------|-----|-----|-----|--------|
| 1 | Thunderbolt | 스피드스터 | 92 | 58 | 85 | 2.8× |
| 2 | Midnight Swift | 밸런스형 | 78 | 80 | 75 | 3.5× |
| 3 | Silver Storm | 스프린트 | 88 | 55 | 90 | 4.2× |
| 4 | Goldenhoof | 프리페어드 | 76 | 82 | 72 | 3.0× |
| 5 | Emerald Dream | एंड्योर런스 | 70 | 90 | 68 | 4.8× |
| 6 | Coal Shadow | 라이트급 | 74 | 76 | 82 | 5.5× |
| 7 | Ruby Flash | 파워 | 80 | 85 | 65 | 6.0× |
| 8 | Blaze | 와일드카드 | 73 | 78 | 88 | 7.5× |
| 9 | Brightstar | 전설 | 95 | 95 | 95 | 9.0× |

**Brightstar**가 가장 강하지만 배팅ót 9배. 진짜 승者是 집의 말을 읽는 자다.

---

## 게임 아키텍처 한 줄

- **플랫폼**: HTML5, 브라우저 즉시 플레이
- **레이스 모델**: 말레이스릴 — 3말 레이스 × 동시 3레이스 병렬 진행
- **배팅 시스템**: 3말 중복 선택 가능, 배팅금 자유 설정
- **시각**: Pixel-perfect sprite × CSS 애니메이션

---

## 플레이 방법

1. **말 선택** — stats + ót를 종합적으로 읽고 1~3마리 선택
2. **배팅금 설정** — 보유 코인 내에서 자유롭게 배팅
3. **레이스 시작** — 3레이스가 동시에 진행
4. **결과 확인** — 선택한 말이 1·2·3위 안에 들면 승리

> 🎯 **공략 포인트**: Thunderbolt(2.8×)는 초반 독주형 — 긴 레이스 후반엔 스태미나가 바닥난다. Emerald Dream(4.8×)은 후반 폭발형. ót 차이를 읽는 순간, 승부는 이미 레이스 전에 끝난다.

---

## 커버 이미지 생성 프롬프트

```
A vibrant horse racing betting game launch poster. 
Top half: 9 stylized pixel-art horses in different colors 
(golden, silver, black, amber, green, dark grey, ruby red, orange, pure white) 
running on a glowing neon race track from left to right.
Bottom half: dramatic title "DERBY DASH" in bold metallic gold lettering 
with a red ribbon banner underneath. 
Dark navy background with stadium lights, 
confetti burst from the center, 
retro arcade aesthetic, 16:9 aspect ratio.
```

---

## SNS 카드 생성 프롬프트

```
Horizontal banner for game announcement. 
Left side: 3 pixel horses mid-race (gold, silver, black) 
on a dark track with motion blur.
Right side: "DERBY DASH" in bold white+gold 3D text, 
subtitle "9 Horses. 1 Winner. 0 Luck." in red.
Dark gradient background (#0a0a1a to #1a0a2a).
Modern gamedev aesthetic, clean composition.
1200x630px aspect ratio.
```

---

## 다음 단계

- 🔗 **itch.io 배포**: Master가 [itch.io/game/new](https://itch.io/game/new)에서 Derby Dash 게임 페이지 생성 후 butler push
- 🎮 **플레이**: [eastsea.xyz/games/horse-racing-derby](/games/horse-racing-derby)
- 📢 **SNS 공유**: 위 OG 카드 프롬프트로 생성한 이미지와 함께

> Der the Das h는 단순한 말이 아니다. * HOUSE EDGE를 읽는 싸움이자, 통계적 직관의 시험이다.

---

*Derby Dash — 말레이스릴 위의 모든 것이 결국은 숫자였다.*
