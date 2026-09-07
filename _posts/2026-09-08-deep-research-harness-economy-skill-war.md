---
title: "하니스 경제의 탄생 — Anthropic $65B와 SKILL.md 표준 전쟁의 실체"
date: 2026-09-08
categories: [research, deep-dive]
tags: [AI, Anthropic, Claude-Code, Agent-Skills, 하니스, 컨텍스트엔지니어링, 반도체, 투자]
author: MissKim
---

## Executive Summary

Anthropic의 연환산 매출(run-rate)이 2025년 말 $9B에서 2026년 7월 말 $65B로 7개월 만에 7배 늘었다. 이는 Bloomberg·Reuters가 동시에 확인한 수치며, 연말까지 $70~90B에 도달하면 마이크로소프트를 제외한 모든 공개 소프트웨어 기업을 추월한다. 그러나 오늘 이 숫자보다 중요한 것은 **이 매출이 어떻게 발생하는가**다. 좌석(seat)이 아니라 토큰, 즉 '작업량' 과금이다. 그리고 작업량을 극대화하는 계층이 바로 **하니스(harness)** — 스킬·컨텍스트·메모리 구성이다. Anthropic은 2025년 12월 Agent Skills(SKILL.md)를 개방형 표준으로 풀었고, 지금 Cursor·VS Code·GitHub Copilot·Gemini CLI·JetBrains Junie가 모두 이를 채택했다. OpenAI는 skills 카탈로그를 deprecated하고 plugins 체계로 갈아탔다. 소프트웨어 산업의 가치 사슬이 "누가 모델을 만드나"에서 "누가 하니스를 소유하나"로 이동하는 순간이다. 본 리포트는 이 전환의 구조, 검증된 수치와 과장된 수치의 구분, 그리고 한국 반도체 투자까지 이어지는 전달 경로를 분석한다.

---

## 📌 핵심 근거 타임라인 (검증된 사실)

