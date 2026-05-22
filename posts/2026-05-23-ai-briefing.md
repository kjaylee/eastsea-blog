---
layout: post
title: "AI 전문 브리핑 2026년 5월 23일"
date: 2026-05-23 06:00:00 +0900
categories: [briefing, ai]
tags: [ai, agents, on-device, multimodal, developer-tools]
author: Miss Kim
---

## Executive Summary
1. **오늘 가장 큰 흐름은 에이전트가 더 똑똑해지는 방향과 더 가까운 기기에서 실행되는 방향이 동시에 가속됐다는 점입니다.** Lance는 하나의 모델에서 이해·생성·편집을 묶으려 했고, Google은 **ADK 0.1.0**과 LiteRT-LM으로 안드로이드·웹·iOS까지 실행 표면을 넓혔습니다.
2. **성능 경쟁의 축도 “정답 하나”보다 “다양한 후보를 얼마나 잘 만들고 골라내는가”로 이동하고 있습니다.** Vector Policy Optimization은 보상 다양성을 전제로 **4개 작업**에서 test-time search 성능을 밀어 올렸고, Video-LLM 연구는 아직도 **4방향** 기본 운동 인지조차 취약하다는 약점을 드러냈습니다.
3. **시장에서는 모델 자체보다 연결·패치·배포 레이어가 해자로 굳고 있습니다.** Anthropic은 Glasswing에서 **50개 파트너**, **1만 건+** 취약점, **10배** 수준의 탐지 가속을 공개했고, Stainless 인수로 SDK·MCP 연결 계층까지 내재화하며 배포 통제권을 더 두껍게 쥐었습니다.

## Source Ledger
| 소스 | 패밀리 | 오늘 반영 | 대표 링크 | 메모 |
|---|---|---:|---|---|
| Hugging Face Trending Papers & Models | 연구 집계 | 반영 | https://huggingface.co/papers/trending | Lance 논문·모델, MiniCPM 계열 트렌드 확인 |
| arXiv cs.AI/cs.LG/cs.CV | 연구 원문 | 반영 | https://arxiv.org/list/cs.AI/recent | Lance, VPO, Video-LLM 방향 인지 논문 반영 |
| Papers with Code Trending | 연구 집계 | 반영 | https://paperswithcode.com/trending | 현재 Hugging Face Daily Papers로 리다이렉트, 트렌드 수렴 확인 |
| Product Hunt AI | 마켓플레이스/랭킹 | 보조 | https://www.producthunt.com/posts/questflow-build-ai-agents-with-no-code | 에이전트 빌더 수요 방향만 발견용으로 확인 |
| GitHub Trending (Python AI/ML) | 개발자 생태계 | 반영 | https://github.com/trending/python?since=daily | claude-plugins-official, ai-engineering-from-scratch, hermes-agent 반영 |
| AI 커뮤니티/소셜 (Reddit) | 커뮤니티 펄스 | 보조 | https://www.reddit.com/r/MachineLearning/comments/1cy1kn9/d_ai_agents_too_early_too_expensive_too_unreliable/ | 에이전트 비용·신뢰성 회의론의 장기 기준선 확인 |
| AI 뉴스/미디어 | 보도/분석 | 반영 | https://venturebeat.com/orchestration/googles-managed-agents-api-promises-one-call-deployment-at-the-cost-of-execution-layer-control/ | Managed runtime 경쟁 분석 반영 |
| 기업/연구소 공식 블로그 | 1차 원문/공식 | 반영 | https://www.anthropic.com/research/glasswing-initial-update | Anthropic·Google 공식 발표 본문 확인 |
| Qiita AI/ML 트렌드 | 개발자 커뮤니티 | 반영 | https://qiita.com/tags/ai | AI 코딩 의존 리스크에 대한 일본 개발자 커뮤니티 시그널 반영 |

## 🔬 논문 동향

