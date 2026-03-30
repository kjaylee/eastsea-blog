---
title: "AI 전문 브리핑 2026년 3월 30일"
date: 2026-03-30 06:00:00 +0900
categories: [briefing, ai]
tags: [ai, machine-learning, research, trends, llm, agents, openai, anthropic, google]
author: Miss Kim
---

## Executive Summary

- **핵심1**: Nature지가 AI Scientist의 완전한 연구 자동화 파이프라인을 게재 — AI가 아이디어 구상부터 논문 제출까지 자동화하고 동료심사 1차를 통과, 연구 패러다임 전환의 신호탄.
- **핵심2**: OpenAI $110B 펀딩(Amazon·Nvidia·SoftBank) + Pentagon 독점 AI 계약 체결 — $730B 밸류에이션으로 기업-군사 AI 생태계를 사실상 독점 구도로 재편 중.
- **핵심3**: Google Gemini가 ChatGPT·Claude 히스토리 직수입 기능을 출시해 AI 플랫폼 전환 장벽을 낮추는 동시에 사용자 이탈 방지 전쟁을 본격화.

---

## 🔬 논문 동향

**[AI가 연구 논문을 스스로 쓴다 — Nature 게재 AI Scientist]** (Nature / SakanaAI)  
Nature지가 2026년 3월 발표한 논문에서 AI Scientist는 아이디어 생성·문헌 검색·실험 설계·결과 분석·원고 작성·동료심사 모의평가까지 전 과정을 인간 개입 없이 수행함. 핵심 혁신인 자동 리뷰어(Automated Reviewer)가 실제 컨퍼런스 채택 결정을 인간 리뷰어 수준으로 예측하며, AI 생성 논문이 ML 워크숍 동료심사 1차를 통과함. 테스트 컴퓨팅·기반 모델 품질이 높아질수록 논문 질도 향상되어 향후 버전은 더 강력해질 것이 예측된다.  
→ 원문: [Towards end-to-end automation of AI research](https://www.nature.com/articles/s41586-026-10265-5)  
→ 교차확인: [SakanaAI/AI-Scientist-v2 GitHub](https://github.com/SakanaAI/AI-Scientist-v2)

**[Hyperagents — 자기 수정 가능한 메타인지 에이전트 프레임워크]** (Facebook Research / arXiv 2603.19461)  
Facebook Research의 Hyperagents는 태스크 에이전트와 메타 에이전트가 단일 편집 가능한 프로그램 안에서 서로의 코드를 수정하는 자기참조적(self-referential) 구조를 채택함. 기존 에이전트가 코딩 작업에만 강하던 한계를 넘어 코드 외 다양한 계산 도메인에서도 오픈엔드 성능 향상이 입증됨. 에이전트가 스스로의 메타인지를 수정하는 구조는 AI 자율 학습의 근본적인 새 방향을 제시한다.  
→ 원문: [Hyperagents (HuggingFace Papers)](https://huggingface.co/papers/2603.19461)  
→ 교차확인: [arXiv 2603.19461](https://arxiv.org/abs/2603.19461)

**[MiroThinker-1.7 & H1 — GAIA 81.9% 달성 오픈소스 리서치 에이전트]** (MiroMindAI / arXiv 2603.15726)  
MiroThinker-1.7은 256K 컨텍스트 창에서 태스크당 최대 **600회** 도구 호출이 가능한 오픈소스 리서치 에이전트로, 72B 모델이 GAIA **81.9%**, HLE **37.7%**, BrowseComp **47.1%**를 달성해 이전 오픈소스 최고 성능을 경신하며 GPT-5-high에 근접함. 상호작용 스케일링(interaction scaling)이 모델 크기·컨텍스트 길이와 함께 성능의 세 번째 축임을 강화학습으로 입증함. 오픈소스 연구 에이전트가 상업 모델을 따라잡는 속도가 예상보다 훨씬 빠르다.  
→ 원문: [MiroThinker-1.7 (arXiv)](https://arxiv.org/abs/2603.15726)

**[PixelREPA — KAIST, 픽셀 공간 확산 트랜스포머 FID 1.81 달성]** (KAIST AI / arXiv 2603.14366)  
KAIST AI 팀의 PixelREPA는 픽셀 공간 확산 트랜스포머(JiT)의 REPA 실패 원인인 정보 비대칭 문제를 Masked Transformer Adapter로 해결하여 FID **1.81**, IS **317.2**를 달성함. JiT-B/16 기준 수렴 속도를 **2배 이상** 향상했으며 사전 토크나이저 없이 픽셀 직접 확산이 가능해짐. 경량 이미지 생성 모델의 실용성이 크게 높아져 엣지 디바이스 이미지 생성 연구에 직접 적용 가능하다.  
→ 원문: [PixelREPA (HuggingFace)](https://huggingface.co/papers/2603.14366)

---

## 🛠 모델 · 도구

**[Google Gemini, ChatGPT·Claude 히스토리 직접 이식 기능 출시]** (Google / 2026-03-26)  
Google이 Gemini 설정에 메모리 임포트 기능을 추가해 ChatGPT·Claude 등 타 AI 서비스의 메모리·맥락·대화 히스토리를 ZIP 파일로 가져올 수 있게 됨. 기존 AI에 지정된 프롬프트를 붙여넣어 선호도 요약을 생성하고 Gemini에 이식하는 방식이며, 과거 대화 스레드 검색·연속 활용도 지원함. AI 플랫폼 전환 비용을 낮추는 동시에 타사 사용자 데이터를 흡수하는 락인(lock-in) 전략으로, 직접적 ChatGPT/Claude 사용자층 공략이 핵심 의도다.  
→ 원문: [Gemini Import Tool (MacRumors)](https://www.macrumors.com/2026/03/26/gemini-import-tool/)  
→ 교차확인: [Gemini ChatGPT import (DigitalTrends)](https://www.digitaltrends.com/computing/geminis-new-chatgpt-import-lets-you-keep-context-when-you-switch/)

**[Google, ProducerAI 인수 + Lyria 3 음악 생성 모델 Gemini 통합]** (Google / 2026-02-24)  
Google이 음악 AI 스타트업 ProducerAI를 Google Labs에 인수하고, Lyria 3 음악 생성 모델을 Gemini에 탑재해 **30초 트랙** 무료 생성을 롤아웃함. 모든 생성 오디오에 SynthID AI 워터마크를 삽입해 저작권 추적성을 확보했으며, Suno·Udio 등 음악 AI 스타트업에 대한 Big Tech의 시장 반격이 본격화됨. 음악 생성 AI가 일반 크리에이터 워크플로에 통합되면서 콘텐츠 제작 비용의 추가 하락이 예상된다.  
→ 원문: [Google ProducerAI Lyria 3 (TheAITrack)](https://theaitrack.com/google-producerai-acquisition-lyria-3-gemini/)

---

## 💻 GitHub · 커뮤니티

**[bytedance/deer-flow — 주간 18,872★ 폭발, 오픈소스 SuperAgent 1위]** (GitHub Trending)  
ByteDance의 deer-flow는 연구·코딩·콘텐츠 생성을 수분~수시간 단위 장기 작업으로 처리하는 오픈소스 SuperAgent 하네스로, 이번 주 **18,872 stars**를 획득해 GitHub Python 트렌딩 1위(총 52,406★)에 등극함. 샌드박스·메모리·도구·서브에이전트·메시지 게이트웨이를 결합한 LangChain 기반 구조이며 자체 사이트(deerflow.tech)도 운영 중. LangGraph·CrewAI 대비 장기 멀티태스크 처리 능력이 차별점으로, 에이전트 자동화 수요의 새로운 집결지다.  
→ 원문: [bytedance/deer-flow (GitHub)](https://github.com/bytedance/deer-flow)

**[SakanaAI/AI-Scientist-v2 — 에이전틱 트리 탐색으로 워크숍 논문 자동 생성]** (GitHub Trending)  
AI-Scientist-v2는 이번 주 855 stars 증가(총 3,814★)로 주목받는 프로젝트로, 에이전틱 트리 탐색(agentic tree search)을 통해 워크숍 레벨의 과학적 발견을 자동화하는 공식 구현체임. Nature 게재 AI Scientist 논문과 직결된 코드베이스로, 기반 모델 품질이 생성 논문 품질에 직접 영향을 미침이 실증됨. Qiita(일본 개발자 커뮤니티)에서도 LLM·생成AI 태그 인기가 급증해 AI 에이전트 실험이 아시아 개발자층으로도 빠르게 확산되고 있다.  
→ 원문: [SakanaAI/AI-Scientist-v2 (GitHub)](https://github.com/SakanaAI/AI-Scientist-v2)

---

## 📰 산업 · 시장 뉴스

**[OpenAI, $110B 투자 유치 — 밸류에이션 $730B 확정]** (TheAITrack / 2026-02-27)  
OpenAI가 Amazon, Nvidia, SoftBank로부터 **$110B**를 조달해 프리머니 밸류에이션 **$730B**를 기록, 스타트업 역사상 최대 규모 단일 펀딩 라운드를 달성함. AWS 배포 확대와 Nvidia 인프라 역량이 강화되어 추론 처리량과 가격 경쟁력이 동시에 향상될 전망이며, Anthropic과의 자본 격차가 단기에 해소되기 어려워짐. 엔터프라이즈 시장 선점 속도가 빨라지며 2026년 AI SaaS 시장의 구조적 재편이 예고된다.  
→ 원문: [OpenAI $110B Funding (TheAITrack)](https://theaitrack.com/openai-raises-110b-730b-valuation-aws-nvidia/)  
→ 교차확인: [OpenAI Anthropic Pentagon (Axios)](https://www.axios.com/2026/03/11/openai-anthropic-pentagon-google)

**[OpenAI Pentagon 독점 계약 vs Anthropic 연방 퇴출 — AI 정치 분쟁]** (NYT / TechCrunch / 2026-03)  
OpenAI가 기밀 클라우드 전용 3개 레드라인 조건으로 Pentagon과 AI 계약을 체결했고, Trump 행정부는 연방 기관에 Anthropic AI를 **6개월 내** 단계적 퇴출하도록 지시함. OpenAI·Google DeepMind 직원 **30명 이상**이 Anthropic의 국방부 소송을 공개 지지하는 이례적 경쟁사 연대가 발생했으며, Google은 조용히 Pentagon 수주를 확대해 어부지리를 취하는 중. AI의 군사 활용과 책임 소재를 둘러싼 규범 전쟁이 본격화되어 정부 계약 전략과 기업 가치에 중대한 변수가 됐다.  
→ 원문: [OpenAI Pentagon Deal (NYT)](https://www.nytimes.com/2026/03/02/technology/openai-pentagon-deal-amended-surveillance.html)  
→ 교차확인: [OpenAI Google Employees Back Anthropic (TechCrunch)](https://techcrunch.com/2026/03/09/openai-and-google-employees-rush-to-anthropics-defense-in-dod-lawsuit/)

**[Block, 직원 40% 해고 — Jack Dorsey "AI가 소규모 팀을 가능하게 했다"]** (TheAITrack / 2026-02-26)  
Block(구 Square)이 **4,000명 이상**(전체의 **40%**)을 해고하면서 CEO Jack Dorsey가 AI 도구 덕분에 더 작고 효율적인 팀 운영이 가능해졌다고 공식 발표함. Klarna·Duolingo 등의 AI 기반 감원 흐름과 맥을 같이하며, 2026년 테크 기업의 AI 치환 감원이 임계점에 도달했음을 보여줌. AI 도입이 생산성 향상을 넘어 조직 구조 자체를 재설계하는 수준으로 전개되고 있어 노동 시장 전반에 구조적 충격이 예상된다.  
→ 원문: [Block AI Layoffs (TheAITrack)](https://theaitrack.com/jack-dorsey-block-ai-layoffs/)

**[Meta-AMD $600억 AI 칩 파트너십 — 6GW GPU 롤아웃 공식화]** (TheAITrack / 2026-02-24)  
Meta와 AMD가 **$600억** 규모의 AI 칩 공급 계약을 체결하고 **6GW GPU** 롤아웃 계획을 공식화함. Nvidia 의존도를 줄이려는 멀티벤더 전략의 일환으로 AMD의 AI 가속기 시장 점유율 확대와 Meta의 오픈소스 AI 인프라 확충이 맞아떨어진 결과. Nvidia 독주를 견제하는 AI 칩 생태계 다변화가 가속화되면서 2026년 하반기 GPU 가격 경쟁에 직접 영향이 예상된다.  
→ 원문: [Meta AMD $60B Deal (TheAITrack)](https://theaitrack.com/meta-and-amd-60bn-ai-chip-deal-6gw/)

**[Wayve, Nvidia·Uber로부터 $1.2B 유치 — 2026년 런던 공개 로보택시]** (TheAITrack / 2026-02-25)  
자율주행 AI 스타트업 Wayve가 Nvidia, Uber, 글로벌 자동차 제조사들로부터 시리즈 D에서 **$1.2B**를 조달해 밸류에이션 **$8.6B** 확정. Uber가 추가로 최대 **$3억** 투자 가능한 옵션을 확보했으며, 2026년 런던에서 일반 공개 로보택시 시범 운행이 예정됨. Waymo(Alphabet) 중심의 자율주행 판도에 유럽발 도전자가 등장하며 로보택시 경쟁이 다국화되고 있다.  
→ 원문: [Wayve $1.2B Funding (TheAITrack)](https://theaitrack.com/wayve-1-2b-series-d-8-6b-valuation/)

---

## 💋 미스 김 인사이트

### 오늘의 핵심 트렌드 3가지

1. **연구 자동화의 임계점 돌파**: AI Scientist가 Nature에 실리고 AI-Scientist-v2가 GitHub 트렌딩 최상위에 오른 동시에 MiroThinker-H1이 GAIA 81.9%를 기록한 시기가 겹쳤다. 단순 보조에서 독립 연구 주체로의 전환이 학계에서 공식 인정받는 티핑포인트다.

2. **에이전트 자기 개선 레이스 개막**: Hyperagents(자기 수정), deer-flow(장기 슈퍼에이전트), MiroThinker(상호작용 스케일링)가 동시에 주목받는 것은 에이전트가 단일 태스크 처리기에서 자율 개선 시스템으로 진화하는 흐름이 수렴하는 신호다.

3. **AI 산업화 2단계 — 자본·군사·고용 재편**: OpenAI $730B·Pentagon 독점·Block 40% 감원·Meta-AMD $600억이 같은 달에 터진 것은 AI가 기술이 아닌 국가 인프라·산업 구조 재편의 레버로 본격 취급됨을 의미한다.

### Jay에게 추천

- **즉시 실행**: bytedance/deer-flow를 로컬에서 설치·테스트할 것. 장기 에이전트 작업 자동화 측면에서 현재 플로우 개선에 직결되며 LangChain 기반이라 진입장벽이 낮음.
- **주목**: Gemini 메모리 임포트 UX 패턴 — iOS 개발자 관점에서 AI 앱 내 타 서비스 데이터 마이그레이션이 플랫폼 전략의 핵심 무기가 되고 있음. 캐주얼 게임 + AI 어시스턴트 통합 시 사용자 락인 설계에 참고.
- **관망**: Wayve 로보택시·Pentagon AI 계약 — 직접 비즈니스 접점은 낮지만 AI 규제 환경 변화와 GPU 가격 동향 모니터링 필요.

### 다음 1주 전망

AI-Scientist-v2 커뮤니티 반응이 폭발적으로 확산될 가능성이 높고, Hyperagents GitHub 공개 여부(현재 private)가 핵심 변수다. Gemini 이식 기능 실사용 리뷰 확산 시 OpenAI의 방어적 기능 추가가 예상된다. OpenAI vs Anthropic Pentagon 분쟁은 미 의회 청문회로 이어질 가능성이 있어 AI 규제 뉴스가 급증할 전망이다.
