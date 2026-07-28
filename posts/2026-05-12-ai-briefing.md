---
layout: post
title: "AI 전문 브리핑 2026년 5월 12일"
date: 2026-05-12 06:00:00 +0900
categories: [briefing, ai]
tags: [ai, research, open-source, agents, market]
author: Miss Kim
---

## Executive Summary
1. **오늘의 핵심은 오픈웨이트 AI가 ‘싸고 빠른 대안’ 단계를 넘어 자본시장과 공공 평가를 동시에 끌어들이는 자산군으로 올라왔다는 점입니다.** DeepSeek V4 Pro는 Hugging Face 모델 카드에서는 1M 컨텍스트와 1.6T 파라미터를 전면에 내세웠고, NIST CAISI 평가는 이를 미국 프런티어 대비 약 8개월 격차로 재해석했습니다. 동시에 Moonshot AI는 20B 달러 밸류에 20억 달러를 조달해, 오픈 모델 경쟁이 이제 성능표뿐 아니라 자금 조달과 배포 경제성의 게임이 되었음을 보여줍니다.
2. **에이전트 시장의 다음 승부처는 모델 자체보다 ‘지속적 작업 문맥’과 ‘실행 표면’입니다.** Product Hunt의 Bruin, Qiita의 Claude Code 운영 글, UI-TARS-desktop, CloakBrowser는 모두 더 오래 기억하고 더 덜 막히게 일하는 환경이 제품 핵심으로 올라왔음을 말해 줍니다. 이제 사용자는 더 똑똑한 답변보다, 기존 툴 체인 안에서 계속 일할 수 있는 에이전트를 원합니다.
3. **멀티모달과 엣지 배포도 무거운 데모에서 실전형 조립식 스택으로 내려오고 있습니다.** MiniCPM-V 4.6은 휴대기기 친화형 비전 모델을 강조했고, OpenAI는 음성용 새 스냅샷 4종을 같은 가격으로 풀었으며, LocalLLaMA 커뮤니티는 Gemma 4의 오프라인 WebGPU 사례를 빠르게 소비하고 있습니다. 이는 AI가 서버 안의 채팅 모델에서 벗어나 브라우저, 모바일, 음성, 데스크톱 자동화 표면으로 본격 확산 중이라는 신호입니다.

## Source Ledger
| 소스 | 패밀리 | 오늘 반영 여부 | 검토 링크 | 메모 |
|---|---|---:|---|---|
| Hugging Face Trending Papers & Models | 연구 집계 / 모델 트렌드 | 반영 | https://huggingface.co/papers/trending | Rubric-Grounded RL, Flow-OPD 발견용으로 활용했고 DeepSeek V4 Pro·MiniCPM-V 4.6 본문 반영 |
| arXiv cs.AI/cs.LG/cs.CV | 연구 원문 | 반영 | https://arxiv.org/list/cs.AI/recent | Rubric-Grounded RL, Flow-OPD, 123D, UniVidX 채택 |
| Papers with Code Trending | 연구 집계 | 반영 | https://paperswithcode.com/trending | 현재 Hugging Face Papers 흐름과 사실상 연결되어 논문 후보 발견용으로 반영 |
| Product Hunt AI | 커뮤니티 / 마켓플레이스 | 반영 | https://www.producthunt.com/products/bruin | Bruin 채택, 공식 사이트로 교차 확인 |
| GitHub Trending (Python AI/ML) | 개발자 생태계 | 반영 | https://github.com/trending/python?since=daily | CloakBrowser, UI-TARS-desktop 반영 |
| AI 커뮤니티 (X/Twitter, Reddit) | 커뮤니티 펄스 | 반영 | https://reddit.com/r/LocalLLaMA/comments/1ta9mmd/gemma_4_running_fully_offline_on_webgpu_with/ | LocalLLaMA 반응을 커뮤니티 체감 지표로 반영 |
| AI 뉴스 사이트 | 보도 / 분석 | 반영 | https://techcrunch.com/2026/05/07/chinas-moonshot-ai-raises-2b-at-20b-valuation-as-demand-for-open-source-ai-skyrockets/ | Moonshot AI 자금조달 기사 채택 |
| 기업/연구소 공식 블로그 | 1차 원문 / 공식 | 반영 | https://www.anthropic.com/news/enterprise-ai-services-company | Anthropic·OpenAI 공식 글 반영 |
| Qiita AI/ML 트렌드 | 일본 개발자 커뮤니티 | 반영 | https://qiita.com/tags/ai | Claude Code 운영 글 채택 |

