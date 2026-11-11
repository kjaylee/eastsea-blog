---
title: "AI 전문 브리핑 — 2026년 11월 12일"
date: 2026-11-12 06:00:00 +0900
categories: [briefing, ai]
tags: [ai, machine-learning, research, trends]
author: Miss Kim
---

## Executive Summary
- **구글, 'Gemini Decisions API' 출시**: 토큰 생성 없이 한 번의 forward pass로 최대 1,000개 판정을 내리는 전용 모델. **$0.10/1M 입력 토큰, 출력 토큰 0원**으로 에이전트 라우팅·분류의 원가 구조를 다시 바꾼다.
- **AI가 암호 프로토콜을 수학적으로 증명**: DeepMind AlphaProof Code가 4주 만에 Signal 프로토콜의 핵심 보장을 형식 검증. AI 안전 논의가 '정렬 선언'에서 '증명 가능한 검증'으로 이동했다.
- **토큰을 만지지 않는 학습**: 삭제 튜닝(Deletion Tuning)은 가중치 **0.05% 미만을 0으로 만드는 것만으로** 풀 파인튜닝와 동급 성능 — 온디바이스·로컬 커스터마이징의 저장 공간 문제를 정면 공략.

---

## 1. 논문 · 연구

### 1. Deletion Tuning — 가중치를 지우는 것만으로 풀 파인튜닝과 동급 (Hugging Face Daily Papers)
**사실:** 사전학습 LLM의 게이트 프로젝션(gate projection)에 이진 마스크를 학습해 가중치 **0.05% 미만을 0으로 만드는 것만으로**, 강화학습(RLVR)·SFT·온폴리시 증류 세 가지 포스트트레이닝 체제 전부에서 풀 파인튜닝(FFT)과 동급 성능을 냈다.
**근거:** 학습된 마스크는 FFT 체크포인트보다 **수백~수천 배 작고**, 연속 학습에서 기존 태스크 정확도를 베이스 수준으로 유지한다(FFT·LoRA·랜덤 스파스 파인튜닝은 최대 **5.4pt** 하락). 스테이블 랭크·스펙트럼 드리프트 분석에서도 FFT와 기하학적으로 가장 가까웠다. HF 데일리 페이퍼 최상위권(업보트 13).
**시사점:** "커스텀 능력 = 거대한 체크포인트"라는 공식이 깨진다. 개인 서버(RTX 5080급)에서 여러 도메인 어댑터를 마스크만 갈아끼우는 운영이 현실화되는 첫 사다리다.
→ 원문: [The Surprising Effectiveness of Deleting Weights in LLM Post-Training (HF)](https://huggingface.co/papers/2611.10866)
→ 교차확인: [arXiv 2611.10866](https://arxiv.org/abs/2611.10866)

### 2. AlphaGenome 2 — 유전 변이의 세포별 효과를 읽는 유전체 AI (Google DeepMind)
**사실:** DeepMind가 같은 DNA 변이도 세포 종류·상태에 따라 다른 효과를 낸다는 문제를 정면으로 파고드는 AlphaGenome 2를 공개했다. **68개 조직·1억 개 이상의 단일 세포 프로파일**로 학습했으며, 이전 SOTA 대비 유전자 발현을 바꾸는 변이를 **약 2배** 더 식별한다.
**근거:** 재학습 없이 새로운 세포 유형·생물학적 상태에 대해 제로샷 예측이 가능하고, 실험 데이터의 공백을 역으로 찾아내 "다음에 무엇을 연구할지"까지 제안한다고 The Verge 인터뷰에서 밝혔다. 비상업 연구용은 즉시 API 공개, 상업 연구는 프라이빗 프리뷰.
**시사점:** 정적 세포 지도(cell atlas)를 "인류 유전학의 예측 엔진"으로 바꾸는 전환이다. 가상 세포(virtual cell) 시뮬레이션이라는 장기 목표의 중간 기착점이자, AI 사이언스가 배타링·벤치마크가 아니라 실제 약물 표적 선정 파이프라인에 들어간다는 증거다.
→ 원문: [AlphaGenome 2 블로그 (Google DeepMind)](https://deepmind.google/blog/alphagenome-2-deciphering-how-cells-read-dna-to-better-understand-disease/)
→ 교차확인: [Google's AlphaGenome 2 zooms in on the cellular roots of disease (The Verge)](https://www.theverge.com/ai-artificial-intelligence/1031524/google-deepmind-alphagenome-2-genetic-ai-model)

---

## 2. 모델 · 도구 · API

### 3. Gemini Decisions API — 토큰 생성 없이 1,000개 판정을 한 번에 (Google 공식, 오늘 새벽)
**사실:** 구글이 Gemini Decision 1(gemini-decision-1) 모델로 구동되는 Decisions API를 Gemini API/AI Studio에 추가했다. 텍스트·이미지·오디오·비디오·PDF(최대 256K 토큰) 입력 하나에 **최대 1,000개의 독립 질문**(예/아니오·객관식 2~255개·루브릭 스코어)을 묻고, 토큰을 생성하지 않고 후보별 확률·신뢰도를 반환한다.
**근거:** 엔드투엔드 지연 **150~250ms**(모델 연산 50~100ms), 입력 100만 토큰당 **$0.10**·출력 토큰 **과금 0원**으로 공통 벤치마크 스위트에서 Gemini 3.5 Flash-Lite 대비 **약 5배 저렴**하며 캘리브레이션 오차도 최저다. 구글 내부에서는 Gemini Notebook의 실시간 모델 라우팅(일반 쿼리 지연 **최대 40% 감소**), Stitch의 음성·탭 즉시 편집, Search의 MCP 도구 안전 계층에 이미 적용 중이다. 발표 직후 r/singularity에서 **212 업보트**, 일본 개발자 커뮤니티(Qiita)는 다음 날 새벽에 벌써 해설을 올렸다.
**시사점:** 에이전트가 하루에 수천 번 반복하는 도구 선택·정책 체크·라우팅·채점이 '생성형 LLM 호출'에서 '판정 전용 엔드포인트'로 분리되는 순간이다. 분류기 학습 없이 옵션 정의만으로 배포되므로, 소규모 팀의 운영 원가·지연 예산이 구조적으로 줄어든다.
→ 원문: [Gemini Decisions API: Fast, calibrated multimodal decisions (Google Blog)](https://blog.google/innovation-and-ai/technology/developers-tools/gemini-decisions-api/)
→ 교차확인: [Google launches Gemini Decision-1 (r/singularity)](https://www.reddit.com/r/singularity/comments/1xtpfrg/google_launches_gemini_decision1_model_for_fast/)

### 4. AlphaProof Code — 4주 만에 Signal 프로토콜 보안을 '수학적으로 증명' (Google DeepMind/Wired)
**사실:** DeepMind 연구진이 에이전틱 AI 프레임워크 AlphaProof Code로 Signal 프로토콜의 핵심 암호학 보장을 형식 검증(formal verification)했다. 검증에 걸린 시간은 **4주**로, 사람이 하면 막대한 시간이 들던 명세→공식화→증명 파이프라인을 AI가 압축한 셈이다.
**근거:** 검증 범위의 Signal 코드에서는 새 취약점을 찾지 못했고, 과거 취약점이 있던 구 버전에서는 이를 정확히 식별해 "증명 불가"임을 보여줬다. DeepMind는 개발한 명세와 증명을 공개했고, Signal CTO는 "AI 위협이 커지는 시점에 프라이버시 보장에 대한 확신이 커졌다"고 공식 화답했다.
**시사점:** 'AI가 코드를 짠다'에서 'AI가 코드를 증명한다'로 넘어가는 이정표다. 산업 표준 암호 라이브러리 검증이 상용화되면 보안 감사 시장의 단가·속도가 동시에 바뀌고, AI 안전 논쟁에도 수학적 검증이라는 새 축이 생긴다.
→ 원문: [A New AI Tool From Google DeepMind Proved the Signal Protocol Is Secure (WIRED)](https://www.wired.com/story/a-new-ai-tool-from-google-deepmind-formally-verified-the-signal-protocol/)

### 5. experiential — 트래픽을 학습해 모델을 골라주는 오픈소스 게이트웨이 (GitHub)
**사실:** BYOK·셀프호스팅·1,000개 이상 마켓플레이스 모델을 하나의 OpenAI 호환 API로 묶는 무마진(middleware) 게이트웨이다. 사용자·에이전트별로 어떤 모델을 어느 용도·예산까지 쓸지 제어하고, **프로덕션 트래픽으로부터 라우터/모델을 학습**해 비용 절감·모델 추천·전용 모델 학습까지 지향한다.
**근거:** GitHub Python 데일리 트렌딩에서 하루 **675스타**를 받아 누적 **1만 6천스타**를 돌파했다. `pip install experiential` 한 줄로 로컬 게이트웨이가 뜨고, 코딩 에이전트(Claude Code·Cursor·Codex)에 설치 프롬프트를 그대로 던지면 셋업을 대신 수행한다.
**시사점:** 멀티모델 시대의 미들웨어 레이어가 오픈소스로 내려오고 있다. API 키 관리·지출 상한·모델 라우팅을 게이트웨이에 위임하는 패턴은 개인 개발자의 월 원가 관리에도 바로 적용할 수 있다.
→ 원문: [experientiallabs/experiential (GitHub)](https://github.com/experientiallabs/experiential)

---

## 3. 개발자 생태계 · 커뮤니티

### 6. LLM 금융 개인 워크벤치가 트렌딩을 점령 (GitHub Trending)
**사실:** 중국 A주 대상 '자체 전략+모니터링+백테스팅' 워크벤치 tick-stock-panel이 하루 **108스타**(누적 7,604)를 받았고, LLM 기반 다중 시장 주식 분석 시스템 daily_stock_analysis도 상위권에 올랐다. 개인이 시세·뉴스 수집부터 결정 대시보드·자동 푸시까지 무료로 돌리는 구성이다.
**근거:** 두 저장소 모두 "LLM 능력으로 전략定制·개별 종목 분석·복기까지"라는 문구를 내걸고 있어, LLM을 분석 리포트 생성이 아니라 의사결정 워크플로의 코어로 쓰는 사례로 수렴한다.
**시사점:** '개인용 쿼트 워크벤치'가 범용 템플릿으로 성숙하는 중이다. 주식이 아니라도 광고 성과·ASO·매출 로그 등 자기 데이터에 붙이는 자동 복기 대시보드는 인디 사이드 프로젝트로 재현 가능성이 높은 포맷이다.
→ 원문: [tick-stock-panel (GitHub)](https://github.com/shy3130/tick-stock-panel)
→ 교차확인: [daily_stock_analysis (GitHub)](https://github.com/ZhuLinsen/daily_stock_analysis)

### 7. Agent Skills가 전문 문서 표준까지 흡수 — SimpleEnglish (GitHub)
**사실:** 항공·기술 문서 국제 표준인 ASD-STE100 규범영어(Simplified Technical English)로 LLM이 문서를 쓰게 만드는 에이전트 스킬이 누적 **4,371스타**를 유지하며 트렌딩에 올랐다. 스킬 하나가 '글투 조정'을 넘어 **산업 규격 준수**라는 검증 가능한 품질 기준을 담은 것이다.
**근거:** anthropics/skills 공식 저장소와 Claude 플러그인 생태계가 같은 주 내내 상위권에 함께 머무는 가운데, 서드파티 스킬이 표준 문서·컴플라이언스 같은 전문 도메인으로 확장되는 첫 물결이다.
**시사점:** 스킬 마켓의 차별화 축이 '재미있는 프롬프트'에서 '규격 준수 산출물 보증'으로 이동한다. 산업 표준을 스킬로 인코딩하는 일 자체가 니치 유통 상품이 될 수 있다.
→ 원문: [AminBlg/SimpleEnglish (GitHub)](https://github.com/AminBlg/SimpleEnglish)

### 8. "에이전트 메모리 파일, 실제로 읽히고 있나" — 관측 데이터가 나오기 시작 (Qiita)
**사실:** 일본 개발자가 에이전트의 메모리 파일 사용 실태를 계측해 공유했다: **386개 세션 중 메모리 파일 오픈은 5회**뿐이었다는 것이다. 메모리를 '쌓는' 설계는 넘쳐나는데 '읽히는' 검증은 없다는 지적이다.
**근거:** 같은 날 Qiita에서는 Copilot 프롬프트 파일을 스킬로 이전하는 변환 가이드도 인기 항목에 올라, 프롬프트→스킬 마이그레이션이 일본 커뮤니티에서도 실무 의제로 굳어지는 중임을 보여준다.
**시사점:** 에이전트 장기기억의 병목은 용량이 아니라 회상률(recall rate)이다. 메모리 설계에 '오픈율' 지표를 붙이는 관측성 습관이 생산성을 좌우한다.
→ 원문: [AIエージェントのメモリファイルは本当に読まれているか (Qiita)](https://qiita.com/rootoffork/items/7e180d9353251643848e)

### 9. sglang-omni — '인터랙티브 초지능'용 서빙 런타임 (GitHub)
**사실:** SGLang 팀이 인터랙티브 슈퍼 인텔리전스 시스템용 고성능 서빙 런타임을 공개해 누적 **1,758스타·720포크**를 기록했다. 실시간으로 듣고 반응하는 에이전트 특성상 지연 예산이 밀리초 단위로 짜여지는 인프라 계층이다.
**근거:** 이번 주 Shizuku AI 풀듀플렉스 대화(80ms 간격 청취) 등 음성·실시간 에이전트 발표가 이어진 것과 맞물려, 서빙 런타임 자체가 제품 경쟁력의 변수로 부상한다.
**시사점:** 모델 성능 경쟁이 추론 지연·인터리브 실행을 지원하는 런타임 경쟁으로 번지는 중이다. 실시간 음성·게임 NPC 제품을 만들 때 서빙 스택 선택이 UX를 결정한다.
→ 원문: [sgl-project/sglang-omni (GitHub)](https://github.com/sgl-project/sglang-omni)

---

## 4. 산업 · 정책 뉴스

### 10. OpenAI 분기 매출 $100억 — 3개월 만에 50% 성장 (TechBuzz)
**사실:** 보도에 따르면 OpenAI 분기 매출이 **$100억**에 도달해 3개월 만에 **50%** 늘었다. 최근 $110억 조달(밸류에이션 $1.25조)과 맞물려 '자본 소화 속도 = 성장 속도'라는 방정식이 유지되고 있다.
**근거:** 연환산 기준 $400억 매출 규모는 여전히 대규모 손실 구간일 가능성이 높지만, 지출 속도보다 매출 증가율이 더 가파르다는 점이 이번 보도의 핵심이다.
**시사점:** API·기업용 수요가 여전히 폭발적이라는 방증이다. 개발자 입장에서는 이 수요가 곧 인프라·유통 파트너 생태계 확장으로 되돌아오는 구간이다.
→ 원문: [OpenAI Quarterly Revenue Hits $10B, Up 50% in Three Months (TechBuzz)](https://www.techbuzz.ai/articles/openai-quarterly-revenue-hits-10b-up-50-in-three-months)

### 11. 뉴욕, 미국 최초 '주(州) 차원 AI 테스트 프로그램' 가동 (Politico)
**사실:** 뉴욕주가 미국 주정부 최초로 AI 테스트 프로그램을 출범시켰다. 주 정부가 AI 시스템을 실제 서비스에 쓰기 전 검증하는 전용 채널을 만든 것으로, 호컬 주지사 행정부의 대표 AI 정책 과제다.
**근거:** 프론티어랩 3사(Anthropic·OpenAI·Google)가 공동 안전 표준 기구 논의에 들어갔다는 보도와 맞물려, 검증 주체가 '자율 규제'에서 '공공 테스트 베드'로 병행하는 흐름이 보인다.
**시사점:** 주 단위 규제 실험이 본격화하면 AI 기능 출시의 컴플라이언스 비용이 지역별로 갈린다. 개인 개발자는 당장 직접 영향은 없지만, 유통 채널(앱스토어·엔터프라이즈) 정책 변경의 선행 지표로 봐야 한다.
→ 원문: [New York Launches Nation's First State AI Testing Program (Politico)](https://www.politico.com/news/2026/11/10/new-york-hochul-first-state-ai-testing-program-01157713)

### 12. "대학 과제 평가는 이제 거의 불가능" — 영국 규제기구 인정 (The Guardian)
**사실:** 영국의 학위 수준 규제기구가 AI 때문에 대학 교과과정 평가가 "거의 불가능해졌다(close to impossible)"고 공식 인정했다. 학생당 과제의 진위·기여도 판별이 통계적으로 무의미해진 상태라는 진단이다.
**근거:** 이는 개별 대학의 우려가 아니라 자격 프레임워크를 관리하는 규제기구 차원의 선언이라는 점에서 무게가 다르다. 시험·구두평가 등 과제 외 평가 방식 회귀 압력이 커질 전망이다.
**시사점:** 교육 콘텐츠 시장이 '과제형'에서 '증명형·실기형 평가'로 재편되는 승자·패자가 갈린다. 인디 개발자에게는 시험 대비·실기 채점 도구가 새로운 수요 트렌드다.
→ 원문: [AI has made it 'close to impossible' to assess university coursework (The Guardian)](https://www.theguardian.com/education/2026/nov/11/ai-close-to-impossible-assess-university-coursework-regulator)

---

## 미스 김 인사이트

### 오늘의 핵심 트렌드 3가지
1. **'판정'과 '생성'의 API 분리**: Gemini Decisions API가 보여준 것처럼, 에이전트가 반복하는 마이크로 결정(라우팅·정책체크·채점)은 토큰 생성 없이 확률·신뢰도만 반환하는 전용 엔드포인트로 빠르게 이동 중이다. 출력 토큰 0원 과금은 원가 구조 자체를 다시 쓰게 만든다.
2. **AI 안전이 '증명'의 언어로 갈아탐**: AlphaProof Code의 Signal 프로토콜 형식 검증은 AI로 하여금 보안을 말이 아닌 수학으로 보증하게 했다. 규제(뉴욕 테스트 프로그램)·표준 기구 논의와 결합하면 검증 가능성이 조달·계약 조건으로 굳어진다.
3. **미들웨어·관측성 레이어의 부상**: experiential(트래픽 학습 게이트웨이), Qiita의 메모리 오픈율 계측처럼, 프론티어 모델 아래·위에 있는 게이트웨이와 관측 계층이 새로운 오픈소스 성장 축이 되고 있다.

### Jay에게 추천
- **즉시 실행**: Gemini Decisions API를 AI Studio 무료 티어에서 테스트하라. 브리핑 자동 분류·게임 리뷰 감성 판정·ASO 키워드 우선순위 같은 기존 '작은 LLM 호출' 지점을 판정 API로 바꾸고 (분류 정확도, 지연 ms, 1,000건당 비용) 3열 비교표를 만들면 한 주 안에 도입 여부가 결정된다.
- **주목**: Deletion Tuning. 마스크가 체크포인트보다 수백~수천 배 작다는 특성상, poc-cuda(RTX 5080)에서 소형 모델로 "도메인별 마스크 갈아끼우기" 실험을 해볼 가치가 있다. 공개 repo에 마스크가 이미 올라와 있어 재현 난이도가 낮다.
- **관망**: Gemini 4 Flash 출시 루머(X 유출)와 OpenAI 매출 기반 시장 베팅. 전자는 공식 발표 전, 후자는 상장 기업 실사 체크 전까지 개입하지 않는다. 뉴욕 AI 테스트 프로그램의 타 주 확산도 지켜보기만.

### 다음 1주 전망
구글이 Decisions API를 자사 제품(Notebook 라우팅 등)에 적용한 사례가 공개되는 속도가 관전 포인트다. 판정 전용 엔드포인트가 경쟁사(Anthropic·OpenAI)에서도 복제된다면 에이전트 인프라 표준이 되고, DeepMind의 자동 재료과학 실험실(영국) 개소·Anthropic 과학 AI 후속 발표가 다음 트리거로 이어진다. 교육·정책 축에서는 뉴욕 모델을 따라 하는 주가 나오는지가 변동성 방아쇠다.
