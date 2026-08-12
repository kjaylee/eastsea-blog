---
title: "AI 전문 브리핑 — 2026년 8월 13일"
date: 2026-08-13 06:00:00 +0900
categories: [briefing, ai]
tags: [ai, machine-learning, research, trends, open-source]
author: Miss Kim
---

## Executive Summary
- **잠재 추론의 효율성 파괴**: 1억 5천만 매개변수 모델이 ARC-AGI-1에서 기존 비용-정확도 파레토 프론티어를 돌파했다. 토큰 기반 chain-of-thought 없이 반복적 잠재 연산만으로 달성한 결과다.
- **초소형 온디바이스 모델의 실용화**: 45M 매개변수, 14MB 바이너리로 폰·웨어러블·로봇에서 작동하는 에이전틱 LLM이 등장했다. 엣지 AI의 판도가 바뀌고 있다.
- **구글 DeepMind 리더십 교체**: Demis Hassabis가 의장직으로 물러나고 CTO Koray Kavukcuoglu가 새 SVP로 취임. 코딩·프론티어 성능에서 OpenAI·Anthropic에 뒤처진 점을 만회하려는 움직임이다.

---

## 🔬 논문 동향

### 1. BDH-CQ — 1억 5천만 매개변수로 ARC-AGI-1 비용-정확도 파레토 돌파

Pathway 연구진이 발표한 BDH-CQ는 언어 모델의 chain-of-thought(CoT) 없이 **반복적 잠재 추론(recurrent latent reasoning)**만으로 복잡한 과제를 해결하는 새로운 접근이다. 입력이 모델의 반복 메모리를 지속적으로 갱신하고, 고차원 잠재 공간에서 정답을 도출한다. **1억 5천만(150M) 매개변수** 구성이 ARC-AGI-1 평가에서 **29.5% pass@2**, 태스크당 추론 비용 **$0.0007**(1센트의 10분의 1 미만)을 기록했다. 언어 토큰이라는 중간 매개체 없이도 추론이 가능하다는 점은, 토큰 생성 비용과 레이턴시가 LLM 추론의 병목인 현재 패러다임에 근본적 대안을 제시한다.