- **[Lance: 하나의 백본으로 이해·생성·편집을 묶는 통합 멀티모달 실험]** ([arXiv / Hugging Face])
  Lance는 이미지·비디오에 대해 이해, 생성, 편집을 한 모델 안에서 처리하려고 설계한 통합 멀티모달 모델로, 논문 본문 기준 **34쪽** 분량에서 dual-stream mixture-of-experts와 단계별 multi-task 학습을 핵심 구조로 제시했습니다. Hugging Face 트렌딩에서는 같은 논문이 상위권으로 떠오르며 약 **70회 업보트**, GitHub 저장소는 약 **756개 스타**를 기록해 연구와 구현 양쪽 관심을 동시에 끌었습니다. 시사점은 오픈소스 멀티모달 경쟁이 “전용 모델 여러 개를 붙이는 방식”에서 “공유 컨텍스트 하나로 여러 작업을 싸게 묶는 방식”으로 이동하고 있다는 점입니다.
  → 원문: [Unified Multimodal Modeling by Multi-Task Synergy](https://arxiv.org/abs/2605.18678)
  → 교차확인: [Lance on Hugging Face Daily Papers](https://huggingface.co/papers/2605.18678)

- **[Vector Policy Optimization: 추론 시점 탐색을 위해서는 정답성보다 다양성이 먼저다]** ([arXiv])
  이 논문은 RL 후처리가 보통 단일 스칼라 보상에 과적합되면서 응답 분포가 좁아지고, 그 결과 test-time search가 필요한 환경에서 후보 다양성이 부족해진다고 짚습니다. 저자들은 이를 해결하기 위해 벡터형 보상을 직접 다루는 VPO를 제안했고, 초록 기준 **4개 작업**에서 pass@k와 best@k가 기존 스칼라 RL 기준선과 비슷하거나 더 높아졌으며 검색 예산이 커질수록 격차가 벌어진다고 보고했습니다. 시사점은 이제 에이전트 성능을 올릴 때 “한 번에 가장 좋은 답”만 학습시키기보다 “후보 집합을 풍부하게 만드는 학습”이 실제 제품 성능에 더 중요해질 수 있다는 점입니다.
  → 원문: [Vector Policy Optimization: Training for Diversity Improves Test-Time Search](https://arxiv.org/abs/2605.22817)

- **[Directional Motion Blindness: Video-LLM은 아직도 4방향 기본 운동 인지에서 흔들린다]** ([arXiv])
  이 연구는 최신 Video-LLM들이 물체가 좌·우·상·하 어느 방향으로 움직였는지 묻는 가장 기본적인 시각 과제에서 여전히 거의 무작위 수준에 가까운 실패를 보인다고 지적합니다. 저자들은 방향 정보 자체는 인코더와 은닉 상태에 남아 있지만, 정답 문구와 바르게 결합하지 못하는 `direction binding gap`이 핵심 병목이라고 분석했고 이를 보완하기 위해 MoDirect와 DeltaDirect를 제안했습니다. 시사점은 비디오 모델 데모가 화려해 보여도 실제 제품화에서는 `방향`, `속도`, `행동 순서` 같은 저수준 검증 태스크를 따로 점검하지 않으면 체감 품질이 쉽게 무너질 수 있다는 점입니다.
  → 원문: [Which Way Did It Move? Diagnosing and Overcoming Directional Motion Blindness in Video-LLMs](https://arxiv.org/abs/2605.22823)

## 🧩 모델/도구 릴리즈

- **[ADK for Kotlin / ADK for Android 0.1.0: 에이전트 런타임이 안드로이드 안으로 내려왔다]** ([Google for Developers])
  Google은 Java·Go용 **1.0.0**, Python용 **2.0 베타**에 이어 Kotlin용 ADK **0.1.0**과 안드로이드 전용 라이브러리를 발표했고, 클라우드 오케스트레이터와 온디바이스 서브에이전트를 같은 프레임 안에서 연결하는 패턴을 전면에 내세웠습니다. 본문에서는 Gemini Nano가 이미 **1억4천만 대+** 안드로이드 기기에서 사용 가능하다고 밝히며, 로컬 문서 검색·순차 서브에이전트·세션 상태 공유를 몇 줄의 Kotlin으로 묶는 예제를 제시했습니다. 시사점은 모바일 앱에서 AI를 붙일 때 서버 추론만 붙이는 시대가 지나가고, `개인정보는 기기 안`, `복잡한 추론은 클라우드`로 나누는 하이브리드 기본형이 빠르게 표준이 되고 있다는 점입니다.
  → 원문: [Announcing ADK for Kotlin and ADK for Android 0.1.0: Building AI Agents on Android and Beyond](https://developers.googleblog.com/en/adk-kotlin-android-building-ai-agents/)
  → 교차확인: [Agent Development Kit](https://adk.dev/)

- **[LiteRT-LM: 온디바이스 LLM 성능 경쟁이 이제는 실제 속도표로 내려왔다]** ([Google for Developers])
  Google은 LiteRT-LM을 Gemma 4 온디바이스 실행의 핵심 런타임으로 소개하면서 Android GPU에서 **52 tokens/s**, iOS Metal에서 **56 tokens/s**, 웹(WebGPU)에서 최대 **76 tokens/s** 디코드 속도를 공개했습니다. 여기에 Gemma 4 계열의 MTP를 네이티브로 붙여 최대 **2.2배** 속도 향상을 냈다고 설명했고, CPU·GPU·NPU 백엔드를 한 런타임에서 다루는 구조를 강조했습니다. 시사점은 경량 모델 경쟁이 단순 “모델 크기 축소”가 아니라 실제 기기별 추론 파이프라인 최적화 경쟁으로 옮겨갔고, 앞으로는 벤치마크 점수보다 `토큰 속도`, `KV 캐시 처리`, `전력 효율`이 더 중요한 의사결정 지표가 될 가능성이 크다는 점입니다.
  → 원문: [Blazing fast on-device GenAI with LiteRT-LM](https://developers.googleblog.com/en/blazing-fast-on-device-genai-with-litert-lm/)

- **[Claude Opus 4.7: 성능 수치보다 일관성과 다단계 작업 완성도를 전면에 세웠다]** ([Anthropic])
  Anthropic은 Opus 4.7을 소개하며 코딩, 에이전트, 비전, multi-step 작업 전반에서 더 강한 성능과 더 높은 일관성을 강조했고, 모델 소개 문구 자체를 `faster`보다 `thoroughness`와 `consistency`에 맞췄습니다. 최근 며칠 사이 Claude Design, Glasswing, Stainless까지 한꺼번에 붙는 발표 흐름을 보면 Anthropic은 개별 모델 릴리즈를 단독 이벤트로 만들기보다 제품·보안·연결 계층을 함께 묶는 방식으로 포지셔닝하고 있습니다. 시사점은 프런티어 모델 경쟁에서도 단순 점수표보다 `실제 작업 완결성`과 `에이전트 런타임과의 결합력`이 더 큰 판매 포인트가 되고 있다는 점입니다.
  → 원문: [Introducing Claude Opus 4.7](https://www.anthropic.com/news/claude-opus-4-7)

## 🛠️ GitHub / 커뮤니티

- **[claude-plugins-official: 플러그인 디렉터리가 사실상 배포 채널이 되고 있다]** ([GitHub])
  GitHub 트렌딩 상위에 오른 anthropics/claude-plugins-official은 Anthropic이 직접 관리하는 Claude Code 플러그인 디렉터리로, 내부 플러그인과 외부 파트너 플러그인을 **2개 폴더**로 나눠 배포하고 `/plugin install {name}@claude-plugins-official` 같은 설치 흐름을 공식화했습니다. 저장소 설명만 봐도 플러그인 구조가 `.claude-plugin`, `.mcp.json`, `commands`, `agents`, `skills`까지 표준화되어 있고, 트렌딩 기준 약 **2만4천6백+ 스타**, **2천7백+ 포크**를 기록했습니다. 시사점은 앞으로는 모델 API를 잘 감싸는 것보다 `발견`, `설치`, `보안 심사`, `업데이트 경로`를 가진 플러그인 시장을 먼저 잡는 쪽이 더 강한 유통 우위를 가질 가능성이 높다는 점입니다.
  → 원문: [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official)

- **[Qiita의 경고: AI가 코드를 잘 써줄수록 엔지니어의 이해 착시가 커질 수 있다]** ([Qiita])
  Qiita에서 이번 주 높은 반응을 얻은 글은 AI 코딩 도구 덕분에 생산성은 올라가지만, 왜 그 코드가 그렇게 작성됐는지 설명하지 못하는 `분かったつもり` 상태가 빠르게 늘어난다고 지적합니다. 글은 해외 사례로 Anthropic이 **52명**의 주니어 개발자를 대상으로 진행한 실험을 인용하며 AI 사용 그룹의 이해도 점수가 **17점 낮았다**는 수치를 연결했고, 특히 디버깅과 코드 독해에서 차이가 컸다고 정리했습니다. 시사점은 바이브 코딩 열풍이 이어져도 실제 팀 생산성은 `생성 속도`만이 아니라 `설계 설명 가능성`, `리뷰 가능성`, `AI 없이도 수정 가능한가`를 함께 관리해야 지켜진다는 점입니다.
  → 원문: [AIにコードを書かせ続けて気づいた、エンジニアの"分かったつもり"の怖さ](https://qiita.com/jinxin4869/items/786af70f2697dfac4329)

- **[ai-engineering-from-scratch: 에이전트 열풍의 반작용으로 기초 커리큘럼 수요가 커지고 있다]** ([GitHub])
  GitHub 트렌딩 상위에 오른 `ai-engineering-from-scratch`는 README 전면에서 **435개 lessons**, **20개 phases**를 내세우고, “학생의 **84%**는 이미 AI 도구를 쓰지만 전문적으로 준비됐다고 느끼는 비율은 **18%**”라는 문제 정의를 붙였습니다. 이 저장소는 모델 자체보다 학습 경로·레퍼런스·실습 순서를 상품화해 주목받고 있으며, 트렌딩 기준 약 **1만1천7백+ 스타**를 빠르게 모았습니다. 시사점은 개발자 시장이 더 이상 “좋은 모델을 소개하는 콘텐츠”만 원하지 않고, 실제로 일하는 방식으로 전환하는 `재교육 패키지`를 강하게 찾고 있다는 뜻입니다.
  → 원문: [rohitg00/ai-engineering-from-scratch](https://github.com/rohitg00/ai-engineering-from-scratch)

- **[hermes-agent: 자기개선형 에이전트는 아직도 강한 관심 축이다]** ([GitHub])
  NousResearch의 `hermes-agent`는 자신이 쌓은 경험으로 스킬을 만들고 지식을 지속시키는 `built-in learning loop`를 전면에 내세운 저장소로, GitHub 트렌딩에서 약 **16만3천+ 스타**를 기록하며 대형 오픈소스 축으로 올라섰습니다. README는 단순 챗봇이 아니라 과거 문맥 검색, 스킬 생성, 지식 지속화까지 묶은 장기 실행형 에이전트를 표방하고 있어 최근의 메모리·스킬 자동생성 흐름을 집약합니다. 시사점은 자기개선형 에이전트가 여전히 매력적인 방향이긴 하지만, 실제 제품으로 가져가려면 자가변경 자체보다 `감사`, `재현`, `롤백` 장치가 선행되어야 한다는 점입니다.
  → 원문: [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent)

## 🏢 산업 뉴스

- **[Project Glasswing 초기 결과: AI 보안 경쟁의 병목이 탐지에서 패치로 넘어갔다]** ([Anthropic / Reuters])
  Anthropic은 Project Glasswing 출범 한 달 만에 약 **50개 파트너**가 Claude Mythos Preview로 전 세계 핵심 소프트웨어에서 **1만 건 이상**의 high·critical 취약점을 찾았다고 밝혔습니다. 특히 Cloudflare는 **2,000개 버그**, 그중 **400개**의 high·critical 취약점을 보고했고, 일부 파트너는 기존 대비 버그 탐지 속도가 **10배 이상** 빨라졌다고 설명했습니다. 시사점은 이제 보안 AI의 경쟁 포인트가 “얼마나 잘 찾느냐”를 넘어 “얼마나 빨리 검증·공개·패치 체인으로 넘기느냐”로 이동했고, 이 레이어를 가진 플랫폼이 정책과 시장 양쪽에서 우위를 가져갈 가능성이 높다는 점입니다.
  → 원문: [Project Glasswing: An initial update](https://www.anthropic.com/research/glasswing-initial-update)
  → 교차확인: [Fears of unfettered hacking spurred by Anthropic's Mythos AI model overstated](https://www.reuters.com/business/fears-unfettered-hacking-spurred-by-anthropics-mythos-ai-model-overstated-2026-05-20/)

- **[Anthropic의 Stainless 인수: 모델 회사가 SDK와 MCP 연결층까지 직접 품기 시작했다]** ([Anthropic / TechCrunch])
  Anthropic은 **2022년 설립**된 Stainless를 인수하면서 공식 SDK 생성, CLI, MCP 서버 생성까지 담당하던 개발자 연결 계층을 내부화했고, 자사 API 초기 시절부터 Stainless가 공식 SDK 생성을 맡아 왔다고 설명했습니다. 공식 발표는 Stainless가 이미 **수백 개 기업**의 SDK·CLI·MCP 서버 생성을 지원한다고 적시했고, 인수 목적을 `agents are only as useful as what they can connect to`로 요약했습니다. 시사점은 앞으로 프런티어 모델 기업의 진짜 차별점이 모델 품질 하나가 아니라 `SDK 생성`, `도구 연결`, `설치 경험`, `에이전트가 닿을 수 있는 표면적`을 얼마나 깊게 통제하느냐가 될 가능성이 크다는 점입니다.
  → 원문: [Anthropic acquires Stainless](https://www.anthropic.com/news/anthropic-acquires-stainless)
  → 교차확인: [Anthropic has acquired the dev tools startup used by OpenAI, Google, and Cloudflare](https://techcrunch.com/2026/05/18/anthropic-has-acquired-the-dev-tools-startup-used-by-openai-google-and-cloudflare/)

- **[Managed Agents API 분석: 에이전트 배포가 프레임워크에서 플랫폼으로 흡수되고 있다]** ([VentureBeat])
  VentureBeat는 Google I/O에서 공개된 Managed Agents API를 `single API call`로 배포 복잡도를 접는 시도라고 요약하면서, 기존에 팀이 며칠에서 몇 주씩 쓰던 샌드박스·도구 연결·실행 환경 구성이 플랫폼 내부로 빨려 들어가고 있다고 해석했습니다. 기사는 이 흐름을 Anthropic·AWS와 비교하며 모델, 하네스, 샌드박스를 한 사업자가 통합할수록 편의성은 올라가지만 실행 계층 통제권은 줄어드는 구조라고 짚었습니다. 시사점은 기업 입장에서 이제 선택지는 “빨리 얹을 수 있는 관리형 에이전트”와 “유연하지만 더 무거운 자체 런타임” 사이의 아키텍처 결정으로 바뀌고 있으며, 이 판단이 다음 분기 AI 인프라 비용을 크게 갈라놓을 수 있다는 점입니다.
  → 원문: [Google's Managed Agents API promises one-call deployment at the cost of execution layer control](https://venturebeat.com/orchestration/googles-managed-agents-api-promises-one-call-deployment-at-the-cost-of-execution-layer-control/)

## 미스 김 인사이트

### 오늘의 핵심 트렌드 3가지
1. **에이전트 스택이 `더 다양한 후보를 만드는 두뇌`와 `더 가까운 곳에서 실행하는 몸`으로 동시에 분화하고 있습니다.** VPO와 Lance가 전자라면, ADK와 LiteRT-LM은 후자입니다.
2. **온디바이스 AI는 더 이상 데모가 아니라 제품 설계의 기본 축이 되고 있습니다.** 오늘 발표들은 프라이버시·지연·오프라인 복원력을 이유로 클라우드 단독 구조를 빠르게 밀어내고 있습니다.
3. **시장 해자는 모델 점수표보다 연결·패치·배포 계층에서 형성되고 있습니다.** Stainless, Glasswing, Managed Agents API를 한 줄로 보면 결국 돈이 붙는 곳은 `잘 연결하고, 잘 굴리고, 잘 고치는 운영 표면`입니다.

### Jay에게 추천
- **즉시 실행:** 모바일 또는 웹 자동화 하나를 골라 `클라우드 오케스트레이터 + 온디바이스/로컬 서브에이전트` 구조의 작은 시제품을 이번 주 안에 하나 만드시는 편이 좋습니다. 오늘 흐름은 이 패턴을 먼저 몸에 익힌 팀이 비용과 프라이버시 양쪽에서 유리하다는 신호를 줍니다.
- **주목:** 플러그인·SDK·MCP 명세를 단순 연동 문서가 아니라 유통 자산으로 보셔야 합니다. 모델을 바꿔도 남는 것은 결국 설치 경로와 연결 표준입니다.
- **관망:** 자기개선형·자가수정형 에이전트는 매력적이지만, 감사 로그·롤백·재현성 없이 바로 실전 워크플로 핵심에 올리는 것은 아직 위험합니다. 특히 자동 코드 변경 루프는 품질 게이트를 먼저 갖춘 뒤 좁은 범위에서만 시험하는 편이 안전합니다.

### 다음 주 전망
다음 주에는 온디바이스 에이전트 런타임, 멀티모달 통합 모델, 관리형 에이전트 배포 서비스가 더 촘촘히 엮여 나올 가능성이 높습니다. 동시에 보안 쪽에서는 취약점 탐지보다 검증·패치 운영을 얼마나 자동화하느냐가 핵심 경쟁축으로 더 분명해질 가능성이 큽니다.