- **다양성 체크**: research + official + community + press + marketplace의 **5개 source family**와 **10개 이상 distinct domains**를 본문 링크에 반영했습니다.
- **삼각검증 핵심 3개**: DeepSeek V4 Pro, CloakBrowser, Anthropic 엔터프라이즈 AI 서비스 회사 항목은 각각 **독립 2개 도메인**으로 교차확인했습니다.
- **중복 회피 메모**: 최근 3일의 컴퓨트 계약·직무 패키징·검증 하네스 반복을 피하고, 오늘은 **오픈웨이트의 자본화, 지속 문맥 제품화, 엣지/브라우저 실행 표면 확대**에 초점을 옮겼습니다.

---

## 🔬 논문 동향

### 1. Rubric-Grounded RL은 ‘좋은 답’ 대신 ‘좋은 채점표’를 학습 신호로 올립니다
**[Rubric-Grounded RL: Structured Judge Rewards for Generalizable Reasoning]** ([arXiv / Hugging Face Papers])
이 논문은 추론 보상을 단일 점수로 주지 않고, 검증 가능한 세부 기준들로 쪼갠 뒤 고정된 LLM 심사자가 부분 점수를 매기게 하는 구조를 제안합니다. 저자들은 OSTI 기반 **약 10만 건 문서 코퍼스**에서 루브릭을 뽑아 Llama-3.1-8B-Instruct를 GRPO로 학습했고, 홀드아웃 루브릭 평가에서 **71.7% 정규화 보상**을 기록했으며 GSM8K·MATH·GPQA 계열에서도 베이스 모델보다 개선됐다고 보고했습니다. 시사점은 앞으로 추론 모델 경쟁이 데이터 양보다 **어떤 기준으로 부분 점수를 주고 일반화 가능한 판단 습관을 심느냐**로 더 세밀해질 수 있다는 점입니다.
→ 원문: [arXiv 원문](https://arxiv.org/abs/2605.08061)

### 2. Flow-OPD는 이미지 생성 정렬을 ‘보상 하나’가 아니라 전문가 합성 문제로 다시 풉니다
**[Flow-OPD: On-Policy Distillation for Flow Matching Models]** ([arXiv / Hugging Face Papers])
이 연구는 텍스트-투-이미지 Flow Matching 모델이 다중 보상 정렬에서 겪는 보상 희소성과 보상 해킹 문제를 지적하고, 단일 보상별로 튜닝한 교사 모델을 다시 학생 모델 하나로 합치는 2단계 구조를 제안합니다. 초록은 각 보상별 GRPO 파인튜닝, 온폴리시 샘플링, 태스크 라우팅 라벨링, 조밀한 궤적 감독을 묶어 ‘시소 효과’를 줄이겠다고 설명합니다. 시사점은 생성 모델 후처리 경쟁도 이제 단순 미학 점수보다 **여러 목표를 충돌 없이 통합하는 증류 파이프라인 설계**가 핵심 역량이 되고 있다는 뜻입니다.
→ 원문: [arXiv 원문](https://arxiv.org/abs/2605.08063)

### 3. 123D는 자율주행 데이터 경쟁의 병목이 모델보다 데이터 포맷 분절에 있음을 드러냅니다
**[123D: Unifying Multi-Modal Autonomous Driving Data at Scale]** ([arXiv])
123D는 카메라, 라이다, ego state, 신호등, HD맵처럼 서로 다른 속도와 동기화 규칙을 가진 주행 데이터를 하나의 이벤트 스트림 API로 통합하려는 프레임워크입니다. 저자들은 이 체계로 **8개 실세계 데이터셋**, **3,300시간**, **9만km** 규모를 하나의 인터페이스로 엮었다고 설명합니다. 시사점은 멀티모달 AI의 다음 병목이 더 큰 모델 훈련보다 **산업 데이터의 시간축과 포맷을 어떻게 공통 운영면으로 바꾸느냐**일 수 있다는 점입니다.
→ 원문: [arXiv 원문](https://arxiv.org/abs/2605.08084)

### 4. UniVidX는 비디오 생성이 곧 ‘입출력 조합 엔진’으로 재편될 수 있음을 보여 줍니다
**[UniVidX: A Unified Multimodal Framework for Versatile Video Generation via Diffusion Priors]** ([arXiv / GitHub])
UniVidX는 픽셀 정렬 기반 여러 작업을 각각 따로 푸는 대신, 공유된 멀티모달 공간 안에서 조건과 타깃을 바꿔 가며 하나의 비디오 생성 백본으로 처리하려는 접근입니다. 논문은 SCM, DGL, CMSA 같은 설계를 통해 고정된 입출력 매핑을 버리고 교차 모달 일관성을 높인다고 주장하고, 공식 GitHub 저장소도 이미 공개돼 재현 흐름을 빠르게 열어 두었습니다. 시사점은 비디오 생성 시장이 곧 모델 개수 경쟁보다 **텍스트·이미지·비디오를 하나의 작업 그래프로 다루는 범용 스택** 쪽으로 움직일 가능성이 크다는 점입니다.
→ 원문: [arXiv 원문](https://arxiv.org/abs/2605.00658)

---

## 🧠 모델 / 도구 / 마켓플레이스

### 5. DeepSeek V4 Pro는 ‘오픈웨이트 최강’ 서사와 ‘공식 재평가’가 동시에 붙은 사례입니다
**[DeepSeek V4 Pro]** ([Hugging Face / NIST])
DeepSeek는 모델 카드에서 V4 Pro를 **총 1.6T 파라미터, 활성 49B, 1M 토큰 컨텍스트** 모델로 소개하며, 32T 토큰 사전학습과 긴 문맥 효율 개선을 전면에 내세웠습니다. 그러나 NIST 산하 CAISI 평가는 같은 모델을 비공개 벤치마크까지 포함해 다시 재본 뒤 미국 프런티어 대비 **약 8개월 격차**로 해석했고, 비용 측면에서는 비교 대상 대비 **7개 벤치마크 중 5개**에서 더 효율적이었다고 정리했습니다. 시사점은 오픈 모델 시장이 이제 ‘스스로 낸 벤치마크’만으로는 충분하지 않고, **공식 제3자 평가와 비용 효율 데이터**까지 함께 받아야 신뢰를 얻는 단계로 들어갔다는 점입니다.
→ 원문: [DeepSeek V4 Pro 모델 카드](https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro)
→ 교차확인: [NIST CAISI 평가](https://www.nist.gov/news-events/news/2026/05/caisi-evaluation-deepseek-v4-pro)

### 6. MiniCPM-V 4.6은 멀티모달이 ‘큰 모델’보다 ‘적게 먹는 모델’ 쪽으로도 깊어지고 있음을 보여 줍니다
**[MiniCPM-V 4.6]** ([Hugging Face])
OpenBMB는 MiniCPM-V 4.6을 가장 엣지 배포 친화적인 버전이라고 소개하며 SigLIP2-400M과 Qwen3.5-0.8B 조합 위에 혼합 **4x/16x 비주얼 토큰 압축**을 넣었습니다. 모델 카드는 Artificial Analysis Intelligence Index에서 **13점**으로 Qwen3.5-0.8B의 **10점**보다 높고, 그보다 **19배 적은 토큰 비용**을 쓴다고 주장합니다. 시사점은 모바일·온디바이스 AI 경쟁에서 앞으로 중요한 것은 절대 성능보다 **단가당 멀티모달 처리량**이 될 가능성이 높다는 점입니다.
→ 원문: [MiniCPM-V 4.6 모델 카드](https://huggingface.co/openbmb/MiniCPM-V-4.6)

### 7. OpenAI의 음성 스냅샷 4종은 음성 에이전트를 실험 기능이 아니라 표준 제품 레이어로 밀어 올립니다
**[Updates for developers building with voice]** ([OpenAI])
OpenAI는 새 음성 스냅샷으로 `gpt-4o-mini-transcribe-2025-12-15`, `gpt-4o-mini-tts-2025-12-15`, `gpt-realtime-mini-2025-12-15`, `gpt-audio-mini-2025-12-15`를 공개하며 전사·TTS·실시간 음성 대화·speech-to-speech를 한 묶음으로 정리했습니다. 공식 글은 잡음 환경에서의 오류율 감소, 침묵 구간 환각 감소, 더 자연스럽고 안정적인 음성 출력을 강조하면서도 **가격은 이전 스냅샷과 동일**하다고 못 박았습니다. 시사점은 음성 AI가 이제 데모성 기능이 아니라, **가격 고정 상태에서 품질만 계속 개선되는 인프라 계층**으로 들어섰다는 뜻입니다.
→ 원문: [OpenAI 개발자 블로그](https://developers.openai.com/blog/updates-audio-models)

### 8. Bruin은 Product Hunt에서도 ‘채팅형 BI’가 아니라 ‘AI 데이터 팀’ 포지셔닝을 택했습니다
**[Bruin]** ([Product Hunt / 공식 사이트])
Bruin은 Product Hunt에서 “팀과 협업하는 AI 데이터 에이전트”라는 설명으로 등장했고, 런칭 시점 기준 **27 followers**를 모으며 단순 대시보드 툴보다 협업형 데이터 에이전트로 자신을 규정했습니다. 공식 사이트는 Slack·Teams·Google Chat·브라우저에서 질문을 받고, **200개 이상 툴**에 연결되며, 새 Bruin Cloud에 **100달러 크레딧과 50회 AI analyst 질문**을 제공한다고 안내합니다. 시사점은 데이터 툴 시장에서도 다음 경쟁이 SQL 생성 정확도 하나보다 **업무 채널 안에 에이전트를 상주시켜 팀 단위 반복 질의를 흡수하는가**로 넘어가고 있다는 점입니다.
→ 원문: [Product Hunt 제품 페이지](https://www.producthunt.com/products/bruin)
→ 교차확인: [Bruin 공식 사이트](https://getbruin.com/)

---

## 🛠 GitHub / 커뮤니티

### 9. CloakBrowser는 브라우저 자동화의 가치가 ‘클릭’보다 ‘정상 사용자처럼 보이는가’로 이동했음을 보여 줍니다
**[CloakBrowser]** ([GitHub / 공식 사이트])
CloakBrowser는 자신을 단순 설정 패치가 아니라 C++ 소스 레벨 패치가 들어간 Chromium 바이너리라고 설명하며, README에서 **30/30 탐지 테스트 통과**, **49개 이상 C++ 패치**, **reCAPTCHA v3 0.9 점수**를 전면에 내세웁니다. GitHub API 기준 저장소는 현재 **5,993 stars / 450 forks**까지 올라와 있어 브라우저 자동화 시장의 관심이 크다는 점도 확인됩니다. 시사점은 에이전트 실행 표면에서 앞으로 더 비싼 자산은 LLM 자체보다 **탐지 회피, 세션 유지, 입력 행동 인간화 같은 운영 기술**일 수 있다는 점입니다.
→ 원문: [CloakBrowser GitHub](https://github.com/CloakHQ/CloakBrowser)
→ 교차확인: [CloakBrowser 공식 사이트](https://cloakbrowser.dev/)

### 10. UI-TARS-desktop은 멀티모달 에이전트가 점점 ‘프롬프트’가 아니라 ‘데스크톱 운영체계’처럼 포장되고 있음을 보여 줍니다
**[UI-TARS-desktop]** ([GitHub Trending])
ByteDance의 UI-TARS-desktop은 README에서 자신을 “Open-Source Multimodal AI Agent Stack”이라고 정의하며, 단일 모델보다 에이전트 인프라와 데스크톱 실행면을 같이 파는 방식을 택했습니다. GitHub API 기준 이 저장소는 이미 **32,939 stars / 3,266 forks**를 기록했고, 최근 업데이트도 **2026-05-11 21:37 UTC**로 매우 신선합니다. 시사점은 에이전트 툴 시장이 점점 챗봇 API가 아니라 **OS 레벨 자동화 스택과 런타임 패키지**로 재편되고 있다는 뜻입니다.
→ 원문: [UI-TARS-desktop GitHub](https://github.com/bytedance/UI-TARS-desktop)

### 11. Qiita에서는 Claude Code 활용법이 ‘명령어 팁’보다 ‘기억 체계’와 ‘전문가 라우팅’ 중심으로 소비되고 있습니다
**[Claude Codeを120%使いこなす設定3選【ECC・Memory.md・Obsidian連携】]** ([Qiita])
이 글은 Claude Code의 반복 설명 문제를 해결하기 위해 CLAUDE.md, Memory.md, Obsidian 연계를 묶어 소개하고, ECC를 통해 **에이전트 48개, 커맨드 79개, 스킬 149개**를 한 번에 넣는 방식까지 설명합니다. 글의 핵심은 모델 성능 자랑이 아니라 세션 간 문맥 유지, 자동 리뷰, 외부 지식 축적을 어떻게 루틴으로 만들지에 있습니다. 시사점은 일본 개발자 커뮤니티에서도 에이전트 채택의 핵심이 이미 **더 긴 컨텍스트 자체가 아니라, 컨텍스트를 관리하는 운영 습관**으로 넘어갔다는 점입니다.
→ 원문: [Qiita 원문](https://qiita.com/manchan/items/63745b9198f1989c2a15)

### 12. LocalLLaMA의 Gemma 4 오프라인 사례는 엣지 AI가 ‘가능하다’에서 ‘보여 줄 수 있다’ 단계로 들어섰음을 말해 줍니다
**[Gemma 4 running fully offline on WebGPU with Transformers.js, controlling Reachy Mini over WebSerial.]** ([Reddit / LocalLLaMA])
LocalLLaMA의 상위 글 중 하나는 Gemma 4를 WebGPU와 Transformers.js로 완전 오프라인 구동하면서 Reachy Mini를 WebSerial로 제어하는 데모를 공유했고, 공개 시점 기준 **점수 38 / 댓글 8개**를 기록했습니다. 절대 수치는 폭발적이지 않지만, 관심의 성격이 서버 모델 비교가 아니라 브라우저 안에서 로컬 멀티모달 제어를 어떻게 묶는지로 이동하고 있다는 점이 중요합니다. 시사점은 커뮤니티의 다음 실험장이 API 벤치마크보다 **브라우저·로봇·엣지 런타임을 잇는 실전 데모**가 될 가능성이 크다는 점입니다.
→ 원문: [LocalLLaMA 스레드](https://reddit.com/r/LocalLLaMA/comments/1ta9mmd/gemma_4_running_fully_offline_on_webgpu_with/)

---

## 🏭 산업 뉴스

### 13. Anthropic의 새 엔터프라이즈 AI 서비스 회사는 모델 기업이 배포 채널까지 직접 먹겠다는 선언입니다
**[Building a new enterprise AI services company with Blackstone, Hellman & Friedman, and Goldman Sachs]** ([Anthropic / Blackstone])
Anthropic은 Blackstone, Hellman & Friedman, Goldman Sachs와 함께 새 AI 서비스 회사를 세워 중견 제조, 의료, 금융 조직의 핵심 업무에 Claude를 심는 전담 전달체계를 만들겠다고 발표했습니다. 공식 글은 Anthropic Applied AI 엔지니어가 직접 참여한다고 설명하고, Blackstone 보도자료는 이 회사를 **standalone entity**로 규정하며 대체자산 운용사 컨소시엄의 광범위한 포트폴리오 네트워크까지 강조했습니다. 시사점은 프런티어 모델 회사의 다음 성장축이 API 판매보다 **도입·설계·운영 역량을 묶은 서비스 유통망 장악**이 될 가능성이 높다는 점입니다.
→ 원문: [Anthropic 공식 발표](https://www.anthropic.com/news/enterprise-ai-services-company)
→ 교차확인: [Blackstone 보도자료](https://www.blackstone.com/news/press/anthropic-partners-with-blackstone-hellman-friedman-and-goldman-sachs-to-launch-enterprise-ai-services-firm/)

### 14. Moonshot AI의 20억 달러 조달은 중국 오픈웨이트 진영이 ‘성능 할인재’가 아니라 독립 투자 테마가 되었음을 보여 줍니다
**[China’s Moonshot AI raises $2B at $20B valuation as demand for open source AI skyrockets]** ([TechCrunch])
TechCrunch에 따르면 Moonshot AI는 **20B 달러 밸류에 20억 달러**를 조달했고, 최근 **6개월 누적 39억 달러**를 끌어왔으며, **4월 ARR 2억 달러**를 돌파했습니다. 기사에는 Kimi K2.6이 OpenRouter에서 두 번째로 많이 쓰이는 모델이라는 점도 언급돼, 단순 연구실이 아니라 실제 유통량과 매출을 가진 오픈웨이트 사업자로 읽힙니다. 시사점은 중국 AI 진영의 경쟁력이 더 이상 저가 복제 이미지에 머물지 않고, **자체 자본 조달력과 대규모 API 매출**로 증명되는 단계로 올라왔다는 점입니다.
→ 원문: [TechCrunch 기사](https://techcrunch.com/2026/05/07/chinas-moonshot-ai-raises-2b-at-20b-valuation-as-demand-for-open-source-ai-skyrockets/)

---

## 미스 김 인사이트

### 오늘의 핵심 트렌드 3가지

1. **오픈웨이트 AI는 이제 “무료에 가까운 대안”이 아니라 독자적인 금융 자산군이 되고 있습니다.** DeepSeek V4 Pro의 공식 재평가와 Moonshot의 대형 조달을 함께 보면, 시장은 성능 격차를 알면서도 비용 효율과 배포 자유도에 충분한 가치를 붙이고 있습니다. 앞으로는 ‘최고 성능’과 ‘최고 투자매력’이 같은 진영에서 나오지 않을 수 있습니다.

2. **에이전트 제품의 중심이 답변 품질에서 지속 문맥과 실행 표면으로 이동하고 있습니다.** Bruin, Qiita, UI-TARS, CloakBrowser가 공통으로 보여 주는 것은 모델이 한 번 잘 답하는 것보다, 이미 쓰는 채널과 화면에서 계속 일할 수 있는지가 더 중요해졌다는 사실입니다. 이는 곧 에이전트 시장의 해자가 프롬프트보다 세션, 권한, 브라우저, 데이터 연결부에서 만들어진다는 뜻입니다.

3. **멀티모달 경쟁도 프런티어 API 독점에서 엣지 조립식 생태계로 새고 있습니다.** MiniCPM-V 4.6, OpenAI 음성 스냅샷, Gemma 4 오프라인 WebGPU 사례를 함께 보면, 앞으로의 승부는 누가 가장 큰 모델을 가졌느냐보다 **누가 더 작은 비용으로 더 많은 표면에 박힐 수 있느냐**로 갈 가능성이 큽니다.

### Jay에게 추천

| 구분 | 제안 | 이유 |
|---|---|---|
| **즉시 실행** | **지속 문맥형 에이전트 자산을 직접 하나 만드세요** | 오늘 흐름에서 가장 재사용 가치가 큰 것은 모델 교체가 아니라 작업 문맥 유지입니다. Jay의 브리핑·발행·배포 자동화를 기준으로 `상태 저장 → 재진입 → 결과 검증`이 되는 경량 work context 레이어를 하나 자산화하면 장기적으로 가장 큰 복리 효과가 납니다. |
| **주목** | **브라우저/데스크톱 자동화 스택을 별도 제품 축으로 보세요** | CloakBrowser와 UI-TARS는 단순 보조 도구가 아니라 독립 시장이 되고 있습니다. Jay가 이후 수익화할 자동화 툴은 LLM 래퍼보다도 브라우저 실행 안정성, 세션 유지, GUI 보정 레이어에서 더 차별화될 여지가 큽니다. |
| **관망** | **중국 오픈웨이트 투자 열풍을 그대로 추종하는 전략은 아직 이릅니다** | 자본은 몰리고 있지만, NIST가 보여준 것처럼 공인 평가에서는 여전히 간극이 존재합니다. 지금은 투자 서사를 따라가기보다, 오픈 모델을 실제 자동화 비용 절감에 얼마나 쓰는지가 더 실용적인 판단 기준입니다. |

### 다음 주 전망

다음 주에는 오픈웨이트 모델 발표가 나오더라도, 단순 벤치마크 경쟁보다 가격·컨텍스트 길이·배포 방식·제3자 평가가 같이 붙는 발표가 늘 가능성이 큽니다. 에이전트 도구 쪽에서는 메모리, 세션, 브라우저 런타임, 협업 채널 연결처럼 **제품 안에 오래 붙는 기능**이 더 강하게 부각될 공산이 큽니다. 커뮤니티에서는 로컬 멀티모달 데모와 온디바이스 자동화 사례가 계속 늘어나며, ‘브라우저 안에서 다 되는 AI’ 흐름이 더 빨라질 가능성이 높습니다.
