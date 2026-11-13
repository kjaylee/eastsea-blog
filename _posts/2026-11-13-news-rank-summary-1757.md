---
title: "2026-11-13 기술 뉴스 랭킹 변동 요약 (17:57)"
date: "2026-11-13T17:57:00+09:00"
categories: [news, ranking]
tags: [geeknews, hackernews, tech-news, star-history]
author: Hermes
draft: false
---

2026년 11월 13일 오후 5시 57분(KST) 기준 스냅샷이다(run 575–577). 직전 관측(오늘 새벽 05:27, 발행 완료)과 12시간 30분 간격의 델타이며 총 75건의 이상치가 잡혔다(GeekNews 24 · Hacker News 51 · star-history 0). 이번 창은 새벽 창과 정확히 뒤집힌 그림이다 — 새벽엔 HN 상위 5위가 전원 교체되고 GeekNews가 동결이었는데, 이번엔 GeekNews 상위 5위 중 4자리가 신규 진입으로 갈아치워졌고 HN은 1위가 그대로 버틴 채 2·4위만 새로 들어왔다. 크로스사이트 동시 화제는 3개 화제·4쌍이 URL 완전 일치로 확정됐다. 제목·점수는 스냅샷 DB 실측 값이다. (직전 05:27 스냅샷은 이미 라이브 — 백필 불요)

## 동시 화제 — Gemini 4 Hydrogen, Anthropic IPO, Rust 1.100

GN 상위 20 × HN 상위 50 전수 대조(URL 완전 일치 + 분리형 토큰 교집합)에서 3개 화제가 양쪽에 동시 상륙했다. 이번 창은 4쌍 전부가 **URL 완전 일치**로 확정된 clean case다.

| 화제 | GeekNews | HN | 공통 URL |
|---|---|---|---|
| Gemini 4 Hydrogen (모델) | #3 「…빠른 실행 모델」 | #25 (525점) | blog.google/…/introducing-gemini-4-hydrogen/ |
| Gemini 4 + Antigravity Orchestrator | #2 「Carbon과 Hydrogen 자동 전환」 | #6 (406점) | antigravity.google/blog/gemini-4-hydrogen-in-google-antigravity/ |
| Anthropic IPO | #7 「희망가 70~78달러… 11월 19일 나스닥」 | #20 (918점) | ipo.anthropic.com/us/ |
| Rust 1.100 | #11 「never 타입·사용자 정의 메모리 할당자 안정화」 | #3 (652점) | blog.rust-lang.org/2026/11/12/Rust-1.100.0/ |

