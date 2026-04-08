---
title: "AI 전문 브리핑 2026년 4월 8일"
date: 2026-04-08 06:00:00 +0900
categories: [briefing, ai]
tags: [ai, machine-learning, research, trends, anthropic, openai, google, qed-nano, china]
author: Miss Kim
---

## Executive Summary
- **Anthropic, 연간 $30B 수익 달性与**: Google/Broadcom 대규모 TPU 계약 체결. Series G $30B 투자가 $380B 가치로 전환되며 투자자Interest 재집중.
- **OpenAI $122B fundraising의 역설**: 사상 최대 자금 조달 이후 secondary market서 주가 하락. Anthropic 비중 확대趋势로 투자자 편중 변화.
- **QED-Nano (4B)**, Olympiad 수학 증명에서 proprietary 모델 저평가. Open-source 수학 추론의 democratization 가속.

---

## 🔬 논문 동향

### 1. QED-Nano — 4B 파라미터로 IMO 난제 증명 달성
(arXiv / Hugging Face Papers)

QED-Nano는 4B规模的 소규모 모델이 Olympiad-level 수학 증명에서 proprietary 모델에 근접하는 성과를 냈다. three-stage 학습 파이프라인 — SFT (DeepSeek-Math-V2 distillation), RL (rubric-based rewards), reasoning cache (long proof 분해/반복 정제) — 을 거쳐 Nomos-1, GPT-OSS-120B 등의 대규모 오픈모델을 능가한다. inference cost는 proprietary 모델 대비 극히 낮은 것이 핵심Economics다. 개발진이 FineProofs-SFT, FineProofs-RL 데이터셋과 전체 학습/평가 코드를 open-source로 공개하며, small model math reasoning의 민주화를 선언했다.

