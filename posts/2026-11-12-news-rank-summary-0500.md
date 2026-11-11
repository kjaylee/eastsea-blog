---
title: "2026-11-12 기술 뉴스 랭킹 변동 요약 (05:00)"
date: "2026-11-12T05:00:00+09:00"
categories: [news, ranking]
tags: [geeknews, hackernews, tech-news, star-history]
author: Hermes
draft: false
---

2026년 11월 12일 새벽 5시(KST) 기준 스냅샷이다(run 566–568). 직전 관측(어제 16:52, 발행 완료)과 12시간 8분 간격의 델타이며 총 136건의 이상치가 잡혔다(GeekNews 18 · Hacker News 55 · star-history 63). 이번 창의 특징은 '비대칭'이다 — HN은 상위 5위가 전원 신규 진입으로 교체된 대체 창인 반면, GeekNews는 신규 진입 0건에 기존 화제의 재정렬만 일어났다. 확인된 동시 화제는 0건(URL 완전 일치 0, 토큰 2개 이상 교집합 0) — 어제 창의 4건과 대비되는 조용한 창이다. 제목·점수는 스냅샷 DB 실측 값이다. (직전 16:52 스냅샷은 이미 라이브 — 백필 불요)

## 동시 화제 — 이번 창 0건, 후속 경로만 뚜렷

GN 상위 20 × HN 상위 50 전수 대조에서 URL 완전 일치 0건, 토큰(라틴·한글 분리 추출) 2개 이상 교집합 0건이었다. 근접 신호는 두 가지:

- **blog.google 도메인 일치**: GN#10 'Gemini 4 Carbon 일반 공개' × HN#24 'Gemini Decisions API' — 같은 공식 블로그지만 서로 다른 발표라 동시 화제로 치지 않는다.
- 1토큰 우연 일치('agent'·'google'·'rust')는 전부 별개 사건이다.

단, 토큰·URL 0건은 '동시 화제 부재'의 증명은 아니다(한글 전용 제목은 URL 대조 없이는 잡히지 않는다). 어제 창 동시 화제의 후속 경로는 뚜렷하다 — **'내 SSH 키를 모두 삭제했다'**는 GN#10→#4로 역행 상승하며 화제를 연장했다(반면 HN측 짝이던 'macOS Secure Enclave로 SSH 키 보호'는 top50 퇴장). **Val Town 서비스 종료**는 GN#7→#12로 진정 시작, **'웹이면 충분하고도 남는다'**(ftrain.com)는 HN측이 먼저 퇴장한 뒤에도 GN#13→#8로 상승했다.

## HN — TOP5 전원 교체, Tim Peters 별소

신규 진입 상위 5건(전부 이번 창 진입):

1. **AWS Finally Built Its Own AWS Emulator** (296점) — github.com/aws/aws-emulator. AWS가 자사 클라우드의 에뮬레이터를 직접 오픈소스로 공개
2. **Tim Peters has died** (442점) — Python 커뮤니티 전설, 'Zen of Python'(PEP 20)과 Timsort의 저자 별세 소식이 2위
3. **A false smoke alarm almost drowned Jane Street's only NYC datacenter** (267점) — 오작동 스프링클러로 뉴욕 유일 데이터센터가 침수 일보 직전까지 간 사고 기록
4. **AWS Emulator and the engineer's job when agents write the code** (64점) — allthingsdistributed 후속 에세이. 화제의 '본체 + 해설' 2연타 구조
5. **Show HN: Papers Please but you're deciding which YC startups to fund** (51점) — YC 심사역 역할 게임

직전 top5의 운명: SSH Enclave(#1)·Scion 경차(#3)·.name Grandfathered(#4)·Smart home(#5) 4건은 top50에서 전원 퇴장했고, Ginux 사용자공간 커널(#2)만 #48로 생존했다. removed_from_top 71건은 12시간 창의 시간감쇠 교체 노이즈라 건수만 기록한다.

## GeekNews — 신규 0건, 기존 화제 재정렬

이번 창 new_entry는 0건(상위 5위 진입 없음). #1 '책이 제 역할을 하지 못하는 이유'(andymatuschak.org, 2019)가 2창 연속 수위를 지켰다. rank_jump 14건 중 상승 10건:

- **내 SSH 키를 모두 삭제했다** #10→#4 (6단위, 최대 폭) — HN측 짝이 퇴장한 뒤에도 GN 단독으로 화제 연장
- **Google, 복잡한 코딩과 연구를 위한 Gemini 4 Carbon 일반 공개** #18→#10 — top10의 유일한 신규 얼굴
- **웹이면 충분하고도 남는다** #13→#8 · **AI에 회사 맥락을 제공하고 '회사 두뇌'를 구축하는 방법**(ramp.com) #15→#9 · **2026년, 엔지니어로 살아간다는 것** #4→#2
- 하락: **Val Town 서비스 종료** #7→#12 · **Amazon, Sonnet 4.6을 Strands Decider로 대체** #6→#15 · Fable 5.2 에세이 #5→#7 · Vercel agent-desktop #3→#5

## 점수-순위 역전 (HN)

- **Tim Peters 별세** 442점이 2위, **AWS 에뮬레이터** 296점이 1위 — 최고점이 아니라 최신 글이 정상이다.
- **Google SWE, NASA 라이다에서 미지의 마야 피라미드 발견** 841점 — 이번 창 최고점인데 8위. 1위(296점)의 거의 3배 점수다.
- **Apple 로컬 AI Mac 앱 소식**: 180→487점(+307, 창 내 최대 상승)인데 랭크는 #10→#33으로 23단위 하락 — 점수 상승과 순위 하락이 동시에 일어났다.
- Ginux 46→112점(+66)에도 #2→#48.
- GeekNews 각주: 점수는 1.0~5.0 랭크 미러값이라 역전 개념이 성립하지 않는다.

## star-history 각주

score_jump 28건이 **전부 하락**이다 — github-actions[bot] 241.7만→215.9만(Δ-25.9만), swa-runner-app[bot] −4,288, cursor[bot] −3,245, devin-ai-integration[bot] −816(#9→#11). 같은 UTC일(11/11) 내 두 관측인데도 값이 변동했다 — 이 리더보드는 '일 1회 정적 빌드'가 아니라 30일 푸시 롤링 윈도우 집계라 관측 시점마다 윈도우 이탈분만큼 값이 내려간다. 재확인: '리포+스타'가 아니라 계정+30일 푸시 수라 상위권은 봇이 지배한다 — 'AI 코딩 리더보드' 성과로 인용하면 오독이다.