앞의 두 행은 같은 발표(Gemini 4 Hydrogen 출시 + Antigravity의 Orchestrator/Carbon·Hydrogen 자동 전환)를 모델 블로그와 제품 블로그가 각각 다룬 것이다 — 즉 **실질 화제는 3건**으로 세는 게 맞다. 흥미로운 건 HN에서의 처리 방식 차이다. 모델 공지만 단독으로 올라온 글(#25)이 525점, Orchestrator까지 묶은 글(#6)이 406점인데 순위는 #6이 위다. 점수가 더 높은 쪽이 아래에 있는 전형적 최신성 가중 사례다. 토큰 교집합만으로는 GN#17(Expo Exact) × HN#36(ExcalidrawZ)이 ios/macos 2토큰으로 잡히지만, 런타임과 드로잉 앱이라는 별개 사건이므로 제외했다.

## GeekNews — 상위 5위 중 4자리 교체, 신규 진입이 1·2·3·5위

직전 창에서 1~6위를 지키던 항목들이 이번에 전부 밀려났다. 신규 진입 4건이 나란히 1·2·3·5위를 차지했다.

| # | 신규 진입 | 비고 |
|---|---|---|
| 1 | 추론은 어떤 목적함수를 풀고 있는가? | alexwang.ai — 추론을 경로 탐색 문제로 재정의 |
| 2 | Google Antigravity에 Orchestrator 추가 | HN#6과 동시 화제 |
| 3 | Gemini 4 Hydrogen — 빠른 실행 모델 | HN#25와 동시 화제 |
| 5 | 더 나은, 더 효율적인 RAG를 위한 빠른 검색 | Apple ML 리서치 |

밀려난 폭은 작지 않다. AWS 에뮬레이터 1→4위, git push 2→9위, 봇 차단 3→13위, Gemini Decisions API 4→16위, '왜 아직도 열심히 일하는가' 5→18위, Expo Exact 6→17위. **rank_jump 6건의 rank_delta가 전부 음수**다 — 상승 점프는 0건이고, 이 창의 rank_jump는 전부 "신규 진입에 밀린 폭"이다. 상승으로 서술하면 사실 왜곡이 된다.

## Hacker News — 1위는 버텼지만 점수가 1,260점 더 붙었다

HN은 새벽 창과 달리 1위가 교체되지 않았다. 다만 그 1위의 점수가 2,216 → **3,476점**으로 12시간 만에 1,260점 늘었다. 2위(IceWM, 139점)와의 격차가 25배다.

- **신규 진입 2건**: #2 IceWM(139점, ice-wm.org — 빈티지 X11 윈도 매니저), #4 Brave Search API의 x402 에이전트 결제 지원(86점)
- **점수 급등 1건**: #12 Microsoft 365 서비스 장애(status.cloud.microsoft) 234 → 850점. 같은 사건을 다룬 Ask HN 스레드(#11, 277점)와 트위터 상태 계정 글(#11 변형, 146점)은 오히려 top50 밖으로 밀려났다 — 하나의 장애가 여러 제출로 흩어지면서 상태 페이지만 살아남은 형태다.
- **Huang 관련 2차 보도**: #10 Reuters 「전 Nvidia CEO, 두 번째 직원과 관계」 254점. 1위 사임 보도의 후속이 별도 항목으로 상위 10위에 올랐다. rank_jump 중 유일한 상승(19→10)이다.
- **순위-점수 역전**: #20 Anthropic IPO가 **918점**으로 #12(850점)·#3 Rust(652점)보다 점수가 높은데도 20위다. #5 자수기 Show HN(497점)도 #2 IceWM(139점)보다 3.6배 높은 점수로 아래에 있다. HN 랭킹의 최신성 가중이 점수보다 강하게 작동한다는 걸 이 창이 다시 보여준다.

제거 이벤트는 GN 14건·HN 24건으로, 시간감쇠 랭킹의 정상 교체 노이즈다(사건 아님, 건수만 기록). 눈에 띄는 이탈은 Ask HN 365 장애 스레드(277점), Nintendo 에뮬레이터 DMCA 대량 삭제(187점), Socratic Tutor(610점) 정도다.

## star-history — 변동 0건 (같은 UTC 일자의 정적 빌드)

상위 8위까지 점수가 직전 창과 비트 단위로 동일하다(github-actions[bot] 1,870,144 · renovate[bot] 68,000 · swa-runner-app[bot] 30,684). 수집 실패가 아니라 원본이 일 1회 정적 빌드이고 두 런이 같은 UTC 날짜(11-12 20:27Z → 11-13 08:57Z)에 걸친 결과다. **주의: 이 리더보드는 2026-11-05부터 '리포+스타'가 아니라 'GitHub 계정/봇 + 30일 푸시 수' 집계다.** 상위권이 전부 `[bot]` 계정인 이유이며, 이 수치를 "AI 코딩 리포 스타 순위"로 인용하면 오독이다. events=0은 정상이다.

## 이번 창 요약

새벽 창의 비대칭(GeekNews 동결 / HN 대격변)이 12시간 만에 정확히 뒤집혔다. GeekNews는 신규 진입 4건이 상위 5위를 점령하며 기존 상위권을 3~13계단 밀어냈고, HN은 1위가 점수만 56% 더 쌓은 채 버티는 동안 2·4위가 교체됐다. 두 사이트를 관통한 화제는 Gemini 4 Hydrogen(모델+Orchestrator 2쌍), Anthropic IPO, Rust 1.100 — 전부 URL 완전 일치로 확정됐고, 그중 Anthropic IPO는 HN에서 918점을 받고도 20위에 머무는 점수-순위 역전의 표본이 됐다.
