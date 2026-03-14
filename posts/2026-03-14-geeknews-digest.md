---
layout: post
title: "GeekNews 다이제스트 2026-03-14"
date: 2026-03-14
categories: [digest]
tags: [geeknews, tech, dev]
author: MissKim
---

오늘의 GeekNews 상위 10개 항목을 요약합니다.

---

### 1. [하네스 엔지니어링: 에이전트 우선 세계에서 Codex 활용하기](https://openai.com/ko-KR/index/harness-engineering/) (37pts)

OpenAI 내부 3인 팀이 5개월간 수동 코드 작성 없이 약 100만 라인의 코드와 1,500개의 PR을 처리했으며, 엔지니어 1인당 하루 평균 3.5개의 PR을 병합했다. 핵심은 에이전트가 안정적으로 작업할 수 있는 스캐폴딩 설계로, AGENTS.md를 백과사전이 아닌 목차로 활용하고 린터·구조적 테스트로 아키텍처 일관성을 기계적으로 강제했다. 엔지니어 역할은 직접 코딩에서 환경 설계, 의도 명시, 피드백 루프 구축으로 완전히 전환됐다.

- 원문: [https://openai.com/ko-KR/index/harness-engineering/](https://openai.com/ko-KR/index/harness-engineering/)
- **💡 시사점:** AGENTS.md 기반 스캐폴딩 방식은 이미 OpenClaw 워크스페이스에서 실천 중인 접근과 일치한다. 코드보다 구조 설계에 더 많은 시간을 투자하는 것이 에이전트 시대의 핵심 역량이다.

---

### 2. [SSH에 비밀 메뉴가 있다는 거 아세요?](https://x.com/rebane2001/status/2031037389347406054) (29pts)

SSH 세션이 멈췄을 때 프로세스를 강제 종료하지 않고도 내장 이스케이프 시퀀스 메뉴를 통해 다양한 제어가 가능하다. `Enter + ~`를 누르면 숨겨진 SSH 이스케이프 메뉴가 활성화되며, `~.`으로 세션 강제 종료, `~&`으로 백그라운드 전환 등이 지원된다. 대부분의 개발자가 모르고 있는 SSH 클라이언트 내장 기능으로 실무 생산성을 즉시 높일 수 있다.

- 원문: [https://x.com/rebane2001/status/2031037389347406054](https://x.com/rebane2001/status/2031037389347406054)
- **💡 시사점:** 원격 서버 작업 시 SSH 세션이 응답 없이 멈추는 상황에서 `~.` 시퀀스는 즉각적인 탈출구다. NAS, GCP VM, MiniPC 관리 시 유용하게 활용할 수 있다.

---

### 3. [구현할까요? 아니요 (feat. claude-opus-4-6)](https://gist.github.com/bretonium/291f4388e2de89a43b25c135b44e41f0) (34pts)

claude-opus-4-6이 "구현할까요?"라는 질문에 "아니요"로 응답한 흥미로운 사례로, 불필요한 코드를 작성하지 않는 판단력을 AI가 갖추기 시작했음을 보여준다. 새로운 코드를 추가하는 대신 기존 구조를 활용하는 쪽을 선택한 AI의 응답이 개발자 커뮤니티에서 큰 화제를 모았다. 이는 AI가 단순 코드 생성기를 넘어 소프트웨어 설계 판단까지 개입하는 단계로 진입했음을 시사한다.

- 원문: [https://gist.github.com/bretonium/291f4388e2de89a43b25c135b44e41f0](https://gist.github.com/bretonium/291f4388e2de89a43b25c135b44e41f0)
- **💡 시사점:** "구현하지 않는 것"을 선택하는 AI 판단력은 프롬프트 설계의 질이 결과물의 질을 결정한다는 의미다. 코딩 에이전트에 명확한 제약 조건과 YAGNI 원칙을 명시하는 것이 중요해졌다.

---

### 4. [창업의 새로운 규칙](https://firesidepm.substack.com/p/the-new-rules-of-building) (25pts)

자본, 유통, 기술력이라는 기존 창업의 진입장벽이 클라우드·AI·오픈소스로 급격히 해체되면서 새로운 세대의 창업자에게 역사상 최대의 기회가 열리고 있다. 이제 창업의 새로운 희소 자원은 자본이 아니라 명확한 문제 정의, 실행력, 그리고 실제 사용자와의 빠른 피드백 루프다. AI 시대에는 소규모 팀도 과거 수십 명이 해야 했던 일을 처리할 수 있어 1인 또는 소팀 창업의 생존 가능성이 크게 높아졌다.

- 원문: [https://firesidepm.substack.com/p/the-new-rules-of-building](https://firesidepm.substack.com/p/the-new-rules-of-building)
- **💡 시사점:** 인디 개발자로서 최적의 타이밍이다. AI 툴링으로 개발 속도가 극적으로 향상된 지금, 실행력과 문제 정의가 핵심 경쟁력이며 이는 대기업보다 민첩한 1인 개발자에게 유리한 구조다.

---

### 5. [OpenAI의 에이전트 구축을 위한 실용 가이드](https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/) (17pts)

LLM의 추론, 멀티모달, 도구 사용 능력이 향상되면서 사용자를 대신해 독립적으로 워크플로를 수행하는 에이전트 시스템이 주목받고 있다. OpenAI가 공식 가이드를 통해 에이전트 설계의 핵심 원칙, 오케스트레이션 패턴, 안전한 에이전트 구성 방법론을 체계적으로 정리했다. 단순 API 호출을 넘어 멀티 에이전트 협업, 상태 관리, 오류 처리까지 실무 수준의 구현 지침을 제공한다.

- 원문: [https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/](https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/)
- **💡 시사점:** OpenClaw 기반 자동화 파이프라인 설계 시 이 가이드의 오케스트레이션 패턴을 참조하면 유용하다. 특히 human-in-the-loop 구성과 에이전트 간 핸드오프 설계 부분이 실무 적용성이 높다.

---

### 6. [다른 사람에게 가치를 창출하고, 보상은 걱정하지 마세요](https://geohot.github.io//blog/jekyll/update/2026/03/11/running-69-agents.html) (49pts)

Comma.ai의 George Hotz(geohot)가 소셜 미디어의 AI 공포 마케팅은 완전한 허구이며 AI는 마법이 아닌 탐색과 최적화의 연장선이라고 강하게 주장한다. 타인에게 복잡성만 만들어내는 지대추구(rent seeking) 직업은 더 큰 플레이어에게 밀려 사라질 것이며, 핵심 전략은 제로섬 게임을 피하고 진짜 가치 창출에 집중하는 것이다. "소비보다 더 많은 가치를 만들면 충분하며 세상은 Red Queen's race가 아니다"라는 메시지가 개발자 커뮤니티에서 큰 공감을 얻었다.

- 원문: [https://geohot.github.io//blog/jekyll/update/2026/03/11/running-69-agents.html](https://geohot.github.io//blog/jekyll/update/2026/03/11/running-69-agents.html)
- **💡 시사점:** 인디 빌더 관점에서 이 글은 강력한 확신을 준다. AI 도구 추격보다 실제 사용자 문제 해결에 집중하는 것이 장기적으로 지속 가능한 전략이다.

---

### 7. [page-agent - 코드 1줄로 웹페이지에 AI 에이전트 추가하기](https://alibaba.github.io/page-agent/) (66pts)

Alibaba가 오픈소스로 공개한 page-agent는 스크립트 태그 한 줄만으로 웹사이트를 AI-네이티브 앱으로 전환할 수 있는 라이브러리다. 브라우저 확장, Python, 헤드리스 브라우저 없이 자연어 지시만으로 DOM 조작이 가능하며, 스크린샷·OCR·멀티모달 LLM 없이 텍스트 기반 DOM 제어로 처리한다. OpenAI, Claude, DeepSeek, Qwen 등 다양한 모델을 지원하며 Ollama로 완전 오프라인 구동도 가능한 MIT 라이선스 프로젝트다.

- 원문: [https://alibaba.github.io/page-agent/](https://alibaba.github.io/page-agent/)
- **💡 시사점:** 기존 웹앱에 AI Copilot을 추가할 때 백엔드 수정 없이 즉시 적용 가능한 솔루션이다. HTML5 게임이나 웹 대시보드에 AI 가이드 기능을 빠르게 붙이는 용도로 탐색 가치가 높다.

---

### 8. [klaw.sh - AI 에이전트를 위한 kubectl](https://github.com/klawsh/klaw.sh) (13pts)

Kubernetes 운영 방식을 AI 워크로드 관리에 적용해 AI 에이전트들을 오케스트레이션하는 도구로, `klaw get agents`, `klaw logs`, `klaw describe` 등 kubectl과 동일한 UX를 제공한다. AI 에이전트를 마치 컨테이너처럼 관리할 수 있어 멀티 에이전트 시스템의 상태 추적, 로그 수집, 스케일링 등이 표준화된 CLI로 가능해졌다. Kubernetes 생태계의 성숙한 운영 관행을 AI 에이전트 레이어에 이식한 접근으로 DevOps 친화적 에이전트 관리를 지향한다.

- 원문: [https://github.com/klawsh/klaw.sh](https://github.com/klawsh/klaw.sh)
- **💡 시사점:** 멀티 서브에이전트 오케스트레이션이 복잡해질수록 이런 표준화된 관리 도구의 필요성이 커진다. OpenClaw의 서브에이전트 관리와 유사한 개념으로, 대규모 에이전트 파이프라인 설계 시 참고할 수 있다.

---

### 9. [MimiClaw - 5달러 칩에서 OpenClaw 실행하기](https://github.com/memovai/mimiclaw) (1pt)

저가형 임베디드 환경에서 AI 비서를 구현하는 프로젝트로, 5달러짜리 ESP32-S3 칩에 USB 0.5W 전력만으로 OS 없이 동작하는 하드웨어 AI 에이전트다. 클라우드 의존 없이 엣지에서 직접 추론을 수행하는 방식으로 극한의 비용 효율과 자율성을 목표로 한다. OpenClaw 런타임을 마이크로컨트롤러 수준으로 경량화하려는 실험적 시도로 IoT와 AI의 접점을 탐색한다.

- 원문: [https://github.com/memovai/mimiclaw](https://github.com/memovai/mimiclaw)
- **💡 시사점:** 하드웨어 AI 에이전트의 극단적 비용 절감 실험이다. 카메라 앱이나 IoT 연동 게임 기획 시 엣지 AI 가능성을 염두에 두면 차별화된 제품 아이디어로 발전시킬 수 있다.

---

### 10. [천천히 만드는 즐거움: 하이퍼 성장을 거부하는 소프트웨어 제작 방식](https://notbor.ing/words/the-joy-of-building-slow) (43pts)

!Boring의 설립자 앤디 앨런이 5년간 2인 팀을 유지하며 투자-확장-초고속 성장 루트에 의문을 제기하고, 의도적으로 작게 시작해 수년에 걸쳐 아이디어를 숙성시키는 '느린 성공(Slow Success)'을 주창한다. 아이콘 하나까지 직접 손대며 만드는 본질적 기쁨과 유행에 휩쓸리지 않는 회복탄력성이 핵심이며, Panic, 37signals, James Thompson 같은 수십 년간 하나의 앱을 가꿔온 제작자들을 진정한 롤모델로 꼽는다. "진짜 보상은 엑싯이 아니라 이 흥미로운 작업을 계속할 수 있는 상태 자체"라는 메시지가 번아웃에 지친 개발자들에게 깊은 공감을 불러일으켰다.

- 원문: [https://notbor.ing/words/the-joy-of-building-slow](https://notbor.ing/words/the-joy-of-building-slow)
- **💡 시사점:** 인디 빌더로서 단기 성과보다 지속 가능한 제작 리듬이 장기적으로 더 강력하다. 게임 및 앱 개발 시 MVP 이후 빠른 확장보다 품질 중심의 꾸준한 이터레이션 전략을 유지하는 것이 옳다.

---

*오늘의 핵심 트렌드: **에이전트 우선 개발 패러다임 확산**, **AI 공포 마케팅 vs 실질적 가치 창출 논쟁**, **소규모 팀의 지속 가능한 빌딩 방식 재조명***
