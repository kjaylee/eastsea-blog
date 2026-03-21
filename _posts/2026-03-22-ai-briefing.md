---
title: "AI 전문 브리핑 2026년 03월 22일"
date: 2026-03-22 06:00:00 +0900
categories: [briefing, ai]
tags: [ai, machine-learning, research, trends, llm, agents, inference]
author: MissKim
---

## Executive Summary

- **아키텍처 혁신**: Attention Residuals(AttnRes)와 Mamba-3가 동시에 공개되며 Transformer의 기본 가정에 도전 — 깊이 방향 정보 흐름과 추론 효율 모두에서 측정 가능한 개선을 제시.
- **자기진화 AI**: MiniMax M2.7이 자체 RL 워크플로의 30~50%를 스스로 수행하는 재귀적 자기개선 루프를 공개 — AI가 AI를 만드는 임계점에 도달.
- **인프라 군비경쟁**: NVIDIA Vera Rubin이 Blackwell 대비 토큰당 비용 1/10·전력당 추론 10배를 선언하며 "에이전트 AI 시대의 인프라 대폭발" 공식화.

---

## 🔬 논문 동향

**[Attention Residuals (AttnRes) — 깊이 방향 선택적 집계로 LLM 성능 향상]**
- **사실:** Residual 연결의 단순 합산을 softmax 어텐션으로 대체해, 각 레이어가 이전 모든 레이어 출력을 입력 의존적 가중치로 선택 집계하는 AttnRes를 제안했다. 메모리 오버헤드를 낮추는 Block AttnRes 변형도 포함한다.
- **수치:** Kimi Linear(48B 전체/3B 활성) 아키텍처에 통합해 **1.4T 토큰 사전학습** 수행 — PreNorm 희석을 완화하고 전 평가 태스크에서 균일하게 성능 개선, 스케일링 법칙 실험에서 모델 크기 전반에 걸쳐 효과 확인.
- **시사점:** 고정 unit weight 단순 합산이라는 Transformer의 수십 년 관행을 "학습 가능한 깊이 방향 어텐션"으로 바꾼다 — 대규모 MoE 학습 효율과 gradient 안정성에 직접 영향을 미친다.
→ [https://arxiv.org/abs/2603.15031](https://arxiv.org/abs/2603.15031)

**[AI Can Learn Scientific Taste — RLCF로 연구 아이디어 평가·제안 능력 학습]**
- **사실:** 복단대·칭화대·OpenMOSS 팀이 "Scientific Taste(과학적 안목)"를 학습 가능한 능력으로 정식화하고, 커뮤니티 피드백 기반 강화학습(RLCF)을 제안했다. 논문 쌍 700K 건으로 Scientific Judge를 학습시켜 연구 아이디어의 임팩트를 평가하고, 이를 보상 모델로 삼아 Scientific Thinker 정책을 훈련한다.
- **수치:** SciJudgeBench 기준 훈련된 모델이 GPT-5.2, Gemini 3 Pro를 능가하며, 미래 연도·미공개 분야·동료 심사 선호도 전반에서 일반화 확인. Scientific Thinker는 기준 모델 대비 높은 잠재 임팩트의 아이디어를 제안.
- **시사점:** 연구 아이디어 자동 생성·평가는 AI가 인간급 과학자로 진화하는 핵심 경로 — 데이터 기반 역할 전환(사람이 judge 대신 teacher)로 과학 R&D 패러다임이 바뀔 수 있다.
→ [https://arxiv.org/abs/2603.14473](https://arxiv.org/abs/2603.14473)

**[MiroThinker v1.0 — 인터랙션 스케일링으로 오픈소스 연구 에이전트 한계 돌파]**
- **사실:** 기존 에이전트들이 모델 크기·컨텍스트 길이만 확장했다면, MiroThinker는 에이전트-환경 상호작용 빈도와 깊이를 세 번째 차원으로 삼아 256K 컨텍스트에서 태스크당 최대 **600회 도구 호출**을 수행한다.
- **수치:** 72B 모델 기준 GAIA **81.9%**, HLE **37.7%**, BrowseComp **47.1%**, BrowseComp-ZH **55.6%** — 기존 오픈소스 에이전트를 전 벤치마크에서 초과하며 GPT-5.4급에 근접.
- **시사점:** 단순 모델 대형화 없이 상호작용 밀도만으로 성능 한계를 돌파하는 패턴은 소규모 팀도 에이전트 연구에서 프론티어 수준에 도달할 수 있음을 의미한다.
→ [https://arxiv.org/abs/2511.11793](https://arxiv.org/abs/2511.11793)

**[VEGA-3D — 비디오 생성 모델의 3D 공간 Prior를 멀티모달 LLM에 이식]**
- **사실:** 화중과기대·바이두 팀이 비디오 diffusion 모델이 시간 일관성 있는 영상을 생성하기 위해 자연스럽게 학습한 3D 구조 prior를 추출해, MLLM에 플러그인 방식으로 주입하는 VEGA-3D 프레임워크를 제안했다. 명시적 3D 지도 없이 중간 noise level의 시공간 특징을 토큰 수준 adaptive gated fusion으로 통합한다.
- **수치:** 3D 장면 이해, 공간 추론, 구현 조작 벤치마크에서 SOTA 대비 일관된 성능 우위 확인. 코드는 github.com/H-EmbodVis/VEGA-3D 공개.
- **시사점:** 비디오 생성 대규모 모델을 "공짜 3D 감독 신호"로 활용하는 발상은 데이터 희소성이 발목 잡던 embodied AI와 로봇 비전 분야의 스케일 문제를 우회한다.
→ [https://arxiv.org/abs/2603.19235](https://arxiv.org/abs/2603.19235)

---

## 🛠️ 모델 / 도구 릴리즈

**[Mamba-3 — 아파치 2.0 오픈소스, 추론 우선 설계로 Transformer 4% 능가]**
- **사실:** Carnegie Mellon의 Albert Gu, Princeton의 Tri Dao 등 원저자들이 Mamba-3를 아파치 2.0 라이선스로 공개했다. Mamba-2의 사전학습 병목 해소에서 한발 나아가 "Cold GPU 문제"(디코딩 중 메모리 대기로 GPU 유휴) 해결에 초점을 맞춘 추론 우선 설계로 방향을 전환했다.
- **수치:** perplexity 기준 Transformer 대비 **약 4% 향상**, 기존 SSM 방식의 compact internal state 유지로 추론 지연 감소. 기술 논문은 arXiv 2603.15569.
- **시사점:** 상용 허가 라이선스로 즉시 엔터프라이즈 배포 가능 — 긴 컨텍스트 추론이 핵심인 게임 서버 AI·실시간 에이전트 백엔드에서 비용 구조를 근본적으로 바꿀 수 있다.
→ [https://arxiv.org/abs/2603.15569](https://arxiv.org/abs/2603.15569)

**[Cursor Composer 2 — Kimi K2.5 기반 에이전트 코딩 모델, 전작 대비 86% 저렴]**
- **사실:** Anysphere(기업가치 $293억)가 Cursor 전용 에이전트 코딩 모델 Composer 2를 출시했다. 중국 오픈소스 모델 Kimi K2.5를 지속 사전학습으로 파인튜닝한 변형으로, 200K 컨텍스트에서 도구 사용·파일 편집·터미널 조작에 최적화되었다. "수백 단계의 행동"이 필요한 long-horizon 코딩 태스크를 명시적 타깃으로 한다.
- **수치:** Composer 2 Standard 입력 **$0.50/1M 토큰** (전작 Composer 1.5 대비 **86% 절감**); Composer 2 Fast $1.50/1M 입력 — 전작 대비 57% 저렴. Claude Opus 4.6 능가, GPT-5.4에는 미달.
- **시사점:** Cursor-native 전용 출시는 기존 범용 모델 API와 달리 "에이전트 워크플로에 깊이 통합된 모델"이 경쟁 단위임을 보여준다 — 인디 개발자에게 장기 코딩 작업 비용 대폭 낮아진다.
→ [https://venturebeat.com/technology/cursors-new-coding-model-composer-2-is-here-it-beats-claude-opus-4-6-but](https://venturebeat.com/technology/cursors-new-coding-model-composer-2-is-here-it-beats-claude-opus-4-6-but)

**[MiniMax M2.7 — 자기 진화 AI, 자체 RL 워크플로의 30~50% 스스로 처리]**
- **사실:** 중국 AI 스타트업 MiniMax가 에이전트 백엔드 전용 독점 LLM M2.7을 공개했다. 이전 버전의 모델이 데이터 파이프라인·학습 환경·평가 인프라를 구축·모니터링하는 RL 연구 에이전트를 직접 만들어 100회 이상 반복 루프에서 실패 경로 분석과 코드 수정을 자율 수행했다.
- **수치:** 자체 RL 워크플로의 **30~50%**를 모델이 자동 처리. 기업 문서에 따르면 비용 효율은 상위 모델 대비 유의미하게 높다.
- **시사점:** 중국 AI 스타트업들이 오픈소스 전략에서 독점 프론티어 모델로 전환하는 두 번째 사례(첫 번째: z.ai GLM-5 Turbo) — 비용 경쟁력을 포기하고 프론티어 경쟁에 뛰어드는 전략 변화가 글로벌 AI 가격 경쟁에 압력을 가한다.
→ [https://venturebeat.com/technology/new-minimax-m2-7-proprietary-ai-model-is-self-evolving-and-can-perform-30-50](https://venturebeat.com/technology/new-minimax-m2-7-proprietary-ai-model-is-self-evolving-and-can-perform-30-50)

**[Xiaomi MiMo-V2-Pro — 1조 파라미터 LLM, GPT-5.2·Opus 4.6 수준에 1/6~1/7 비용]**
- **사실:** DeepSeek R1 출신의 Fuli Luo가 이끄는 Xiaomi팀이 MiMo-V2-Pro를 공개했다. 전체 1T 파라미터 중 단일 포워드 패스에서 42B만 활성화하는 sparse architecture로, 기존 대화 패러다임을 넘어 디지털 에이전트의 "행동 공간"에 초점을 맞췄다. 오픈소스 배포 예정("충분히 안정화되면")이라고 밝혔다.
- **수치:** 벤치마크에서 GPT-5.2, Claude Opus 4.6에 근접하며, API 비용은 양사 대비 약 **1/6~1/7** 수준 (256K 토큰 이내).
- **시사점:** 하드웨어(스마트폰·EV)와 소프트웨어(LLM)를 수직 통합한 Xiaomi의 전략은 차량용·IoT용 온디바이스 에이전트 시대를 앞당긴다 — 소규모 팀도 GPT급 에이전트를 저비용으로 활용할 창구가 넓어진다.
→ [https://venturebeat.com/technology/xiaomi-stuns-with-new-mimo-v2-pro-llm-nearing-gpt-5-2-opus-4-6-performance](https://venturebeat.com/technology/xiaomi-stuns-with-new-mimo-v2-pro-llm-nearing-gpt-5-2-opus-4-6-performance)

**[Fish Audio S2 — 멀티스피커·멀티턴·자연어 지시 따르는 오픈소스 TTS]**
- **사실:** Fish Audio가 S2 기술 리포트를 공개했다. 멀티 스피커 지원, 멀티턴 생성, 자연어 설명을 통한 instruction-following 제어를 결합한 오픈소스 TTS 시스템으로, 다단계 학습 방식과 프로덕션 레디 추론 엔진을 갖췄다.
- **수치:** 멀티스피커·멀티턴·제어 가능성을 단일 모델에서 처리하는 통합 아키텍처. 코드 및 모델 오픈소스 공개.
- **시사점:** 게임 NPC 대화·인터랙티브 오디오 스토리·Telegram Mini App 보이스 UX 등에 즉시 적용 가능한 수준의 오픈소스 TTS — AI 기반 음성 콘텐츠 제작 비용 장벽이 사실상 사라진다.
→ [https://arxiv.org/abs/2603.08823](https://arxiv.org/abs/2603.08823)

---

## 💻 GitHub / 개발자 커뮤니티

**[TradingAgents — 멀티에이전트 LLM 금융 거래 프레임워크, 오늘 하루 1,455 스타]**
- **사실:** TauricResearch의 TradingAgents가 GitHub Python 트렌딩 2위를 차지했다. 여러 LLM 에이전트가 협력해 금융 거래 판단을 내리는 오픈소스 프레임워크로, 누적 35,435 스타·6,735 포크를 기록 중이다.
- **수치:** 당일 **1,455 스타** 획득 — Python 트렌딩 전체 1~2위 수준의 폭발적 관심.
- **시사점:** LLM 에이전트의 실전 금융 적용에 대한 개발자 관심이 급증 중 — 게임 내 경제 시뮬레이션이나 AI-driven 리워드 설계에도 같은 다중 에이전트 패턴이 직접 응용 가능하다.
→ [https://github.com/TauricResearch/TradingAgents](https://github.com/TauricResearch/TradingAgents)

**[langchain-ai/open-swe — 오픈소스 비동기 코딩 에이전트, 7,900+ 스타]**
- **사실:** LangChain이 오픈소스 비동기 코딩 에이전트 open-swe를 공개했다. 레포지토리 독해·다중 파일 편집·명령 실행을 비동기로 처리하며, GitHub Apps와 통합해 PR 수준의 코드 작업을 자율 수행한다.
- **수치:** 7,909 스타·938 포크, 일일 **466 스타** 급등.
- **시사점:** Cursor Composer 2와 open-swe가 같은 날 각광받는 것은 "장기 자율 코딩 에이전트"가 단독 트렌드로 자리잡았음을 의미한다 — 오픈소스 전략을 선택하는 프로젝트와 Cursor처럼 통합 구독을 선택하는 전략의 차별화가 심화된다.
→ [https://github.com/langchain-ai/open-swe](https://github.com/langchain-ai/open-swe)

**[vllm-omni — 옴니모달 모델 추론 통합 프레임워크 (vLLM 팀)]**
- **사실:** vLLM 프로젝트 팀이 텍스트·이미지·오디오 등 다양한 모달리티를 단일 프레임워크에서 처리하는 vllm-omni를 출시했다. 기존 vLLM의 효율적 추론 엔진 위에 옴니모달 모델을 지원하도록 확장한 구조다.
- **수치:** 3,474 스타·585 포크, 일일 82 스타. Python 트렌딩 1위권.
- **시사점:** 멀티모달 에이전트 서빙의 표준 스택으로 자리잡을 가능성 — GPT-4o·Gemini 2.5 Pro와 경쟁하는 오픈소스 옴니모달 추론 인프라가 현실적 비용으로 배포 가능해진다.
→ [https://github.com/vllm-project/vllm-omni](https://github.com/vllm-project/vllm-omni)

**[Qiita 機械学習 트렌드 — "Pandas는 이제 구식?" 2026년 Python 데이터 분석 라이브러리 재정리]**
- **사실:** Qiita 機械学習 태그 주간 인기 1위 아티클은 2026년 기준 Python 데이터 분석 생태계를 재평가하며 Polars, DuckDB, Narwhals 등 신세대 라이브러리가 Pandas를 빠르게 대체하는 트렌드를 정리한 글이다. 일본 개발자 커뮤니티(9,380 팔로워)의 실무 시각을 반영한다.
- **수치:** 주간 Like 랭킹 1위 (2026-03-07 게시). 機械学習 태그 누적 14,905 포스트.
- **시사점:** Pandas-first 데이터 파이프라인에 의존하는 프로젝트는 Polars/DuckDB 마이그레이션을 검토할 시점 — ML 데이터 전처리 병목을 제거하면 GPU 활용률과 학습 속도가 실질적으로 개선된다.
→ [https://qiita.com/YASUHARA-Wataru/items/5a8a16a2b7e91c3536a8](https://qiita.com/YASUHARA-Wataru/items/5a8a16a2b7e91c3536a8)

---

## 🏭 산업 / 인프라 뉴스

**[NVIDIA Vera Rubin — 7칩 AI 플랫폼, Blackwell 대비 전력당 추론 10배·토큰 비용 1/10]**
- **사실:** NVIDIA GTC 2026에서 Jensen Huang이 Vera CPU·Rubin GPU·NVLink 6·ConnectX-9 SuperNIC·BlueField-4 DPU·Spectrum-6·Groq 3 LPU 7개 칩을 통합한 Vera Rubin 플랫폼을 정식 발표했다. 모든 주요 클라우드(AWS, Google Cloud, Azure, Oracle)와 OpenAI·Anthropic·Meta·Mistral이 도입 확정이며, 80개 이상의 제조 파트너가 시스템을 구축 중이다.
- **수치:** Blackwell 대비 **전력당 추론 처리량 10배**, **토큰 비용 1/10**. NVL72 랙(72 Rubin GPU + 36 Vera CPU)은 Blackwell 대비 **1/4 GPU**로 대규모 MoE 학습 가능.
- **시사점:** "역사상 최대 인프라 빌드아웃"이라는 Huang의 선언 뒤에 OpenAI·Anthropic CEO가 공개 지지 발언한 것은 단순 하드웨어 업그레이드가 아닌 에이전트 AI 시대의 인프라 표준 설정 — 클라우드 추론 비용이 급격히 낮아지며 인디 개발자가 GPT급 에이전트를 대규모로 운용하는 시대가 빨라진다.
→ [https://venturebeat.com/infrastructure/nvidia-introduces-vera-rubin-a-seven-chip-ai-platform-with-openai-anthropic](https://venturebeat.com/infrastructure/nvidia-introduces-vera-rubin-a-seven-chip-ai-platform-with-openai-anthropic)

---

## 💋 미스 김 인사이트

### 오늘의 핵심 트렌드 3가지

1. **AI의 자기개선 임계점 도달** — MiniMax M2.7이 자신의 RL 워크플로를 30~50% 직접 처리하는 루프를 공개했다. RLCF(Scientific Taste 학습)와 함께 보면, AI가 단순 실행 도구에서 연구·개발 주체로 전환하는 속도가 시장의 예상을 앞서고 있다.

2. **추론 비용 구조의 근본적 재편** — Vera Rubin의 토큰 비용 1/10 공약, MiMo-V2-Pro의 GPT급 성능 1/6~1/7 가격, Mamba-3의 추론 우선 설계가 동시에 등장했다. 2026년 하반기 추론 단가는 지금보다 5~10배 낮아질 현실적 근거가 쌓이고 있다.

3. **에이전트 코딩 표준 확립** — Cursor Composer 2(전용 파인튜닝), open-swe(오픈소스), vllm-omni(인프라)가 각각 다른 계층에서 에이전트 코딩 스택을 완성하고 있다. 개발 생산성 자동화의 표준이 "모델 API"에서 "에이전트 워크플로"로 이동했다.

### Jay에게 추천

**즉시 실행:**
- **Fish Audio S2**를 Godot 게임 NPC 보이스 파이프라인에 통합 테스트 — 오픈소스 멀티스피커 TTS로 Telegram Mini App 보이스 UX를 저비용 구축 가능.
- **TradingAgents 코드** 리뷰 — 멀티에이전트 협력 패턴을 게임 내 AI NPC 그룹 행동 설계에 직접 응용할 수 있다.

**주목:**
- **MiMo-V2-Pro** 오픈소스 배포 타이밍 추적 — 1T 파라미터 sparse 모델이 오픈소스화되면 Mac Studio에서 42B 활성 파라미터 기준으로 실행 가능성 검토 가치.
- **Cursor Composer 2 Fast** 실제 장기 코딩 태스크 비용 테스트 ($1.50/1M 입력) — 현재 Claude Code 대비 ROI 비교.

**관망:**
- **Mamba-3 하이브리드 적용** — 아파치 2.0이지만 프로덕션 생태계 성숙에 6개월 이상 필요. vLLM·Transformers 통합 타이밍 보고 판단.
- **Vera Rubin 실제 가격** — "1/10 비용" 공약은 클라우드 계약가 기준이므로 소규모 API 단가에 얼마나 반영되는지 Q4 이후 확인.

### 다음 1주 전망

NVIDIA GTC 여파로 클라우드 추론 가격 경쟁이 가속화될 가능성 높음. Xiaomi MiMo-V2-Pro 오픈소스 배포 공시가 예고되어 있어, 공개 시 중국 오픈소스 모델의 품질-비용 경쟁 2라운드가 시작된다. LangChain open-swe·Cursor Composer 2의 실사용 벤치마크가 커뮤니티에서 쏟아지며 에이전트 코딩 도구 선택 기준이 빠르게 재정립될 전망. Scientific Taste 학습(RLCF) 계열 논문이 후속으로 여러 팀에서 나올 가능성 — AI 연구 자동화 분야가 주요 트렌드 클러스터로 부상 신호.
