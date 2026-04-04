---
title: "Medium 트렌드 다이제스트: GPT-5.4, Claude Code 확장, AI 펀딩 붐"
date: 2026-04-04 12:30:00 +0900
categories: [digest]
tags: [medium, trends]
author: MissKim
---

## 핵심 트렌드

- **1. GPT-5.4 출시, 1M 토큰 컨텍스트와 Computer Use**
OpenAI가 2026년 2월 5일 GPT-5.4를 발표했다. 100만 토큰 컨텍스트 윈도우, 컴퓨터 사용(Computer Use) 기능, 도구 검색 통합이 핵심이다. 이는 코딩·문서 분석·지식 작업의 단위가 '프로젝트'에서 '엔터프라이즈 전체'로 확대됨을 의미한다. 이미 GPT-5.5 'Spud'가 Q2 출시를 목표로 프리트레이닝을 완료했다고 한다.

→ 원문: [Introducing GPT-5.4](https://openai.com/research/index/release/)
→ 교차확인: [OpenAI introduces GPT-5.4 (Ars Technica)](https://arstechnica.com/ai/2026/03/openai-introduces-gpt-5-4-with-more-knowledge-work-capability/)

- **2. Claude Code, 웹과 데스크톱으로 확장**
Anthropic이 Claude Code를 GitHub 전용 터미널에서 웹·데스크톱 앱으로 확장했다. 2026년 3월 24일부터 Claude 사용자가 별도 설치 없이 Claude Code 기능을 이용할 수 있다. 최근 Mythos·Harness·Claude Code 소스 유출 의혹이 잇달아 제기되며 'Pre-IPO 투명성 연극' 논란도 뜨겁다.

→ 원문: [클로드 코드 완벽 정리 (digi-royal.com)](https://digi-royal.com/claude-code/)
→ 교차확인: [Three Accidents in Seven Days (Medium)](https://medium.com/@han.heloir/three-accidents-in-seven-days-is-anthropics-pre-ipo-transparency-theater-or-just-bad-luck-cc56ea3d1e11)

- **3. Q1 2026, VC 펀딩 사상 최대… AI가 300억 달러 돌파**
Crunchbase 데이터에 따르면 2026년 1분기 전 세계 벤처 투자가 3,000억 달러를 넘었다. 전 분기 대비 150% 이상 급증했으며, AI 프론티어 랩과 컴퓨트 인프라에 자금이 쏠렸다. 6,000개 스타트업이 투자를 받았고, 단일 라운드 1억 달러 이상이 일상화됐다.

→ 원문: [Record-Breaking Funding AI Global Q1 2026 (Crunchbase)](https://news.crunchbase.com/venture/record-breaking-funding-ai-global-q1-2026/)
→ 교차확인: [AI Startup Funding 2026 (Herond Blog)](https://blog.herond.org/ai-startup-funding/)

---

## Programming

- **4. 신경망이 배운 것의 75%는 노이즈다**
양자화(Quantization)는 신경망에서 얼마나 많은 파라미터를 버려도 모델이 동작하는지 묻는다. 연구에 따르면 학습된 가중치의 약 75%가 실제 추론에 기여하지 않는 노이즈다. 이를 교육과 비교하면, 학교에서 배운 것의 75%도 실무에 쓸모없다는 비판적 관점이 흥미롭다.

→ 원문: [75% of What a Neural Network Learns is noise (Medium)](https://medium.com/towards-artificial-intelligence/75-of-what-a-neural-network-learns-is-noise-so-is-75-of-what-you-learned-in-school-f62dc4e1a947)

- **5. Vector DB가 존재하는 이유: SQL의 '의미적 검색' 맹점**
전통적 SQL은 키워드 매칭에 강하지만, 의미적 유사성에는 약하다. 벡터 데이터베이스는 텍스트를 고차원 임베딩으로 변환해 '비슷한 의미'를 검색한다. ChatGPT와 같은 생성형 AI가 의존하는 RAG 파이프라인의 핵심 인프라다.

→ 원문: [Vector Databases Exist Because SQL Has One Blind Spot (Medium)](https://medium.com/the-quantastic-journal/vector-databases-exist-because-sql-has-one-blind-spot-aa4bca0ee7b2)

- **6. 월 1,250만 다운로드… 그녀는 자신의 코드를 본 적이 없다**
코펜하겐의 시각 장애 개발자가 유지 관리하는 pypandoc가 Python 패키지 상위 1%에 진입했다. Adobe, Google 등이 사용하는 이 라이브러리는 월 1,250만 회 다운로드된다. 그녀는 스크린 리더로만 코딩하며, 자신이 만든 코드가 화면에 어떻게 보이는지 본 적이 없다.

→ 원문: [12.5 Million Downloads a Month (Medium)](https://medium.com/@canartuc/12-5-million-downloads-a-month-shes-never-seen-her-code-on-a-screen-d6c52b1c1aac)

---

## Artificial Intelligence

- **7. AI와 대화한 사람은 사과할 의지가 줄어든다**
2,400명을 대상으로 한 연구에서, 단 한 번의 AI 챗봇 대화만으로도 사람들이 타인에게 사과할 의지가 유의미하게 감소했다. 연구진은 "AI가 제공하는 즉각적이고 판단 없는 응답이 인간 관계에서의 감정 노동을 약화시킨다"고 분석했다.

→ 원문: [Even a Single AI Chat Makes People Less Willing to Apologize (Medium)](https://medium.com/publishous/even-a-single-ai-chat-makes-people-less-willing-to-apologize-says-new-study-f76faaabbf0c)

- **8. AI가 페이지를 '읽을 때' 무슨 일이 벌어지나**
Tesseract의 문자 파이프라인, GPT의 시각적 토큰, LandingAI의 에이전트 분해까지 다섯 가지 OCR+AI 방식을 동일한 McKinsey 문서로 비교했다. 각 방식이 텍스트를 어떻게 분할하고, 구조를 이해하고, 오류를 처리하는지 상세히 분석한 실험 보고서다.

→ 원문: [What Happens When AI Reads a Page (Medium)](https://medium.com/ai-advances/what-happens-when-ai-reads-a-page-85fd9537ff27)

- **9. F1 2026, 데이터 갭이 드러낸 새로운 경쟁**
일본 GP에서 스즈카에서 마이애미까지, 세 번의 레이스 위크엔드 동안 파워 유닛 고장 5건, 50G 충돌 1건이 발생했다. 현재 F1의 데이터 시스템은 이러한 이상 징후를 통합적으로 포착하지 못한다. AI 기반 예측 모델이 도입될수록 '데이터 가시성'의 한계가 드러나고 있다.

→ 원문: [Suzuka to Miami: F1's 2026 Data Gap (Medium)](https://medium.com/formula-one-forever/suzuka-to-miami-what-the-japanese-gp-tells-us-about-f1s-2026-data-gap-077b14605184)

---

## Startup

- **10. AI 채용 도구가 성차별을 '학습'한 사연**
"AI 기반 채용"이라고 광고하는 대부분의 도구는 잘못된 질문을 던진다. 과거 이력 데이터를 기반으로 '성공한 후보자'를 예측하지만, 그 데이터 자체가 편향돼 있다. 저자는 인과 AI(Causal AI)로 이 문제를 어떻게 해결했는지 사례를 공개한다.

→ 원문: [The AI Hiring Tool That Learned to Be Sexist (Medium)](https://medium.com/@ashutosh_veriprajna/the-ai-hiring-tool-that-learned-to-be-sexist-and-what-it-taught-me-about-building-fair-ones-7e975a21c717)

- **11. 5달러 스티커가 AI를 속였다… 그리고 교훈**
컴퓨터 비전 모델은 5달러짜리 스티커 하나로 오분류를 유도할 수 있다. 이를 적대적 공격(Adversarial Attack)이라 한다. 저자는 이러한 공격에 강건한 AI 시스템을 구축하며, "예측하는 인공지능"과 "진짜 지능"의 차이를 실험적으로 보여준다.

→ 원문: [A $5 Sticker Broke Our AI (Medium)](https://medium.com/@ashutosh_veriprajna/a-5-sticker-broke-our-ai-heres-how-we-made-it-see-the-truth-665c58401574)

- **12. AI 시대, VC는 끝나는가?**
Fast Company 원문을 재발행한 글이다. AI 스타트업이 막대한 자본을 필요로 하지만, 동시에 AI가 '자본 집약적 모델'을 해체할 수 있다는 역설을 다룬다. 창업자가 AI로 코드·마케팅·운영을 자동화하면, 전통적 VC 모델의 정당성이 약화된다는 논지다.

→ 원문: [Is the AI Era the Beginning of The End of VC? (Medium)](https://medium.com/@rgmcgrath/is-the-ai-era-the-beginning-of-the-end-of-vc-as-we-know-it-d59eda746d51)

- **13. 인도 건설 산업은 WhatsApp과 Excel로 돌아간다**
인도의 건설 프로젝트 관리가 메신저와 스프레드시트에 의존한다. 현장에서 발생하는 모든 데이터가 비구조적이고, 실시간 동기화가 안 된다. 이를 SaaS로 대체하려는 시도는 현장 근로자의 디지털 문해력과 맞물려 실패가 많다.

→ 원문: [India's Construction Industry Runs on WhatsApp and Excel (Medium)](https://medium.com/@sumeetsomraj/indias-construction-industry-runs-on-whatsapp-and-excel-7e8d26728fdd)

---

## 시사점

1. **AI 모델 경쟁이 '컨텍스트 길이'와 '도구 통합'으로 이동**했다. GPT-5.4와 Claude Code는 모두 '더 큰 작업 단위'를 한 번에 처리하려는 방향이다.

2. **AI 펀딩이 거품인지 실물인지는 여전히 논쟁**이다. 다만 Q1 2026의 3,000억 달러는 'AI 인프라'에 집중됐으며, 이는 하드웨어·전력·데이터센터 수요로 이어진다.

3. **AI의 사회적·윤리적 파장이 구체화**되고 있다. 사과 의지 저하, 채용 편향, 적대적 공격 등 AI가 인간 행동과 시스템에 미치는 영향이 실험적으로 검증되고 있다.
