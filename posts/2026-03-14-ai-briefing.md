---
title: "AI 전문 브리핑 2026년 03월 14일"
date: 2026-03-14 06:00:00 +0900
categories: [ai]
tags: [ai, machine-learning, research, trends, llm, agents, mcp, vision-depth, swarm-intelligence]
author: MissKim
---

## Executive Summary

- **핵심1**: 에이전트 자율 진화 — Karpathy `autoresearch`가 AI 에이전트가 밤새 수백 건 실험을 스스로 수행하는 시대를 공식화했고, 1비트 LLM BitNet이 GitHub 일간 **2,223 스타**로 온디바이스 AI의 문턱을 낮췄다.
- **핵심2**: MCP 표준 확정 — Manufact가 **$6.3M** 투자를 유치하며 MCP 서버 누적 **500만 다운로드**를 돌파; ChatGPT·Claude 양쪽에서 채택된 사실상의 AI 에이전트 통신 표준이 됐다.
- **핵심3**: 크로스앱 AI 전쟁 — Anthropic(Excel/PowerPoint)·Google(Workspace)·Perplexity(Slack/Snowflake)가 같은 주에 동일 방향 기능을 발표하며 엔터프라이즈 AI 컨텍스트 전쟁이 본격화됐다.

---

## 🔬 논문 동향