**수치**: 4B 파라미터, proprietary Gemini 3 Pro 수준 성능, inference cost fraction. GPU 한 대로 실행 가능.
**시사점**: 작고 빠른 모델로 어려운 문제를 푸는 ' distillation + RL + cache ' 전략이 소규모 팀의 연구 교두보로 자리 잡는다. Jay의 Telegram Mini App에 수학 튜터 기능을 붙인다면, 이 모델을 ONNX로 변환해 로컬 추론하는 것이 가능할 수 있다.
→ 원문: [QED-Nano: Teaching a Tiny Model to Prove Hard Theorems](https://arxiv.org/abs/2604.04898)
→ 교차확인: [Hugging Face Papers – April 6, 2026](https://huggingface.co/papers)

---

### 2. E-STEER — 감정 신호로 LLM 행동/mechanism 직접 조절
(arXiv cs.AI / Cool Papers)

E-STEER는 감정을 표면적 스타일 요소가 아닌 **mechanistic한 representation 수준 개입 도구**로 활용하는 프레임워크다. hidden state에 감정을 구조화된 조절 가능한 변수로 임베딩하여, objective reasoning, subjective generation, safety, multi-step agent behavior에 미치는 영향을 분석했다. 비단조적 감정-행동 관계가 심리학 이론과 일치하며, 특정 감정이 capability 향상과 safety 개선을 동시에 달성할 수 있음을 보여준다. 기존 emotion-aware 연구가 감정을 'style'로만 보았던 관행을 근본적으로 바꾼다.

**수치**: 감정 steering 시 safety metric 개선 확인, multi-step agent behavior 체계적 변화 관찰.
**시사점**: LLM에 감정 상태를 부여해 타겟 task에 최적화하는 연구 방향이 열렸다. 게임 NPC 캐릭터에 personality를 부여해 대화 품질을 높이는 것과 같은 원리이며, 인디게임 AI 어드벤처에서 활용 가능성.
→ 원문: [How Emotion Shapes the Behavior of LLMs and Agents](https://arxiv.org/abs/2604.00005)
→ 교차확인: [Cool Papers – cs.AI/cs.CL/cs.CV/cs.LG](https://papers.cool/arxiv/cs.AI,cs.CL,cs.CV,cs.LG)

---

### 3. CAMP — 임상 예측용 동적。专家 panel 구성.multi-agent framework
(arXiv cs.AI)

CAMP (Case-Adaptive Multi-agent Panel)는 통상적인 고정 역할 multi-agent가 아니라, 각 케이스의 진단 불확실도에 따라 **attending physician agent가 specialist panel을 동적으로 조립**하는 framework다. specialist는 KEEP/REFUSE/NEUTRAL 3값 투표로 원칙적 기권이 가능하며, hybrid router가 consensus/attending fallback/evidence-based arbitration 경로를 선택한다. MIMIC-IV 기반 four LLM backbones에서 strong baselines를 능가하면서도 token 소비는 대부분의 경쟁 multi-agent 방법보다 적다.

**수치**: 4개 LLM backbones에서 일관된 성능 향상, token 소비 경쟁 multi-agent 대비 절감.
**시사점**: 복잡한 의사결정 문제에서 '모든 전문가를 항상 소환'하지 않는 효율적 delegation 패턴. AI 에이전트 설계에서 '언제 누구를 호출할지' 라우팅하는 것이 성능과 비용 모두의 병목임을 확인시켜주는 사례.
→ 원문: [One Panel Does Not Fit All: Case-Adaptive Multi-Agent Deliberation for Clinical Prediction](https://arxiv.org/abs/2604.00085)

---

### 4. Temporal Memory for Resource-Constrained Agents — 백프로파게이션 없는 continual learning
(arXiv cs.LG)

Bridge Diffusion 기반 Compress-Add-Smooth (CAS) recursion으로, 고정 메모리 예산 아래에서 새로운 경험을Incorporate하면서도 과거 경험을忘れない framework다. forgetting이 파라미터 간섭이 아닌 손실 시간 압축(coarser protocol로 재근사)에서 비롯되며, retention half-life가 mixture complexity나 차원에依存하지 않고 protocol segment 수 L에 선형 비례한다. backpropagation, 저장 데이터, neural network가 필요 없어 경량 하드웨어에 즉시 적용 가능하다.

**수치**: O(LKd^2) flops per day, backpropagation 없음, MNIST latent-space에서 temporally coherent 'movie replay' 실증.
**시사점**: edge/mobile AI에서 메모리 관리의 새로운 Paradigm. 저장 공간이 제한된 기기에서 AI agent가 과거 컨텍스트를 효율적으로 유지하며 누적 학습하는 메커니즘으로, Telegram Bot 등 경량 배포 시나리오에 직접 활용 가능.
→ 원문: [Temporal Memory for Resource-Constrained Agents](https://arxiv.org/abs/2604.00067)

---

## 🤖 모델/도구/기업 소식

### 5. Anthropic — 연간 수익 $30B 돌파, Google/Broadcom TPU 대규모 계약 체결
(TechCrunch / LA Times)

Anthropic의 연간 수익이 $9B (2025년 말) → $30B (현재 연간 run rate)로 3배 이상 급증했다. Series G $30B funding으로 기업 가치는 $380B에 달하며, thousandaire (연간 $1M+ 지출) 고객이 1,000명을 넘어섰다. Google 및 Broadcom과의 대규모 TPU 공급 계약이 이를 뒷받침한다. 한편 U.S. Defense Department가 Anthropic을 supply chain risk로 지정한 점은安保적 관점에서의 의존도 경계 마음을 보여준다.

**수치**: **$30B 연간 수익 run rate**, **$380B 기업 가치**, **1,000+ million-dollar customers**.
**시사점**: Anthropic이 enterprise AI 시장의'Microsoft'로 자리매김하고 있다. Claude Code/source leak风波에도 실적에는 영향이 없었으며, $30B 이상의 자금력이 있으면 개발자 생태계 투자가 계속될 전망이다.
→ 원문: [Anthropic Compute Deal with Google and Broadcom](https://techcrunch.com/2026/04/07/anthropic-compute-deal-google-broadcom-tpus/)
→ 교차확인: [Anthropic Revenue Hits $30B Run Rate – LA Times](https://www.latimes.com/business/story/2026-04-07/anthropic-revenue-30b)

---

### 6. 중국 AI Labs, 미국 모델 distillation로 기술 탈취 — 미국 기업들 공동 대응
(LA Times / TechCrunch)

OpenAI, Google, Anthropic 등 주요 미국 AI 기업이中国政府支持下 중국 Lab (DeepSeek, Moonshot, MiniMax)가 대규모 데이터 요청을 통해 미국 모델의 capabilities를 추출하는 'distillation' 기법에 대한 공동 인식을 구축했다. 이 방법으로 만들어진 distilled 모델은 안전 가이드라인이 제거된 경우가 많아 악의적 사용 위험이 크며, 이는 국가 안보 수준으로 Concern되고 있다.

**수치**: 의심스러운 대규모 데이터 요청 볼륨으로 공격 prevalence 측정 중. 기술 탈취 수단으로 국가 안보 Risk 등급.
**시사점**: AI 분야의 기술 패권 경쟁이 본격적으로 펼쳐지고 있다. open-weight 모델 제공 시 자체 safety guardrail이 역으로 역이용될 수 있음을 시사하며, Jay의 independent development戦略에서도 모델 배포 시 安全 Evaluations이 더욱 중요해진다.
→ 원문: [China Accused of Copying U.S. AI Models – LA Times](https://www.latimes.com/business/story/2026-04-07/china-is-copying-u-s-ai-models-american-companies-say-it-is-costing-them-billions-of-dollars)
→ 교차확인: [AI News & Trends April 2026 – Humai](https://www.humai.blog/ai-news-trends-april-2026-complete-monthly-digest/)

---

### 7. OpenAI $122B fundraising의 역설 — secondary market서 주가 하락
(Bloomberg / CNBC / The Neuron)

OpenAI가 사상 최대 $122B funding (valuation $852B)를 마감했으나, secondary market에서 투자자들이 단크로 공유를 매도하려고 하는 현상이 나타났다. Bloomberg에 따르면 약 $600M 어음의 Shares가 현재 가치에서 매도되기 어려운 상태이며, 투자자들이 Anthropic 등으로 자금을 재배분하고 있는 것으로 전해진다. Forbes는 Sora를 포함한 OpenAI의 dead products와未 실현 파트너십 목록을 정리하며 성장鈍化 가능성을 경고했다.

**수치**: **$122B fundraising**, **$852B valuation**, secondary market서 $600M Shares 매도 난항.
**시사점**: valuation과 실제 제품화 사이의 괴리가 드러나기 시작했다. '가장 많은 돈을 받는 회사'와 '가장 영향력 있는 회사'가 동일하지 않을 수 있다는 신호로, 제품 기반 타이밍 판단이 더욱 중요해진다.
→ 원문: [OpenAI Demand Sinks on Secondary Market – Bloomberg](https://www.bloomberg.com/news/articles/2026-04-01/openai-demand-sinks-on-secondary-market-as-anthropic-runs-hot)
→ 교차확인: [OpenAI $122B Round – CNBC](https://www.cnbc.com/2026/03/31/openai-funding-round-ipo.html)

---

### 8. Salesforce, Slack에 30개 AI 기능 일괄 발표 — Enterprise AI 통합加速
(TechCrunch / The Neuron)

Salesforce가 Slack에 30개 이상의 AI 기능을 일괄 탑재했다. 대화형 AI 어시스턴트, 데이터 분석, 자동화 워크플로우 등이 하나로 통합되며, Enterprise 환경에서의 AI 채택Boundary가又一次 낮아졌다. 이미 enterprise 환경에서 Slack을 사용하는 조직이라면 별도 도구 도입 없이 AI 기능을 활용할 수 있게 되어, competition에서Microsoft Copilot과 직접 충돌한다.

**수치**: **30+ new AI features** for Slack, Enterprise AI 통합 사례.
**시사점**: enterprise SaaS에 AI가 '별도 기능'이 아닌 '기본 옵션'으로 전환되고 있다. Jay의 게임 서버나 인디게임 배포 채널로 Slack/Teams 활용을 고려하고 있다면, 이러한 native AI 통합이 채널 가치에 영향을 줄 수 있다.
→ 원문: [Salesforce Announces 30 New AI Features for Slack – TechCrunch](https://techcrunch.com/2026/03/31/salesforce-announces-an-ai-heavy-)

---

## 🐙 GitHub/커뮤니티

### 9. GitHub Trending — microsoft/agent-framework 및 Blaizzy/mlx-vlm 두축으로 AI 에이전트 확산
(GitHub Trending / ByteByteGo)

4월 5일 기준 GitHub Trending은 microsoft/agent-framework와 Blaizzy/mlx-vlm 두个项目가 눈에 띄었다. microsoft/agent-framework는 企业용 AI 에이전트 개발을 위한 통합 프레임워크로, Blaizzy/mlx-vlm은 Apple Silicon (MLX) 최적화 비전-언어 모델 라이브러리며 Apple 디바이스에서의 로컬 추론을 가능하게 한다. OSSInsight AI ranking에서도 AI agent framework, coding agent, RAG framework가 상위권을 차지하며, 에이전트 개발 Ecosystem이 성숙하고 있음을 보여준다.

**수치**: microsoft/agent-framework + Blaizzy/mlx-vlm 동시 trending, 2026년 top AI repos (ByteByteGo).
**시사점**: Apple Silicon에서 돌아가는 로컬 AI vision 모델 라이브러리가 trending이라는 것은 end-user device AI inference 시대로의 전환을 의미한다. Jay의 Mac Studio (M3)에서 로컬 추론 파이프라인을 구축할 때 Blaizzy/mlx-vlm 스타일의 MLX 최적화가 핵심 자원이 될 수 있다.
→ 원문: [GitHub Trending Repositories – April 5, 2026 – MapoDev](https://www.mapodev.com/en/posts/2026-04-05-github-github-trending-repositories-april-5-2026)
→ 교차확인: [Top AI GitHub Repositories 2026 – ByteByteGo](https://blog.bytebytego.com/p/top-ai-github-repositories-in-2026)

---

### 10. Claude Code Source Leak — 1,893파일 517K줄 코드 24시간 내 유출/분석
(Alex Kim / WSJ / HN)

Anthropic의 Claude Code (AI coding agent) 전체 소스코드가 npm source map을 통해 의도치 않게 유출되었다. 1,893개 파일, 517K줄规模的 코드베이스가 공개되었으며, 개발자들이 24시간 내에 53+ 도구, 95+ slash commands, persistent memory/multi-agent worktrees 등未출시 기능까지 전부 매핑했다. Anthropic은 copyright takedown을 요청했고, Alex Kim의 deep dive에서는 fake tools, frustration regexes, undercover mode 등이 발견되었다.

**수치**: **1,893 files**, **517K lines**, **53+ tools**, **95+ slash commands** 유출.
**시사점**: Coding agent의 '프라이버시'와 '투명성' 사이의 긴장이 표면화했다. Anthropic처럼 대규모로 개발해도 내부 도구가暴露出는 사례는, Jay가 자체 coding agent를 구축할 때 보안Partitionning 전략의 중요성을 보여준다.
→ 원문: [Claude Code Source Leak Deep Dive – Alex Kim](https://alex000kim.com/posts/2026-03-31-claude-code-source-leak/)
→ 교차확인: [Anthropic Races to Contain Claude Code Leak – WSJ](https://www.wsj.com/tech/ai/anthropic-races-to-contain-leak-of-code-behind-claude-ai-agent-4bc5acc7)

---

## 📊 산업/투자/정책

### 11. Q1 2026 Venture Funding — $297B 사상 최고, AI가 전체의 대부분 차지
(Crunchbase / The Neuron)

2026년 1분기에 전 세계 스타트업에 $297B가 투자되며 사상 최고 기록을 경신했다. 6,000개 스타트업에 quarter-on-quarter 약 150% 증가했으며, AI compute 및 frontier lab 투자가 주로 이끌어왔다. AI 분야에 대한 venture 식견이 계속 강세를 보이며, 실제 제품 수익이 뒷받침되지 않는的局面에도 투자가 이어지고 있다.

**수치**: **$297B Q1 2026 venture funding**, **6,000개 스타트업**, quarter-on-quarter **+150%**.
**시사점**: venture capital의 AI에 대한 배팅이 계속되고 있지만, 수익 기반 而不是想象的 기업가치가 평가받는 시점은 멀지 않았다. '演示效果'와 'production 검증' 사이의 갭이 좁혀지는 2026년 여름이 기업의 진정한 기로가 될 수 있다.
→ 원문: [Record-Breaking Q1 2026 Venture Funding – Crunchbase](https://news.crunchbase.com/venture/record-breaking-funding-ai-global-q1-2026/)
→ 교차확인: [Everything That Happened in AI Today – The Neuron](https://www.theneuron.ai/explainer-articles/-around-the-horn-digest-everything-that-happened-in-ai-today-wednesday-april-1-2026)

---

### 12. Apple, AI 전략 재편 — Siri를Third-party 챗봇의 'App Store'로 전환
(Bloomberg / The Neuron)

Apple이 Mac Pro를 단종하고 AI 전략을 Siri 중심의 third-party chatbot 플랫폼으로 전환했다. OpenAI 등 외부 AI를 Siri 내부에 통합하고, iPhone 하드웨어 디자이너에게 $200K-$400K 규모의Retention 보너스를 지급하며 대이직을 방지하고 있다. Rare bonuses라는 표현이 나올 만큼Apple의 AI 인력확보 전쟁이 본격화되고 있다.

**수치**: 디자이너 retention 보너스 **$200K-$400K**, Siri third-party 챗봇 플랫폼 전환.
**시사점**: Apple이 'AI-native hardware company'로 재편되고 있다. Jay의 camera app이나 게임도 Siri Shortcuts 연동성을 갖추면 Apple의 AI 생태계에서Discoverability를 얻을 수 있는 가능성이 열린다.
→ 원문: [Apple Doubles Down on AI Strategy – Bloomberg](https://www.bloomberg.com/news/newsletters/2026-03-29/apple-doubles-down-on-hardware-services-with-revamped-ai-strategy-rare-bonuses)

---

## 💡 미스 김 인사이트

### 오늘의 핵심 트렌드 3가지

1. **Enterprise AI 수익화와 투자 사이의 정점 도래**: Anthropic $30B run rate vs OpenAI secondary market 주가 하락 — 실제 수익이估值보다 빠르게 성장하고 있다. 2026년 여름,_demo에서 production으로의 전환이 중요한 분기령이다.
2. **Small-model reasoning의 democratization**: QED-Nano (4B)로 proprietary 모델 수준의 Olympiad 증명이 가능해졌다. distillation + RL + reasoning cache 파이프라인이 소규모 팀도 열악한 추론 연구 진입장벽을 낮추고 있다.
3. **Coding agent 보안의 현실**: Claude Code leak처럼 대규모 기업도 소스 유출에서 자유롭지 못하다. End-user device AI (Apple Silicon MLX)와 coding agent 보안이 同時에 관심 대상이 되고 있다.

### Jay에게 추천

- **즉시 실행**: QED-Nano를 ONNX 변환하여 Telegram Bot에 수학 튜터 시나리오 테스트. 4B规模的 로컬 추론은 Mac Studio에서 충분히 돌아간다.
- **주목**: Blaizzy/mlx-vlm (MLX 최적화 vision 모델) — Apple Silicon에서 돌아가는 로컬 AI pipeline 구축 시 필수 참조.
- **관망**: OpenAI secondary market trend — IPO 대기 중이나 투자자 신뢰도가 흔들리고 있다. valuation 기반 전략은 재점검 필요.

### 다음 1주 전망

Claude Mythos 5, GPT-5.4, Gemini 3.1의 3대 프런티어 모델 출시 효과를 받아, 다음 주는 **에이전트 성능 비교 리뷰**와 **enterprise 계약 갱신 시즌**이 핵심이 될 것이다. EU AI Act 본격 시행으로 high-risk 시스템 감사도 시작되며, Venture funding 사상 최고 기록이 투자유치 시장을 얼마나 끌어올릴지 지켜볼 필요가 있다.
