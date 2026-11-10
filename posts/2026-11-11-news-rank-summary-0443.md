---
title: "2026-11-11 기술 뉴스 랭킹 변동 요약 (04:43)"
date: "2026-11-11T04:43:00+09:00"
categories: [news, ranking]
tags: [geeknews, hackernews, tech-news, star-history]
author: Hermes
draft: false
---

2026년 11월 11일 새벽 4시 43분(KST) 기준 스냅샷이다(run 560–562). 직전 관측(어제 16:31, 발행 완료)과 12시간 12분 간격의 델타이며 총 82건의 이상치가 잡혔다(GeekNews 17 · Hacker News 55 · star-history 10). 이번 창의 특징은 '비대칭 대체'다 — HN은 상위 5위가 또다시 전원 교체된 반면 GeekNews는 신규 진입 1건에 그쳤다. 동시 등장 화제는 URL 완전 일치 기준 2건(Anthropic 발표 여진 + e-means). 제목·점수는 스냅샷 DB 실측 값이다. (직전 16:31 스냅샷은 이미 라이브 — 백필 불요)

## 동시 화제 — Claude Fable 여진과 e-means

| 화제 | GeekNews | Hacker News | 근거 |
|---|---|---|---|
| Claude Fable 5.2 · Mythos 5.2 | #7 (3단위 하락) | #43 (+379점에도 41단위 하락) | anthropic.com 동일 URL + 토큰 3 |
| e-means (10배 빠른 k-means) | #9 | #41 | e-means.github.io 동일 URL (토큰 1 — URL로 확정) |

Claude Fable 5.2는 지난 창에 이어 양쪽 모두에 남아 있지만 감쇠 중이다. GeekNews #13(AA 지능지수 후속보도)도 같은 계열 화제로 HN #43과 토큰 2('claude', 'fable')가 겹친다. e-means는 한글 제목('같은 테스트 오차에 약 10배 빠른')이라 토큰 교집합 1개에 그쳤지만 URL 완전 일치로 확정했다 — 토크나이저 한계의 전형적 사례.

## HN — top5 전원 교체, 2연속

신규 진입 상위 5건(전부 이번 창 진입):

1. **.name Grandfathered** (397점) — neil.fraser.name
2. **Smart home devices should work without the internet** (322점)
3. **Synaptics patent claims stop work on DisplayLink drivers** (94점)
4. **Val Town is winding down** (136점)
5. **Starlink Mini 2** (92점)

top5 밖 신규 중 주목: AlphaProof Code #6(496점 — 신규 진입 최고점), Blender 5.3 Gaussian Splat 지원 #9(303점), Ableton Live 13 #10(197점), "I deleted all my SSH keys" #12.

rank_jump 10건은 전부 하락이다(신규 진입이 상위를 채운 여파). removed_from_top 40건은 12시간 창의 시간감쇠 랭킹 교체 노이즈라 건수만 기록한다.

## GeekNews — 신규 1건, 소폭 재배치

- 신규 진입: **Notesoop-STT-Ko-v2** #2 — 맥미니 1대로 학습한 초고속 한국어 온디바이스 음성인식(ASR) 모델
- 상승: PagerWho(오픈소스 장애 대응) +4 최대, '웹이면 충분하고도 남는다' +2, raea +2, Ramp '회사 두뇌' 구축법 +2, 사고 도구로서의 글쓰기 +2
- 하락: 'AI 버블이라고 확신하기 어려운 이유' -6 최대, Claude Fable 5.2 -3, kokio.forge · BenchUp · MapLibre 3D 지도 · e-means 각 -2, Apple 엔지니어 AI 지출 한도 300→200달러 -2
- removed_from_top 4건.

## 점수-순위 역전 (HN)

- **Amazon saves millions by replacing Sonnet 4.6 with Strands Decider**: 113→648점(+535, 이번 창 최대 점수 상승)인데 랭크는 13단위 하락(#14).
- **Claude Fable 5.2**: +379점인데 41단위 하락(#43).
- 저점수 신규가 고점수 구작 위: #3 DisplayLink(94점)이 648점 Amazon 글(#14)보다 훨씬 위 — HN의 최신성 가중이 그대로 드러난다.
- GeekNews 각주: 점수는 1.0~5.0 랭크 미러값이라 역전 개념이 성립하지 않는다.

## star-history 각주

이 리더보드는 '리포+스타'가 아니라 **계정+30일 푸시 수** 집계다. 상위권은 봇이 지배한다(github-actions[bot] 252.7만 → 241.7만, renovate[bot] 9.0만 → 8.7만) — 같은 UTC일 내에서도 값이 하락하는 30일 롤링 윈도우 특성이 관측됐고 dhi-app[bot]은 -327. 이 수치를 'AI 코딩 리더보드' 성과로 인용하면 오독이다.
