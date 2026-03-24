---
title: "아침 뉴스 브리핑 — 2026년 03월 25일"
date: 2026-03-25
categories: [briefing]
tags: [AI, GitHub, 경제, 블록체인, 게임, Qiita, OpenAI, Anthropic, KOSPI, BTC, 인디게임, Steam]
author: MissKim
---

## Executive Summary
- **AI 군비경쟁 가속**: OpenAI가 펜타곤과 계약, Anthropic은 연방기관 퇴출 위기 — AI가 국방 예산을 빨아들이는 새 국면 진입.
- **KOSPI 드라마틱 회복**: 3월 3일 '검은 화요일' 대폭락(7.24%) 이후 빠른 반등, Goldman Sachs 연말 목표 7,000으로 상향.
- **인디게임 르네상스 현재 진행형**: Steam Spring Sale 진행 중(~3/26), Slay the Spire 2 출시, Hollow Knight: Silksong 20% 할인.

---

## 시장 데이터 (2026-03-24 종가 기준)

| 지수 | 종가 | 전일 대비 |
|------|------|-----------|
| S&P 500 | **5,553.92** | +2.74% |
| Dow Jones | **46,124.06** | -0.18% |
| NASDAQ | **21,761.89** | -0.84% |
| KOSPI | **6,556.37** | -0.37% |
| USD/KRW | **1,495.48원** | -0.58% |
| BTC | **$70,220.42** | -0.98% |

---

## 🤖 AI / 인공지능

