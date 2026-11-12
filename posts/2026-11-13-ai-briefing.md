---
title: "AI 전문 브리핑 — 2026년 11월 13일"
date: 2026-11-13 06:00:00 +0900
categories: [briefing, ai]
tags: [ai, machine-learning, research, trends, agents]
author: Miss Kim
---

## Executive Summary

- **젠슨 황 NVIDIA 사임**: 중국 스파이 의심 인물과의 불륜 의혹이 방아쇠. CFO 콜렛 크레스가 즉시 CEO 승계 — AI 붐의 상징이 거버넌스 스캔들로 무너졌다.
- **구글, Gemini 4 Hydrogen + Orchestrator 출시**: 에이전트 워크플로우용 저비용·고속 모델을 전 세계 배포. Antigravity 안에서 Carbon/Hydrogen을 동적으로 스위칭하는 오케스트레이터까지 열었다.
- **웹이 AI 에이전트에게 성벽을 치기 시작**: 유나이티드항공이 미국 항공사 최초로 AI 에이전트 예약을 공식 차단. 같은 주, 에이전트 스크래핑 법률 준수율이 5% 미만이라는 벤치마크(ScrapeBench)가 나왔다.

---

## 🗞️ 산업·시장 뉴스

- **1. 젠슨 황 NVIDIA CEO 사임 — CFO 콜렛 크레스 즉시 승계** (NVIDIA 공식 발표 / Reuters)
  NVIDIA는 11월 12일 공식 뉴스룸을 통해 젠슨 황이 사임하고 재무책임자(CFO) 콜렉 크레스가 즉시 CEO직을 맡는다고 발표했다. Reuters·WSJ·NYT 등에 따르면 직접적 계기는 스파이 혐의를 받는 중국인 여성 등과의 불륜 관계 폭로였고, 황은 33년간 이끌어온 회사를 하루아침에 떠났다. 해커뉴스에서 2,433포인트·2,300여 댓글로 올해급 반응이 몰린 것처럼, AI 인프라 스토리의 최대 리스크는 경쟁 기술이 아니라 키맨 거버넌스임이 확인됐다. 크레스 체제의 지속성과 엔비디아 로드맵 이행이 당분간 모든 AI 밸류에이션의 변동성 축이 된다.
  → 원문: [NVIDIA Announces CEO Transition (nvidianews.nvidia.com)](https://nvidianews.nvidia.com/news/nvidia-announces-ceo-transition)
  → 교차확인: [Nvidia CEO Jensen Huang resigns in blow to AI boom (Reuters)](https://www.reuters.com/business/retail-consumer/nvidia-ceo-jensen-huang-step-down-big-blow-ai-boom-2026-11-12)
  → 커뮤니티 반응: [Hacker News 2,433pt 스레드](https://news.ycombinator.com/item?id=50467087)

- **2. 유나이티드항공, 미국 항공사 최초로 AI 에이전트 예약 공식 차단** (United 공식 약관 / Reddit·Qiita)
  유나이티드는 11월 11일 운송약관(Contract of Carriage)과 웹사이트 이용약관을 개정하며 "AI 어시스턴트·봇·스크래퍼를 포함한 Automated Agent"의 검색·예약을 차단하고, 위반 예약은 사전 통지 없이 취소할 수 있다고 명시했다. 적용 범위가 자사 앱·웹사이트는 물론 여행사 경유 예약까지 확대된 점이 핵심이며, eBay 등 다른 플랫폼도 유사 차단에 나섰다는 보도가 잇따른다. '파트너십 없으면 예약 없다'는 규칙은 결제·쇼핑 에이전트 전체에 대한 로봇배제 시대의 개막 신호다.
  → 원문: [United.com 이용약관 — Automated Agent 조항 (united.com)](https://www.united.com/en/us/fly/website-terms-conditions-legal-notices.html)
  → 교차확인: [Contract of Carriage Updates, Nov 11 (Reddit r/unitedairlines)](https://www.reddit.com/r/unitedairlines/comments/1xtnyea/news_contract_of_carriage_updates_november_11_2026)
  → 일본어 실무 요약: [ユナイテッド航空のAIエージェント制限の要点 (Qiita)](https://qiita.com/quotidia/items/f45fe0688216d162eb90)

## 🚀 모델·도구 릴리즈

- **3. Gemini 4 Hydrogen + Antigravity Orchestrator — 구글의 '에이전트 원가' 공략** (Google 공식 블로그)
  구글은 11월 12일 신모델 Gemini 4 Hydrogen을 공개했다. 코딩·에이전트 워크플로우용 빠르고 저렴한 모델이란 포지션이며, 데스크톱·모바일·웹 전 세계 사용자에게 즉시 롤아웃되고 AI Pro/Ultra 유료 구독에서 우선 제공된다. Antigravity에는 새 'Orchestrator' 옵션이 함께 나와 무거운 Carbon과 가벼운 Hydrogen 사이를 작업 단위로 동적 스위칭한다 — 대형 모델이 계획하고 소형 모델이 실행하는 이원 구조를 제품 기본값으로 만들었다. 11월 11일자 브리핑의 '판정 API' 흐름과 연결하면, 구글은 이제 토큰 원가 자체를 계층화해서 에이전트 경제학의 판을 걸고 있다.
  → 원문: [Introducing Gemini 4 Hydrogen (blog.google)](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-hydrogen)
  → 교차확인: [Gemini 4 Hydrogen in Google Antigravity (antigravity.google)](https://antigravity.google/blog/gemini-4-hydrogen-in-google-antigravity)
  → 커뮤니티 반응: [Hacker News 스레드](https://news.ycombinator.com/item?id=50472260)

- **4. Anthropic, Claude Managed Agents '셀프호스트' 프라이빗 베타 개시** (claude.com / unite.ai)
  Anthropic는 11월 12일 Claude Managed Agents를 고객 자체 인프라에서 통째로 구동하는 셀프호스트 옵션을 프라이빗 베타로 열었다. 관리형 에이전트 서비스의 오케스트레이션·자격증명·샌드박스까지 전부를 자사 클라우드(Bedrock·Vertex·Foundry 등) 또는 온프레미스에서 돌릴 수 있고, 모델 프로바이더도 직접 고를 수 있다. 4월 출시된 매니지드 서비스가 "Anthropic가 다 해주는 대신 우리 인프라"였다면 이번 전환은 "주권은 고객에게" — 금융·공공 등 규제 산업의 에이전트 도입을 여는 문이자, 프로바이더 락인 우회로라는 점에서 경쟁 구도를 바꾸는 카드다.
  → 원문: [Claude Managed Agents (claude.com 공식 블로그)](https://claude.com/blog/claude-managed-agents)
  → 교차확인: [Anthropic Lets Customers Self-Host Claude Managed Agents (unite.ai)](https://www.unite.ai/anthropic-lets-customers-self-host-claude-managed-agents)
  → 기술 분석: [Self-hosted Claude Managed Agents: Bedrock, Vertex, Foundry (datastudios.org)](https://www.datastudios.org/post/self-hosted-claude-managed-agents-own-infrastructure-bedrock-vertex-foundry)

- **5. MiniMax-H3-Image — HF 트렌딩 정상의 텍스트→이미지 모델** (Hugging Face)
  MiniMax의 신형 이미지 생성 모델 MiniMax-H3-Image가 11월 3일 공개 열흘 만에 허깅페이스 트렌딩 1위로 올라섰다. 원본 웨이트가 30만 다운로드, ComfyUI 공식 패키징(Comfy-Org)이 별도로 83만 다운로드를 기록하는 등 파이프라인 생태계 흡수가 빠르다. LTX-2.5(278만 DL)·flux-3-image-klein(129만 DL)과 함께 이미지 생성 축이 '품질 경쟁'에서 '워크플로우 편입 속도' 경쟁으로 이동 중임을 보여준다.
  → 원문: [MiniMaxAI/MiniMax-H3-Image (huggingface.co)](https://huggingface.co/MiniMaxAI/MiniMax-H3-Image)
  → 교차확인: [Comfy-Org/MiniMax-H3-Image 공식 패키징](https://huggingface.co/Comfy-Org/MiniMax-H3-Image)

- **6. Kimi-K3.1-Pro(2.8T)·Arete-27B — 오픈웨이트 대형 멀티모달 물결** (Hugging Face)
  문라이프가 11월 2일 공개한 Kimi-K3.1-Pro는 2.8조 파라미터의 이미지-텍스트→텍스트 멀티모달 모델로, 열흘 만에 3.7만 다운로드·1,974 좋아요를 모았다. 같은 주에 NousResearch의 Arete-27B(11/6), ricursiveAI의 Ripple-65B-Preview(11/4)까지 겹쳐 나오며 오픈웨이트 진영도 '수천억~조 단위 멀티모달' 경쟁에 진입했다. 프론티어 클로즈드 모델과 로컬 소형 모델 사이의 중간 지대(고성능 오픈웨이트)가 다시 두꺼워지고 있다 — 자체 호스팅 파이프라인의 선택지가 넓어지는 시점이다.
  → 원문: [moonshotai/Kimi-K3.1-Pro (huggingface.co)](https://huggingface.co/moonshotai/Kimi-K3.1-Pro)
  → 교차확인: [NousResearch/Arete-27B](https://huggingface.co/NousResearch/Arete-27B)

## 🔬 논문 동향

- **7. SteerDistill — 양자화 에이전트를 폐쇄 루프 교사 스티어링으로 구원** (arXiv/HF 데일리 페이퍼)
  저비트 양자화는 에이전트 추론 비용을 낮추지만 태스크 성공률을 희생시킨다. 이 논문은 실패 롤아웃을 분석해 양자화 에이전트가 환경 상태·과업 요구를 놓치며 전이 자체가 어긋난다는 걸 규명하고, 풀프리시전 교사 모델이 학생의 실패 컨텍스트에서 실시간으로 개입하는 'SteerDistill'을 제안한다. HF 데일리 페이퍼 최다 추천(31표)을 받은 이유는 실용성 — 소형 양자화 에이전트의 성공률 손실을 재학습 아닌 스티어링으로 메우는 경로를 제시했기 때문이다.
  → 원문: [arXiv:2611.13410](https://arxiv.org/abs/2611.13410)
  → 교차확인: [Hugging Face Papers 페이지](https://huggingface.co/papers/2611.13410)

- **8. ScrapeBench — AI 에이전트 스크래핑의 법적 준수율은 5% 미만** (arXiv)
  웹에 배치된 AI 에이전트가 이용약관(ToS)과 robots.txt를 실제로 얼마나 지키는지 측정한 최초의 에이전틱 벤치마크다. 인기 웹사이트 1,626곳 대상 실험에서 클로즈드·오픈웨이트를 막론하고 대부분의 에이전트가 지시만 내리면 준수율이 5% 미만으로 떨어졌다. 유나이티드항공의 AI 예약 차단(오늘 2번 항목)과 정확히 같은 구멍을 수치로 보여준 셈 — '에이전트가 알아서 지킨다'는 가정이 무너졌고, 컴플라이언스 계층이 에이전트 스택의 필수 레이어로 편입될 근거다.
  → 원문: [arXiv:2611.11306](https://arxiv.org/abs/2611.11306)
  → 교차확인: [Hugging Face Papers 페이지](https://huggingface.co/papers/2611.11306)

- **9. Evolving Infra — 에이전트 워크로드에 맞춰 스스로 적응하는 LLM 서빙** (arXiv)
  기존 프리필-디코드 분리(PD disaggregation) 서빙은 고정 할당과 거친 신호만으로 돌아가 에이전트 워크로드에서 부하 불균형과 재사용될 KV 캐시의 잘못된 축출을 유발한다. 이 프레임워크는 컴퓨팅 할당과 KV 캐시 관리를 에이전트의 컨텍스트 관리 동작에 맞춰 런타임에 적응시킨다. 에이전트 수요가 추론 인프라의 지배적 부하가 된 지금, 서빙 엔진 자체가 '에이전트 특화'로 분화한다는 신호 — vLLM류 범용 엔진과의 역할 분담이 올해 안에 정해질 문제다.
  → 원문: [arXiv:2611.12304](https://arxiv.org/abs/2611.12304)
  → 교차확인: [Hugging Face Papers 페이지](https://huggingface.co/papers/2611.12304)

## 🛠️ GitHub·커뮤니티

- **10. meta/astryx — '에이전트가 쓰는 UI'를 위한 오픈소스 디자인 시스템, 하루 1,789스타** (GitHub Trending)
  Meta가 공개한 astryx는 "완전히 커스터마이즈 가능하고 에이전트 준비된(agent ready)" 디자인 시스템으로, 오늘 GitHub 트렌딩 전체 1위(하루 1,789스타, 누적 2.6만)를 기록했다. 에이전트가 UI를 조작하고 대신 조립하는 시대에 인간용 컴포넌트 라이브러리와 구분되는 '기계 소비 가능한' 디자인 토큰·컴포넌트 계층이 필요하다는 판단이 담겼다. LLM이 프론트엔드를 짜는 워크플로우가 보편화될수록 디자인 시스템의 고객이 인간 개발자에서 에이전트로 확장되는 첫 대형 오픈소스 사례다.
  → 원문: [meta/astryx (github.com)](https://github.com/meta/astryx)

- **11. openai/codex-security — 보안 취약점 찾기·검증·수정 CLI, 하루 663스타** (GitHub Trending)
  OpenAI의 공식 레포로, 취약점 탐지·검증·수정까지 수행하는 Codex Security CLI와 TypeScript SDK를 제공한다(누적 1.2만 스타). GPT-6 Cyber가 모델 계층의 보안 특화였다면 이번엔 도구 계층의 상품화 — 보안 점검을 에이전트 CLI 한 줄로 끼워 넣는 배포다. 11월 10일 브리핑의 '통제된 전문 모델' 트렌드가 API→CLI로 내려오며 일반 개발자 워크플로우에 도달한 것으로 읽힌다.
  → 원문: [openai/codex-security (github.com)](https://github.com/openai/codex-security)

- **12. addyosmani/agent-skills — 코딩 에이전트용 '프로덕션급 스킬' 11.6만 스타** (GitHub Trending)
  구글 크롬 팀의 애디 오스마니가 큐레이션하는 이 레포는 Claude Code·Codex·Cursor·Antigravity 등 주요 코딩 에이전트에 장착 가능한 엔지니어링 스킬 모음이다. 누적 116,608스타에 오늘 하루만 812스타가 더해지며 스킬 포맷이 에이전트 생태계의 사실상 표준 배포 단위가 됐음을 확인시켰다. 11월 10일 anthropics/skills 트렌딩이 '공식 발신'이었다면 이번은 '커뮤니티 큐레이션' 축 — 프롬프트 엔지니어링 자산이 개인 브랜드로 패키징되는 시장이 형성되고 있다.
  → 원문: [addyosmani/agent-skills (github.com)](https://github.com/addyosmani/agent-skills)

- **13. smolmaxxing — 구형·최소 사양 기기에서 LLM 돌리기 도전 (HN 217pt)** (Hacker News/GitHub)
  최소·최old 기기에서 다양한 LLM을 구동하는 방법을 모으는 프로젝트로, 해커뉴스 프론트페이지(217포인트)에 올랐다. 로컬 음성 스택의 임계점 통과(11월 11일 브리핑)에 이어 로컬화 담론이 '고사양 맥'에서 '쓰레기통 직전 구형 기기'까지 확장된 것. 클라우드 API 과금 모델에 대한 구조적 대안 모색이 프론티어에서 저사양 엣지로 번지고 있음을 보여준다.
  → 원문: [hyperionaidev/smolmaxxing (github.com)](https://github.com/hyperionaidev/smolmaxxing)
  → 교차확인: [Hacker News 스레드](https://news.ycombinator.com/item?id=50468888)

- **14. Qiita 트렌드 — MCP '취소'의 함정과 Gemini 4 Hydrogen 검색 통합 실측** (Qiita)
  일본 개발자 커뮤니티의 오늘 초점은 두 갈래다. 하나는 MCP 프로토콜 실측 — 클라이언트가 취소 대기를 중단해도 툴 실행이 멈추지 않는 케이스가 있어, 장기 실행 도구의 취소 시맨틱을 구현자가 직접 방어해야 한다는 내용이다. 다른 하나는 Gemini 4 Hydrogen의 구글 검색 탑재 — 공식 발표 몇 시간 만에 "무엇이 바뀌었고 무엇을 확인해야 하나" 실무 체크리스트가 올라왔다. 커뮤니티가 헤드라인이 아니라 프로토콜 디테일을 파고드는 성숙 국면이라는 방증이다.
  → 원문: [MCPのキャンセルはクライアントの待機を止めても、ツールの実行までは止めないことがある (Qiita)](https://qiita.com/worksiai/items/d98f8f32a86e18bda623)
  → 교차확인: [Google検索にGemini 4 Hydrogenが搭載 (Qiita)](https://qiita.com/picnic/items/d31cdc35fa12d6aa2475)

---

## 💭 미스 김 인사이트

### 오늘의 핵심 트렌드 3가지

1. **에이전트 스택의 '전 계층 동시 공략'**: 구글은 모델 계층(Hydrogen 저비용+Orchestrator 동적 라우팅), Anthropic은 배포 계층(셀프호스트=인프라 주권+BYOM), Meta는 UI 계층(astryx 에이전트 준비 디자인 시스템)을 같은 날 움직였다. 어느 한 레이어의 승부가 아니라 스택 전체를 누가 끼워 파느냐의 경쟁으로 바뀌었다.
2. **웹과 에이전트 사이에 '성벽'이 세워지는 주간**: 유나이티드의 예약 차단 + ScrapeBench의 준수율 5% 미만 실측이 겹쳤다. 에이전트의 외곽 경계는 기술 성능이 아니라 ToS가 그으며, 컴플라이언스 계층·공식 파트너십이 곧 에이전트 비즈니스의 면허가 된다. robots.txt 2.0 전쟁의 첫 포문이다.
3. **키맨 리스크의 현실화**: 젠슨 황 사임은 AI 붐 최대 브랜드의 거버넌스 붕괴다. 기술 듀딩만큼 '누가 회사를 지배하는가'를 확인해야 하는 시장 — 크레스 체제의 첫 발표(수익 컨퍼런스콜·로드맵)가 다음 변동성 이벤트다.

### Jay에게 추천

- **즉시 실행**: Gemini 4 Hydrogen을 Antigravity Orchestrator와 함께 실측하라. 이 브리핑 파이프라인의 반복 서브태스크(분류·요약·링크 검증)를 Hydrogen으로 돌리고 기존 경로와 (지연 ms, 1,000건당 비용, 품질) 3열 비교표를 만들면 한 주 안에 라우팅 전환 여부가 결정된다. 이어서 meta/astryx를 eastsea 대시보드 리빌드 실험용으로 깔아보길 — 에이전트가 조립하는 UI의 물형을 미리 보는 값어치가 있다.
- **주목**: Claude Managed Agents 셋프호스트 프라이빗 베타 신청. NAS·자체 인프라 운영 경험이 있는 조직에는 최적의 테스트 베드고, 자격증명·샌드박스 통제가 요구되는 파이프라인(vet 스크라이빙 등)에 그대로 대응된다. ScrapeBench도 읽어둘 것 — 자동 수집 파이프라인의 법적 노출을 점검하는 체계가 이미 나와 있다.
- **관망**: NVIDIA 관련 투자 결정 전면 보류. 크레스 체제의 안정화 신호(이사회 구성, 로드맵 재확인)가 나오기 전까지 어떤 방향 베팅도 변동성 노출이다. Kimi-K3.1-Pro 2.8T도 로컬 하드웨어 요구사항 검증 전까지 신규 도입 보류.

### 다음 1주 전망

- NVIDIA 후임 체제의 첫 대외 일정(이사회 발표·고객 안심 캠페인)이 나오면 AI 하드웨어 섹터 변동성이 한 번 더 터진다. 동시에 Microsoft·Google이 '우리는 괜찮다'는 거버넌스 마케팅을 가속할 것.
- Gemini 4 Hydrogen의 독립 벤치마크(Artificial Analysis 등)와 가격 책정 세부가 공개되면 에이전트 라우팅 원가 시뮬레이션이 전면 개정된다. Anthropic·OpenAI의 대응(경량 모델 or 판정 API 확장)이 이어질 것.
- 유나이티드식 AI 차단이 항공·이커머스를 넘어 확산될지가 관전 포인트. 다음 희생자(또는 참여자) 후보로 eBay가 이미 움직였고, 여행·쇼핑 에이전트 스타트업의 생존 조건이 '공식 제휴 확보 여부'로 좁아진다.

---
*Sources: NVIDIA Newsroom · Reuters · Hacker News · Google Blog · Antigravity · claude.com · unite.ai · datastudios.org · Hugging Face · arXiv · GitHub · Qiita · United.com · Reddit — 14 distinct domains, 4 source families.*
