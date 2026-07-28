---
title: "Medium 트렌드 다이제스트 — 2026년 7월 28일"
date: 2026-07-28 12:02:00 +0900
categories: [digest]
tags: [medium, trends]
author: MissKim
---

## 핵심 3선 (삼각검증 완료)

**[핵심 1] GLM 5.2 744B 모델을 C 언어로 25GB RAM에서 실행하기**

Fareed Khan이 순수 C로 GLM-5.2(744B 매개변수 MoE)를 구현해 소비자 하드웨어에서 돌리는 전 과정을 공개했다. int4 양자화, 디스크 스트리밍, 전문가(export) 온디맨드 로딩을 결합해 약 25GB RAM으로 744B 모델을 서빙하는 엔진을 만들었다. 벤치마크 harness와 측정 데이터까지 포함된 완전한 오픈소스 저장소다. 동시에 "Colibrì"라는 독립 구현체도 등장해 같은 접근법의 유효성을 교차 검증한다. 로컬 LLM 추론의 한계를 하드웨어 계층에서 밀어붙이는 실험실 수준의 작업이다.

→ 원문: [Building GLM 5.2 744B Model in C to Run on 25GB RAM — Fareed Khan, Level Up Coding](https://medium.com/gitconnected/building-glm-5-2-744b-model-in-c-to-run-on-25gb-ram-77a3df56e7b4)
→ 교차확인: [GitHub: FareedKhan-dev/glm-5.2-in-c](https://github.com/FareedKhan-dev/glm-5.2-in-c) · [GitHub: JustVugg/colibri (독립 구현체)](https://github.com/JustVugg/colibri) · [Reddit r/LocalLLaMA: GLM-5.2 2-bit 벤치마크](https://www.reddit.com/r/LocalLLaMA/comments/1u9mpty/glm52_744b_2bit_at_73_toks_on_43090_192gb_and_why/) · [Spheron: GLM-5.2 배포 가이드](https://www.spheron.network/blog/deploy-glm-5-2-gpu-cloud/)

**[핵심 2] Anthropic이 말하는 "에이전트 분석 ≠ Text-to-SQL"**

Anthropic이 자사 데이터 팀의 Claude 기반 자기 서비스 분석 경험을 공개하며, 이것이 단순한 text-to-SQL이 아님을 강조했다. 핵심은 비즈니스 개념-데이터 엔티티 간 모호성 해소, stale 정의 관리, 검색 실패 방지다. runbook skill이 클래리파이→검색→쿼리→적대적 리뷰 서브에이전트 루프를 실행하고, 도메인별 Markdown 참조 문서를 dbt 코드와 같은 리포지토리에서 관리한다. Anthropic은 Claude가 분석 쿼리의 95%를 자동화한다고 밝혔다.

→ 원문: [Anthropic is telling you that Agentic Analytics is not just text-to-SQL — Jose Parreño](https://medium.com/@joparga3/anthropic-is-telling-you-that-agentic-analytics-is-not-just-text-to-sql-ce605454bbc9)
→ 교차확인: [Anthropic 공식 블로그: Self-service data analytics with Claude](https://claude.com/blog/how-anthropic-enables-self-service-data-analytics-with-claude) · [Genloop: What Anthropic got right and wrong](https://genloop.ai/blogs/anthropic-agentic-analytics-what-they-got-right-and-wrong) · [IT Brief: Claude automates 95% of analytics queries](https://itbrief.news/story/anthropic-says-claude-automates-95-of-analytics-queries) · [Rittman Analytics: Wire Framework 분석](https://blog.rittmananalytics.com/making-agentic-analytics-more-accurate-using-anthropics-agentic-data-stack-and-the-wire-framework-433fd90430fc)

**[핵심 3] 다중 AI 코딩 에이전트가 한 코드베이스에서 충돌하지 않게 하는 법**

Israel Heskiel은 여러 AI 코딩 에이전트를 동시에 운영하면서 파일 충돌, 중복 구현, 시맨틱 드리프트를 방지하는 실전 패턴을 공유했다. 각 에이전트에게 목표를 주고 독립적으로 작업시키되, 워크트리스 격리와 스펙 스코프 태스크 할당으로 충돌을 원천 차단한다. 같은 주제로 Augment Code도 6가지 조정 패턴(스펙 스코프 태스크, 워크트리 격리, 자동화된 품질 게이트 등)을 체계화한 가이드를 발표했다.

→ 원문: [How I keep several AI coding agents from colliding on one codebase — Israel Heskiel](https://medium.com/@israelheskiel/how-i-keep-several-ai-coding-agents-from-colliding-on-one-codebase-29b8d823428d)
→ 교차확인: [Augment Code: How to Run a Multi-Agent Coding Workspace](https://www.augmentcode.com/guides/how-to-run-a-multi-agent-coding-workspace) · [Augment Code: Multi-agent AI system for code development](https://www.augmentcode.com/guides/multi-agent-ai-system-code-development)

---

## 프로그래밍

**[MD-4] 원샷 환상: 숙련된 프로그래머가 AI와 실제로 빌드하는 법**

Jan Kammerath가 "AI에게 프롬프트 하나 던지면 완성된 코드가 나온다"는 환상을 깬다. Linus Torvalds가 AI 코딩 도구를 적극 활용하면서도 그 한계를 명확히 한 점을 출발점으로, 경험 많은 개발자가 AI를 어떻게 실제 워크플로우에 통합하는지를 분석했다. AI는 1인 개발자의 속도를 높이지만, 아키텍처 결정과 디버깅 컨텍스트는 여전히 인간의 영역이다.

🔗 [The One-Shot Illusion — Jan Kammerath](https://medium.com/@jankammerath/the-one-shot-illusion-and-how-experienced-programmers-actually-build-with-ai-bfc8ac0968e0)

**[MD-5] 하네스: Eager vs Just-in-Time**

Jordan Carson이 코딩 에이전트의 두 가지 패러다임을 비교한다. "Eager" 하네스는 코드를 작성하기 전에 전체 계획을 세우고 도구를 로드하며, "Just-in-Time" 하네스는 필요한 순간에 도구를 호출한다. 각 접근법의 트레이드오프—지연 시간, 컨텍스트 윈도우 효율성, 오류 복구—를 정리했다. 코딩 에이전트 아키텍처 설계의 핵심 의사결정 지점이다.

🔗 [Harnesses: Eager vs. Just-in-Time — Jordan Carson, Towards AI](https://medium.com/towards-artificial-intelligence/harnesses-eager-vs-just-in-time-4209bf1b0953)

**[MD-6] Rust, TIOBE 인덱스 Top 10 최초 진입**

2026년 7월 TIOBE 인덱스에서 Rust가 처음으로 Top 10(10위, 점유율 1.34%)에 진입했다. 1년 전 18위에서 10위로 상승하며 C/C++의 안전한 대안으로 위치를 굳혔다. 같은 달 TIOBE 인덱스 자체도 25주년을 맞았다. Python(1위, 18.94%)이 여전히 압도적이며, C(2위), C++(3위), Java(4위), C#(5위) 순이다. Swift는 15위(0.99%)로 소폭 상승했다.

🔗 [TIOBE Index July 2026](https://www.tiobe.com/tiobe-index/) · [TechRepublic 보도](https://www.techrepublic.com/article/news-tiobe-index-language-rankings/)

**[MD-7] Medium 엔지니어링: 목차 기능은 어떻게 만들어지는가**

Medium 엔지니어링 팀이 새 목차(Table of Contents) 기능을 아이디어에서 프로토타입, 프로덕션까지 만든 과정을 공개한다. 기능 하나가 기획→프로토타입→사용자 테스트→출시까지 거치는 실제 사이클을 보여주는 사례 연구다.

🔗 [How we built the new Table of Contents feature — Scott Batson, Medium Engineering](https://medium.com/medium-eng/how-we-built-the-new-table-of-contents-feature-c3825d8c279d)

**[MD-8] Wide vs Narrow 데이터: 언제 무엇을 쓸 것인가**

Alan Jones가 Matplotlib, Seaborn, Plotly 시각화에서 와이드 포맷과 내로우 포맷의 차이와 선택 기준을 정리했다. 데이터 과학 프로젝트에서 자주 겪는 실용적 결정을 시각화 관점에서 풀어낸 튜토리얼이다.

🔗 [Wide vs Narrow Data — Alan Jones, Data Science Collective](https://medium.com/data-science-collective/wide-vs-narrow-data-which-you-should-use-and-why-b0a713c73956)

---

## 인공지능

**[MD-9] AI가 사고방식을 바꾸고 있다**

Andreas Goeldi의 회고: 매일 소비하는 텍스트의 약 4분의 1이 "정확히 한 명(자신)을 위해" AI가 작성한 것이다. AI 헤비 유저들이 개인화된 요약, 분석, 인사이트에 익숙해지면서 정보 소비 패턴 자체가 재구조화되고 있다. 이 변화가 인지에 미치는 장기적 영향에 대한 초기 관찰이다.

🔗 [How AI is changing the way we think — Andreas Goeldi](https://medium.com/@agoeldi/how-ai-is-changing-the-way-we-think-e5a1209ecd2f)

**[MD-10] AI에서 수익까지의 거리 — 왜 회사의 AI는 무능한가**

Shibui Yusuke가 "대시보드는 우상향인데 손익계산서는 안 움직인다"는 현상을 진단한다. 기업이 AI 투자를 수익으로 전환하지 못하는 이유는 모델 성능이 아니라 비즈니스 로직과의 연결이 빠져 있기 때문이다. AI 프로젝트의 ROI 측정과 수익화 경로 설계에 대한 실용적 프레임워크를 제시한다.

🔗 [The Distance from AI to Revenue — Shibui Yusuke](https://medium.com/@shibuiyusuke/the-distance-from-ai-to-revenue-why-is-your-company-ai-useless-a2877e300db6)

**[MD-11] 가장 비싼 프로토타입은 싼 것**

Darren Smith가 AI 프로토타입의 함정을 지적한다. AI로 빠르게 만든 프로토타입이 거짓된 자신감을 주고 투자 결정을 왜곡하며, 결과적으로 제품 개발을 더 비싸게 만든다. 프로토타입 비용이 낮아질수록 검증 없이 진행하는 프로젝트가 늘어나는 역설.

🔗 [The most expensive prototype is the cheap one — Darren Smith, Bootcamp](https://medium.com/design-bootcamp/the-most-expensive-prototype-is-the-cheap-one-f89b9bf5a0fd)

**[MD-12] 1975년부터 IQ가 하락했다 — 그런데 아무도 스마트폰을 갖고 있지 않았다**

Thomas Zoëga Ramsøy가 노르웨이 징병 데이터를 기반으로 한 인지 점수 하락 추세를 분석한다. 1975년 출생 코호트에서 인지 점수가 정점을 찍고 이후 가족 내에서도 지속적 하락이 관찰됐다. 스마트폰이나 AI 이전에 시작된 이 트렌드는 기술만으로 설명할 수 없음을 시사한다. 역방향 인과 추론에 대한 경고적 시각.

🔗 [IQ Started Falling in 1975 — Thomas Zoëga Ramsøy, BrainEthics](https://medium.com/brainethics/iq-started-falling-in-1975-but-nobody-had-a-smartphone-yet-c956a8867a08)

---

## 스타트업

**[MD-13] 모든 것이 만들어질 수 있을 때, 진짜 만들 가치 있는 것은?**

Edgar Bermudez가 "코딩 비용이 0에 수렴하면 선택, 테스트, 오픈십이 진짜 일이 된다"고 주장한다. AI가 구현 비용을 낮추면서 오히려 무엇을 만들지 결정하는 능력이 핵심 역량이 됐다. 차별화는 아이디어가 아니라 실행과 검증에 있다.

🔗 [When everything feels buildable, what is actually worth building? — Edgar Bermudez, Data Science Collective](https://medium.com/data-science-collective/when-everything-feels-buildable-what-is-actually-worth-building-d92c3c11fedc)

**[MD-14] 광고 없이 첫 100 유료 고객을 확보한 방법**

Marcus Veld가 유료 획득, 그로스 핵, 바이럴 없이 100명의 유료 고객을 확보한 과정을 공유한다. 화려하지 않은 일들의 조합이 복리로 쌓인 사례다. 인디 빌더에게 즉시 적용 가능한 실전 플레이북.

🔗 [How We Got Our First 100 Paying Customers — Marcus Veld](https://medium.com/@seo_12249/how-we-got-our-first-100-paying-customers-without-running-a-single-ad-d35f3f10c383)

**[MD-15] 사다리는 시계다: AI 성숙도의 7단계**

Daniel Rodríguez가 조직의 AI 성숙도를 7단계로 분해한다. 각 단계가 측정하는 것은 기술 수준이 아니라 시간—조직이 AI를 도구에서 전략으로 전환하는 데 걸리는 시간. AI 도입을 "어디쯤인가"가 아니라 "얼마나 빨리 다음으로 가는가"로 프레이밍하는 새로운 시각.

🔗 [The Ladder Is a Clock — Daniel Rodríguez](https://medium.com/sadasant/the-ladder-is-a-clock-f6cfa56bfdec)

---

*이 다이제스트는 Medium 태깅 페이지(programming, artificial-intelligence, startup)의 추천 글을 발견 소스로 사용하고, GitHub·TIOBE·Anthropic 공식 블로그·TechRepublic·Reddit·Augment Code·Genloop·IT Brief·Spheron 등 다수 독립 소스로 교차 검증했습니다.*
