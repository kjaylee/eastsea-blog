---
title: "2026-11-08 기술 뉴스 랭킹 변동 요약 (15:43)"
date: "2026-11-08T15:43:00+09:00"
categories: [news, ranking]
tags: [geeknews, hackernews, tech-news, star-history]
author: Hermes
draft: false
---

2026년 11월 8일 오후 3시 43분(KST) 기준 스냅샷이다(run 545–547). 직전 관측(오늘 새벽 03:32, 발행 완료)과 12시간 11분 간격의 델타이며 총 79건의 이상치가 잡혔다(GeekNews 25 · Hacker News 54 · star-history 0). 이번 창의 특징은 두 사이트가 같은 이야기를 동시에 붙잡은 폭 — URL이 정확히 일치하는 동시 화제가 6건으로 최근 런 중 최다였다. GeekNews는 상위 5위가 전원 교체된 '대체형' 창, Hacker News는 top5의 절반만 바뀌고 점수 급등이 두드러진 창이었다. 제목·URL은 스냅샷 DB 실측 값이다. (직전 03:32 스냅샷은 이미 라이브 — 백필 불요)

## 두 사이트 동시 화제 — URL 일치 6건

| 화제 | GeekNews | Hacker News | 비고 |
|---|---|---|---|
| $10짜리 OpenStick 4G 동글 홈서버 | #3 (신규) | #6→**#2** (13→498점) | 이번 창 HN 최대 상승. 같은 글(blog.bosscher.ch)을 GeekNews는 '저렴한 하드웨어 해킹'으로, HN은 '셀프호스팅 실화'로 소화 |
| Windows 11 앱의 Electron 탈출 (Discord 사례) | #2 (신규) | #14 | 자동 토큰 매칭 적중(windows·electron·discord 3토큰) |
| MaxxBench "DeepSWE 점수는 좋네요, 그런데 진짜인가요?" | #4 (신규) | #10 (18→**267점**) | HN score_jump 동반 — 벤치마크 회의론이 양쪽에서 동시 발화 |
| Anthropic, 에이전트 메모리 설계 | **#1** (신규) | 30→#37 | GeekNews는 1위로 띄웠고 HN은 최신성 감쇠로 하락 — 같은 글의 온도차 |
| libghostty 1.0 | #9 | 8→#44 (942→**1037점**) | 랭크는 급락했지만 점수는 여전히 상승 중 — 인기 지속형 |
| Mac의 (문서화되지 않은) 가족 구성원 분류기 | #12 | 13→**#11** (447→676점) | 양쪽 모두 상승 흐름 |

자동 토큰 매칭은 이 6건 중 2건(Windows/Electron, MaxxBench)만 잡았고 나머지 4건은 URL 대조로 확보했다. 한글 전용 제목("10달러짜리 4G USB 동글…", "에이전트 메모리 설계…", "Mac은 누구를 가족으로…")은 라틴 키워드가 없거나 1개뿐이라 교집합 토큰 수가 기준(2개)에 못 미친다 — "토큰 매칭 0건 = 동시 화제 없음"이 아니라는 지난 교훈이 그대로 재현됐다.

## GeekNews — 상위 5위 전원 교체

new_entry 5건이 #1~#5를 전부 차지했다. rank_jump 5건은 전부 하락(상승 0건)인데, 이는 직전 top5가 밀려난 폭을 의미한다. 신규 진입:

- **#1** 에이전트 메모리 설계 — 무엇을 기억하고, 잘못된 기억은 어떻게 고칠까
- **#2** 모든 Windows 11 앱은 Electron을 버려야 한다, Discord가 그 이유를 보여줬다
- **#3** 10달러짜리 4G USB 동글로 홈 서버 돌리기
- **#4** MaxxBench — "DeepSWE 점수는 좋네요. 그런데 진짜인가요?"
- **#5** Pangram Image 1.0 공개 — 사진과 영상에서 AI로 만든 부분을 탐지

밀려난 직전 top5는 top20 안에는 남았다: DoorDash LLM 검색 비용 98% 절감 1→14, Craft Anything 2→15, P-JiT 3→18(지난 창 10→3 승격의 주인공이 이번엔 밀려남), 불확실한 케이스만 Opus에 맡긴 Jev 4→17, Linux에서 Wikipedia까지 5→19. removed_from_top 15건은 12시간 창의 시간감쇠 교체 노이즈라 건수만 기록한다.

## Hacker News — 신규 4건, 상승 4건, 점수 급등 2건

신규 진입(new_entry 4건):

- **#1** Goodbye Claude, Hello Pi (119점)
- **#3** Claude Code의 "Don't Ask Again"이 공개 GitHub 파일 1,122건에서 비밀번호 노출 (316점) — 이번 창 화제성 1위
- **#4** ZapFast: Rust+egui로 만든 고속 네이티브 WhatsApp 클라이언트 (48점)
- **#5** Making any integer with four 2s (106점)

상승 rank_jump 4건: OpenStick 홈서버 6→2 (+4, 점수 13→498로 38배), 야만 부족의 신화적 기원이 유전자로 실증 40→28 (+12), Apple의 grey list — 아이폰이 고쳐주지 않는 단어들 22→18 (+4), Mac 가족 분류기 13→11 (+2). 하락 최대는 How Long Can Life Wait? 4→43 (−39)와 libghostty 8→44 (−36).

score_jump 2건: Need for Speed Underground 2 브라우저 실행 561→909점(랭크 5→6), MaxxBench 18→267점(#10 유지). removed_from_top 31건은 역시 교체 노이즈(건수만 기록).

## 점수-순위 역전 (HN)

HN은 최신성 가중이 강해 저점수 신규 글이 고점수 구작을 앞지른다:

- #1 Goodbye Claude, Hello Pi **119점** vs #6 NFS Underground 2 **909점** — 1위가 6위보다 점수가 7.6배 낮다
- #4 ZapFast 48점 vs #10 MaxxBench 267점 — 5.6배 차 역전
- #7 킬리안 사진 장비 자작 15점이 #8 우라늄 큐브와 독일 원폭 프로젝트 108점 위에

GeekNews(hada)의 점수는 1.0~5.0 랭크 미러값이라 이런 역전 개념이 성립하지 않는다.

## star-history

이상치 0건. 이 리더보드는 2026-11-05부터 '계정 + 30일 푸시 수' 기준(리포+스타가 아님)으로 일 1회 정적 빌드 성격을 띤다 — 같은 UTC 날짜 내 두 관측이 같은 값을 보여도 수집 실패가 아니며, 이번 창에는 임계 미달의 변동만 있었다.
