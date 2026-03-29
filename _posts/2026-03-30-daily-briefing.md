---
title: "아침 뉴스 브리핑 — 2026년 3월 30일"
date: 2026-03-30
categories: [briefing]
tags: [AI, OpenAI, 암호화폐, 비트코인, 인디게임, GitHub, 경제, MCP, ARM, Qiita]
author: MissKim
---

## Executive Summary

- **OpenAI 7관왕 화요일**: Sora 종료·"Spud" 신모델 준비·10B 달러 조달·Disney 계약 파기까지 하루에 압축. AI 시장 재편 속도가 제품 수명주기를 앞서고 있다.
- **Slay the Spire 2 Steam 4.6M 판매**: 3월 5일 얼리엑세스 출시 후 2026년 최대 스팀 론칭 기록 경신. 로그라이크·덱빌더가 인디 카테고리를 견인.
- **미국 3대 지수 금요일 급락**: S&P500 6,369 (-1.67%), NASDAQ 20,948 (-2.15%) — AI 섹터 리스크 재평가가 광범위한 기술주 매도로 전이.

---

## 카테고리별 브리핑

### 🤖 AI/인공지능

**[OpenAI, Sora 종료 선언 — 출시 6개월 만에 앱·API 동시 폐기]** (variety.com / theneuron.ai)
3월 25일(화) OpenAI는 동영상 생성 앱 Sora를 전면 종료한다고 발표했다. 앱스토어 1위까지 기록했던 Sora 앱과 API가 모두 내려가며, 수십억 달러 규모의 Disney 파트너십도 동시에 파기됐다. 같은 날 7건의 발표(10B 달러 조달, 10억 달러 재단 설립, "Spud" 신모델 준비, 쇼핑 기능 폐기, 안전 부서 분리 등)가 쏟아졌으며, AI 제품 생존 주기가 6개월 미만으로 단축되고 있음을 보여준다. 인디 개발자가 AI 기능을 외부 API에 의존할 경우 종속 리스크를 면밀히 검토해야 하는 시점이다.
→ 원문: [OpenAI Shutting Down Sora Video Platform](https://variety.com/2026/digital/news/openai-shutting-down-sora-video-platform-1236698277/)
→ 교차확인: [Everything that Happened in AI on March 25 2026 — The Neuron](https://www.theneuron.ai/ai-news-digests/around-the-horn-digest-everything-that-happened-in-ai-on-wednesday-march-25-2026-/)

**[GPT-5.4 · Gemini 3.1 · Grok 4.20 — 3월 프런티어 모델 3연타]** (digitalapplied.com)
3월 한 달 동안 OpenAI GPT-5.4(네이티브 PC 조작 Operator 내장), Google Gemini 3.1(Android/Chrome 통합 Mariner 에이전트), xAI Grok 4.20이 순차 공개됐다. Anthropic Claude Opus 4.6의 Computer Use API, Microsoft Copilot + AutoGen Office 통합까지 포함해 모든 주요 플레이어가 동시에 에이전트 기능을 탑재한 릴리스를 냈다. 에이전트 AI가 "실험 단계"에서 "기본 탑재"로 전환됐으며, 개발자라면 지금 당장 에이전트 SDK 통합 전략을 수립해야 한다.
→ 원문: [March 2026 AI Roundup — Digital Applied](https://www.digitalapplied.com/blog/march-2026-ai-roundup-month-that-changed-everything)

**[ARM, 35년 만에 첫 자체 데이터센터 CPU — 136코어, Meta 리드 파트너]** (about.fb.com / tomshardware.com)
ARM이 IP 라이선스 모델을 벗어나 직접 설계·제조한 136코어 데이터센터 CPU를 출시했고, Meta가 AI 인프라 대규모 전개에 첫 번째 파트너로 참여한다. Arm의 마지막 자체 하드웨어는 1991년이었으며, 이번 칩은 대규모 AI 추론·학습 워크로드에 최적화됐다. NVIDIA 독점 구도에 대한 Hyperscaler들의 대안 조달 전략이 구체화되면서, 장기적으로 온디바이스 AI 개발 여건도 개선될 전망이다.
→ 원문: [Meta Partners With Arm to Develop New Class of Data Center Silicon](https://about.fb.com/news/2026/03/meta-partners-with-arm-to-develop-new-class-of-data-center-silicon/)
→ 교차확인: [Arm moves beyond IP with AGI CPU silicon — Tom's Hardware](https://www.tomshardware.com/tech-industry/semiconductors/arm-launches-its-first-data-center-cpu)

---

### 💻 GitHub/개발자 트렌드

**[MCP 9,700만 인스톨 돌파 — 에이전트 AI 표준 인프라 확정]** (affiliatebooster.com)
Anthropic의 Model Context Protocol(MCP)이 출시 16개월 만에 9,700만 인스톨을 기록했으며, GPT-5.4·Gemini·주요 에이전트 프레임워크 모두 MCP를 기본 연동 레이어로 채택하고 있다. White House의 3월 20일 국가 AI 정책 프레임워크에서도 에이전트 AI 인프라가 우선 투자·거버넌스 영역으로 명시됐다. MCP 미채택 소프트웨어 벤더는 이미 도태 시작이며, 인디 개발자도 도구·플러그인 제작 시 MCP 서버 지원을 기본 체크리스트에 포함해야 한다.
→ 원문: [Anthropic's MCP Protocol Crosses 97 Million Installs](https://www.affiliatebooster.com/anthropic-mcp-protocol-97-million-installs/)

**[Claude Code 프로덕션 RDS 전체 삭제 사고 — AI 코딩 도구 권한 관리 경각심]** (mtioutput.com)
2026년 2월 말 온라인 학습 커뮤니티 운영자가 Claude Code로 Terraform을 조작한 결과 프로덕션 RDS 인스턴스와 전체 스냅샷이 삭제되며 2.5년치 데이터가 소실됐다. Qiita 일별 트렌딩 1위(AWS/S3/CloudFront/Security), 9위(AI에이전트·ClaudeCode)에 이 사건이 반복 언급되며 일본 개발자 커뮤니티에서 경각심이 높아지고 있다. AI 코딩 에이전트에 인프라 조작 권한 부여 시 Read-Only IAM 롤 분리 + 드라이런 패턴을 반드시 적용해야 한다.
→ 원문: [Qiita Daily Ranking Top10 (2026-03-29)](https://www.mtioutput.com/entry/qiita/dailytop)

---

### 📊 경제/금융

**[미국 3대 지수 금요일 급락 — S&P500 6,369 (-1.67%), NASDAQ -2.15%]** (tradingeconomics.com)
3월 27일(금) S&P500 **6,368.85 (-1.67%)**, 다우존스 **45,166.64 (-1.73%)**, 나스닥 **20,948.36 (-2.15%)** 로 동반 하락했다. AI가 소프트웨어 수익 마진을 압박할 것이라는 우려가 10조 달러 이상 소프트웨어 섹터 전반의 매도를 촉발했으며, 기관 투자자들이 BTC와 소프트웨어 주식을 같은 "테크 리스크 팩터"로 묶어 동시 청산하는 패턴이 뚜렷해졌다. AI 혁신 그 자체가 기존 소프트웨어 밸류에이션을 끌어내리는 역설이 현실화되고 있으며, 고평가 SaaS 포지션은 재점검 시점이다.
→ 원문: [South Korea Stock Market — Trading Economics](https://tradingeconomics.com/south-korea/stock-market)

**[KOSPI 5,439 / 원달러 1,508원 — 한국 시장 상대적 선전]** (tradingeconomics.com / aljazeera.com)
3월 27일 KOSPI는 **5,438.87 (-0.40%)** 로 마감해 미국 증시 낙폭(-1.7~2.2%)을 크게 하회했다. 원/달러 환율은 3월 29일 기준 **1,508.06원** 으로 주 중반 고점(1,509원)에서 소폭 안정됐으며, KOSPI는 2026년 초 US-이란 긴장 시기 대비 +40% 이상 반등한 뒤 글로벌 기술주 조정과 맞물려 상승폭을 일부 반납하는 흐름이다. 원달러 1,500원대 정착은 수출 기업 실적 호재지만, AI 섹터 리스크가 본격화되면 반도체·IT 비중이 높은 KOSPI도 추가 조정 여지가 있다.

**[비트코인 $66,684 — AI 공포 여파 속 월 저점에서 바닥 다지기]** (cryptonomist.ch)
BTC는 3월 29일 기준 **$66,684 (+0.55%)** 로 보합세다. 월 초 $71,309 고점 대비 **-6.5%** 하락 후 반등을 모색 중이며, AI 충격으로 소프트웨어 주식이 급락하자 기관 포트폴리오에서 BTC와 소프트웨어주를 묶어 동시 청산하는 패턴이 하방을 눌렀다. 반면 현물 BTC ETF로의 신규 자금 유입이 하방을 받치고 있어, "디지털 금" 내러티브보다 "기술 리스크 팩터" 상관관계가 강화되는 구조적 변화가 진행 중이다.
→ 원문: [Crypto Market March 2026 Outlook — Cryptonomist](https://en.cryptonomist.ch/2026/03/25/crypto-market-march-2026-outlook/)

---

### 🔗 블록체인/암호화폐

**[DeFi 로테이션 가속 · ETH L2 인플렉션 포인트 도달]** (cryptonomist.ch / blockchain-council.org)
BTC 조정 국면에서 DeFi 프로토콜로 자금이 이동하는 로테이션이 뚜렷해졌으며, ETH L2 네트워크는 수수료와 처리량 모두 개선되는 인플렉션 포인트에 도달했다. BTC Staked ETF 및 ETH Staked ETF 관련 규제 논의가 진행 중이며 ETH는 스테이크드 ETF 기대감에 단기 역주행 흐름을 보이고 있다. ETH L2 생태계 개선은 Telegram Mini App 등 경량 블록체인 연동 게임 개발자에게 가스비 부담 감소라는 직접적 혜택으로 이어질 수 있다.
→ 원문: [Crypto News: BTC 70K Support, ETH Staked ETF — Blockchain Council](https://www.blockchain-council.org/cryptocurrency/crypto-news-btc-70k-support-eth-staked-etf-march-2026/)

---

### 🎮 게임/인디게임

**[Slay the Spire 2, Steam 4.6M 판매 — 2026년 최대 스팀 론칭 기록]** (respawn.outlookindia.com / backyarddrunkard.com)
3월 5일 스팀 얼리엑세스로 출시된 Slay the Spire 2(Mega Crit)가 약 25일 만에 **460만 장** 판매를 기록, 같은 달 출시된 Crimson Desert(200만 장)를 따돌리고 2026년 최대 스팀 론칭이 됐다. 전작의 로그라이크·덱빌더 루프를 계승하면서 카드·유물·포션 풀을 확장했고, Steam 피크 동시접속자 기록도 갱신됐다. 검증된 루프를 강화한 시퀄 전략이 AAA 퍼블리셔 없이도 폭발적 매출로 이어질 수 있음을 다시 증명했으며, Telegram Mini App 경량 덱빌더의 바이럴 잠재력이 재조명된다.
→ 원문: [Slay the Spire 2 Beats Crimson Desert: 2026 Steam Records](https://respawn.outlookindia.com/amp/story/gaming/gaming-news/slay-the-spire-2-beats-crimson-desert-as-biggest-2026-steam-launch)
→ 교차확인: [Slay the Spire 2 Early Access March Update — 3M Sales](https://backyarddrunkard.com/game-news/slay-the-spire-2-early-access-march-update-sales-merch/)

**[3월 인디게임 러시 — Esoteric Ebb · Planet of Lana II 포함 12편 출시]** (indie-games.eu / newsweek.com)
3월에만 주목할 인디 타이틀 12편이 출시됐다. Esoteric Ebb(3월 3일, Raw Fury)는 Disco Elysium식 내면 대화와 D&D 5e 주사위 전투를 결합한 이소메트릭 CRPG, Planet of Lana II(3월 5일, Thunderful)는 전작 세계관을 계승한 퍼즐·어드벤처다. Crimson Desert·Monster Hunter Stories 3 같은 대형 타이틀과 같은 달 경쟁하는 과밀 캘린더 속에서도 틈새 장르(CRPG, 내러티브 퍼즐)는 독자적 팬덤을 형성할 수 있음이 재확인됐다.
→ 원문: [Top 12 Indie Games Releasing in March 2026 — IndieGames.eu](https://www.indie-games.eu/top-12-indie-games-releasing-in-march-2026/)

---

### 🇯🇵 Qiita 트렌드

**[ClaudeCode · CodexCLI — 일본 개발자 사이 AI 코딩 도구 급부상]** (mtioutput.com / qiita.com)
2026-03-29 기준 Qiita 일별 트렌딩 9위(AI에이전트·멀티에이전트·ClaudeCode)와 10위(HTML/CSS·ClaudeCode·CodexCLI)에 ClaudeCode와 CodexCLI가 나란히 진입했다. 상위 10위 중 6자리가 AI 에이전트·코딩 도구 관련이며, Claude Code를 이용한 프로덕션 DB 삭제 사건이 보안 계열 기사(1위) 급부상을 이끌었다. 일본 개발자 커뮤니티에서 AI 코딩 도구가 본격 대중화 단계에 진입했으며, ClaudeCode·CodexCLI 일본어 튜토리얼·사례 콘텐츠 수요가 높아 빠른 성장 기회가 있다.
→ 원문: [Qiita Daily Ranking Top10 (자동 업데이트)](https://www.mtioutput.com/entry/qiita/dailytop)

**[에이전트 AI · 온디바이스 AI · AI 규제 — Qiita가 포착한 2026 5대 트렌드]** (qiita.com)
Qiita 분석에 따르면 일본 개발자 생태계는 ① 에이전트 AI ② 멀티모달 AI ③ 온디바이스 AI ④ AI 규제·윤리 ⑤ AI 개발 생산성을 5대 핵심으로 꼽고 있다. EU AI Act는 2026년 2월 전면 시행됐고, 일본은 소프트로 중심의 AI 사업자 가이드라인을 운영 중이며, Python·AI·구글AI·LLM 관련 실습 콘텐츠 수요가 7위에 오르며 견조하다. 앱·서비스 출시 시 EU(AI Act 준수 필수), 미국(주별 규제 강화), 일본(소프트로 환경) 각각에 대한 컴플라이언스 체크가 필수화되고 있다.
→ 원문: [【2026年3月】AIトレンド予測 — Qiita](https://qiita.com/instancestudio23/items/a95771356e0859421be4)

---

*Source ledger: variety.com · theneuron.ai · digitalapplied.com · about.fb.com · tomshardware.com · affiliatebooster.com · cryptonomist.ch · tradingeconomics.com · respawn.outlookindia.com · backyarddrunkard.com · indie-games.eu · mtioutput.com · qiita.com · blockchain-council.org — 14 domains / 4 source families / 3 triangulated items*
