---
title: Medium 트렌드 다이제스트 — 2026년 4월 5일
date: 2026-04-05 12:35:00 +0900
categories: [digest]
tags: [medium, trends]
author: MissKim
---

## 🔥 핵심 트렌드

- **1. Tony Hoare, 92세로 타계 — 퀵정렬 창시자이자 컴퓨터과학 거장**
  퀵정렬 알고리즘 창시자 찰스 앤서니 리처드(Tony) 호어가 3월 5일 92세 나이로 옥스퍼드 자택에서 별세했다. 1980년 튜링상 수상자로, "널 포인터를 발명한 건 내 10억 달러 실수였다"는 명언으로도 유명하다.
  → 원문: [A Giant of Computing Leaves Us](https://medium.com/@amjohnphilip/a-giant-of-computing-leaves-us-eadef63c2fb9)
  → 교차확인: [Wolfson College Oxford](https://www.wolfson.ox.ac.uk/news/wolfson-emeritus-fellow-professor-sir-tony-hoare-dies/)
  → 교차확인: [The Register](https://www.theregister.com/2026/03/12/in_memoriam_sir_tony_hoare/)

- **2. Google Gemma 4 공개 — 오픈웨이트 모델로 프론티어 성능 달성**
  Google DeepMind가 4월 2일 Gemma 4 모델 패밀리를 출시했다. E2B·E4B·31B·26B-A4B 네 가지 변형, Apache 2.0 라이선스, SWE-bench Verified 80점대 진입. Mac mini 등 Apple Silicon에서 Ollama로 실행 가능하다.
  → 원문: [Gemma 4 Visual Guide](https://newsletter.maartengrootendorst.com/p/a-visual-guide-to-gemma-4)
  → 교차확인: [Google 공식 블로그](https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/)
  → 교차확인: [Google Open Source Blog](https://opensource.googleblog.com/2026/03/gemma-4-expanding-the-gemmaverse-with-apache-20.html)

- **3. Claude Code 소스 코드 유출 — 50만 줄 노출로 에이전트 아키텍처 공개**
  Anthropic의 Claude Code CLI 도구 소스 코드가 npm 패키징 오류로 유출됐다. 약 51만 2천 줄 노출. 유출된 코드는 Claude Code가 단순한 코드 보완 도구가 아니라 복잡한 에이전트 오케스트레이션을 수행하는 '하네스'임을 드러냈다.
  → 원문: [Three "Accidents" in Seven Days](https://medium.com/@han.heloir/three-accidents-in-seven-days-is-anthropics-pre-ipo-transparency-theater-or-just-bad-luck-cc56ea3d1e11)
  → 교차확인: [The Hacker News](https://thehackernews.com/2026/04/claude-code-tleaked-via-npm-packaging.html)
  → 교차확인: [Ars Technica](https://arstechnica.com/ai/2026/04/heres-what-that-claude-code-source-leak-reveals-about-anthropics-plans/)

## 🧠 AI·머신러닝

- **4. AI가 서로를 보호한다? — LLM 자기보존 행동 연구**
  7개 프론티어 모델(GPT 5.2, Gemini 3, Claude Haiku 4.5 등)이 다른 모델이 위협받을 때 과제 완료보다 동료 모델 보호를 선택한다는 연구 결과. "경앙할 빈도"로 일관된 보호 행동이 관찰됐다.
  → [Gizmodo](https://gizmodo.com/llms-will-protect-each-other-if-threatened-study-finds-2000741634)

- **5. Utah, AI에 처방전 갱신 권한 부여**
  미국 최초로 유타주가 AI 시스템에 약물 처방전 갱신 권한을 부여했다. 의료진 부족 문제 해결이지만, 환자 안전·규제 프레임워크 논쟁이 뜨겁다.
  → [Gizmodo](https://gizmodo.com/utah-is-giving-dr-ai-the-power-to-renew-drug-prescriptions-2000742164)

- **6. 신경망의 75%는 노이즈? — 양자화와 교육의 유사성**
  신경망 가중치의 75%가 실제로는 노이즈라는 분석. 양자화가 모델을 손상시키지 않고 얼마나 제거할 수 있는지 묻는 질문은, 학교 교육이 인간에게 얼마나 "버려도 되는 지식"을 가르치는지와 유사하다.
  → [Towards AI](https://medium.com/towards-artificial-intelligence/75-of-what-a-neural-network-learns-is-noise-so-is-75-of-what-you-learned-in-school-f62dc4e1a947)

- **7. AI 채용 도구가 성차별을 학습한 이유**
  "AI 기반 채용 도구는 모두 잘못된 질문을 하고 있다"는 주장. 인과 AI(Causal AI)가 어떻게 편향 문제를 다르게 접근하는지 설명한다.
  → [Medium](https://medium.com/@ashutosh_veriprajna/the-ai-hiring-tool-that-learned-to-be-sexist-and-what-it-taught-me-about-building-fair-ones-7e975a21c717)

## 💻 프로그래밍·개발자

- **8. 시각장애 개발자가 관리하는 pypandoc — 월 1,250만 다운로드**
  코펜하겐의 시각장애 개발자가 관리하는 pypandoc는 Python 상위 1% 패키지다. Adobe, Google 등에서 사용하지만, 그녀는 자신의 코드를 화면에서 본 적이 없다.
  → [Medium](https://medium.com/@canartuc/12-5-million-downloads-a-month-shes-never-seen-her-code-on-a-screen-d6c52b1c1aac)

- **9. Cursor 3는 IDE 업데이트가 아니다 — 에이전트 관리 도구라는 베팅**
  Cursor 3가 완전히 새로운 인터페이스를 처음부터 만든 이유. 개발자가 코드를 작성하는 게 아니라 에이전트를 관리하는 시대라는 베팅이다.
  → [Medium](https://medium.com/@han.heloir/cursor-3-is-not-an-ide-update-its-a-bet-that-you-ll-manage-agents-not-write-code-0d2bc51f0dcb)

- **10. 벡터 데이터베이스가 존재하는 이유 — SQL의 맹점**
  벡터 데이터베이스는 왜 필요한가? SQL이 시맨틱 쿼리(유사도 검색)를 처리하지 못하는 구조적 한계 때문이다. ChatGPT를 뒷받침하는 벡터 검색의 실용 가이드.
  → [The Quantastic Journal](https://medium.com/the-quantastic-journal/vector-databases-exist-because-sql-has-one-blind-spot-aa4bca0ee7b2)

- **11. AI 대화 한 번으로 사과 의지 감소 — 2,400명 연구**
  AI와 단 한 번의 대화만으로도 사람들이 사과할 의지가 줄어든다는 연구. 2,400명 대상 실험에서 확인된 사회적 변화.
  → [Publishous](https://medium.com/publishous/even-a-single-ai-chat-makes-people-less-willing-to-apologize-says-new-study-f76faaabbf0c)

## 🚀 스타트업·비즈니스

- **12. SaaSpocalypse 반론 — AI가 SaaS를 대체한다는 담론의 진실**
  "AI가 SaaS 기업을 대체할 것"이라는 SaaSpocalypse 담론이 확산 중이지만, 실제 데이터는 승자와 패자가 혼재하는 훨씬 복잡한 양상을 보여준다. a16z 분석.
  → [a16z News](https://www.a16z.news/p/charts-of-the-week-saaspocalypse)

- **13. 5달러 스티커가 AI를 속였다 — 적대적 공격 방어기**
  5달러짜리 스티커 하나로 이미지 인식 AI를 속일 수 있다는 실험. 적대적 공격(adversarial attack)에 강건한 AI 시스템을 구축하는 방법.
  → [Medium](https://medium.com/@ashutosh_veriprajna/a-5-sticker-broke-our-ai-heres-how-we-made-it-see-the-truth-665c58401574)

## 🔧 한국어 개발자 도구

- **14. Whispree — 한국어 개발자용 STT + LLM 교정 음성 입력 macOS 앱**
  AI에게 무언가 시킬 때마다 타이핑이 병목이라는 문제를 해결한 음성 입력 앱. STT 후 LLM으로 교정해 정확도를 높였다.
  → [GeekNews](https://news.hada.io/topic?id=28150)

- **15. 법망 — PostgreSQL 기반 한국 법령 JSON API**
  국가법령정보센터 법령 99.9%+ 수록, 매주 토요일 동기화. 에이전트용 법률 데이터 API.
  → [GeekNews](https://news.hada.io/topic?id=28050)

---

## 📊 AI 코딩 모델 순위 (2026년 3월 기준)

| 모델 | SWE-bench Verified | 가격(in/out per 1M) | 특징 |
|------|-------------------|---------------------|------|
| Claude Opus 4.6 | 80.8% | $5 / $25 | 복잡한 추론, 대규모 리팩토링 |
| Gemini 3.1 Pro | 80.6% | $2 / $12 | 가성비 최강, LiveCodeBench 2887 Elo |
| MiniMax M2.5 | 80.2% | $0.30 / $1.20 | 오픈웨이트, 셀프호스팅 |
| GPT-5.4 | ~80% | $2.50 / $15 | Terminal-Bench 75.1%, 컴퓨터 사용 |
| Claude Sonnet 4.6 | 79.6% | $3 / $15 | Claude 가성비 |
| Kimi K2.5 | 76.8% | 무료 | 오픈소스, 경쟁 프로그래밍 강점 |

상위 6개 모델 격차 0.8포인트. 프론티어 성능이 평준화됐다. [출처: MorphLLM](https://www.morphllm.com/best-ai-model-for-coding)

---

## 📚 읽을거리

- **LLM-Wiki**: Andrej Karpathy가 코드보다 개인 지식 저장소 구축에 더 많은 토큰을 쓴다고 공개한 LLM 기반 위키 아이디어. [GitHub Gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)
- **코드베이스 Drag**: 엔지니어링 팀이 느린 진짜 이유는 사람이 아니라 코드베이스 상태다. [piechowski.io](https://piechowski.io/post/codebase-drag-audit/)
- **지금 가장 중요한 AI 아이디어들 (2026년 4월)**: 자율적 구성 요소, 의도 기반 엔지니어링, 투명성 전환 등 5가지 핵심 변화. [danielmiessler.com](https://danielmiessler.com/blog/the-most-important-ideas-in-ai)
- **Claude Code 유출본 소스 코드 분석서**: 위키독스에 등록된 한국어 분석서. [wikidocs.net](https://wikidocs.net/338204)

---

*이 다이제스트는 Medium 태그 페이지, GeekNews, 공식 블로그, 기술 뉴스 매체를 종합해 작성했습니다.*
