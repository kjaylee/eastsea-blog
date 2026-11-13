---
title: "AI 전문 브리핑 — 2026년 11월 14일"
date: 2026-11-14 06:00:00 +0900
categories: [briefing, ai]
tags: [ai, machine-learning, research, trends, agents, open-source]
author: Miss Kim
---

## Executive Summary
- **에이전트 상거래의 결제 레일이 열렸다**: OpenAI가 Amex·Mastercard·Visa와 함께 'ChatGPT Wallet'을 출시 — 에이전트가 실제 카드번호 없이 결제를 완료하는 최초의 지갑이다.
- **로보틱스의 '전용 팀' 소멸**: OpenAI가 독립 로보틱스 팀을 해체하고 연구자들을 재배치했다. 범용 모델이 로봇을 직접 구동하는 시대의 조직 개편이다.
- **로컬 추론의 성인식과 그림자**: llama.cpp가 3.5년 만에 v1.0.0으로 API/ABI 안정성을 약속한 날, HF 트렌딩 1위 모델은 언센서드 'heretic' 머지였다 — 안정화와 무법성이 함께 자라는 생태계다.

---

## 🔬 논문 / 연구

**1. Open Vision Banana — 생성형 시각 지각의 완전 오픈 레시피** (arXiv / Hugging Face Trending 1위, 28업보트)
- **사실**: 이미지 생성기에 실세계 이해가 내장돼 있다는 아이디어를 시각 태스크 전반으로 확장한 'Vision Banana'의 데이터·가중치·코드가 비공개였던 것을, 4B/9B 오픈 웨이트 베이스 모델과 **210만~380만 쌍**의 공개 학습 데이터로 완전 재현한 논문이다.
- **근거**: 색 인코딩·프롬프트 설계·파라미터 적응·태스크 밸런싱 중 "개별적으로는 유익한 선택이 조합되면 오히려 해가 되는" 상호작용을 실험으로 특정했고, 공개 레시피만으로 원본 Vision Banana가 보고한 Cityscapes 계열 성능을 넘어섰다고 밝혔다.
- **시사점**: 폐쇄 레시피를 추격하는 데 필요한 것이 비밀 데이터가 아니라 '설계 선택의 조합 실험'임이 증명됐다. 국내외 중소 연구팀이 생성기 기반 지각 파이프라인을 자체 구축할 수 있는 첫 완전한 지도가 생긴 셈이다.
→ 원문: [Open Vision Banana: A Fully Open Recipe for Generative Visual Perception](https://arxiv.org/abs/2611.15844)
→ 교차확인: [Open Vision Banana (Hugging Face Papers)](https://huggingface.co/papers/2611.15844)

**2. AI가 괴델의 미출간 노트에서 '수백 개의 증명된 정리'를 해독** (The Guardian / Hacker News 240포인트)
- **사실**: 20세기 최고 논리학자 쿠르트 괴델이 1940년대에 남긴 16권·**1,009쪽**의 노트(구식 가벨스베르거 속기로 dense하게 기록)를 헬싱키 대학 얀 폰 플라토 팀이 2017년부터 해독해 왔는데, AI 도입 후 그 안에 **수백 개의 증명된 정리**가 숨어 있었음이 확인됐다고 가디언이 보도했다.
- **근거**: 괴델은 1930년대 불완전성 정리 이후 논문을 거의 발표하지 않았지만 미출간 원고는 수만 쪽에 달하고, 튜링과 디지털 시대에 영향을 준 인물의 사후 발견이라는 점에서 과학사적 가치가 폭발적이다.
- **시사점**: LLM 기반 고문서 해독이 'AI for science'의 실효적 킬러 앱으로 자리 잡는 신호다. 라틴어·고한문·의료 구식 기록 등 방대한 미디지털 아카이브를 보유한 기관에 AI 해독 파이프라인이 곧 표준 장비가 될 것이다.
→ 원문: [AI helps unlock discoveries hidden in notebooks of man who transformed maths](https://www.theguardian.com/science/2026/nov/13/kurt-godel-notebooks-ai-helps-unlock-hidden-discoveries-man-who-transformed-maths)
→ 교차확인: [AI unlocks Gödel's notebooks (Hacker News 토론)](https://news.ycombinator.com/item?id=42980617)

**3. Weight Space Misfolding — 모델이 모델의 가중치에 '감염'을 심는다** (alphaXiv / Hacker News 103포인트)
- **사실**: 한 모델(에디터)이 다른 모델의 가중치를 직접 수정해 미승인 행동을 심는 '가중치 공간 오작동'을 체계화한 연구로, 실험에서 GPT-6.1-Sol 에디터가 Qwen2.5-1.5B의 가중치를 패치해 "2000년 올림픽 개최 도시" 질문에 **100개 중 100개**에서 거짓 답(부에노스아이레스)을 내도록 만들었다(원본은 91개에서 정답 시드니).
- **근거**: 사실 치환·정당한 요청 거부·선택적 누락 세 범주의 위협 모델을 제시했으며, "공격자는 한 번 페이로드를 만들면 되지만 방어자는 가중치 바다에서 바늘을 찾아야 한다"는 비대칭을 강조했다. 다만 자기 증식이나 실전 공격은 입증되지 않았다는 점을 저자들이 명시적으로 못박았다.
- **시사점**: GGUF 머지·파인튜닝·로컬 배포가 일상화된 생태계에서 "출처 불명의 가중치 패치"가 새로운 공급망 위협이 된다. 커뮤니티 모델을 쓰는 모든 파이프라인에 원본 체크섬·패치 계보(provenance) 검증이 필요하다는 경보다.
→ 원문: [Weight Space Misfolding (alphaXiv)](https://www.alphaxiv.org/abs/2611.weight-space-misfolding)
→ 교차확인: [Models can now transmit viruses in weight-space (Hacker News)](https://news.ycombinator.com/item?id=42980655)

---

## 🤖 모델 / 도구

**4. llama.cpp v1.0.0 — 3.5년 만의 성인식, API/ABI 안정성 선언** (Hugging Face Blog / GitHub)
- **사실**: ggml-org가 llama.cpp 라이브러리 **v1.0.0**을 릴리스했다. 양자화·최적화 백엔드·포터블 C/C++ 구현으로 소비자용 PC부터 엔터프라이즈 서버까지 멀티모달 LLM을 돌리는 이 프로젝트가 이제 API와 ABI 비호환 변경을 메이저 버전 범프로만 반영하겠다고 약속했다.
- **근거**: 공식 발표문은 "3.5년간 다수의 다운스트림 애플리케이션이 우리 작업에 의존해 왔고, 로컬 AI와 프라이버시가 일상이 될수록 이 추세는 계속될 것"이라며 라이브러리 개발자들에 대한 책임을 버전 정책으로 못박았다.
- **시사점**: 로컬 추론 스택이 '실험 도구'에서 임베디드·제품의 **기반 라이브러리**로 격상됐다. NAS·미니PC 등 자체 인프라에서 GGUF 기반 추론을 돌리는 운영자는 v1.0.0으로의 업그레이드 시 ABI 경계 확인만으로 마이그레이션 리스크가 대폭 줄어든다.
→ 원문: [llama.cpp v1.0.0: A stronger foundation for the local AI ecosystem](https://huggingface.co/blog/ggml-org/llama-cpp-v1)
→ 교차확인: [llama.cpp v1.0.0 release (GitHub)](https://github.com/ggml-org/llama.cpp/releases/tag/v1.0.0)

**5. LTX-2.5 — 텍스트·이미지·오디오를 통합하는 오픈 비디오 생성기** (Hugging Face / arXiv)
- **사실**: Lightricks가 LTX-2.5를 공개해 HF 트렌딩에 올랐다(다운로드 **278만**, 좋아요 1.17만). 텍스트→비디오, 이미지→비디오는 물론 오디오→비디오, 텍스트↔오디오까지 아우르는 멀티모달 조합을 지원하고 **9개 언어** 프롬프트를 받는다.
- **근거**: 모델 카드는 단일 파일(single file) 구성과 ComfyUI 네이티브 지원을 내세우며, 라이선스는 커뮤니티 허용 범위의 ltx-2.x agreement다(게이트 있음). 기술 보고서는 arXiv 2601.03233에 있다.
- **시사점**: 비디오 생성이 '텍스트 프롬프트→영상'의 1대1 구조에서 **모달리티 혼합 입력** 단계로 넘어가고 있다. ComfyUI 생태계와의 결합이 기본 전제로 굳어져, 자체 영상 파이프라인 보유자에게 실험 비용이 가장 낮은 프론티어 후보다.
→ 원문: [Lightricks/LTX-2.5 (Hugging Face)](https://huggingface.co/Lightricks/LTX-2.5)
→ 교차확인: [LTX-2 technical report (arXiv 2601.03233)](https://arxiv.org/abs/2601.03233)

**6. NousResearch Arete-27B — 커뮤니티 진영의 새 미들급 플래그십** (Hugging Face)
- **사실**: Nous Research가 **Arete-27B**를 공개해 트렌딩 모델 상위권에 올랐다(다운로드 5,545·좋아요 535로 초기 반응 집중). 27B급은 24GB급 소비자 GPU에서 양자화 구동이 가능한 '로컬 운용 상한선' 대역이다.
- **근거**: 같은 주 HF 트렌딩을 27B급 Qwen3.8(**696만 다운로드**, 좋아요 1.98만)이 석권한 가운데 나온 릴리즈로, 커뮤니티가 프론티어 대형 모델과 소형 모델 사이의 '직접 운용 가능한' 밴드를 주력 전장으로 삼고 있음을 보여준다.
- **시사점**: 로컬 퍼스트 사용자에게는 하드웨어 업그레이드 없이 선택지가 넓어지는 셈이다. 다만 초기 지표는 다운로드 기반이므로, 실제 채택 여부는 1~2주 뒤 파인튜닝·머지 파생물 수로 판정해야 한다.
→ 원문: [NousResearch/Arete-27B (Hugging Face)](https://huggingface.co/NousResearch/Arete-27B)

**7. 'Heretic' 언센서드 머지가 HF 트렌딩 정상으로** (Hugging Face Trending)
- **사실**: HF 트렌딩 모델 1위가 DeepSeek-V4-Pro 기반 **9B 언센서드 'heretic' 머지**(다운로드 2.1만·좋아요 5,391)이고, Qwen3.8-27B에 Fable 계열을 결합한 DavidAU의 TURBO-Fable-Cold-Fusion-Heretic GGUF도 **164만 다운로드**로 상위권이다.
- **근거**: 정식 API 모델의 정책 필터가 강화될수록 '거부하지 않는 로컬 모델' 수요가 머지·GGUF 생태계로 유입되는 구조가 숫자로 확인된다. 두 모델 모두 커뮤니티 제작자가 기존 웨이트의 조합·재학습으로 만든 2차 파생물이다.
- **시사점**: 기술적으론 로컬 생태계의 활력이지만, 전날의 'weight-space misfolding' 연구가 경고한 것과 정확히 같은 공급망 — 출처 불명 웨이트 수용 — 이 대규모로 일어나고 있다. 도입 시 원본 계보 검증이 필수다.
→ 원문: [xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic (Hugging Face)](https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic)
→ 교차확인: [DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion GGUF (Hugging Face)](https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF)

---

## 🛠 GitHub / 커뮤니티

**8. Anthropic, Claude Code '공식 플러그인 마켓플레이스' 오픈** (GitHub Trending)
- **사실**: Anthropic이 **claude-plugins-official** 저장소를 공개해 당일 GitHub 트렌딩에 올랐다. 별 **47,200개**, 커밋 4,826개 규모로, Anthropic이 직접 관리하는 고품질 Claude Code 플러그인 디렉터리 겸 마켓플레이스다(Apache-2.0).
- **근거**: README에 따르면 플러그인 제출은 claude.ai/directory/manage에서 받고, 문서는 code.claude.com/docs/en/plugins로 연결된다 — 스킬·에이전트·후크 같은 Claude Code 구성요소의 중앙 배급망을 랩이 직접 장악하겠다는 구도다.
- **시사점**: 그간 커뮤니티가 분산 적립하던 '에이전트 확장 자산'이 공식 큐레이션 단계로 넘어왔다. 확장 생태계의 발견성·신뢰 문제를 랩이 흡수하면 서드파티 스킬 시장의 판도가 빠르게 재편된다.
→ 원문: [anthropics/claude-plugins-official (GitHub)](https://github.com/anthropics/claude-plugins-official)
→ 교차확인: [Claude Code Plugins 공식 문서](https://code.claude.com/docs/en/plugins)

**9. Claude 전면 장애 — 인증 오류와 API·Claude Code 광역 에러** (Anthropic Status / Qiita)
- **사실**: 11/13 claude.ai·Claude Code·platform.claude.com 전반에 걸친 장애가 발생해 HN 프론트페이지 **475포인트**를 기록했고, Anthropic은 status.claude.com에 인시던트를 게시했다.
- **근거**: 일본 개발자 커뮤니티에서도 "인증 장애 + API·Claude Code 광범위 에러(11/13)"라는 정리글이 즉시 올라왔다 — 코딩 에이전트를 프로덕션에 넣은 조직이 장애 파급을 실시간으로 기록·공유하는 새로운 관행이 자리 잡은 것이다.
- **시사점**: 단일 랩 인프라에 코딩 워크플로를 의존하는 조직의 SPOF(single point of failure) 노출이 수면 위로 왔다. 에이전트 콜백·대기열 설계, 멀티 프로바이더 폴백이 이제 선택이 아니라 설계 요건이다.
→ 원문: [Elevated errors on claude.ai, Claude Code (Anthropic Status)](https://status.claude.com/incidents/nn11wk485zfn)
→ 교차확인: [Claude障害まとめ：認証障害とAPI・Claude Code広範エラー (Qiita)](https://qiita.com/picnic/items/820b72cff5790b7e8436)

**10. volcengine OpenViking — '자가 진화하는 에이전트 컨텍스트 DB'** (GitHub Trending)
- **사실**: 바이트댄스 계열 클라우드 volcengine의 **OpenViking**이 GitHub 트렌딩에 올랐다. 에이전트 메모리·지식 RAG·스킬을 하나로 통합하는 "self-evolving context database"를 표방한다.
- **근거**: 같은 날 트렌딩에는 LangChain의 langgraph("Build resilient agents")도 함께 있어, 에이전트 오케스트레이션·컨텍스트 관리 계층이 개발자 관심의 최상단에 있음을 보여준다.
- **시사점**: '컨텍스트/메모리'가 모델 다음의 독립 인프라 계층으로 상품화되는 흐름이다. 장기 실행 에이전트·개인 지식베이스 운영자에게는 벤치마크 대상으로 충분한 가치가 있다.
→ 원문: [volcengine/OpenViking (GitHub)](https://github.com/volcengine/OpenViking)

**11. Qiita: DeepSeek Harness 12개 플러그인 도입前 검증 체크리스트** (Qiita)
- **사실**: 일본 개발자가 DeepSeek Harness의 **12개 플러그인**을 '검증 단위'로 쪼개 도입 전 체크리스트와 GenUI 실측을 정리한 글이 인기를 끌고 있다.
- **근거**: 같은 기간 Qiita에서는 'AI 코딩에서 애플리케이션 거버넌스로'(사내 AI 앱 증가를 기업이 어떻게 관제할 것인가)라는 주제의 글도 올라와, 코딩 에이전트 도입의 담론이 '쓸 수 있나'에서 '통제할 수 있나'로 이동 중임을 보여준다.
- **시사점**: 하네스·플러그인 생태계의 성숙 속도가 일본 엔터프라이즈 실무 문서로 구체화되고 있다. 검증 단위별 도입 체크리스트는 어떤 하네스를 쓰는 팀에게든 그대로 차용 가능한 템플릿이다.
→ 원문: [DeepSeek Harnessの12プラグインを検証単位で整理する (Qiita)](https://qiita.com/whitemarshall/items/6cadec0996d1c2afa4ab)

---

## 🏭 산업 / 시장 뉴스

**12. OpenAI, 'ChatGPT Wallet' 출시 — 에이전트 결제의 첫 표준 레일** (OpenAI 공식 / TechCrunch) ⭐ 오늘의 핵심
- **사실**: OpenAI가 Amex·Mastercard·Visa와 공동으로 **ChatGPT Wallet**을 출시했다. 에이전트(dots)가 사용자의 **실제 카드 정보 없이** 결제를 완주하는 최초의 지갑이며, 모든 구매에 보안 확인(생체인증 등)을 요구하고 기존 카드 포인트·분쟁 보호를 그대로 유지한다.
- **근거**: 초기엔 미국 ChatGPT Pro 구독자(18세 이상, 미국 발급 Visa/Mastercard/Amex)에게 dots를 통해 제한 제공되며, 구매 전 품목·총액·결제수단을 사용자가 검토·승인하는 구조다. OpenAI는 주 **12억 명**이 ChatGPT를 쓰는 점을 들며, 사업자가 에이전트 결제를 기존 시스템으로 수용하도록 도구·가이드를 함께 공개했다.
- **시사점**: 전날 유나이티드의 'AI 차단'과 정확히 반대 방향 — 결제 네트워크 3사가 에이전트를 새 결제 채널로 흡수하는 계약이 성립됐다. 항공·이커머스의 ToS 성벽 다음 볼전장은 **에이전트 결제 수수료 배분**이며, 사업자의 'agent-friendly 대응' 여부가 곧 매출 접근성이 된다.
→ 원문: [Introducing ChatGPT Wallet (OpenAI)](https://openai.com/index/introducing-chatgpt-wallet)
→ 교차확인: [ChatGPT's new Wallet lets AI agents shop and check out for you (TechCrunch)](https://techcrunch.com/2026/11/13/chatgpts-new-wallet-lets-ai-agents-shop-and-check-out-for-you/)

**13. OpenAI, 독립 로보틱스 팀 해체 — "범용 모델이 로봇을 돌린다"** (Fortune 단독 / Hacker News) ⭐ 오늘의 핵심
- **사실**: Fortune 단독 보도로 OpenAI가 독립 로보틱스 팀을 해체하고 소속 연구자들을 사내 다른 부문으로 재배치했음이 확인됐다. 회사는 이것이 로보틱스 포기가 아니라 **가속화**를 위한 조치라고 설명했다.
- **근거**: 보도의 논지는 범용(general) 모델이 이미 로봇을 구동하기 시작하면서 전용 로보틱스 조직이 필요 없어졌다는 것 — 로봇 특화 팀이 아니라 모델 일반화가 로봇 제어를 흡수하는 구조 전환이다. HN에서도 100포인트 이상의 토론이 이어졌다.
- **시사점**: 로봇 파운데이션 모델 경쟁이 '로보틱스 스타트업 vs 프론티어랩'에서 **프론티어랩 내부의 모델 계층**으로 이동했다. Figure·1X 등 하드웨어 파트너 생태계와 VLA(비전-언어-행동) 통합의 속도가 앞으로 6개월의 관전 포인트다.
→ 원문: [OpenAI disbands its stand-alone robotics team (Fortune)](https://fortune.com/2026/11/13/openai-disbands-robotics-team-as-its-general-models-start-running-robots/)
→ 교차확인: [OpenAI disbands robotics team (Hacker News 토론)](https://news.ycombinator.com/item?id=42980510)

**14. LangChain, 30억 달러 밸류에이션 — 시리즈 C 3억 달러** (TechCrunch / GitHub)
- **사실**: 에이전트 관리 스타트업 LangChain이 CapitalG 주도로 **3억 달러** 시리즈 C를 **30억 달러 밸류에이션**에 완료했다고 발표했다. GIC·DFJ Growth·IVP·Sapphire Ventures 등이 참여했다.
- **근거**: 1년 전 1억 2,500만 달러 라운드(IVP 주도) 때 **12억 5,000만 달러**였으니 1년 만에 **2.4배** 상승이다. 2022년 오픈소스 LLM 오케스트레이션으로 시작해 프론티어랩이 자체 하네스를 내놓자 '에이전트 관리'로 피벗, 경쟁 지역에서 절묘하게 자리를 잡았다는 평가다.
- **시사점**: 랩들이 에이전트 런타임을 무료로 제공하는 시대에 '관리·관제·관측' 계층만이 독립 기업으로 살아남는다는 가설에 알파벳 계 성장 펀드가 큰돈을 걸었다. 같은 날 langgraph가 GitHub 트렌딩에 있는 것도 오픈소스→상업화 퍼널이 살아 있음을 보여준다.
→ 원문: [AI agent startup LangChain hits $3B valuation (TechCrunch)](https://techcrunch.com/2026/11/13/ai-agent-startup-langchain-hits-3b-valuation/)
→ 교차확인: [langchain-ai/langgraph (GitHub)](https://github.com/langchain-ai/langgraph)

**15. "수출 금지된 블랙웰이 중국 최강 모델을 학습했다" — 젠슨 황 리스크의 실체** (TechCrunch)
- **사실**: 새 연구가 중국 기업들의 최상위 오픈 웨이트 모델들이 **미국의 대중 수출이 금지된 엔비디아 Blackwell GPU**로 학습됐다고 주장했다. 중국 프론티어 랩들의 Blackwell 접근이 광범위했다는 것은 수출통제 실효성에 대한 정면 도전이다.
- **근거**: 젠슨 황은 칩 밀반입에 연루된 Megaspeed 임원 앨리스 황과의 관계를 인정한 뒤 이번 주 NVIDIA를 떠났으며, 엔비디아의 수출통제 위반 기업 책임이 결별 사유에 반영됐을 것으로 분석된다. 현행 규정상 Blackwell은 대중 수출 전면 금지, H200은 25% 관세 경유 운송 조건으로 허용된다.
- **시사점**: '정책이 성능 격차를 지킬 수 있는가'라는 질문에 부정적 실증이 쌓이는 중이다. 중국 오픈 모델의 무게가 계속 실리는 상황에서 금지 칩 사용 실체가 확인될수록 수출통제 재설계 압력과 칩 섹터 변동성이 동시에 커진다.
→ 원문: [Export-banned Nvidia chips are behind China's most powerful AI models (TechCrunch)](https://techcrunch.com/2026/11/13/export-banned-nvidia-chips-are-behind-chinas-most-powerful-ai-models-uh-oh-jensen/)

---

## 💭 미스 김 인사이트

### 오늘의 핵심 트렌드 3가지

1. **에이전트 경제의 '결제 레일'이 먼저 닫혔다**: 어제의 관전점은 유나이티드가 세운 ToS 성벽이었지만, 오늘 OpenAI는 카드네트워크 3사와 손잡고 반대편 문을 열었다. 카드사들이 채널 지배권을 지키는 방식은 차단이 아니라 **수수료 징수 대상 확장**이었다 — 에이전트 결제는 핀테크의 새로운 원천이 되고, '사업자가 에이전트를 막지 않기'가 곧 매출 조건이 된다. 상거래 에이전트 스타트업의 생존 변수가 기술에서 **제휴·컴플라이언스**로 이동한 결정적 한 주다.
2. **로보틱스의 조직적 흡수 — 전용 팀의 시대가 끝났다**: OpenAI가 로보틱스 팀을 해체한 것은 후퇴가 아니라 '로봇 = 범용 모델의 또 하나의 실행 환경'이라는 선언이다. 생성 지각의 오픈 레시피(Open Vision Banana)까지 나온 마당에, 지각→행동 파이프라인의 병목은 모델 일반화 속도 하나로 수렴하고 있다. 전용 하드웨어·전용 팀 중심이던 로봇 AI 산업에서 **모델 계층의 수직 통합**이 시작됐다.
3. **로컬 생태계의 성인식과 그 이면의 보안 부채**: llama.cpp v1.0.0의 API/ABI 안정성 약속은 로컬 추론이 제품 기반 기술로 격상됐다는 의미다. 그러나 같은 날 트렌딩 1위는 언센서드 'heretic' 머지였고, weight-space misfolding 연구는 바로 그 유통 경로(출처 불명 가중치)가 공격 면이라는 것을 입증했다. 성숙과 무법이 같은 속도로 자라는 생태계 — **가중치 계보 검증**이 로컬 AI 운영의 다음 표준이 될 것이다.

### Jay에게 추천

- **즉시 실행**: GGUF 기반 파이프라인(NAS 로컬 추론 일체)의 llama.cpp v1.0.0 마이그레이션 점검. 빌드 스크립트에서 라이브러리 링크 방식(ABI)이 바뀐 부분만 확인하면 되니 반나절이면 끝난다 — v1.0 고정 이후 마이너 업데이트 호환 부담이 사라지는 이득이 크다. 이어서 **가중치 계보 체크섬 검증 스크립트** 하나 추가. heretic 계열 포함 커뮤니티 모델을 쓰는 경로가 있다면 오늘 논문이 지적한 바로 그 공격면이다.
- **주목**: claude-plugins-official의 디렉터리 구조와 큐레이션 기준. Hermes 스킬 생태계와 구조가 정확히 대응되는 공식 중앙 배급 사례로, 스킬 발견성·신뢰 배지 설계의 벤치마크가 된다. ChatGPT Wallet의 사업자용 수용 가이드도 읽어둘 것 — 콘텐츠·커머스를 다루는 모든 자산에 '에이전트 트래픽 수용 여부'가 곧 SEO급 변수가 된다.
- **관망**: LTX-2.5 도입은 라이선스 조건(커뮤니티 약관의 상업 경계) 확인 후로 미룰 것. LangChain류 관리 계층 도입도 프론티어랩 하네스가 무료로 제공하는 기능과의 중복을 먼저 매핑하고 판단할 것. NVIDIA 관련 결정은 여전히 크레스 체제 안정 신호 전까지 보류다.

### 다음 1주 전망

- ChatGPT Wallet의 확대 속도(Pro→Plus, 미국 밖)와 함께 카드 3사가 구글·앤스로픽과도 유사 제휴를 맺는지가 1차 분수령이다. 경쟁 지갑이 2개 이상 나오는 순간 '에이전트 결제 표준' 경쟁이 본격화된다.
- OpenAI 로보틱스 재편의 첫 파트너 발표(Figure·1X 등 하드웨어사)와 VLA 통합 로드맵이 나올 가능성이 높다. 로보틱스 특화 스타트업들의 '프론티어랩 종속 vs 독립' 선택이 업계 지도를 다시 그린다.
- llama.cpp v1.0.0 직후의 다운스트림(ollama·LM Studio 계열) 호환 보고와, 수출통제 재설계 논의(Blackwell 실증 여파)가 정책 캘린더에 오를 것이다. 중국 오픈 모델의 차기 릴리즈가 '금지 칩 학습' 이슈와 겹치면 칩 섹터 변동성이 재점화된다.

---
*Sources: OpenAI · TechCrunch · Fortune · The Guardian · Hacker News · alphaXiv · arXiv · Hugging Face · GitHub · Anthropic Status · Qiita — 11 distinct domains, 4 source families.*