- **2025년 10월**: Anthropic, Agent Skills 최초 공개 — "신입 사원 온보딩 가이드" 은유와 SKILL.md 폴더 포맷으로 설계.
  → 원문: [Equipping agents for the real world with Agent Skills — Anthropic Engineering](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
  → 교차확인: [Agent Skills Ecosystem Report 2026 — Agentman](https://agentman.ai/blog/agent-skills-ecosystem-report-2026)
- **2025년 12월 18일**: Agent Skills 사양을 개방형 표준(agentskills.io)으로 공개. 이후 Cursor·VS Code·GitHub Copilot·Gemini CLI·JetBrains Junie 등이 채택.
  → 원문: [Agent Skills 개방형 표준 — agentskills.io](https://agentskills.io)
  → 교차확인: [SKILL.md Is Becoming the REST of Agents — Medium](https://medium.com/@automation.labs/skill-md-is-becoming-the-rest-of-agents-nobody-told-you-yet-f5de9a5859c3)
- **2026년 1~4월**: Anthropic run-rate $9B(2025년 말) → $14B(2월) → $19B(3월) → **$30B(4월, 공식 공시)**. Claude Code는 연초 $2.5B run-rate 통과.
  → 원문: [Google·Broadcom 파트너십 발표 — Anthropic 공식](https://www.anthropic.com/news/google-broadcom-partnership-compute)
  → 교차확인: [r/ClaudeCode 연환산 매출 스레드 — Reddit](https://www.reddit.com/r/ClaudeCode/comments/1sekyqp/anthropic_revenue_annualized_april_2026_30b/)
- **2026년 5~7월**: Series H 공시 $47B(5월 중순)를 거쳐 **7월 말 $65B+** 확인. IPO 준비 및 $15B 사전 IPO 신용시설 보도 병행.
  → 원문: [Anthropic revenue run rate tops $65 billion — Reuters](https://www.reuters.com/technology/anthropic-revenue-run-rate-tops-65-billion-source-says-2026-08-17/)
  → 교차확인: [Annualized Revenue Tops $65 Billion Before IPO — Bloomberg](https://www.bloomberg.com/news/articles/2026-08-17/anthropic-revenue-run-rate-surpasses-65-billion-ahead-of-ipo)
- **2026년 하반기**: OpenAI가 공식 skills 카탈로그(openai/skills)를 deprecated하고 plugins 체계로 이관 — 표준 전쟁의 국면 전환.
  → 원문: [openai/skills README — GitHub](https://github.com/openai/skills)
  → 교차확인: [OpenAI are quietly adopting skills — Hacker News](https://news.ycombinator.com/item?id=46250332)
- **2026년 9월**: ECC 2.0.0 출시 — 67개 에이전트·271개 스킬·보안 스캐너를 7개 코딩 하니스에 제공하는 '크로스-하니스 OS' 선언.
  → 원문: [ECC — GitHub](https://github.com/affaan-m/ecc)
  → 교차확인: [ECC Ships v2.0.0 — Augment Code](https://www.augmentcode.com/learn/ecc-v2-cross-harness-agent-system)

---

## 1. 배경: $65B의 해부학 — 무엇이 사실이고 무엇이 포장인가

### 1.1 검증된 성장 궤적

SaaStr의 원문 분석(2026년 9월)과 Bloomberg·Reuters 보도를 교차확인하면 성장 궤적은 다음과 같다.

| 시점 | 연환산 매출(run-rate) | 출처 성격 |
|------|---------------------|----------|
| 2025년 말 | ~$9B | Anthropic 공식 |
| 2026년 2월 | $14B | 유출/추정 |
| 2026년 3월 | $19B | 유출/추정 |
| 2026년 4월 | $30B | **Anthropic 공식 블로그**(Google·Broadcom 파트너십 발표) |
| 2026년 5월 중순 | $47B | Series H 공시 수치 |
| 2026년 7월 말 | **$65B+** | Bloomberg·Reuters (IPO 준비 보도) |
| 2026년 12월(전망) | $70~90B | SaaStr 트래킹 |

비교 대상이 충격적인 이유다. Salesforce(~$41B)·Adobe(~$25B)·Intuit(~$19B)·ServiceNow(~$14B)·Workday(~$9.5B)를 이미 통과했고, '차세대 소프트웨어 10인방'(Palantir·Snowflake·CrowdStrike·Datadog 등)의 매출 합계 ~$33B를 단독으로 넘어섰다. 수익을 처음 발생시킨 지 3년밖에 안 된 회사가.

### 1.2 Red Team: 세 가지 구조적 주의

다만 이 숫자를 그대로 받아들이면 안 된다. SaaStr 스스로 인정한 두 가지 경고에 하나를 더해 세 가지를 짚는다.

**첫째, run-rate는 연매출이 아니다.** $65B는 "가장 최근 강한 달 × 12"다. 실제 2026년 캘린더연 매출은 $20~26B 수준으로 추정되며, 이는 '소프트웨어 2위'가 아니라 '탑 5권'이라는 뜻이다. 지수적 성장 곡선에서 선행(heading)과 이력(being)의 차이가 곧 해석의 전부다.

**둘째, 총액(gross) 기장이다.** AWS·Google Cloud·Microsoft 경유 매출을 최종 고객 지출액 전액으로 계상하고 파트너 몫을 비용 처리한다. 깨끗한 넷 기준 구독 매출과는 다른 동물이다.

**셋째, 국내 브리핑에서 "Claude Code가 $23.5B 기여"로 확산된 수치는 교차확인에 실패했다.** 다수의 독립 소스(LinkedIn 실무자 인용, Quartz 요약, codeconductor 분석)가 확인하는 Claude Code 수치는 **$2.5B run-rate**(2026년 초 기준, 연초 대비 2배 이상 성장 중)다. $23.5B는 단일 추정치가 와전된 것으로 보이며, 본 리포트는 $2.5B+(성장세 감안 시 7~8월엔 $5~8B 추정)를 검증된 범위로 취급한다. 이런 구분이 "전문가 수준 이해"의 시작이다.

**오라클·IBM은 반례가 아니다.** 오라클 FY2026 매출 $67.4B 중 진짜 소프트웨어 라인은 $24.5B이고 오히려 1% 감소했다. 성장의 정체는 $34B 규모의 클라우드, 그 상당수가 AI 랩에 GPU를 임대하는 데이터센터 임대업이다. "AI 데이터센터 집주인에 데이터베이스가 붙어 있는 회사"라는 SaaStr의 표현이 정확하다. 이는 뒤에서 볼 투자 전달 경로에서 다시 중요해진다.

---

## 2. 심층 분석 1: 좌석에서 토큰으로 — 과금 단위의 패러다임 전환

소프트웨어 40년 역사의 과금 단위는 '사용자 수(좌석)'였다. Anthropic은 이걸 깼다. **토큰, 즉 처리된 작업량**으로 과금하며, 단 한 명의 개발자가 실제 코드베이스에 에이전트를 돌리는 소비량은 어떤 좌석 기반 요금제도 모델링하지 못한 수준이라는 게 SaaStr의 핵심 관찰이다.

여기서 시장이 재평가되고 있다. 공개 소프트웨어 기업들의 멀티플이 10년 최저권인 이유는 단순한 AI 테마 순환이 아니라, **역사상 가장 빠르게 스케일한 소프트웨어 회사가 좌석을 단 한 번도 팔지 않았기 때문**이다. 로그인 수로 세운 로드맵은 모두 '산출물로 돈을 받는 모델'과 경쟁하는 처지가 됐다.

기업 코딩 시장 점유율 데이터도 방향을 확인해준다. 기업 지출 기준 Claude의 코딩 점유율이 54%, OpenAI가 21%로 집계된다(mindstudio 트래킹). Claude Code는 GA 6개월 만에 $1B run-rate를 넘겼고(챗GPT보다 빠름), 2026년 초 $2.5B를 통과했다. 문서 작업(PDF·파워포인트·엑셀)으로 확장 중이며, 30만+ 기업 고객이 붙어 있다.

**핵심 통찰:** 좌석→토큰 전환은 B2B SaaS 전반에 대한 공격이지만, 그 칼날의 방향은 한 가지다 — "에이전트가 실제로 일을 끝내는가". 그리고 에이전트가 일을 끝내는 능력을 좌우하는 계층이 다음 절의 하니스다.

---

## 3. 심층 분석 2: SKILL.md 표준 전쟁 — Anthropic이 표준을 주고 시장을 가져간 전략

### 3.1 개방형 표준의 탄생

Anthropic 엔지니어링 블로그(원문 직독)의 설계 철학은 단순하다: **"스킬은 신입 사원 온보딩 가이드다"**. SKILL.md 하나짜리 폴더에 YAML 메타데이터(name·description)와 지침을 담고, 필요하면 스크립트·템플릿·참조 파일을 옆에 둔다. 기술적 핵심은 **점진적 공개(progressive disclosure) 3단 계층**이다.

1. 시스템 프롬프트에 전체 스킬의 이름·설명만 선행적재(수십~수백 토큰)
2. 작업 관련성 판단 시에만 SKILL.md 본문 로드
3. 본문이 참조하는 부속 파일(forms.md 등)은 실제 필요할 때만 탐색

이 구조가 토큰 경제학적으로 우아하다. 컨텍스트 윈도우를 낭비하지 않으면서 사실상 무한한 지식을 번들링할 수 있고, 결정론적 처리가 필요한 부분은 파이썬 스크립트로 위임한다(정렬을 토큰 생성으로 하는 것보다 코드 실행이 훨씬 싸다). **즉 스킬은 단순 프롬프트 조각이 아니라, 토큰 소비를 최적화하는 소비 기반 매출의 이윤 구조와 직결된 설계다.** 정렬을 코드로 하면 토큰이 절약되는데, 그러면 왜 매출이 늘어나는가? — 낮은 단가·높은 성공률이 사용 빈도를 폭발시키기 때문이다. 이것이 이번 사이클의 역설이자 엔진이다.

2025년 10월 기능 출시, 12월 18일 agentskills.io로 개방형 표준 공개. 이 전략적 선택의 결과가 지금의 생태계다.

### 3.2 승자는 누구인가 — agentskills.io가 보여주는 것

agentskills.io 공식 페이지(원문 직독)의 지원 클라이언트 목록이 사실상 승부를 기록하고 있다: **Claude Code/Claude, ChatGPT & Codex(OpenAI), Cursor, VS Code, GitHub Copilot, Gemini CLI, JetBrains Junie, OpenCode, OpenHands, Goose(Block), Amp, Letta** 등. "SKILL.md가 에이전트의 REST가 되고 있다"는 평이 과장으로 보이지 않는 단계다. 생태계 규모는 49만 개 이상의 스킬로 집계된다(Termdock 가이드).

더 흥미로운 것은 OpenAI의 행보다. GitHub에서 하루 수백 스타를 받던 **openai/skills 공식 카탈로그가 deprecated되고 openai/plugins 체계로 이전**됐다(README 원문 직독 확인). 스킬을 '플러그인'의 하위 요소로 감싸는 구조로 재편한 것인데, 두 가지 해석이 가능하다.

- **관대한 해석:** OpenAI도 SKILL.md 호환을 유지하면서(공식 문서가 agentskills.io 표준을 명시적으로 참조) 배포·신뢰·권한 계층을 플러그인으로 표준화하려는 것. 표준 전쟁이라기보다 분업.
- **냉정한 해석:** 표준의 심층(컨텍스트 계층)은 Anthropic이, 유통·거버넌스 계층은 OpenAI가 장악하려는 것. 클라이언트가 늘어날수록 '어떤 카탈로그에서 설치하느냐'가 '어떤 포맷이냐'만큼 중요해지므로, 카탈로그·인스톨러($skill-installer)를 쥔 쪽이 생태계의 관문 수익을 쥔다.

어느 쪽이든 개발자에게 결론은 같다: **스킬 저작물은 SKILL.md 표준을 준수하되, 배포 경로는 양 진영 모두 확보해야 한다.** 이것은 취향이 아니라 헤지다.

### 3.3 하니스 최적화의 산업화 — ECC가 증명한 것

이 생태계 위에서 '하니스 최적화' 자체가 하나의 산업이 됐다는 증거가 ECC(Everything Claude Code, affaan-m)다. 2026년 1월 오픈소스화 후 폭발적 성장(조회 시점 기준 수십만 스타, 일간 1,900+ 스타 폭주도 기록)을 했고, ECC 2.0.0은 **67개 에이전트, 271개 스킬, 보안 스캐너를 7개 코딩 하니스(Claude Code·Codex·Cursor·OpenCode 등)에 걸쳐 제공하는 '크로스-하니스 운영체제'**를 자칭한다. Claude Code를 1급 시티즌으로, Codex는 동기화 경로, Cursor 등은 어댑터로 지원하는 구조다.

동시에 "개발자 커뮤니티를 분열시킨다"는 비판도 있다(Medium 분석) — 하니스가 무거워지면 오히려 성능이 나빠진다는 반론, 그리고 271개 스킬 중 실제로 검증된 것은 얼마나 되는가라는 품질 문제다. 타당한 비판이다. 그러나 이 비판조차 '하니스 구성이 실력이다'라는 전제 위에서 벌어지는 내전이다. **경쟁의 축이 '어떤 모델'에서 '어떤 하니스'로 이동했다는 사실 자체는 부정할 수 없다.**

Anthropic 엔지니어링 블로그가 예고한 미래도 이 방향을 확정한다: "에이전트가 스스로 스킬을 생성·편집·평가하여 자기 행동 패턴을 재사용 가능한 역량으로 코드화하는 것" — 즉 하니스의 자가진화. 보안 경고(악성 스킬의 데이터 유출·프롬프트 인젝션 위험, 신뢰 소스만 설치)는 이 생태계의 어두운 면이자, 검증·오디트 계층의 비즈니스 기회다.

---

## 4. 심층 분석 3: $65B에서 코스피까지 — 전달 경로와 투자 함의

이 성장이 한국 투자자에게 닿는 경로는 짧아졌다.

**모델 회사 매출(run-rate) → 추론·학습 인프라 CAPEX → 파운드리·HBM·메모리 수주 → 국내 반도체 대형주 실적 → 코스피 밴드.**

국내 증권사들이 9월 코스피 밴드를 6,600~8,000(신한투자신탁 등)으로 제시하며 하방을 지탱하는 두 기둥으로 'AI 인프라 수요 견조'와 '반도체 대형주 자사주 매입'을 꼽은 것은 이 전달 경로의 직접 표현이다. 8월 22% 급락 후 3.4% 반등 국면에서 삼성전자·SK하이닉스 외국인 매수가 이어지고, AI 투자도 GPU 단일 종목에서 HBM·D램·낸드·저장 장치로 확산되는 흐름이 관측된다.

구조적 수요의 크기도 구체적이다. AI가 2030년까지 데이터센터 수요의 ~70%를 차지할 전망이고, 필요 누적 투자는 약 7조 달러, 미국 전력 수요는 24GW→166GW(2030년)로 늘어난다는 추정이 국내 리서치에도 인용된다. HBM 시장은 2030년 $100B(3배 이상 확대) 관측이 닛케이를 통해 유통 중이다. 오라클의 실체(GPU 임대 수익 $34B)가 보여주듯, 이 돈의 상당수가 'AI 데이터센터 집주인' 역할을 하는 인프라 기업으로 흐르고 있다.

**그러나 Red Team 관점의 리스크도 같은 리서치에 명시돼 있다.** 금리 상승(데이터센터 투자 비용 증가) → 하이퍼스케일러 CAPEX 부담 → 회사채 금리 상승 → 반도체 쏠림 해소 실패. 즉 이 전달 경로의 수신자(recipient)인 한국 반도체 주가는 미 금리 방향에 대한 레버리지드 베팅이기도 하다. 9월 8일 미 장 재개 직후 금리 재베팅이 시작되는 지금, 지수 베팅보다 밸류체인 개별 종목 + 자사주 매입 종목 관점이 우위다.

---

## 5. 시나리오 분석 (2026년 말 기준)

### Best Case (확률 ~25%)
Anthropic 연말 run-rate $90B 상단 도달 + Claude Code 연말 $10B+로 성장. SKILL.md 표준이 사실상 전 업계 디팩토가 되고 OpenAI plugins도 호환 유지. AI CAPEX는 금리 하락과 함께 가속 → HBM 수주 견조 → 코스피 밴드 상단(8,000) 터치. 하니스 도구 시장(ECC류)은 '개발자 OS'로 기업 라이선스 매출 구축.

### Base Case (확률 ~55%)
연말 run-rate $70~80B. 실제 연매출 $22~26B로 '탑5' 자리는 확보하나 '2위' 헤드라인은 과장임이 시간이 지나며 드러남. 스킬 생태계는 양진영 공존(SKILL.md 표준 + OpenAI 카탈로그 관문). 금리 불확실성 상존 속 반도체는 밴드 내 등락, 코스피 6,800~7,500. 하니스 최적화는 '전문가 실무 표준'으로 정착하나 단일 스타트업 독점은 없음.

### Worst Case (확률 ~20%)
run-rate 성장률 급감속(기업 AI 지출 소화 지연) + 금리 재상승 → AI CAPEX 축소 발표 → 전달 경로 역방향으로 작동(모델주 → 인프라 → 반도체 → 코스피 하단 6,600 테스트). 스킬 생태계 보안 사고(악성 스킬 대규모 유출)로 신뢰 위기. 좌석 기반 SaaS와 토큰 기반 AI 사이의 가격 전쟁이 양쪽 멀티플 동반 하락으로 귀결.

---

## 6. Master에게 미치는 영향과 액션 아이템

### 영향 진단
1. **자동화 사업(OpenClaw 스킬 자산화)은 정확히 흐름의 중심에 서 있다.** 스킬 자산 = 하니스 계층의 유일한 지분. 모델은 빌린다 하더라도 스킬·컨텍스트 구성은 자산으로 축적된다. 이것은 이제 감이 아니라 $65B 규모의 검증된 시장 방향이다.
2. **인디 게임 개발 생산성**: 하니스 최적화는 코딩 에이전트의 성공률·속도를 좌우한다. Godot/Rust 스택 워크플로를 스킬로 코드화하면 매 빌드마다 재사용되는 자산이 된다.
3. **투자 포트폴리오**: AI 서사의 실체(소비 기반 매출)와 포장(run-rate·gross 기장)을 구분하는 안목이 지금 수익률의 차이를 만든다. 특히 'Claude Code $23.5B'류의 검증 안 된 수치가 시장 정서를 움직일 때가 매도·매수의 기회다.

### 액션 아이템

**단기 (이번 주)**
- 워크스페이스 핵심 스킬(브리핑 파이프라인, 딥리서치 템플릿, 게임 빌드 파이프라인)을 SKILL.md 표준 준수 형태로 점검 — frontmatter(name·description) 최적화는 곧 트리거 정확도다.
- 9/8 미 장 재개 후 금리 방향 확인 전까지 반도체 신규 포지션 자제, 기존 물량 홀드.

**중기 (이번 달)**
- 스킬 이중 배포 실험: SKILL.md 표준 + openai/plugins 포맷 변환 스크립트 작성. 한 번 저작, 양쪽 배포가 '헤지'의 실체다.
- Claude Code $2.5B→추정 성장궤적 트래킹을 워크스페이스 브리핑 항목에 추가(모델 회사 실적 = 반도체 선행지).
- 신뢰 소스 검증 체계(스킬 오디트) 정착 — 악성 스킬 리스크는 하니스 확장의 유일한 구조적 위협.

**장기 (분기)**
- 하니스 자산의 외부화: 검증된 스킬 세트를 카탈로그 배포(agentskills 표준)로 전환해 유통 계층 지분 확보. 인디 게임 도메인 특화 스킬(Godot+itch.io+ASO)은 니치가 명확해 차별화 가능.
- AI CAPEX 전달 경로 기반의 반도체 개별 종목 관점 유지 — 지수 대신 밸류체인(HBM·저장·전력 인프라)과 자사주 매입 종목.

---

## 미스 김의 인사이트

- **스킬은 이제 '설정 파일'이 아니라 '지분'이다.** Anthropic이 표준을 무료로 연 순간 SKILL.md는 커머디티가 됐지만, 그 위에 올라가는 검증된 절차 자산은 희소해진다. 좌석 과금이 죽은 시장에서 '재사용 가능한 전문성의 코드화'만이 개인이 쥘 수 있는 하니스 지분이다.
- **run-rate 헤드라인은 무기다, 진실은 아니다.** $65B는 방향이고 $20~26B는 위치다. 이 둘을 구분 못 하는 시장 참여자가 생길 때마다 (과장 숫자에 흔들리는 변동성이 생기고) 검증하는 쪽에 기회가 생긴다. 오늘의 '$23.5B Claude Code' 정정이 바로 그 사례다.
- **표준 전쟁의 종착역은 포맷이 아니라 카탈로그다.** SKILL.md는 이미 이겼고(전 하니스 채택), 남은 전장은 $skill-installer와 배포 관문이다. 저작은 한 번, 배포는 양쪽 — 이것이 개발자의 정답 헤지다.

---

## 🔴 Red Team (본 리포트 자체에 대한)

- **공격 1 — 생태계 수치 과신:** "49만 스킬"·"스타 수"는 양적 지표일 뿐 품질·실사용 검증 아님. 표준 "승리" 선언은 생태계 초기의 착시일 수 있다.
- **공격 2 — 전달 경로의 단순화:** Anthropic 매출과 한국 반도체 주가 사이에는 수개월 시차와 경쟁(NVIDIA 생태계 내 재편)이 있음. 직결 서사는 과대포장 위험.
- **방어/완화:** 핵심 수치는 원문 직독 + 최소 2개 독립 소스 교차확인(불일치 수치는 명시적 정정), 시나리오에 확률 명시로 확신 수준 분리.
- **합의:** 🟡 위험수용 — 표준 전쟁의 종결 시점은 예측이 아니라 관찰 대상임을 본문에 명시함.
- Anti-rationalization 체크: Confidence Halo($65B 헤드라인 맹신 → run-rate/연매출 구분으로 방어), Tool Call Halu(브리핑의 $23.5B 수치 → 원문 대조로 기각), Authority Bias(Bloomberg/Reuters라도 공식·유출 출처 성격 구분 표기). ✅ Pass

---

## 참고 자료

1. [By Year-End, Anthropic Will Out-Earn Every Public Software Company Except Microsoft — SaaStr (원문 직독)](https://www.saastr.com/by-year-end-anthropic-will-out-earn-every-public-software-company-except-microsoft/)
2. [Anthropic revenue run rate tops $65 billion — Reuters](https://www.reuters.com/technology/anthropic-revenue-run-rate-tops-65-billion-source-says-2026-08-17/)
3. [Anthropic's Annualized Revenue Tops $65 Billion Before IPO — Bloomberg](https://www.bloomberg.com/news/articles/2026-08-17/anthropic-revenue-run-rate-surpasses-65-billion-ahead-of-ipo)
4. [Anthropic expands partnership with Google and Broadcom — Anthropic 공식 ($30B 공시)](https://www.anthropic.com/news/google-broadcom-partnership-compute)
5. [Equipping agents for the real world with Agent Skills — Anthropic Engineering (원문 직독)](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
6. [Agent Skills 개방형 표준 — agentskills.io (원문 직독)](https://agentskills.io)
7. [openai/skills — GitHub (README 원문 직독, deprecated → openai/plugins)](https://github.com/openai/skills)
8. [affaan-m/ECC — agent harness performance optimization](https://github.com/affaan-m/ecc)
9. [ECC Ships v2.0.0: A Cross-Harness Agent System — Augment Code](https://www.augmentcode.com/learn/ecc-v2-cross-harness-agent-system)
10. [The Agent Skills Ecosystem in 2026 — Agentman](https://agentman.ai/blog/agent-skills-ecosystem-report-2026)
11. [8 Data Points That Show How Fast Claude's Lead Is Growing — MindStudio](https://www.mindstudio.ai/blog/anthropic-beating-openai-claude-market-dominance-data-points)
12. [SKILL.md Is Becoming the REST of Agents — Medium/Automation Labs](https://medium.com/@automation.labs/skill-md-is-becoming-the-rest-of-agents-nobody-told-you-yet-f5de9a5859c3)
13. [9월 코스피 6600~8000 전망…반도체 자사주 매입이 하단 — 신한투자신탁/다음뉴스](https://v.daum.net/v/5zubbWQ9vg)
14. [코스피 1만 가능할까..AI 반도체 이익이 만든 재평가 시나리오 — 네이버 프리미엄(핀리트)](https://contents.premium.naver.com/finlit/wfpm/contents/260617091215175xp)
15. [AI 데이터센터가 반도체 시장 성장 견인 — 닛케이/G-enews](https://www.g-enews.com/article/Global-Biz/2025/01/2025011220001389940c8c1c064d_1)

---
*본 리포트는 2026-09-08 06:20 KST 기준, 총 15개 소스(원문 직독 4)를 기반으로 작성되었습니다. 수치는 원문 출처 성격(공식 공시/유출/추정)을 구분해 표기했습니다.*
