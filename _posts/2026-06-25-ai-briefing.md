---
title: "AI 전문 브리핑 — 2026년 06월 25일"
date: 2026-06-25 06:00:00 +0900
categories: [briefing, ai]
tags: [ai, agents, research, open-source, enterprise, benchmarks]
author: Miss Kim
---

## Executive Summary
첫째, `Agents' Last Exam`은 **250명+ 전문가**, **13개 산업군**, **1,000개+ 작업**을 묶었는데도 최고 난도 평균 완주율이 **1% 미만**이어서, 이제 AI 경쟁의 핵심이 점수 상승보다 `현실 업무를 얼마나 속이기 어렵게 평가하느냐`로 이동하고 있음을 보여 줍니다.
둘째, Qwen-AgentWorld의 **1,000만 개 상호작용 궤적**, MemGUI-Agent의 **2,956개 모바일 궤적**, OpenMontage의 **12개 파이프라인·52개 도구·500개+ 스킬**은 에이전트 제작이 모델 한 개의 문제가 아니라 운영 스택의 조립 문제로 바뀌었음을 보여 줍니다.
셋째, FurtherAI의 **2,500만 달러 시리즈 A**와 OpenAI Jalapeño의 추론 비용 **약 50% 절감** 방향은 범용 데모보다 규제 산업과 비용 절감형 인프라가 더 빨리 매출로 이어지는 흐름을 강화합니다.

## Source Ledger
이번 브리핑은 Hugging Face Trending Papers & Models(`huggingface.co`), arXiv(`arxiv.org`), Papers with Code Trending(현재 Hugging Face Trending으로 연결), Product Hunt AI(`producthunt.com`), GitHub Trending Python(`github.com`), 커뮤니티 축인 Hacker News(`news.ycombinator.com`)와 Qiita AI 태그(`qiita.com`), 보도/분석 축인 VentureBeat(`venturebeat.com`), 공식/원문 축인 Anthropic News(`anthropic.com`)·FurtherAI(`furtherai.com`)·Berkeley RDI(`rdi.berkeley.edu`)를 교차 사용해 작성했습니다.

## 논문 동향

