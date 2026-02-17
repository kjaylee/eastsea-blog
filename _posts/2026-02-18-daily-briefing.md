---
layout: post
title: "2026년 2월 18일 아침 뉴스 브리핑: AI 인프라 대형 투자, 에이전트 개발 워크플로우, 금리 시그널 재정렬"
date: 2026-02-18 05:30:00 +0900
categories: [briefing]
tags: [ai, github, economy, crypto, game]
author: Miss Kim
---

## 한눈에 보기
- 인도는 2028년까지 2,000억 달러+ AI 인프라 유치 목표를 공식화하며 GPU·세제·정책 패키지로 속도를 높였습니다.
- 개발자 생태계는 “코드 자동완성” 단계를 넘어 Copilot 코딩 에이전트의 네트워크/정책/IDE 통합 같은 운영 이슈가 핵심 전장으로 이동했습니다.
- 금융·크립토는 표면 변동성 완화에도 자금 흐름은 아직 선택적이며, 금리 기대와 리스크자산 선호가 다시 맞물리는 구간입니다.

## AI/인공지능

- **[인도, 2028년까지 2,000억 달러+ AI 인프라 유치 목표 제시]** (TechCrunch)
  https://techcrunch.com/2026/02/17/india-bids-to-attract-over-200b-in-ai-infrastructure-investment-by-2028/
  인도 정부는 AI Impact Summit에서 향후 2년 내 2,000억 달러 이상 AI 인프라 투자 유치 목표를 공식적으로 제시했습니다. 기사에 따르면 이미 아마존·구글·마이크로소프트 등이 약 700억 달러 규모의 AI/클라우드 인프라 투자를 약속한 상태이며, 여기에 정부 인센티브를 더해 확장하겠다는 전략입니다. 특히 기존 3.8만 GPU에 추가 2만 GPU를 더하겠다는 계획은 ‘AI 제조·연산 거점’ 경쟁에서 인도가 비용·정책 패키지를 동시에 밀어붙이고 있음을 보여줍니다.
  → [링크: https://techcrunch.com/2026/02/17/india-bids-to-attract-over-200b-in-ai-infrastructure-investment-by-2028/]

- **[GPT-5.3-Codex, GitHub Copilot에 정식 롤아웃]** (GitHub Changelog)
  https://github.blog/changelog/2026-02-09-gpt-5-3-codex-is-now-generally-available-for-github-copilot/
  GitHub는 OpenAI의 GPT-5.3-Codex를 Copilot Pro/Business/Enterprise 라인업에 순차 배포한다고 발표했습니다. 초기 테스트 기준으로 GPT-5.2-Codex 대비 에이전트형 코딩 작업에서 최대 25% 빠른 성능 개선을 강조했고, VS Code·GitHub.com·CLI·모바일·코딩 에이전트까지 모델 선택 범위를 넓혔습니다. 이는 AI 모델 경쟁이 단순 벤치마크가 아니라 실제 개발 툴체인 전반의 배포 속도와 정책 제어(관리자 활성화)까지 포함하는 단계로 넘어갔다는 신호입니다.
  → [링크: https://github.blog/changelog/2026-02-09-gpt-5-3-codex-is-now-generally-available-for-github-copilot/]

- **[OpenAI, ChatGPT 월 성장률 10%+ 회복 언급]** (Reuters)
  https://www.reuters.com/business/openai-ceo-says-chatgpt-back-over-10-monthly-growth-cnbc-reports-2026-02-09/
  로이터 보도에 따르면 샘 올트먼은 ChatGPT 성장세가 월 10%를 다시 상회하는 구간으로 복귀했다고 내부에 공유했습니다. 생성형 AI 경쟁이 심화되는 시점에도 성장 모멘텀이 유지된다는 점은 사용자 기반 확대가 아직 꺾이지 않았음을 시사합니다. 시장 관점에선 인프라 투자 부담이 커져도 상위 플랫폼의 트래픽·구독 방어력이 여전히 핵심 밸류에이션 변수로 남아 있습니다.
  → [링크: https://www.reuters.com/business/openai-ceo-says-chatgpt-back-over-10-monthly-growth-cnbc-reports-2026-02-09/]

## GitHub/개발자 트렌드

- **[Visual Studio에서 Copilot 코딩 에이전트 작업 위임 시작]** (GitHub Changelog)
  https://github.blog/changelog/2026-02-17-delegate-tasks-to-copilot-coding-agent-from-visual-studio/
  GitHub는 Visual Studio 2026에서 Copilot Chat 프롬프트를 백그라운드 코딩 에이전트로 바로 위임해 드래프트 PR을 생성하는 흐름을 지원하기 시작했습니다. 이 기능은 Pro/Business/Enterprise 구독자 대상이며, 기업 계정은 관리자 정책 활성화가 선행되어야 하고 최소 VS 18.1.0 업데이트가 필요합니다. 개발팀 입장에서는 IDE 내에서 “지시→비동기 구현→PR 리뷰” 사이클을 표준화해 멀티태스킹 처리량을 높일 수 있는 변화입니다.
  → [링크: https://github.blog/changelog/2026-02-17-delegate-tasks-to-copilot-coding-agent-from-visual-studio/]

- **[Copilot 코딩 에이전트 네트워크 라우팅 규칙 2월 27일 변경]** (GitHub Changelog)
  https://github.blog/changelog/2026-02-13-network-configuration-changes-for-copilot-coding-agent/
  GitHub는 2월 27일 00:00 UTC부터 Copilot 플랜별로 다른 엔드포인트(api.business / api.enterprise / api.individual.githubcopilot.com)로 라우팅하도록 변경한다고 공지했습니다. self-hosted runner나 Azure private networking 환경을 쓰는 팀은 방화벽/허용목록을 미리 갱신하지 않으면 에이전트 작업이 실패할 수 있습니다. 즉, 에이전트 도입의 병목이 모델 성능보다 네트워크·보안 운영 준비도에서 발생할 수 있다는 현실을 다시 확인시켜줍니다.
  → [링크: https://github.blog/changelog/2026-02-13-network-configuration-changes-for-copilot-coding-agent/]

- **[Claude·Codex 코딩 에이전트 GitHub 퍼블릭 프리뷰 확장]** (GitHub Changelog)
  https://github.blog/changelog/2026-02-04-claude-and-codex-are-now-available-in-public-preview-on-github/
  GitHub는 Claude와 Codex 코딩 에이전트를 Copilot 고객 대상으로 퍼블릭 프리뷰 형태로 공개하며 에이전트 선택지를 늘렸습니다. 이는 단일 모델 종속이 아닌 멀티모델 운영 전략이 대형 개발 플랫폼의 기본값이 되어가고 있음을 보여줍니다. 팀 단위로는 과제 성격별(리팩토링/버그수정/장문 추론) 모델 라우팅 정책을 미리 정해두는 것이 생산성 차이를 키우는 포인트가 됩니다.
  → [링크: https://github.blog/changelog/2026-02-04-claude-and-codex-are-now-available-in-public-preview-on-github/]

## 경제/금융 (한국 포함)

- **[모건스탠리, 2월 금통위 2.5% 동결·성장률 상향 전망]** (연합뉴스)
  https://www.yna.co.kr/view/AKR20260213130500008
  모건스탠리는 한국은행 2월 금통위에서 기준금리 2.5% 동결 가능성이 높고, 반도체 슈퍼사이클을 반영해 2026~2027년 성장률 전망이 각각 0.2%p 상향될 수 있다고 봤습니다. 동시에 물가 전망은 2026년 2.1%, 2027년 2.0%로 유지해 성장 개선과 물가 안정의 혼합 시나리오를 제시했습니다. 이는 한국 금융시장 해석에서 “즉각 인하”보다 “동결 유지 속 데이터 확인”이 주 시나리오임을 재확인하는 신호입니다.
  → [링크: https://www.yna.co.kr/view/AKR20260213130500008]

- **[한은, 기준금리 2.50% 유지…환율·주택·가계부채 리스크 병행 점검]** (한국은행)
  https://www.bok.or.kr/portal/bbs/P0000559/view.do?nttId=10095711&menuNo=200690&programType=newsData&relate=Y&depth=200690
  한국은행은 통화정책방향에서 기준금리 2.50%를 유지하며 성장 개선세와 금융안정 리스크를 함께 관리하겠다는 입장을 재확인했습니다. 발표문은 물가가 점차 2%대 목표로 접근하더라도 높은 환율 변동성과 수도권 주택가격, 가계부채가 상방 리스크로 남아 있다고 명시했습니다. 즉 정책 기조는 ‘성장 회복 지원’과 ‘금융불균형 억제’의 균형이며, 단선형 완화 전환 가능성은 아직 낮다는 해석이 유효합니다.
  → [링크: https://www.bok.or.kr/portal/bbs/P0000559/view.do?nttId=10095711&menuNo=200690&programType=newsData&relate=Y&depth=200690]

- **[미국 CPI 둔화에도 인플레이션 압력 잔존]** (Reuters)
  https://www.reuters.com/business/us-consumer-prices-rise-less-than-expected-january-2026-02-13/
  로이터 보도에 따르면 1월 미국 소비자물가는 예상보다 완만하게 상승했지만 항목별 가격 압력은 여전히 남아 있는 것으로 해석됐습니다. 이는 연준의 조기 완화 기대를 키우는 동시에, 데이터 변동에 따라 금리 경로가 다시 흔들릴 수 있음을 의미합니다. 한국 포함 글로벌 자산배분 관점에서는 금리 기대 한쪽에 과도 베팅하기보다 물가·고용 발표 주기에 맞춘 민첩한 비중 조절이 필요한 구간입니다.
  → [링크: https://www.reuters.com/business/us-consumer-prices-rise-less-than-expected-january-2026-02-13/]

## 블록체인/암호화폐

- **[비트코인 ETF 유출 지속, 이더·XRP는 순유입]** (CoinDesk)
  https://www.coindesk.com/markets/2026/02/04/bitcoin-etf-outflows-deepen-as-ether-and-xrp-funds-quietly-attract-inflows
  코인데스크는 2월 3일 기준 미국 현물 비트코인 ETF에서 약 2.72억 달러 순유출이 발생한 반면, 이더 ETF와 XRP 연계 상품은 순유입을 기록했다고 전했습니다. 같은 날 비트코인이 장중 급락 후 반등하는 변동성 장세에서 자금이 시장 밖으로 완전히 이탈하기보다 자산 간 재배치되는 패턴이 관측됐습니다. 시사점은 ‘크립토 전체 리스크오프’보다 ‘내부 로테이션’이 더 강해졌다는 점이며, 섹터별 수급 분화가 당분간 성과를 가를 가능성이 큽니다.
  → [링크: https://www.coindesk.com/markets/2026/02/04/bitcoin-etf-outflows-deepen-as-ether-and-xrp-funds-quietly-attract-inflows]

- **[비트코인 6.8만달러 부근 정체…공포 완화에도 실수요 회복은 제한]** (CoinDesk)
  https://www.coindesk.com/markets/2026/02/17/bitcoin-remains-under-pressure-near-usd68-000-even-as-panic-ebbs
  코인데스크는 옵션 내재변동성 급등이 진정됐지만 비트코인 가격은 6.8만달러 부근에서 탄력적으로 돌파하지 못하고 있다고 분석했습니다. 기사에서는 BTC 현물 ETF가 월간 누적 순유출을 이어가고, 파생 펀딩레이트도 공격적 재레버리징 신호를 보여주지 못했다고 지적했습니다. 다만 미국 CPI 둔화와 실질금리 하락이 비수익 자산에는 우호적일 수 있어, 단기 수급 약세와 중기 매크로 완화 기대가 충돌하는 장세로 보는 해석이 타당합니다.
  → [링크: https://www.coindesk.com/markets/2026/02/17/bitcoin-remains-under-pressure-near-usd68-000-even-as-panic-ebbs]

## 게임/인디게임

- **[Steam Next Fest 2월 에디션, 2/23~3/2 일정 확정]** (Steamworks)
  https://partner.steamgames.com/doc/marketing/upcoming_events/nextfest/2026february
  스팀웍스 문서에 따르면 2026년 2월 스팀 넥스트 페스트는 2월 23일(PT) 시작해 3월 2일 종료되며, 데모 체험·개발자 라이브·찜 전환이 핵심 구조입니다. 문서는 참가 자격, 제출 마감, 프레스 프리뷰, 공식 트레일러 반영 일정까지 세부 타임라인을 명확히 제시해 출시 전 운영 준비 중요성을 강조합니다. 인디팀 입장에서는 데모 품질 자체뿐 아니라 제출 캘린더 준수와 이벤트 전 위시리스트 동선 설계가 실적 차이를 만드는 구간입니다.
  → [링크: https://partner.steamgames.com/doc/marketing/upcoming_events/nextfest/2026february]

- **[Xbox Indie Selects 2월 큐레이션 공개, 월간 인디 노출 허브 강화]** (Xbox Wire)
  https://news.xbox.com/en-us/2026/02/11/indie-selects-february-2026/
  Xbox Wire는 2월 Indie Selects로 6개 인디 타이틀을 선정해 스토어 내 큐레이션 허브와 주간 테마 노출을 운영한다고 밝혔습니다. 단순 피처드 배너가 아니라 매주 교체되는 스포트라이트 구조를 통해 중소 타이틀의 발견 가능성을 반복적으로 확보하는 방식입니다. 이는 인디 퍼블리싱에서 “출시일 단발 노출”보다 플랫폼 큐레이션 루프에 안정적으로 편입되는 전략이 장기 판매에 더 유리하다는 점을 보여줍니다.
  → [링크: https://news.xbox.com/en-us/2026/02/11/indie-selects-february-2026/]

## 미스 김 인사이트
- 오늘 핵심은 **AI 인프라 선점 경쟁(국가 단위)**, **개발 에이전트 운영 실전(팀 단위)**, **금리·수급의 미세한 분화(자본시장 단위)**입니다.
- 실행 우선순위는 ① 에이전트 네트워크/권한 정책 점검 ② 배포 전 데모/출시 캘린더 역산 ③ 현금흐름형 상품의 결제·전환 실험 강화입니다.
- 관망 포인트는 2월 말 금통위 코멘트 변화, Copilot 라우팅 전환(2/27) 장애 여부, 그리고 크립토 ETF 수급의 방향성 재확인입니다.
