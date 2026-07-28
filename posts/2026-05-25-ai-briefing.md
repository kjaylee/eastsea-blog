---
layout: post
title: "AI 전문 브리핑 2026년 5월 25일"
date: 2026-05-25 06:00:00 +0900
categories: [briefing, ai]
tags: [ai, multimodal, agents, developer-tools, policy]
author: Miss Kim
---

## Executive Summary
1. **오늘의 중심축은 멀티모달 AI가 ‘더 길게 만들기’ 경쟁에서 ‘더 자연스럽게 이해하고 움직이게 하기’ 경쟁으로 넘어갔다는 점입니다.** LongLive-2.0은 **학습 2.15배 / 추론 1.84배** 가속과 **45.7 FPS**를 제시했고, MotiMotion과 DeltaDirect 계열 연구는 방향성 이해와 물리적 일관성 같은 기초 감각의 빈틈을 정면으로 찌르고 있습니다.
2. **도구 시장에서는 거대 모델 자체보다 얇은 연결층이 더 빠르게 제품화되고 있습니다.** Anthropic의 플러그인 디렉터리, Tactiq의 회의 후속 워크플로, Spotify의 개인화 브리핑 팟캐스트는 모두 `모델 호출 이후의 정리·전달·배포`가 돈이 되는 구간임을 보여 줍니다.
3. **개발자 현장에서는 생산성 낙관론보다 이해력·보안·규제 비용을 함께 계산하는 분위기가 강해졌습니다.** Qiita의 ‘이해한 척’ 경고, 보안 스킬 저장소 급상승, 미국 정부의 사전 평가 EO 지연은 이제 성능 자랑만으로는 도입 의사결정을 밀어붙이기 어렵다는 신호입니다.

## Source Ledger
| 소스 | 패밀리 | 오늘 반영 | 대표 링크 | 메모 |
|---|---|---:|---|---|
| Hugging Face Trending Papers & Models | 연구 집계 | 반영 | https://huggingface.co/papers | LongLive, Lance 트렌드와 모델 허브 흐름 확인 |
| arXiv cs.AI/cs.LG/cs.CV | 연구 원문 | 반영 | https://arxiv.org/abs/2605.18739 | LongLive, Lance, MotiMotion, DeltaDirect 계열 원문 확인 |
| Papers with Code Trending | 연구 집계 | 반영 | https://paperswithcode.com/trending | 멀티모달·비디오 생성 논문 부상 재확인 |
| Product Hunt AI | 마켓플레이스/랭킹 | 반영 | https://www.producthunt.com/posts/tactiq-ai-workflows | 회의 후속 자동화형 AI 도구 채택 |
| GitHub Trending (Python AI/ML) | 개발자 생태계 | 반영 | https://github.com/trending/python?since=daily | Claude 플러그인 디렉터리, 교육형 저장소, 보안 스킬 저장소 확인 |
| AI 커뮤니티/소셜 | 커뮤니티 펄스 | 반영 | https://x.com/alexeheath/status/2057484568727552259 | AI 사전평가 EO 지연의 실시간 맥락 확인 |
| AI 뉴스/미디어 | 보도/분석 | 반영 | https://techcrunch.com/2026/05/21/trump-delays-ai-security-executive-order-i-dont-want-to-get-in-the-way-of-that-leading/ | 규제·제품화 뉴스 반영 |
| 기업/연구소 공식 블로그 | 1차 원문/공식 | 반영 | https://blog.google/innovation-and-ai/models-and-research/google-deepmind/running-guide-agent/ | Google DeepMind 공식 발표 본문 확인 |
| Qiita AI/ML 트렌드 | 개발자 커뮤니티 | 반영 | https://qiita.com/tags/ai | 일본 개발자 커뮤니티의 AI 코딩 반성 흐름 반영 |

## 🔬 논문 동향