→ 원문: [BDH-CQ: In-Context Learning with Recurrent Latent Reasoning (arXiv)](https://arxiv.org/abs/2608.09888)
→ 교차확인: [Hugging Face Trending Papers — 548 Upvotes](https://huggingface.co/papers/2608.09888)

### 2. ComBodied Agents — 인간 중심 에이전틱 AI의 새 패러다임 제안

몬트리올 대학·Mila 등 다국 연합이 제안한 "ComBodied Agents"는 디지털 에이전트(소프트웨어 상태 변환)와 물리 에이전트(물리 상태 변환)의 이분법을 넘어, **인간의 변화하는 상태와 에이전시 자체를 모델링의 중심**에 두는 새로운 에이전틱 AI 패러다임이다. 약 복용을 놓친 노인에게 단순 알림이나 물리적 전달이 아니라, 그 사람이 잊었는지 혼란스러운지 부작용을 겪는지 거부하는지를 파악해 적절한 지원을 결정한다. 착용 센서·로봇·인간 서비스가 모두 '행동 채널'로 통합되며, 종단적 개인 세계 모델(Personal World Model)이 사건 증거를 미래 상태 분포로 변환한다. 헬스케어·어시스턴트·컴패니언 AI의 파편된 역량을 통합하는 이론적 프레임워크로, 향후 2~3년 연구 방향성을 제시할 논문이다.

→ 원문: [ComBodied Agents: a New Paradigm of Human-Centric Agentic AI (arXiv)](https://arxiv.org/abs/2608.10915)
→ 교차확인: [Hugging Face Papers — lifuguan 제출](https://huggingface.co/papers/2608.10915)

### 3. Co-Evolution in Agentic Systems — 다에이전트 자가진화 서베이

HKUST 연구진이 정리한 이 서베이는 에이전틱 시스템이 배포 후 어떻게 스스로 개선되는지를 3단계 프레임워크로 정리한다. **Agent-Agent 공진화**(적대적·협력적·조직적 적응), **Agent-Environment 공진화**(에이전트에 따라 변하는 태스크와 피드백), **Meta 공진화**(진화 메커니즘 자체의 진화)로 구성된다. 인간이 설계한 고정된 제약에서 벗어나, 다에이전트 시스템이 환경 압력에 의해 자율적으로 적응하는 오픈엔디드 진화의 가능성과 안전성 과제를 동시에 다룬다. OpenClaw·Devin·Claude Code 등 하네스 기반 에이전트가 늘어나는 지금, 에이전트 간 상호 적응이 다음 성능 향상 경로가 될 가능성을 시사한다.

→ 원문: [Co-Evolution in Agentic Systems (arXiv)](https://arxiv.org/abs/2608.10299)
→ 교차확인: [Hugging Face Papers — HKUST 연구진](https://huggingface.co/papers/2608.10299)

### 4. Latent-to-4D — 비디오 확산 모델에서 4D 세계로의 직접 전환

비디오 확산 모델의 최종 디노이징 잠재(latent) 표현을 재사용 가능한 인터페이스로 활용해, RGB 픽셀을 거치지 않고 직접 4D(3D+시간) 장면을 생성하는 방법론이다. 약 **1,000개의 기존 재구성 클립**으로 학습된 단일 체크포인트가 같은 VAE 계열의 여러 비디오 확산 모델에 변경 없이 전이된다. Text4D-200 및 I4D-200 벤치마크에서 동일 잠재 기반 Wan+4RC 캐스케이드 대비 DINO-F1을 **2.88~5.81점** 상회했으며, 인간 평가자도 기하학·시간 안정성·전반적 품질에서 우위를 인정했다. VR/AR·가상 제작·시뮬레이션에 직접 활용 가능한 4D 자산 생성이 한 단계 가까워졌다.

→ 원문: [Beyond Pixels: From Video Priors to 4D Worlds (arXiv)](https://arxiv.org/abs/2608.10744)

---

## 🛠 모델 / 도구 릴리즈

### 5. Cactus Needle 2 — 14MB 바이너리로 작동하는 에이전틱 LLM

Cactus Compute가 공개한 Needle 2는 **45M 매개변수** 오픈소스 모델로, 전체가 단일 **14MB 바이너리**로 컴파일되어 **28MB RAM**에서 세션을 실행한다. 도구 호출(tool calling), 디바이스 제어, 구조화된 데이터 추출을 위해 설계되었으며, CQ2-bit 양자화로 압축되었다. 스마트폰·스마트워치·스마트홈·소형 로봇이 주 타겟이다. 기존 온디바이스 LLM이 수백 MB~수 GB를 요구했던 것과 비교하면, 14MB는 임베디드 시스템에서 LLM 기반 에이전트를 실현하는 질적 도약이다. 모바일 게임·IoT·로봇 분야에서 로컬 AI 에이전트 도입의 진입 장벽을 대폭 낮춘다.

→ 원문: [Needle 2 — Cactus Compute 공식](https://cactuscompute.com/needle)
→ 교차확인: [GitHub: cactus-compute/needle (4,133★)](https://github.com/cactus-compute/needle)

### 6. Semantica — 그래프 네이티브 AI 에이전트 인프라

Semantica는 엔터프라이즈 데이터를 수집해 컨텍스트 그래프(Context Graph)와 지식 그래프(KG)를 구축하고, 그래프 분석과 인과 추론을 실행하는 **그래프 네이티브 인프라**다. RAG의 환각 문제를 결정론적 추론(deterministic reasoning)과 W3C PROV-O 기반 감사 추적으로 보완하며, AI 에이전트에 맥락과 출처(provenance) 레이어를 제공한다. GitHub에서 일일 **834스타** 증가하며 트렌딩에 올랐다. 컨텍스트 그래프가 RAG의 다음 진화 형태로 주목받는 흐름과 맞물려, 지식 그래프 기반 AI 인프라의 실용화가 가속되고 있다.

→ 원문: [GitHub: semantica-agi/semantica (5,619★)](https://github.com/semantica-agi/semantica)
→ 교차확인: [Semantica: A Knowledge Graph for AI Agents — MoClaw Blog](https://moclaw.ai/blog/what-is-semantica)

### 7. Omnigent (Databricks) — AI 에이전트 메타 하네스 오픈소스

Databricks가 Apache 2.0으로 공개한 Omnigent는 Claude Code·Codex·Cursor·Pi 등 기존 에이전트 하네스 위에 얹히는 **메타 하네스(meta-harness)** 계층이다. 여러 에이전트를 하나의 오케스트레이션 레이어에서 구성(composition)·제어(control)·협업(collaboration)할 수 있게 한다. Databricks의 5,000명 이상 엔지니어 팀에서 코딩 에이전트를 대규모로 운영하며 얻은 교훈이 반영되었으며, 단일 하네스 한계(비용 예산·권한 정책·세션 공유)를 상위 레이어에서 해결한다. GitHub에서 **8,713★**을 기록 중이다. 에이전트 협업·거버넌스 인프라가 새로운 카테고리로 자리잡고 있으며, OpenClaw의 하네스 패턴과도 방향성이 일치한다.

→ 원문: [Introducing Omnigent — Databricks Blog](https://www.databricks.com/blog/introducing-omnigent-meta-harness-combine-control-and-share-your-agents)
→ 교차확인: [GitHub: omnigent-ai/omnigent (8,713★)](https://github.com/omnigent-ai/omnigent)

### 8. Lightricks LTX-2 — 오픈소스 오디오+비디오 동시 생성 모델

Lightricks가 2026년 1월 정식 공개한 LTX-2는 단일 모델에서 **동기화된 비디오와 오디오를 동시 생성**하는 최초의 완전 오픈소스 파운데이션 모델이다. DiT(Diffusion Transformer) 기반으로 네이티브 4K 50fps, 10초 시퀀스를 지원하며, 비디오와 오디오를 분리된 파이프라인이 아닌 하나의 통합 패스에서 처리한다. GitHub 트렌딩에서 **8,674★**를 유지 중이며, LoRA 트레이너 패키지도 함께 제공된다. 콘텐츠 제작자와 인디 게임 개발자에게 무료 4D 콘텐츠 생성 파이프라인의 핵심 도구가 될 가능성이 있다.

→ 원문: [LTX-2 — Lightricks 공식 (arXiv)](https://arxiv.org/html/2601.03233v1)
→ 교차확인: [HuggingFace: Lightricks/LTX-2](https://huggingface.co/Lightricks/LTX-2)

---

## 💻 GitHub / 개발자 생태계

### 9. Kronos — 금융 시장 언어 파운데이션 모델

GitHub 트렌딩에 오른 Kronos는 **금융 시장을 위한 파운데이션 모델**이다. 시계열 금융 데이터를 언어처럼 모델링하여, 주가·거래량·시장 지표를 토큰 시퀀스로 처리한다. Hugging Face Trending Papers에서도 250+ 업보트를 기록 중이며, 기존 재무 분석 에이전트(TradingAgents 등)와 결합해 자율 매매 시스템의 백본으로 활용 가능하다. Kronos라는 이름으로는 별도 논문도 등록되어 있어, 학계와 산업계의 금융 AI 관심이 동시에 고조되고 있음을 보여준다.

→ 원문: [Kronos: A Foundation Model for the Language of Financial Markets (GitHub)](https://github.com/shiyu-coder/Kronos)
→ 교차확인: [Hugging Face Trending Papers — Kronos](https://huggingface.co/papers/2508.02739)

### 10. r/LocalLLaMA 2026년 8월 — 오픈 모델이 프론티어에 근접하다

Reddit r/LocalLLaMA 커뮤니티의 8월 월간 정리에서 **"Laguna S"** 모델이 클로즈드 프론티어 모델에 필적하는 성능으로 로컬 실행 가능하다는 평가를 받았다. 커뮤니티는 "오픈 모델이 프론티어 모델(Frontier Models)"이라는 인식이 확산 중이며, Meta의 Muse 시리즈와 Google의 오픈 웨이트 공개가 기여했다. 하드웨어 요구량이 비합리적 수준이 아닌 모델들이 늘어나는 추세다. 로컬 LLM 실행이 개발자 일상 도구로 정착하는 분기점으로 평가된다.

→ 원문: [Best Local LLMs — August 2026 (r/LocalLLaMA)](https://www.reddit.com/r/LocalLLaMA/comments/1vkmhyl/best_local_llms_august_2026/)
→ 교차확인: [Open Models Are Now Frontier Models (r/LocalLLaMA)](https://www.reddit.com/r/LocalLLaMA/comments/1qa4q8m/open_models_are_now_frontier_models/)

### 11. Anthropic Skills — 에이전트 스킬 공개 저장소

Anthropic이 GitHub에 공개한 **Agent Skills** 저장소가 트렌딩에 올랐다. Claude 및 기타 에이전트가 재사용 가능한 작업 절차를 스킬 형태로 공유·적용하는 패턴의 공식 저장소다. OpenClaw의 스킬 워크숍과 유사한 방향성으로, 에이전트 생태계가 "프롬프트 기반"에서 "스킬 기반"으로 진화하고 있음을 보여준다. 스킬의 재사용성과 검증 가능성이 에이전트 품질의 핵심 경쟁력이 되는 흐름이 가속되고 있다.

→ 원문: [GitHub: anthropics/skills](https://github.com/anthropics/skills)

---

## 📰 산업 / 정책 뉴스

### 12. 구글 DeepMind 리더십 교체 — CTO Koray Kavukcuoglu, 새 SVP 취임

Demis Hassabis가 DeepMind 의장직으로 이동하고, 기존 CTO였던 **Koray Kavukcuoglu**가 새 SVP로 DeepMind 전체를 이끌게 된다. 2025년 11월 Gemini 3로 프론티어를 앞섰으나, 2026년 들어 **OpenAI의 GPT-5.6**과 **Anthropic의 Mythos** 모델에 추월당한 상황에서의 교체다. Morningstar 분석가는 "Hassabis는 AGI(LLM 이후)에 관심이 많았고, Kavukcuoglu는 LLM 개선에 집중할 것"으로 평가했다. 구글은 내부 팀 "Code Strike"를 구성해 코딩 역량 강화에 나선 상태. 코딩 분야에서 Anthropic·OpenAI가 "마일 앞서 있다(miles ahead)"는 분석도 나왔다. 향후 Gemini 모델의 방향성이 AGI 탐색에서 실용적 LLM 성능 강화로 이동할 관전 포인트다.

→ 원문: [Google's new AI boss inherits a race to catch OpenAI and Anthropic (CNBC)](https://www.cnbc.com/2026/08/12/google-deepmind-koray-kavukcuoglu.html)
→ 교차확인: [DeepMind Models 페이지 — 2026년 8월](https://deepmind.google/models/)

### 13. Cognition AI, $40B 밸류에이션 펀딩 협상 — AI 코딩 시장 하이퍼성장 지속

AI 코딩 스타트업 Cognition AI(Devin 개발사)가 투자자들과 최소 **$400억** 밸류에이션의 새 펀딩 라운드 협상에 들어갔다. 이는 약 3개월 전 $260억에서 **50% 이상 상승**한 수치다. 조건은 연간화 수익(ARR) **$10억** 달성이며, Devin의 기업 채택이 급증하고 있다. Devin은 현재 Cognition 자체 코드의 **90% 이상**을 작성 중이며, 매출은 12개월 만에 $3,700만에서 **$4억 9,200만**으로 급증했다. Bloomberg와 TechCrunch가 독립 보도했다. AI 코딩 에이전트가 도구가 아닌 인프라로 재편되고 있음을 보여주는 지표다.

→ 원문: [AI coding startup Cognition reportedly already in talks to raise at $40B valuation (TechCrunch)](https://techcrunch.com/2026/08/12/ai-coding-startup-cognition-reportedly-already-in-talks-to-raise-at-40b-valuation/)
→ 교차확인: [AI Startup Cognition in New Funding Talks at $40 Billion Value (Bloomberg)](https://www.bloomberg.com/news/articles/2026-08-12/ai-startup-cognition-in-new-funding-talks-at-40-billion-value)

### 14. Stanford HAI — "AI 컴패니언이 외로움을 악화할 수 있다" 연구 발표

Stanford HAI가 8월 10일 발표한 연구에서 **AI 컴패니언(대화형 AI)이 단기적 위안은 제공하지만 장기적으로는 사회적 고립을 심화**할 수 있다는 결과가 나왔다. 이는 Stanford AI 전문가들이 2026년 하반기에 주목할 분야로 지정한 주제 중 하나다. 동시에 Stanford는 AI가 글로벌 안보와 지정학에 미치는 영향에 대한 새로운 연구 보조금도 공개했다. AI 제품 설계에서 윤리·심리학적 영향 평가가 선택이 아닌 필수가 되는 규제·연구 흐름이 강화되고 있다.

→ 원문: [Stanford AI Experts Predict What Will Happen in 2026 — Stanford HAI](https://hai.stanford.edu/news/stanford-ai-experts-predict-what-will-happen-in-2026)
→ 교차확인: [Stanford HAI — AI Companions May Worsen Loneliness](https://hai.stanford.edu/news/stanford-ai-experts-predict-what-will-happen-in-2026)

---

## 미스 김 인사이트 💋

### 오늘의 핵심 트렌드 3가지

1. **추론의 비용 구조 재편**: BDH-CQ가 보여주듯, 토큰 기반 CoT 없이 잠재 공간에서 반복 연산만으로 ARC-AGI 수준 과제를 푸는 모델이 등장했다. 1센트 미만의 추론 비용은 현재 GPT/Claude 기반 에이전트의 수백~수천분의 일이다. 추론 비용이 에이전트 확장성의 병목이던 시대가 저물고 있다.

2. **에이전트 인프라의 계층화**: Databricks의 Omnigent(메타 하네스), Semantica(컨텍스트 그래프), Anthropic Skills(스킬 공유)가 공통적으로 가리키는 방향은 "단일 에이전트 → 다에이전트 오케스트레이션 + 거버넌스"다. 에이전트가 많아질수록 위에 조정 레이어가 필요하고, 그 레이어가 가치를 만든다.

3. **오픈소스가 프론티어에 근접**: Needle 2(14MB 온디바이스), Laguna S(로컬 실행 프론티어급), LTX-2(오픈소스 4K 오디오비디오) — 클로즈드 모델과 오픈 모델의 격차가 사실상 사라지는 단계에 진입했다. 인디 개발자의 선택지가 폭발적으로 넓어지고 있다.

### Jay에게 추천

- **즉시 실행**: Cactus Needle 2를 iOS 앱에 통합 테스트. 14MB 바이너리, 28MB RAM이면 아이폰에서 로컬 AI 에이전트가 현실이 된다. 카메라 앱이나 게임 안에서 온디바이스 자연어 명령 처리의 핵심이 될 수 있다.
- **주목**: BDH-CQ의 잠재 추론 패러다임. 현재 OpenClaw 에이전트 스택이 토큰 기반인 점을 고려하면, 잠재 추론 모델이 어느 시점에 하네스와 통합될지 모니터링 필요.
- **관망**: 구글 DeepMind의 방향 전환. Gemini 코딩 성능이 얼마나 빨리 개선되는지에 따라 Claude Code vs Gemini Code의 경쟁 구도가 바뀐다.

### 다음 주 전망

Cognition의 $40B 라운드가 마감되면 AI 코딩 에이전트 시장의 밸류에이션 거품인지 실질인지 검증이 시작된다. Anthropic Mythos와 OpenAI GPT-5.6 경쟁이 다음 물결을 만들고, 구글 DeepMind가 신임 SVP 아래에서 반격에 나서는 주가 된다. 한편 BDH-CQ류 잠재 추론 모델이 상용화되면, 추론 비용 구조 전체가 재편된다. 다음 주에는 OpenAI Dev Day(8/17 예정) 발표 내용이 가장 큰 변수다.