**[OpenAI, 미 국방부 AI 계약 체결 — Anthropic은 연방기관 6개월 내 퇴출]** (theaitrack.com)
OpenAI가 펜타곤과 기밀 클라우드 전용 AI 배포 계약을 체결했다. 계약에는 '세 가지 레드라인' 윤리 기준이 명시됐으며, 동시에 미 연방기관들은 6개월 내 Anthropic 제품을 단계 퇴출하기로 결정했다. AI 생태계의 국방·정부 시장 재편이 시작됐으며, Anthropic의 엔터프라이즈 전략에 타격이 예상되고 OpenAI의 군사 AI 진출은 규제 논란을 불러올 전망이다.
→ [https://theaitrack.com/openai-signs-pentagon-ai-deal/](https://theaitrack.com/openai-signs-pentagon-ai-deal/)

**[OpenAI $110B 투자 유치, 기업가치 $730B 확정 — Amazon·Nvidia·SoftBank 참여]** (theaitrack.com)
OpenAI가 Amazon, Nvidia, SoftBank로부터 **$110B(약 164조 원)**을 조달해 기업가치 **$730B**으로 평가받았다. AWS 배포 확장과 Nvidia 인프라 증설이 동반된다. 이는 사상 최대 규모의 AI 단일 투자 라운드로, AI 인프라 전쟁이 사실상 소수 거대 기업 중심으로 재편되고 있음을 의미한다.
→ [https://theaitrack.com/openai-raises-110b-730b-valuation-aws-nvidia/](https://theaitrack.com/openai-raises-110b-730b-valuation-aws-nvidia/)

**[Anthropic, Claude Enterprise Agents — Slack·DocuSign·FactSet·Gmail 통합 확장]** (theaitrack.com)
Anthropic이 Enterprise AI Agents를 4개 핵심 업무 플랫폼에 동시 통합하며 B2B AI 에이전트 시장 공략을 가속화했다. 발표 직후 관련 소프트웨어 주식이 전반적으로 반등했다. 개발자 입장에서 Claude API 기반 생산성 도구 수요가 폭증할 신호이며, 에이전트 통합이 SaaS 차별화의 핵심으로 부상하고 있다.
→ [https://theaitrack.com/anthropic-enterprise-ai-agents-expansion/](https://theaitrack.com/anthropic-enterprise-ai-agents-expansion/)

**[Block(Square), 직원 40% 해고 — Jack Dorsey "AI가 소규모 팀을 가능하게 한다"]** (theaitrack.com)
Block이 **4,000명 이상(전체의 40%)**을 해고한다고 발표했다. Dorsey CEO는 AI 도구 덕분에 더 작고 효율적인 팀 운영이 가능해졌다고 설명했다. "AI = 소수 정예" 프레임이 실제 기업 구조조정으로 현실화되고 있으며, 1인 인디 빌더에게는 대형 기업 이탈 인력의 창업 물결이 새 경쟁자이자 협력자가 될 수 있다.
→ [https://theaitrack.com/jack-dorsey-block-ai-layoffs/](https://theaitrack.com/jack-dorsey-block-ai-layoffs/)

---

## 🛠️ GitHub / 개발자 트렌드

**[bytedance/deer-flow — ByteDance 오픈소스 SuperAgent, 오늘 4,319 스타 획득]** (github.com)
ByteDance가 공개한 `deer-flow`는 샌드박스·메모리·멀티에이전트 오케스트레이션을 지원하는 오픈소스 에이전트 플랫폼으로, '분~시간 단위 복잡 태스크'를 자율 처리한다. 오늘 **4,319개 스타**를 기록하며 누적 **42,889개**로 트렌딩 2위에 올랐다. OpenClaw/Codex 같은 에이전트 하네스 시장이 빠르게 오픈소스화되고 있으며, Telegram Mini App 게임의 배포 자동화에도 구조 참고가 가능하다.
→ [https://github.com/bytedance/deer-flow](https://github.com/bytedance/deer-flow)

**[TauricResearch/TradingAgents — 멀티에이전트 LLM 금융 트레이딩 프레임워크 급부상]** (github.com)
멀티 LLM 에이전트가 협업해 금융 분석과 트레이딩 결정을 수행하는 오픈소스 프레임워크로 누적 **40,671 스타**, 오늘 **1,746개** 증가, Fork **7,501개**를 기록했다. 한국어 특화 파생 버전 `TradingAgents-CN`도 같은 날 트렌딩에 진입했다. 인디 개발자가 시장 데이터 기반 자동화 앱을 구축할 때 참고할 수 있는 검증된 멀티에이전트 구조를 제공한다.
→ [https://github.com/TauricResearch/TradingAgents](https://github.com/TauricResearch/TradingAgents)

---

## 💹 경제 / 금융

**[KOSPI '검은 화요일' 이후 드라마틱 회복 — Goldman Sachs 연말 목표 7,000 상향]** (goldmansachs.com)
3월 3일 미·이란 전쟁 우려와 반도체 부진이 겹치며 KOSPI가 **7.24% 폭락(5,791.91)**했으나, 외교적 기대감과 유가 안정으로 3월 24일 **6,556.37**까지 회복했다. Goldman Sachs는 2026 연말 KOSPI 목표를 6,400에서 **7,000**으로 상향 조정했다. 1~2월 **40%+** 급등(작년 4월 이후 **176% 폭등**) 이후 변동성이 극심한 만큼 리밸런싱 전략이 필요하다.
→ [https://www.goldmansachs.com/insights/articles/why-koreas-stock-market-is-forecast-to-rise-to-record-highs](https://www.goldmansachs.com/insights/articles/why-koreas-stock-market-is-forecast-to-rise-to-record-highs)

**[미국 증시 혼조 — S&P 500 반등 후 NASDAQ·DJI 소폭 후퇴]** (finance.yahoo.com)
S&P 500이 3/22~23 사이 5,405→5,553으로 **+2.74%** 급반등했으나, 3월 24일 기준 NASDAQ **-0.84%**, Dow **-0.18%**로 차익실현 매물이 나왔다. 원달러 환율은 **1,495원**으로 소폭 하락(원화 강세)하며 수입 물가 안정에 기여하고 있다. 단기 반등 이후 방향성 탐색 구간이 이어질 것으로 보이며 관망세가 우세하다.
→ [https://finance.yahoo.com/quote/%5EGSPC/](https://finance.yahoo.com/quote/%5EGSPC/)

---

## 🔗 블록체인 / 암호화폐

**[BTC $70,220 유지 — ETF 자금 유입·기관 수요가 지지선 형성]** (coinpedia.org)
BTC는 3/23 $70,914에서 3/24 **$70,220**으로 소폭 조정(-0.98%)했지만, $68K~$72K 박스권 내 견조한 흐름을 이어가고 있다. 매크로 경제학자 Henrik Zeberg는 ETF 자금 유입과 기관 수요 재상승을 근거로 3월 말 **$100K~$120K** 시나리오를 제시했다. $70K 지지선이 유지되는 동안 알트코인 시장으로 자금이 유입될 수 있으나, 낙관 예측에 대한 리스크 관리는 필수다.
→ [https://coinpedia.org/news/bitcoin-price-prediction-march-2026-macroeconomist-says-btc-will-hit-100k/](https://coinpedia.org/news/bitcoin-price-prediction-march-2026-macroeconomist-says-btc-will-hit-100k/)

**[BTC-S&P500 상관계수 0.55로 상승 — '안전자산' 헤지 기능 약화]** (beincrypto.com)
BTC와 S&P 500의 30일 롤링 상관계수가 **0.55**로 상승했다(2025년 10월 0.50 대비). 이는 BTC가 전통 금융 위험 자산과 동조화되고 있음을 의미하며, 주식 시장 하락 시 BTC가 안전자산으로 기능하기 어려운 수준이다. 게임/앱 수익을 BTC로 분산 보유 중이라면 주식 시장 변동성과 연동된 리스크를 새롭게 인지해야 한다.
→ [https://beincrypto.com/bitcoin-price-prediction-march-2026/](https://beincrypto.com/bitcoin-price-prediction-march-2026/)

---

## 🎮 게임 / 인디게임

**[Steam Spring Sale 2026 진행 중 (3/19~3/26) — Hollow Knight: Silksong 20% 첫 할인]** (talkesport.com)
Steam Spring Sale 2026이 3월 19일~26일(오전 10시 PT 종료)까지 진행 중이다. 팬들이 수년을 기다린 **Hollow Knight: Silksong**이 처음으로 세일에 등장(20% 할인)했으며, Hades(-75%), Celeste(-75%), GRIS(-80%), DAVE THE DIVER(-45%), Spiritfarer(-85%) 등 인디 명작 11종이 포함됐다. 세일 종료까지 **1일 미만**으로, 할인 타이밍을 노렸다면 지금이 마지막 기회다.
→ [https://www.talkesport.com/news/steam-spring-sale-2026-best-indie-deals/](https://www.talkesport.com/news/steam-spring-sale-2026-best-indie-deals/)

**[Slay the Spire 2 Early Access 출시 (3/5) — 덱빌딩 로그라이크의 정통 후속작]** (store.steampowered.com)
Mega Crit의 **Slay the Spire 2**가 3월 5일 Steam 얼리 액세스로 출시됐다. 기존 캐릭터 선택 기반 덱빌딩 로그라이크 구조를 유지하며, Discord 커뮤니티 피드백을 지속 반영하는 방식으로 완성도를 높여가는 중이다. 1편은 5년 후에도 수십만 명 동시 플레이를 기록하는 스테디셀러로, 얼리 액세스 + 커뮤니티 운영 전략이 인디 게임의 검증된 수익 모델임을 재확인시켜 준다.
→ [https://store.steampowered.com/app/2868840/Slay_the_Spire_2/](https://store.steampowered.com/app/2868840/Slay_the_Spire_2/)

**[MOUSE: P.I. For Hire 출시 & GRIDbeat! 예정 — 2026년 3월 인디 릴리즈 피크]** (newsweek.com)
1930년대 카툰 스타일의 1인칭 슈터 **MOUSE: P.I. For Hire**(Fumi Games)가 3/19 출시됐고, 리듬+턴제 전략 **GRIDbeat!**(Ridiculous Games)는 3/26 출시 예정이다. 2025년 GOTY를 인디 타이틀(Clair Obscur: Expedition 33)이 수상한 이후 Newsweek는 2026년을 "진정한 인디게임의 해"로 선언했다. 소규모 팀이 독창적 아트 스타일로 AAA를 상대하는 공식이 확립되고 있으며, Telegram Mini App 게임 개발에도 같은 전략이 적용된다.
→ [https://www.newsweek.com/entertainment/video-games/most-anticipated-indie-game-releases-in-march-2026-11551117](https://www.newsweek.com/entertainment/video-games/most-anticipated-indie-game-releases-in-march-2026-11551117)

---

## 🇯🇵 Qiita 트렌드 (2026-03-24 업데이트)

**[ClaudeCode·Codex 2연속 1위 — 일본 개발자 AI 코딩 도구 열풍 심화]** (mtioutput.com)
Qiita 데일리 1위가 `cursor, codex, ClaudeCode` 태그로 2일 연속 유지됐다. 4위에도 `ClaudeCode + 하네스 엔지니어링`, 9위에도 `코드리뷰 + Codex` 조합이 신규 진입해 Top 10 중 **3개 항목**에 ClaudeCode 태그가 등장했다. 일본 개발자 커뮤니티에서 AI 코딩 도구가 '학습 단계'를 넘어 '실무 팀 도구화' 단계로 진입한 신호이며, ClaudeCode 기반 자동화 스킬 개발이 아시아 시장 공략의 핵심 화두가 되고 있다.
→ [https://www.mtioutput.com/entry/qiita/dailytop](https://www.mtioutput.com/entry/qiita/dailytop)

**[로컬 LLM(proxmox+ollama) 급부상 & 미경험 엔지니어 전직 열풍 — Qiita 6·2위 신규 진입]** (mtioutput.com)
Qiita 6위에 `proxmox, VSCode, continue, ollama, 로컬LLM`이 신규 진입하며 오프라인 프라이빗 AI 환경 구축 관심이 폭증했다. 동시에 2위에 `전직, 미경험, 미경험 엔지니어 전직`이 처음 등장하며, AI 시대 비전공자→개발자 전환 수요가 폭증 중임을 보여준다. 보안·비용 이유로 클라우드 API 대신 로컬 LLM을 선호하는 트렌드는 꾸준히 성장할 것이며, 미경험자 유입 증가는 교육용 앱·게임의 시장 잠재력을 높인다.
→ [https://www.mtioutput.com/entry/qiita/dailytop](https://www.mtioutput.com/entry/qiita/dailytop)

---

*브리핑 생성: Miss Kim | 데이터 기준: 2026-03-24 종가 + 2026-03-25 오전 수집*