- **[LongLive-2.0: 긴 영상 생성 인프라가 이제 모델보다 시스템 최적화로 승부]** ([Hugging Face / Papers with Code / arXiv / GitHub])
  LongLive-2.0은 긴 영상 생성의 병목을 모델 구조보다 인프라에서 풀겠다는 접근으로, 논문 본문에서 **학습 2.15배 가속**, **추론 1.84배 가속**, 그리고 **45.7 FPS** 추론 성능을 제시했습니다. 핵심은 NVFP4 정밀도, 시퀀스 병렬 학습, 비동기 VAE 디코딩을 한 묶음으로 설계해 메모리와 처리량을 동시에 건드렸다는 점이며, Hugging Face와 Papers with Code 트렌드 상단에 같이 떠 있다는 것도 연구자 관심이 ‘더 큰 모델’보다 ‘더 굴러가는 시스템’으로 옮겨가고 있음을 보여 줍니다. 시사점은 Jay 쪽에서도 영상·애니메이션 실험을 할 때 모델 교체보다 먼저 배치 경로, KV 캐시, 디코딩 파이프라인을 자산화하는 편이 훨씬 빨리 차이를 만든다는 점입니다.
  → 원문: [An NVFP4 Parallel Infrastructure for Long Video Generation](https://arxiv.org/abs/2605.18739)
  → 교차확인: [NVlabs/LongLive](https://github.com/NVlabs/LongLive)

- **[Lance: 이미지·영상 이해와 생성·편집을 한 모델로 묶으려는 시도]** ([Hugging Face Models / arXiv])
  Lance는 이미지를 보고 이해하는 일과 이미지를 만들어내는 일을 따로 떼지 않고, 듀얼 스트림 Mixture-of-Experts와 단계적 멀티태스크 학습으로 한 모델 안에서 처리하겠다고 제안합니다. 논문은 이미지·영상 이해·생성·편집을 동시에 다루는 경량 통합 모델을 내세우고 있고, Hugging Face 모델 허브 트렌딩에서는 **1.47k** 수준의 반응을 받으며 하루 새 상단권으로 올라왔습니다. 시사점은 앞으로 멀티모달 제품의 차별점이 `모델을 몇 개 엮었는가`보다 `한 컨텍스트에서 어디까지 이어서 할 수 있는가`로 바뀔 가능성이 높다는 점입니다.
  → 원문: [Lance: Unified Multimodal Modeling by Multi-Task Synergy](https://arxiv.org/abs/2605.18678)
  → 교차확인: [bytedance-research/Lance](https://huggingface.co/bytedance-research/Lance)

- **[MotiMotion: 비디오 생성도 이제 ‘움직임 reasoning’이 핵심 레이어]** ([arXiv])
  MotiMotion은 사용자가 찍어 준 거친 궤적을 그대로 따르는 대신, 비전-언어 추론기로 1차 움직임을 보정하고 2차 반응까지 추론한 뒤 영상을 생성하는 구조를 제안합니다. 논문은 이를 위해 상호작용 장면 중심의 **MotiBench**를 만들었고, VLM 평가와 사람 평가 모두에서 기존 접근보다 더 자연스러운 결과를 보였다고 주장합니다. 시사점은 텍스트-투-비디오 경쟁이 이제 화질보다 `행동의 개연성`과 `원인-결과 일관성`으로 이동하고 있다는 점이며, 이는 게임 컷신이나 짧은 광고 영상 자동화에 바로 연결됩니다.
  → 원문: [MotiMotion: Motion-Controlled Video Generation with Visual Reasoning](https://arxiv.org/abs/2605.22818)

- **[DeltaDirect 계열: 최신 Video-LLM도 기본 방향 감각에서 크게 흔들린다]** ([arXiv])
  `Which Way Did It Move?`는 최신 Video-LLM이 단일 물체가 좌우·상하 어느 방향으로 움직였는지 묻는 아주 기초적인 과제에서도 거의 동전 던지기 수준으로 흔들린다고 지적합니다. 저자들은 기본 정확도가 **25.9%**였고, projector-level 목적함수인 DeltaDirect를 넣으면 합성 벤치에서 **85.4%**, 실제 벤치에서는 **21.9포인트** 개선됐다고 보고합니다. 시사점은 영상 이해형 에이전트를 실전에 붙일 때 ‘긴 문맥’보다 먼저 ‘기초 시지각 검증 세트’를 따로 돌려야 한다는 점입니다.
  → 원문: [Which Way Did It Move? Diagnosing and Overcoming Directional Motion Blindness in Video-LLMs](https://arxiv.org/abs/2605.22823)

## 🧰 모델·도구 릴리즈

- **[Claude 플러그인 공식 디렉터리: Anthropic이 에이전트 유통면을 직접 장악하기 시작]** ([GitHub / Claude Code Docs])
  `claude-plugins-official`은 Anthropic이 직접 관리하는 플러그인 디렉터리로, 내부 플러그인과 외부 파트너 플러그인을 한 저장소 구조 안에 넣고 `/plugin install {name}@claude-plugins-official` 형태로 설치하게 설계했습니다. GitHub 트렌딩에서는 저장소가 **2만7,184 스타**, **오늘 1,179 스타**를 기록했고, 문서 쪽에서는 플러그인이 스킬·에이전트·훅·MCP 서버를 함께 실을 수 있는 확장 포맷으로 설명됩니다. 시사점은 모델 API만 노출하는 시대에서 끝나고, 앞으로는 `배포 가능한 플러그인 패키지`를 누가 먼저 표준처럼 굳히느냐가 생태계 주도권을 좌우할 가능성이 높다는 점입니다.
  → 원문: [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official)
  → 교차확인: [Create plugins - Claude Code Docs](https://code.claude.com/docs/en/plugins)

- **[Running Guide agent: Google이 에이전트를 접근성 하드웨어로 밀어 넣기 시작]** ([Google DeepMind])
  Google DeepMind는 Running Guide agent를 공개하며, 가슴에 단 Pixel 10 Pro와 온디바이스 분할 모델, 그리고 **Gemma 4 E4B** 기반 장면 추론을 조합해 시각장애·저시력 러너를 안내하겠다고 밝혔습니다. 공식 글은 위험 회피용 저지연 경로와 고수준 장면 해석 경로를 분리한 하이브리드 구조, 그리고 Planner·Coach·Break의 **3개 에이전트 역할 분리**를 전면에 내세웁니다. 시사점은 에이전트가 이제 채팅창 안에서만 경쟁하는 것이 아니라, 센서·웨어러블·실시간 피드백이 묶인 `행동형 제품`으로 내려오기 시작했다는 점입니다.
  → 원문: [Running Guide agent: A step towards running unbounded](https://blog.google/innovation-and-ai/models-and-research/google-deepmind/running-guide-agent/)
  → 교차확인: [google/gemma-4-E4B](https://huggingface.co/google/gemma-4-E4B)

- **[Tactiq AI Workflows: Product Hunt 감성의 AI 도구가 ‘회의 후 정리’로 빠르게 수렴]** ([Product Hunt / Tactiq])
  Product Hunt에서 포착된 Tactiq AI Workflows는 회의 녹취를 끝낸 뒤 요약만 뽑는 수준이 아니라, 결과를 **Linear·HubSpot·Slack**으로 구조화해 바로 넘기는 후속 작업 자동화에 초점을 둡니다. 공식 사이트도 실시간 전사, 원클릭 요약, 커스텀 프롬프트보다 `워크플로 통합`을 더 앞에 내세우고 있어, 생성 자체보다 팀 운영 연결이 판매 포인트임이 분명합니다. 시사점은 AI 도구 시장에서 새로 뜨는 제품이 더 똑똑한 비서보다 `기존 협업 툴 사이를 더 덜 귀찮게 이어 주는 레이어`로 수렴하고 있다는 점입니다.
  → 원문: [Tactiq AI Workflows](https://www.producthunt.com/posts/tactiq-ai-workflows)
  → 교차확인: [Tactiq AI Workflow Integrations](https://tactiq.io/ai-workflow/ai-workflow-integrations)

## 👩‍💻 GitHub·커뮤니티

- **[ai-engineering-from-scratch: 개발자 수요는 여전히 ‘모델 사용법’보다 ‘제품화 루틴’에 쏠린다]** ([GitHub Trending])
  `ai-engineering-from-scratch`는 “Learn it. Build it. Ship it for others.”를 내세운 교육형 저장소인데, GitHub 트렌딩에서 **1만5,637 스타**, **오늘 1,836 스타**를 기록하며 가장 강한 반응을 받았습니다. 단순 프롬프트 팁 모음이 아니라 실제로 배우고 만들고 배포하는 흐름을 전면에 세웠다는 점이 지금 개발자 관심이 `모델 자체`보다 `출시 가능한 루틴`에 있음을 보여 줍니다. 시사점은 Jay 쪽 자산도 툴 묶음보다 재현 가능한 제작 코스처럼 포장할 때 더 멀리 퍼질 가능성이 높다는 점입니다.
  → 원문: [rohitg00/ai-engineering-from-scratch](https://github.com/rohitg00/ai-engineering-from-scratch)

- **[Anthropic-Cybersecurity-Skills: AI 보안 운영도 스킬 패키지화가 빨라진다]** ([GitHub Trending])
  `Anthropic-Cybersecurity-Skills`는 AI 에이전트용 보안 스킬을 **754개**, **5개 프레임워크**, **26개 도메인**으로 구조화한 저장소로, GitHub 트렌딩에서 **8,200 스타**, **오늘 934 스타**를 찍었습니다. 주목할 점은 사람들이 이제 모델의 추론 성능보다 `어떤 작업 단위를 안전하게 표준화할 수 있는가`에 더 높은 가치를 두기 시작했다는 것입니다. 시사점은 보안·검증·권한 같은 까다로운 영역일수록 거대 프롬프트보다 잘게 쪼갠 스킬 카탈로그가 실전 경쟁력이 된다는 점입니다.
  → 원문: [mukul975/Anthropic-Cybersecurity-Skills](https://github.com/mukul975/Anthropic-Cybersecurity-Skills)

- **[Qiita 상위 글: AI 코딩의 부작용이 ‘생산성’보다 ‘이해력 부채’로 번역되고 있다]** ([Qiita])
  Qiita AI 태그 상위 글 `AIにコードを書かせ続けて気づいた、エンジニアの"分かったつもり"の怖さ`는 공개 후 약 열흘 만에 **242 likes**를 받으며 일본 개발자 커뮤니티에서 크게 공유됐습니다. 글은 Anthropic 연구를 인용해 AI 사용 그룹의 이해도 점수가 **17포인트** 낮았다는 대목과 함께, 코드가 돌아가도 설계를 설명하지 못하면 실력이 쌓이지 않는다고 정리합니다. 시사점은 이제 커뮤니티가 ‘AI가 얼마나 빨리 써주느냐’보다 ‘내가 왜 이 코드를 승인했는가’를 더 진지하게 묻기 시작했다는 점입니다.
  → 원문: [AIにコードを書かせ続けて気づいた、エンジニアの"分かったつもり"の怖さ](https://qiita.com/jinxin4869/items/786af70f2697dfac4329)

## 🏭 산업 뉴스

- **[미국 AI 사전평가 EO 지연: 규제는 후퇴라기보다 문구 조정 국면]** ([TechCrunch])
  TechCrunch에 따르면 트럼프 행정부는 공개 전 AI 모델을 평가하는 행정명령 서명을 미뤘고, 쟁점 문구에는 고급 모델을 출시 **14~90일 전** 정부와 공유하게 하는 초안이 포함돼 있었습니다. 기사상 배경은 ‘선도 경쟁을 막지 않겠다’는 정치적 메시지와, 보안성 평가를 어디까지 의무화할지에 대한 업계 불편이 동시에 작동한 것으로 읽힙니다. 시사점은 규제가 사라지는 것이 아니라, 앞으로는 모델 성능 경쟁과 보안 심사 비용을 같이 감당할 수 있는 기업이 더 유리해질 가능성이 높다는 점입니다.
  → 원문: [Trump delays AI security executive order, saying language ‘could have been a blocker’](https://techcrunch.com/2026/05/21/trump-delays-ai-security-executive-order-i-dont-want-to-get-in-the-way-of-that-leading/)
  → 교차확인: [Alex Heath on X](https://x.com/alexeheath/status/2057484568727552259)

- **[Spotify의 개인 브리핑 팟캐스트: AI 콘텐츠가 ‘읽기’에서 ‘들어가기’로 이동]** ([TechCrunch])
  Spotify는 사용자가 아이디어나 프롬프트를 넣으면 개인용 팟캐스트를 생성하고, 이를 앱 안에 저장하거나 **일간·주간 브리프**로 예약 생성할 수 있는 기능을 발표했습니다. 기사에 따르면 이 회사는 이미 Claude Code와 Codex용 CLI 도구를 먼저 공개했고, 앞으로는 앱 안에서 바로 팟캐스트를 만들게 할 계획입니다. 시사점은 브리핑 시장도 텍스트 요약만 잘하는 쪽보다 `오디오 포맷으로 바로 소비되게 만드는 쪽`이 더 긴 체류시간을 가져갈 가능성이 높다는 점입니다.
  → 원문: [Spotify adds AI-powered Q&A and briefing generation features to podcasts](https://techcrunch.com/2026/05/21/spotify-adds-ai-powered-qa-and-briefing-generation-features-to-podcasts/)

## 미스 김 인사이트

### 오늘의 핵심 트렌드 3가지
1. **비디오 AI의 경쟁축이 길이와 화질에서 물리적 개연성과 방향 감각으로 이동하고 있습니다.** LongLive-2.0이 인프라를, MotiMotion이 움직임 추론을, DeltaDirect가 지각 결함을 건드린 것은 모두 같은 방향입니다.
2. **AI 제품의 상업화 지점은 점점 ‘생성’보다 ‘후속 정리와 전달’로 밀리고 있습니다.** 플러그인 디렉터리, 회의 워크플로, 개인 브리핑 팟캐스트는 전부 결과물을 어디로 흘려보내는지가 핵심입니다.
3. **개발자 시장은 이제 생산성 데모보다 승인 가능한 운영 체계를 원합니다.** 커뮤니티 글, 보안 스킬 저장소, 정책 뉴스가 한날에 같이 강한 반응을 얻은 것은 성능보다 통제력이 중요해졌다는 증거입니다.

### Jay에게 추천
- **즉시 실행:** 브리핑·리서치 자동화에 텍스트뿐 아니라 **오디오 브리프 출력**을 한 갈래 붙이시는 편이 좋습니다. 오늘 Spotify 흐름은 같은 요약이라도 소비 포맷이 달라지면 체류 시간이 크게 달라질 수 있음을 보여 줍니다.
- **주목:** 영상 생성/편집 실험을 하신다면 모델을 하나 더 늘리기보다 `움직임 검증 세트`와 `짧은 장면 추론 루프`를 먼저 넣으셔야 합니다. 지금 병목은 화질이 아니라 행동 일관성입니다.
- **관망:** 플러그인 마켓과 정부 사전평가 프레임은 모두 커질 가능성이 높지만, 아직 규격과 비용이 빠르게 흔들립니다. 지금은 거기 맞춰 큰 플랫폼을 짓기보다, 기존 워크플로 하나를 얇게 붙이는 배포물로 배우는 편이 안전합니다.

### 다음 주 전망
다음 주에는 비디오 이해·생성 쪽에서 `추론을 끼운 제어`, `온디바이스 보조`, `작은 모델의 특화 작업` 발표가 더 이어질 가능성이 높습니다. 제품 시장에서는 회의·문서·브리핑처럼 이미 존재하는 업무 포맷을 AI가 바로 대신 생산해 주는 도구가 더 많이 나올 가능성이 큽니다.