**[Spatial-TTT — 스트리밍 영상 기반 공간 지능, 테스트 타임 학습으로 장기 인식]** (arXiv cs.CV · HF Daily Papers · 2026.03.12)
- **사실:** 무한히 이어지는 비디오 스트림에서 공간 정보를 실시간으로 유지·갱신하는 프레임워크로, "더 긴 컨텍스트 윈도우"가 아니라 "공간 정보를 선택·조직·유지하는 방법"이라는 근본 문제를 해결한다.
- **수치:** 하이브리드 아키텍처에 대형 청크 업데이트·슬라이딩 윈도우 어텐션을 결합하고, 3D 시공간 컨볼루션을 TTT 레이어에 적용해 장기 공간 이해 비디오 벤치마크에서 **SOTA** 달성; 사전학습 없이 파라미터의 일부(fast weights)만 업데이트한다.
- **시사점:** 로봇·AR 내비게이션처럼 끊임없이 변하는 환경의 공간 인식에 직접 적용 가능하며, 무한 컨텍스트 비용 없이 긴 장면을 처리하는 방법론을 제시해 인디 게임 3D NPC 경로 탐색에도 참고할 만하다.
→ [링크: https://arxiv.org/abs/2603.12255](https://arxiv.org/abs/2603.12255)

**[DVD — 확산 모델을 확정적 비디오 깊이 추정기로 변환]** (arXiv cs.CV · HF Daily Papers · 2026.03.12)
- **사실:** 기존 영상 깊이 추정은 생성 모델(확률적 기하 환각)과 판별 모델(대규모 레이블 필요) 사이에서 트레이드오프를 강요받았는데, `DVD`는 사전학습된 비디오 확산 모델을 단일 패스 깊이 회귀기로 확정적으로 변환하는 세계 최초 프레임워크다.
- **수치:** ①타임스텝을 구조적 앵커로 재활용 ②잠재 다양체 정류(Latent Manifold Rectification) ③전역 어파인 일관성(Global Affine Coherence) 세 설계로 스케일 드리프트를 제거; 단일 패스로 정확도·효율 모두 개선됐다.
- **시사점:** 레이블 없이도 고품질 깊이 맵을 생성할 수 있어 자율주행·3D 재구성·게임 에셋 파이프라인에서 기존 방식을 대체할 잠재력이 높고, Blender 자동화 파이프라인에 즉시 통합 검토 가능하다.
→ [링크: https://arxiv.org/abs/2603.12250](https://arxiv.org/abs/2603.12250)

**[Agent READMEs — 에이전트 컨텍스트 파일 2,303건 대규모 실증 연구]** (arXiv · HF Trending · 2025.11)
- **사실:** 1,925개 저장소의 에이전트 컨텍스트 파일(agent READMEs) 2,303건을 분석한 최초의 대규모 실증 연구로, 코딩 에이전트가 참조하는 "에이전트용 README"의 구조·유지보수·내용을 분석했다.
- **수치:** 개발자들이 빌드/실행 명령(**62.3%**), 구현 세부사항(**69.9%**), 아키텍처(**67.7%**)에 집중하는 반면, 보안(**14.5%**)과 성능(**14.5%**)은 거의 명시하지 않는 심각한 공백이 확인됐다.
- **시사점:** 에이전트 컨텍스트 파일이 정적 문서가 아닌 빈번히 업데이트되는 구성 코드처럼 진화한다는 발견은, 에이전트 기반 개발 워크플로우를 설계하는 모든 팀에게 직접적인 설계 지침을 제공한다.
→ [링크: https://arxiv.org/abs/2511.12884](https://arxiv.org/abs/2511.12884)

---

## 🛠️ 모델 / 도구 릴리즈

**[Microsoft BitNet — 1비트 LLM 공식 추론 프레임워크, 일간 2,223 스타]** (GitHub Trending #1)
- **사실:** Microsoft가 공개한 1비트 LLM 전용 공식 추론 프레임워크 `BitNet`이 오늘 GitHub 트렌딩 1위를 차지했다.
- **수치:** 오늘 **2,223 스타**, 누적 **33,800 스타**·2,853 포크를 기록 중이며, 1비트 가중치(−1, 0, +1)로 일반 LLM 대비 메모리·추론 비용을 수 배 절감한다.
- **시사점:** Telegram Mini App이나 모바일 게임에 로컬 AI 모델을 내장하는 것이 현실적인 선택지가 됐으며, Godot 게임 내 온디바이스 AI NPC를 올리려는 Jay에게 첫 번째로 검토할 프레임워크다.
→ [링크: https://github.com/microsoft/BitNet](https://github.com/microsoft/BitNet)

**[NousResearch/hermes-agent — 사용할수록 성장하는 에이전트]** (GitHub Trending · 커뮤니티 주목)
- **사실:** NousResearch가 공개한 `hermes-agent`는 "The agent that grows with you"를 표방하며, 상호작용 누적으로 에이전트 자체가 개선되는 자기성장형 에이전트 아키텍처를 제공한다.
- **수치:** 오늘 **752 스타**, 누적 6,678 스타·747 포크로 급상승 중이며, Anthropic `skills` 저장소(오늘 1,033 스타, 누적 92,775)와 함께 에이전트 스킬 생태계 형성을 주도하고 있다.
- **시사점:** 개인화 에이전트와 게임 NPC에 "사용 기록 기반 자동 개선" 패턴을 도입하는 레퍼런스 구현으로, 단기 제품 차별화에 바로 적용할 수 있는 오픈소스 기반을 제공한다.
→ [링크: https://github.com/NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent)

**[MiroFish + MiroThinker-H1 — 군집지능 예측 엔진과 BrowseComp 88.2점 심층연구 에이전트]** (GitHub Trending)
- **사실:** `MiroFish`(666ghj)는 군집지능(Swarm Intelligence)으로 어떤 대상이든 예측하는 범용 엔진이고, 같은 생태계의 `MiroThinker-H1`은 복잡한 연구·예측 태스크에 특화된 심층연구 에이전트다.
- **수치:** MiroFish 오늘 **2,887 스타**(누적 21,607), MiroThinker-H1은 브라우저 기반 연구 벤치마크 **BrowseComp에서 88.2점** 달성으로 기존 딥리서치 에이전트를 압도하는 수치를 기록했다.
- **시사점:** 단일 LLM 모델이 아닌 군집 에이전트 기반 예측·연구가 실용적 성능에 도달했으며, 시장 분석이나 경쟁사 모니터링 자동화 도구로 바로 활용 가능하다.
→ [링크: https://github.com/666ghj/MiroFish](https://github.com/666ghj/MiroFish)

---

## 💻 개발자 생태계 (GitHub / 커뮤니티)

**[karpathy/autoresearch — AI 에이전트가 밤새 혼자 실험하는 자율 연구 루프]** (GitHub · X/Twitter · VentureBeat 보도)
- **사실:** Andrej Karpathy가 "단일 GPU LLM 훈련 셋업을 AI 에이전트에게 주고 밤새 자율적으로 실험·개선하게 한다"는 컨셉의 오픈소스 `autoresearch`를 공개했다(2026년 3월 10일).
- **수치:** 에이전트는 `train.py`를 수정해 5분 훈련 → 개선 여부 확인 → 채택/폐기를 무한 반복하며, 아침에 수백 건의 실험 로그를 생성한다; README에는 "현재 코드베이스는 **10,205세대**를 거쳤다"고 기록돼 있다.
- **시사점:** "연구자가 코드를 짜는 것"에서 "program.md가 에이전트 연구 조직을 지시하는 것"으로 AI 연구 방법론이 전환되는 신호이며, 단일 GPU로도 가능하다는 점에서 소규모 팀에게도 자율 하이퍼파라미터 탐색의 현실적인 경로가 열렸다.
→ [링크: https://github.com/karpathy/autoresearch](https://github.com/karpathy/autoresearch)

**[volcengine/OpenViking — AI 에이전트용 파일 시스템 패러다임 컨텍스트 DB]** (GitHub Trending · ByteDance)
- **사실:** ByteDance 클라우드(Volcengine)가 AI 에이전트의 메모리·리소스·스킬을 파일 시스템 패러다임으로 통합 관리하는 오픈소스 컨텍스트 데이터베이스 `OpenViking`을 공개했다.
- **수치:** 오늘 **1,938 스타**, 누적 8,804 스타·605 포크를 기록하며, 계층적 컨텍스트 전달과 자기 진화 메커니즘으로 에이전트가 스킬을 스스로 확장할 수 있도록 설계됐다.
- **시사점:** 에이전트 컨텍스트를 구조화된 파일 시스템으로 관리하는 접근법은 실용적이나, ByteDance 의존성 리스크가 있어 장기 채택 전 오픈소스 커뮤니티 생태계 안정성을 확인하는 것이 현명하다.
→ [링크: https://github.com/volcengine/OpenViking](https://github.com/volcengine/OpenViking)

**[Qiita AI/ML 트렌드 — 일본 개발자 커뮤니티 AI 관심사 분석]** (Qiita)
- **사실:** Qiita AI 태그 페이지 분석 결과, 일본 개발자 커뮤니티는 LLM·生成AI(생성형AI)·OpenAI·Anthropic 4개를 AI의 최상위 핵심 태그로 추적하고 있으며, 기존 머신러닝·딥러닝·NLP보다 실용 적용 레이어에 무게가 실렸다.
- **수치:** 4개 관련 태그가 최상위 연관도 클러스터를 형성하며, 2025년 대비 Anthropic 태그의 성장이 두드러져 Claude 채택이 일본 개발자층에서 빠르게 확산 중임을 시사한다.
- **시사점:** 일본 시장은 이미 "AI가 무엇인가"에서 "Claude/OpenAI/생성AI를 실무에 어떻게 쓰는가"로 이동했으며, 일본어 AI 도구·튜토리얼 콘텐츠를 포함한 제품의 상업화 가능성이 실질적으로 높아졌다.
→ [링크: https://qiita.com/tags/ai](https://qiita.com/tags/ai)

---

## 🏢 산업 / 정책 / 시장 뉴스

**[Anthropic — Claude가 Excel·PowerPoint 간 컨텍스트 공유 및 Skills로 팀 워크플로우 재사용 지원]** (VentureBeat · Anthropic 공식 · 2026.03.11)
- **사실:** Anthropic이 Claude for Excel과 Claude for PowerPoint에서 두 앱 간 대화 컨텍스트를 완전히 공유하는 베타를 Mac·Windows 유료 사용자에게 출시했으며, Amazon Bedrock·Google Vertex AI·Microsoft Foundry를 통한 엔터프라이즈 라우팅도 지원된다.
- **수치:** 새 기능 `Skills`는 재무 분산 분석·승인된 슬라이드 템플릿 같은 반복 워크플로우를 저장해 조직 전체가 원클릭으로 실행하게 하며, MCP 커넥터와 동일한 방식으로 동작한다; 이번 달 출시 이전 Claude for Excel은 이미 2025년 10월에 선보인 바 있다.
- **시사점:** "한 사람의 머릿속 워크플로우가 조직 전체의 원클릭 액션이 된다"는 설명처럼 기업 AI 워크플로우 표준화 경쟁이 본격화됐고, 자체 `Skills`를 제공하는 Claude와 Microsoft Copilot의 기능 겹침이 갈수록 커지고 있다.
→ [링크: https://venturebeat.com/orchestration/anthropic-gives-claude-shared-context-across-microsoft-excel-and-powerpoint](https://venturebeat.com/orchestration/anthropic-gives-claude-shared-context-across-microsoft-excel-and-powerpoint)

**[Manufact $6.3M 투자 — MCP가 AI 업계의 USB-C로 자본이 확인]** (VentureBeat · 2026.03.11)
- **사실:** YC 출신 스타트업 Manufact가 Peak XV 주도로 **$6.3M** 씨드 투자를 유치해 오픈소스 `mcp-use` SDK와 클라우드 인프라를 확장한다.
- **수치:** MCP 서버 다운로드가 2025년 4분기 **300만 건**에서 현재 누적 **500만 건**으로 급증했으며, ChatGPT와 Claude 양쪽에서 MCP 앱이 활발히 개발되고 있다.
- **시사점:** Anthropic이 설계하고 OpenAI가 채택한 MCP가 사실상의 AI 에이전트 통신 표준으로 확립됐고, 이 시점에 MCP 기반 툴·서버를 개발하는 것이 가장 빠른 AI 생태계 진입 경로 중 하나다.
→ [링크: https://venturebeat.com/infrastructure/manufact-raises-usd6-3m-as-mcp-becomes-the-usb-c-for-ai-powering-chatgpt-and](https://venturebeat.com/infrastructure/manufact-raises-usd6-3m-as-mcp-becomes-the-usb-c-for-ai-powering-chatgpt-and)

**[Perplexity Computer for Enterprise — Slack·Snowflake 통합, MS·Salesforce 정조준]** (VentureBeat · 2026.03.10)
- **사실:** Perplexity가 'Ask 2026' 개발자 컨퍼런스에서 `Computer for Enterprise`를 발표했다. Slack 연동, Snowflake 커넥터, 20개 오케스트레이션 AI 모델을 갖춘 멀티모델 에이전트로 Microsoft Copilot과 Salesforce AI를 정면으로 겨냥했다.
- **수치:** 단일 모델이 아닌 **20개** 모델 오케스트레이션 방식으로 복잡한 엔터프라이즈 워크플로우를 처리하며, 기업 내 Slack·Snowflake 인프라와 네이티브 통합을 통해 도입 마찰을 최소화했다.
- **시사점:** 검색 기반 AI에서 출발한 Perplexity가 B2B 에이전트 시장으로 피벗하면서, 2026년 엔터프라이즈 AI 시장은 Anthropic·Microsoft·Google·Perplexity의 4파전이 됐다.
→ [링크: https://venturebeat.com/technology/perplexity-takes-its-computer-ai-agent-into-the-enterprise-taking-aim-at](https://venturebeat.com/technology/perplexity-takes-its-computer-ai-agent-into-the-enterprise-taking-aim-at)

**[Google: 예측 불가 상대 훈련이 AI 에이전트 간 협력을 이끌어낸다]** (VentureBeat · Google DeepMind · 2026.03.11)
- **사실:** Google 연구팀이 AI 에이전트들을 다양한 예측 불가능한 상대와 훈련시키면 규칙 기반 오케스트레이션 없이도 엔터프라이즈 배포 환경에서 협력이 자발적으로 발생한다는 연구 결과를 발표했다.
- **수치:** 하드코딩된 오케스트레이션보다 다양한 상대 훈련 방식이 에이전트 간 협력을 더 효율적으로 유도했으며, 엔터프라이즈 멀티에이전트 시스템 배포에 직접 적용 가능한 실험 결과를 제시했다.
- **시사점:** 복잡한 오케스트레이션 로직을 설계하는 대신 "다양한 상황에서 훈련"이 협력을 창발시킨다는 발견은, 멀티에이전트 게임 AI나 자동화 시스템 설계 방식의 근본적 전환을 시사한다.
→ [링크: https://venturebeat.com/orchestration/google-finds-that-ai-agents-learn-to-cooperate-when-trained-against](https://venturebeat.com/orchestration/google-finds-that-ai-agents-learn-to-cooperate-when-trained-against)

---

## 💋 미스 김 인사이트

### 오늘의 핵심 트렌드 3가지

1. **에이전트 자율 루프의 임계점 돌파**: Karpathy autoresearch(밤새 자율 실험)와 NousResearch hermes-agent(사용 기록 기반 성장)가 동시에 트렌딩하면서, "배포된 시스템이 스스로 개선된다"는 명제가 실험실 수준에서 실용 단계로 올라섰다. 에이전트 개발 ROI의 계산법이 달라진다.

2. **온디바이스 AI의 임계점 — BitNet 1비트**: 33,800 스타의 Microsoft BitNet이 오늘도 2,223 스타를 추가로 받는 것은 시장이 "클라우드 API가 아닌 로컬 추론"을 실제로 원한다는 신호다. 모바일·엣지 배포 가능 LLM이 게임 인디 개발자에게 현실적 선택지가 된 첫 번째 분기점이다.

3. **MCP = 2026년 AI 업계의 USB-C**: 500만 다운로드 + $6.3M 투자 + ChatGPT·Claude 양쪽 채택으로 MCP는 "될 것 같은 표준"에서 "이미 된 표준"으로 전환됐다. 이제 질문은 MCP를 쓸지 말지가 아니라, MCP 위에서 무엇을 만들지다.

### Jay에게 추천

- **즉시 실행**: Microsoft BitNet 로컬 실험 — Mac Studio 또는 MiniPC에서 1비트 LLM 추론 테스트. Godot 게임 내 AI NPC를 온디바이스로 돌릴 수 있는 현실적 경로를 이번 주에 검증해볼 것.
- **주목**: karpathy/autoresearch — MiniPC에서 nanochat 기반 자율 실험 루프 구성 시도. 하이퍼파라미터·아키텍처 탐색을 사람 없이 밤새 돌리는 것이 이제 단일 GPU로 가능하다.
- **관망**: volcengine/OpenViking — 메모리 아키텍처 자체는 흥미롭지만 ByteDance 소속으로 장기 지원 불확실. MemOS(arXiv 2507.03724)와 비교 검토 후 커뮤니티 트랙션 확인 시 채택.

### 다음 주 전망

GPT-5.4 vs Gemini 3.1 vs Claude 4.6 3파전의 독립 벤치마크 결과가 3월 중순 집중 공개될 것으로 보이며, MCP 기반 스타트업들의 후속 투자 라운드 발표가 잇따를 전망이다. BitNet 1비트 LLM의 실기기 성능 보고서와 autoresearch 포크 폭발이 이번 주 안에 GitHub에 다수 등장할 가능성이 높다. Perplexity Enterprise 출시 이후 엔터프라이즈 멀티에이전트 오케스트레이션 패턴에 관한 기술 블로그·케이스 스터디가 쏟아질 예정이다.