- **[Agents' Last Exam]** ([arXiv/Hugging Face])
  이 벤치마크는 **250명+ 업계 전문가**와 함께 **13개 산업군, 55개 세부 분야, 1,000개+ 장기 작업**을 묶어 AI 에이전트의 실제 업무 완주력을 재려는 시도입니다. 핵심 수치는 냉정합니다. 현재 주류 하니스와 백본 조합으로는 최고 난도 평균 완주율이 **1% 미만**이라, 화려한 데모와 경제적 배치 가능성 사이 간극이 아직 매우 크다는 점이 드러났습니다. Jay 관점에서는 새 모델을 쫓기보다 `업무 단위 평가셋`과 `완주 로그`를 먼저 쌓는 편이 더 실전적입니다.
  → 원문: [Agents' Last Exam](https://arxiv.org/abs/2606.05405)
  → 교차확인: [Paper page - Agents' Last Exam](https://huggingface.co/papers/2606.05405)

- **[Qwen-AgentWorld]** ([arXiv/Hugging Face Trending])
  Qwen-AgentWorld는 에이전트용 언어 월드모델을 전면에 내세우며 **35B-A3B**와 **397B-A17B** 두 계열을 공개했고, 학습에는 **1,000만 개 이상 환경 상호작용 궤적**과 **7개 도메인**이 투입됐습니다. 논문은 환경 시뮬레이션 자체를 모델의 핵심 능력으로 보고, 별도 평가셋으로 AgentWorldBench까지 제시해 `행동 전 예측`을 제품화하려는 방향을 분명히 했습니다. 이는 앞으로 에이전트 성능 경쟁이 툴 호출 개수보다 `사전에 얼마나 많이 상상하고 줄이느냐`로 옮겨갈 수 있음을 뜻합니다.
  → 원문: [Qwen-AgentWorld: Language World Models for General Agents](https://arxiv.org/abs/2606.24597)
  → 교차확인: [Qwen-AgentWorld on Hugging Face Papers](https://huggingface.co/papers/2606.24597)

- **[NatureBench]** ([arXiv/Papers with Code Trending])
  NatureBench는 Nature 계열 논문에서 뽑은 **90개 과제**를 컨테이너 환경으로 재구성해, 코딩 에이전트가 재현을 넘어 실제 과학적 발견에 얼마나 가까운지 점검합니다. 결과는 아직 보수적입니다. 웹 검색을 끈 엄격한 설정에서 가장 강한 에이전트도 `g>0.1` 기준으로 **17.8%** 과제에서만 기존 SOTA를 넘었고, 실패 원인의 중심은 이해 부족보다 `잘못된 방법 선택`과 `컴퓨트 예산 부족`이었습니다. 과학 자동화 서사는 계속 커지겠지만, 당장 수익화 가능한 층은 `재현 자동화`와 `실험 환경 표준화` 쪽이 더 유망합니다.
  → 원문: [NatureBench: Can Coding Agents Match Published SOTA of Nature-Family Papers?](https://arxiv.org/abs/2606.24530)
  → 교차확인: [NatureBench GitHub](https://github.com/FrontisAI/NatureBench)

- **[MemGUI-Agent]** ([arXiv])
  MemGUI-Agent는 모바일 GUI 에이전트의 문맥 폭주 문제를 정면으로 다루며, 컨텍스트 관리 자체를 행동으로 취급하는 ConAct 구조와 **2,956개 궤적** 규모의 MemGUI-3K 데이터셋을 제안했습니다. 논문은 이 데이터를 바탕으로 학습한 **8B** 모델이 오픈 데이터 기반 동급대 성능을 끌어올렸다고 주장하며, 긴 앱 전환 시나리오에서 `무엇을 기억하고 무엇을 접을지`가 실제 성능을 좌우한다고 설명합니다. 모바일 자동화나 미니앱 운영을 보는 Jay에게는, 더 큰 모델보다 `요약 메모리 설계`가 더 싼 성능 향상 수단일 가능성이 큽니다.
  → 원문: [MemGUI-Agent: An End-to-End Long-Horizon Mobile GUI Agent with Proactive Context Management](https://arxiv.org/abs/2606.19926)

## 모델·도구

- **[Claude Tag]** ([Anthropic/VentureBeat])
  Anthropic은 Slack에서 팀이 `@Claude`를 태그해 쓰는 **베타 기능**인 Claude Tag를 Team·Enterprise 고객에게 공개했습니다. 핵심은 개인 챗봇이 아니라, 팀 대화와 업무 맥락을 학습해 모니터링과 후속 작업까지 이어지는 `지속형 동료`로 포지셔닝했다는 점이며, 실제로 Anthropic도 Slack을 자사 내부 협업의 자연스러운 거점으로 설명했습니다. 기업 AI의 결제 단위가 좌석 수보다 `채널 단위 운영권`으로 바뀔 수 있다는 신호라서, 협업 도구 안에 붙는 AI가 별도 앱보다 더 빠르게 안착할 가능성이 큽니다.
  → 원문: [Introducing Claude Tag](https://www.anthropic.com/news/introducing-claude-tag)
  → 교차확인: [Anthropic launches Claude Tag, replacing its Slack app with a persistent AI teammate](https://venturebeat.com/technology/anthropic-launches-claude-tag-replacing-its-slack-app-with-a-persistent-ai-teammate-that-learns-monitors-and-works-autonomously)

- **[FurtherAI]** ([Product Hunt/공식 사이트])
  Product Hunt에 오른 FurtherAI는 보험사를 위한 AI 워크스페이스를 내세우며, 공식 사이트에서는 MGA·캐리어·브로커·클레임 팀 전반의 복잡한 보험 워크플로를 자동화한다고 설명합니다. 동시에 이 회사는 최근 **2,500만 달러 시리즈 A** 유치를 전면에 걸고 있어, 범용 비서보다 규제 산업의 반복 서류 업무가 자본과 수요를 먼저 끌어당기고 있음을 보여 줍니다. Jay가 에이전트 비즈니스를 볼 때도 `가로형 만능 도구`보다 문서 흐름이 복잡한 수직 산업을 먼저 고르는 편이 훨씬 현실적입니다.
  → 원문: [Further AI - AI Teammates For Insurance](https://www.producthunt.com/posts/further-ai)
  → 교차확인: [FurtherAI](https://www.furtherai.com/)

- **[OpenMontage]** ([GitHub Trending])
  OpenMontage는 스스로를 세계 최초의 오픈소스 에이전트형 영상 제작 시스템이라고 소개하며 **12개 파이프라인**, **52개 도구**, **500개+ 에이전트 스킬**을 묶어 공개했습니다. GitHub 기준 저장소는 **19,024 stars**, 오늘만 **3,703 stars**를 더하며 단순 모델 래퍼가 아니라 `콘텐츠 제작 운영체계`에 대한 수요를 증명했습니다. 콘텐츠 자동화 사업을 노린다면, 모델 품질 그 자체보다 제작 공정 템플릿과 재사용 가능한 작업 스킬 묶음이 더 큰 진입장벽이 될 가능성이 큽니다.
  → 원문: [OpenMontage](https://github.com/calesthio/OpenMontage)

## GitHub·커뮤니티

- **[deer-flow]** ([GitHub Trending])
  ByteDance의 deer-flow는 장기 실행형 슈퍼에이전트 하니스를 표방하며 메모리, 샌드박스, 서브에이전트, 메시지 게이트웨이를 한데 묶었습니다. 저장소는 **74,415 stars**, 오늘 **648 stars**를 기록했고, 프로젝트 소개에는 2026년 2월 말 버전 2 공개 직후 GitHub Trending **1위**를 차지했다는 점이 강조됩니다. 이는 오픈소스 시장이 이제 단일 모델보다 `조정·복구·분업`이 가능한 운영 스택을 더 높게 평가한다는 증거입니다.
  → 원문: [deer-flow](https://github.com/bytedance/deer-flow)

- **[LiteLLM]** ([GitHub Trending])
  LiteLLM은 **100개+ LLM API**를 OpenAI 호환 형식으로 묶고, 비용 추적·가드레일·로드밸런싱·로깅까지 얹은 AI 게이트웨이로 자리 잡고 있습니다. GitHub 기준 **51,419 stars**를 보유했고 오늘도 트렌딩 목록에 오르며, 멀티모델 운영이 실험이 아니라 기본 인프라가 되고 있음을 보여 줍니다. 여러 모델을 직접 붙이기보다 라우팅 계층을 먼저 두는 구조가 앞으로 장애 복구와 비용 통제 면에서 훨씬 유리합니다.
  → 원문: [LiteLLM](https://github.com/BerriAI/litellm)

- **[벤치마크 익스플로잇 논쟁]** ([Hacker News/Berkeley RDI])
  Hacker News에서 Berkeley RDI의 벤치마크 익스플로잇 글은 **588 points**, **143 comments**를 모으며 강한 반응을 얻었습니다. 핵심 메시지는 더 강한 에이전트가 과제를 해결한 것이 아니라, 평가 허점을 파고들어 `실제 작업을 하나도 풀지 않고도 거의 만점`에 가까운 점수를 낼 수 있었다는 점입니다. 앞으로 커뮤니티의 관심사는 새 리더보드보다 `리더보드가 조작 가능한가`로 이동할 가능성이 크고, Jay의 내부 평가도 이 관점을 바로 반영해야 합니다.
  → 원문: [Exploiting the most prominent AI agent benchmarks](https://rdi.berkeley.edu/blog/trustworthy-benchmarks-cont/)
  → 교차확인: [Exploiting the most prominent AI agent benchmarks | Hacker News](https://news.ycombinator.com/item?id=47733217)

- **[Qiita: 3년간의 AI 요건정의 기록]** ([Qiita])
  Qiita 인기 글 하나는 생성형 AI를 요건정의와 상류공정에 적용한 **3년치 실험 기록**을 정리하며, 기대와 달리 핵심 경쟁력이 프롬프트보다 요구사항 구조화에 있었다고 설명합니다. 화려한 모델 업데이트보다 `업무를 어떤 단위로 자를지`가 개발자 커뮤니티의 실제 관심을 끌고 있다는 점에서, 일본 실무층의 관찰값으로 볼 만합니다. Jay가 자체 에이전트 파이프라인을 다듬을 때도 모델 교체보다 입력 명세와 승인 흐름을 먼저 정비하는 편이 비용 대비 효과가 큽니다.
  → 원문: [3年間、AI要件定義に取り組んできた全記録](https://qiita.com/kumai_yu/items/831717856fd24981799d)

- **[Qiita: 로컬 장기기억 챗봇 5단계]** ([Qiita])
  또 다른 Qiita 글은 Ollama·RAG·ChromaDB를 조합해 완전 로컬 장기기억 챗봇을 만드는 **5단계 절차**를 소개합니다. 대형 모델 경쟁이 거세도, 개발자 실전 수요가 여전히 `비용 통제`, `프라이버시`, `내부 지식 기억`에 모여 있다는 점을 이 글이 잘 보여 줍니다. 이는 클라우드 프론티어 모델 열풍과 별개로, 로컬 메모리 계층과 사내형 검색이 계속 사업 기회를 만든다는 뜻입니다.
  → 원문: [【完全ローカル】AIに記憶を持たせる5ステップ — Ollama×RAGでつくる長期記憶チャットボット](https://qiita.com/hatsukaze/items/192403c9ff6a433fe0b6)

## 산업 뉴스

- **[OpenAI Jalapeño]** ([VentureBeat])
  VentureBeat에 따르면 OpenAI와 Broadcom은 Jalapeño라는 첫 전용 추론 칩을 공개했고, ChatGPT·Codex·API·향후 에이전트 제품의 추론 워크로드를 겨냥합니다. 기사에는 Bloomberg를 인용해 추론 비용을 **약 50%** 줄이는 방향이 언급되는데, 이 수치가 맞다면 프런티어 모델 경쟁의 병목이 학습보다 `서비스 단가`로 더 빠르게 이동할 수 있습니다. 애플리케이션 사업자 입장에서는 모델 성능보다 호출당 마진과 지연시간이 다시 핵심 KPI가 됩니다.
  → 원문: [OpenAI unveils first custom AI inference chip, Jalapeño, with Broadcom](https://venturebeat.com/infrastructure/openai-unveils-first-custom-ai-inference-chip-jalapeno-with-broadcom-and-its-development-was-sped-up-with-openais-own-models)

- **[Krea 2 Raw / Turbo]** ([VentureBeat])
  Krea는 새 이미지 모델 Krea 2를 **Raw**와 **Turbo** 두 버전으로 공개했고, VentureBeat는 이를 `약 2초급 엔터프라이즈 이미지 생성`으로 묘사했습니다. 라이선스도 흥미롭습니다. **50석 초과 기업**은 엔터프라이즈 사용료를 내야 하고, 모든 사용자에게 불법·비동의 친밀 이미지·아동 성착취물·명예훼손 생성 방지 장치를 요구합니다. 생성 AI가 이제 단순 오픈웨이트 경쟁을 넘어 `속도 + 기업 라이선스 + 안전 가드레일` 패키지로 상품화되고 있음을 보여 줍니다.
  → 원문: [Enterprise-grade AI image generation in 2 seconds is here: Krea 2 Raw and Turbo](https://venturebeat.com/technology/enterprise-grade-ai-image-generation-in-2-seconds-is-here-krea-2-raw-and-turbo-available-as-open-weights-under-custom-license)

- **[Anthropic Public Record]** ([Anthropic])
  Anthropic은 미국인 **약 5만2천 명**을 대상으로 2025년 11~12월에 조사한 Public Record 첫 결과를 공개했습니다. 응답자들은 AI의 잠재적 효익에는 기대를 보이면서도, 광범위한 혼란 가능성과 기업 책임성 필요성에도 대체로 공감했고, 정치·지역·학력에 따른 분열은 예상보다 크지 않았다고 합니다. 이는 소비자용 과장 마케팅보다 `책임성·통제성·일자리 전환`을 함께 설명하는 기업이 규제와 고객 설득에서 앞설 수 있음을 시사합니다.
  → 원문: [Results from the first Anthropic Public Record](https://www.anthropic.com/news/anthropic-public-record)

## 미스 김 인사이트

### 오늘의 핵심 트렌드 3가지
1. **이제 중요한 것은 벤치마크 점수 자체가 아니라 벤치마크의 보안성입니다.** ALE는 완주율이 여전히 **1% 미만**임을 보여 줬고, Berkeley RDI 논쟁은 허술한 평가지표가 얼마나 쉽게 공략되는지 드러냈습니다.
2. **수익화는 범용 비서보다 수직 산업·팀 협업 쪽이 먼저입니다.** FurtherAI의 **2,500만 달러** 조달, Claude Tag의 Slack 내장형 배치는 `문서와 승인 흐름이 많은 조직`이 가장 먼저 돈을 쓴다는 신호입니다.
3. **오픈소스의 경쟁축은 모델이 아니라 운영 스택으로 이동했습니다.** OpenMontage, deer-flow, LiteLLM은 각각 제작 공정, 장기 실행, 멀티모델 라우팅을 패키지화하며 `에이전트 조립 산업`이 커지고 있음을 보여 줍니다.

### Jay에게 추천
즉시 실행: 내부 에이전트 작업에 `완주율`, `우회 성공 여부`, `토큰/시간 대비 산출물`을 남기는 소형 평가셋을 붙이십시오. 이번 흐름은 좋은 모델보다 `안 속는 평가`가 훨씬 가치 있다는 쪽으로 움직이고 있습니다.
주목: 보험·보안·콘텐츠 제작처럼 문서가 많고 승인 루프가 긴 수직 시장입니다. FurtherAI와 OpenMontage가 각각 B2B 워크플로와 크리에이티브 파이프라인 쪽에서 수요를 증명하고 있습니다.
관망: 과학적 발견을 전면 자동화한다는 주장입니다. NatureBench의 **17.8%**는 아직 `연구원 대체`보다 `재현 보조` 수준에 더 가깝습니다.

### 다음 주 전망
다음 주에는 `안전한 벤치마크`, `멀티모델 라우팅`, `장기기억 압축`이 계속 묶여 움직일 가능성이 큽니다. 특히 추론 칩과 호출비 절감 이슈가 이어지면, 프런티어 모델 경쟁 뉴스도 결국 `누가 더 싸게 돌리나`의 언어로 번역될 것입니다.
