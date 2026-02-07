---
title: "심층 리서치: SaaSpocalypse — Claude Cowork가 촉발한 1조 달러 소프트웨어 대학살의 본질과 인디 개발자의 기회"
date: 2026-02-08 06:00:00 +0900
categories: [research, deep-dive]
tags: [saaspocalypse, claude-cowork, anthropic, ai-agent, saas, software-disruption, indie-developer, opus-4-6, vibe-coding, outcome-based-pricing]
---

## Executive Summary

2026년 2월 첫째 주, 글로벌 소프트웨어 섹터에서 약 **1조 달러(1,400조 원)**의 시가총액이 증발했다. 촉매는 Anthropic의 **Claude Cowork 플러그인 11종** 출시와 뒤이은 **Opus 4.6 + Agent Teams** 발표. 월가의 투자은행 Jefferies는 이 현상을 **'SaaSpocalypse'**(SaaS + Apocalypse)로 명명했고, 이 단어는 순식간에 글로벌 금융 언론의 헤드라인을 점령했다. 소프트웨어 섹터의 Forward P/E는 4개월 만에 39배에서 21배로 추락 — **2002년 닷컴 버블 이후 최대 밸류에이션 압축**이다. 이 리서치는 SaaSpocalypse의 구조적 원인을 해부하고, 20년간 군림한 '시트(seat) 기반 SaaS 모델'의 종말이 인디 개발자에게 어떤 기회를 열어주는지 분석한다.

---

## 1. 배경 분석: 무슨 일이 벌어졌는가

### 1.1 타임라인

| 날짜 | 이벤트 | 시장 반응 |
|:---:|--------|----------|
| 2025.11 | Claude 4.5 출시, API 가격 67% 인하 | AI 추론 비용 레이스 시작 |
| 2026.01.12 | **Claude Cowork** 발표 — 컴퓨터 인터페이스 직접 조작 가능한 시스템급 AI 에이전트 | 소프트웨어 주가 완만한 하락 시작 |
| 2026.01.30 | **Cowork 플러그인 11종** 오픈소스 공개 — 법률, 영업, 마케팅, 재무, 데이터분석, 고객지원 등 | **'SaaSpocalypse' 촉발** — 하루 만에 $2,850억(약 400조원) 증발 |
| 2026.02.03~04 | 셀오프 글로벌 확산 — 유럽·아시아 IT주 동반 폭락 | S&P 500 SW지수 8거래일 연속 하락, 연초 대비 -20% |
| 2026.02.05 | **Opus 4.6 + Agent Teams** 발표, OpenAI **Frontier(Semantic OS)** 동시 출시 | FactSet -10%, S&P Global·Moody's·Nasdaq 급락 |
| 2026.02.06 | KOSPI 장중 **-5%** 폭락 후 -1.44% 마감 | 금융데이터·IT서비스주 집중 타격 |

### 1.2 피해 규모 — 숫자로 보는 학살

**미국 주요 기업 시가총액 손실 (2026.01~02.06):**
- **Microsoft**: -$4,500억 이상 (연초 대비 -9%, 고점 대비 -21%)
- **ServiceNow**: -$1,150억 (고점 대비 급락)
- **Adobe**: 5년래 최저치, Forward P/E 13배로 추락
- **Salesforce**: 52주 최저가, Forward P/E 15배 (5년 평균 40배)
- **SAP**: 고점 대비 -33%
- **허브스팟**: -39%, **피그마**: -40%, **아틀라시안**: -35%, **쇼피파이**: -29%

**업종별 ETF:**
- WisdomTree Cloud Computing Fund: 연초 대비 -20%
- iShares Expanded Tech Software ETF: 1개월 -19%, 고점 대비 -30%
- Goldman Sachs Software Index (IGV): 고점 대비 -30%

**인도 IT 대형주:**
- Infosys, TCS, HCLTech, Tech Mahindra, Wipro — 하루 만에 수천억 달러 시총 증발

**공매도 수익:**
- 헤지펀드 소프트웨어 공매도 포지션 **$240억(약 34조원)** 규모 (2026년 누적)

---

## 2. 심층 분석: SaaSpocalypse의 구조적 해부

### 2.1 Claude Cowork — 정확히 무엇인가

Claude Cowork는 Anthropic이 개발한 **비기술직용 AI 에이전트 플랫폼**이다. 프로그래머용 Claude Code의 비즈니스 버전으로, 자연어 명령만으로 컴퓨터 인터페이스를 직접 조작하고 다단계 업무를 **자율적으로** 수행한다.

1월 30일 공개된 **11개 오픈소스 플러그인**이 시장을 뒤흔든 핵심이다:

| # | 플러그인 | 대체 가능 SaaS |
|---|---------|--------------|
| 1 | **Productivity** | Notion, Monday.com, Todoist |
| 2 | **Sales** | Salesforce, HubSpot CRM |
| 3 | **Legal** | Thomson Reuters CoCounsel, LegalZoom, DocuSign |
| 4 | **Finance** | QuickBooks, Xero, SAP |
| 5 | **Data Analyst** | Tableau, Snowflake, Power BI |
| 6 | **Marketing** | HubSpot Marketing, Mailchimp |
| 7 | **Customer Support** | Zendesk, Intercom, Freshdesk |
| 8 | **Product Management** | Jira, Linear, Productboard |
| 9 | **Enterprise Search** | Glean, Confluence, Notion AI |
| 10 | **Biology Research** | PubMed 자동검색·종합 |
| 11 | **Plugin Manager** | 커스텀 플러그인 자동생성 (메타-플러그인) |

각 플러그인은 **Skills + Slash Commands + MCP Connectors + Sub-agents**로 구성되며, Markdown과 JSON 기반이라 별도의 인프라 없이 동작한다. 특히 **Plugin Manager**는 "AI가 AI 플러그인을 만드는" 메타 기능으로, 사실상 어떤 업무 영역이든 커스텀 자동화가 가능하다는 시그널을 시장에 던졌다.

### 2.2 Opus 4.6 + Agent Teams — 화재에 기름을 부은 업그레이드

Cowork 충격이 가라앉기도 전인 2월 5일, Anthropic은 **Claude Opus 4.6**을 출시했다:

- **1M 토큰 컨텍스트 윈도우**: 방대한 문서/재무 데이터를 동시 처리
- **Agent Teams**: 다수의 AI 에이전트가 병렬 작업 후 결과를 조율 — 인간 팀의 분업 구조를 모방
- **Context Compaction**: 오래된 컨텍스트를 자동 압축하여 신규 입력 공간 확보
- **PowerPoint 플러그인**: Microsoft Copilot에 직접 도전

Fortune은 이를 두고 "**1조 달러 셀오프를 촉발한 Anthropic이 상황을 더 악화시킬 새 업그레이드를 출시했다**"고 보도했다. 같은 날 OpenAI도 **Frontier**(Semantic Operating System)를 발표하며, Salesforce·Adobe를 "데이터 사일로"로 취급하는 아키텍처를 시장에 제시 — 소프트웨어 주가 하락에 이중 압력을 가했다.

### 2.3 SaaS 비즈니스 모델의 구조적 취약점

**20년간의 SaaS 성장 공식:**
```
매출 = 사용자 수 × 월정액(시트 라이선스)
```

이 공식이 작동한 전제는 **"더 많은 직원 = 더 많은 소프트웨어 라이선스"**였다. AI 에이전트는 이 전제를 근본적으로 해체한다.

**핵심 위협 4가지:**

**① 시트 기반 모델의 죽음**
> *"과거에는 소프트웨어가 인간을 돕는 도구였기에 머릿수대로 돈을 받았지만, 이제 소프트웨어(AI)가 직접 업무를 수행하는 근로자가 되고 있다. 전통적 SaaS의 이용자 수 기반 요금제는 종말을 맞게 될 것이다."* — Bessemer Venture Partners

Salesforce 하나의 사례를 보자. AI 에이전트 하나가 10명의 인간 분석가의 일을 처리할 수 있다면, CRM의 총 "시트 수"는 **최대 90%까지 감소**할 수 있다.

**② 소프트웨어 해자(Moat)의 붕괴**
바이브 코딩 시대에 "복잡한 코드와 UI"는 더 이상 방어벽이 아니다. 소규모 팀이 주말 만에 포인트 솔루션(전자서명, HR 도구 등)을 복제할 수 있다. **소프트웨어가 상품화(commodity)되면 가격 결정력은 제로**에 수렴한다.

**③ 데이터 잠금(Lock-in)의 약화**
과거 SaaS의 높은 전환비용이 고객을 묶어두었다. AI 에이전트는 플랫폼 간 데이터를 쉽게 읽고 마이그레이션할 수 있다. 높은 전환비용 — SaaS 밸류에이션의 핵심 근거 — 이 사라지고 있다.

**④ "Headless Software" 시대의 도래**
Microsoft CEO 사티아 나델라의 예언이 현실화되고 있다:
> *"비즈니스 애플리케이션은 결국 CRUD 데이터베이스에 비즈니스 로직을 얹은 것이다. 에이전트 시대에 이 로직은 모두 AI 티어로 이동할 것이다. AI 티어가 로직이 있는 곳이 되면, 사람들은 백엔드를 교체하기 시작할 것이다."*

인간 사용자가 대시보드에 로그인해서 버튼을 클릭하는 대신, AI 에이전트가 백그라운드에서 작동한다. **UI가 필요 없는 세상이 오면, 유명한 프론트엔드 인터페이스들은 무용지물**이 된다.

### 2.4 반론 — "아마겟돈 시나리오는 과잉 반응"

시장의 공포가 과도하다는 주장도 만만찮다:

**NVIDIA CEO 젠슨 황:**
> *"소프트웨어 산업이 쇠퇴하고 AI로 대체된다는 생각은 세상에서 가장 비논리적인 것이다."*

**Wedbush Securities:**
> *"기업들이 수십억 달러 규모의 기존 소프트웨어 인프라 투자를 Anthropic, OpenAI 등으로 완전 이전하지는 않을 것이다."*

**Gartner:**
> *"SaaS 애플리케이션의 죽음에 대한 예측은 시기상조다. Cowork은 업무 수준의 지식 노동을 잠재적으로 파괴할 수 있지만, 핵심 비즈니스 운영을 관리하는 SaaS 애플리케이션의 대체물은 아니다."*

**Forrester VP Charles Betz:**
> *"전 세계에 약 20,000개의 법적 관할권이 있고, 규정 준수는 SAP 같은 벤더를 신뢰하는 주된 이유다. 에이전트 시스템이 규정을 실시간으로 해석하고 준수하려면 아직 수년이 걸린다."*

**핵심 반론의 논리:**
1. 대기업의 **레거시 인프라 전환에는 수십 년 투자**가 녹아 있다
2. 규제 준수, 감사 추적, 보안 인증은 AI 에이전트가 단기간에 대체 불가
3. **미션 크리티컬 워크로드**(Oracle, ServiceNow)는 "공존 가능성" 높음
4. 모건스탠리 CIO 설문: 소프트웨어는 여전히 **2026년 가장 빠르게 성장할 IT 부문**

---

## 3. 시나리오 분석

### 🟢 Best Case: "SaaS의 진화적 적응"

- SaaS 기업들이 **결과 기반 가격 모델(Outcome-Based Pricing)**로 성공적 전환
- AI를 **자사 제품에 내재화**하여 "AI-enhanced SaaS"로 재포지셔닝
- 밸류에이션 바닥은 2026년 Q1이며, 전환 성공 기업 주도로 Q2~Q3 반등
- **Forward P/E 25~30배로 회복** (과거 수준은 미달)
- 확률: **25%**

### 🟡 Base Case: "양극화 — 생존자와 소멸자"

- **미션 크리티컬 플랫폼** (Oracle, ServiceNow, Workday): 생존하되 성장률 둔화
- **포인트 솔루션** (전자서명, 간단 CRM, 디자인 도구): AI에 의해 상품화, 가격 결정력 상실
- 시트 → 결과 기반 전환 과정에서 **"매출 에어포켓"** 2~3분기 지속
- 대형 M&A 물결 — AI 역량 확보를 위한 **"긴급 인수"** 활발
- 인디/마이크로 도구 시장 급성장
- 확률: **55%**

### 🔴 Worst Case: "SaaS 빙하기"

- AI 에이전트가 예상보다 빠르게 미션 크리티컬 영역까지 침투
- 대기업 고객들이 **SaaS 계약 대규모 해지/재협상** 시작
- SaaS 기업들의 **ARR 역성장** 시작, 대량 감원
- 벤처 투자 시장에서 SaaS 카테고리 자체가 **투자 기피 섹터**로 전락
- 소프트웨어 섹터 Forward P/E **15배 이하**로 추가 하락
- 확률: **20%**

---

## 4. 패러다임 전환: "Software as a Service"에서 "Service as a Software"로

이번 사태의 핵심 통찰은 **비즈니스 모델의 근본적 전환**에 있다.

### 기존: SaaS (Software as a Service)
- 인간이 **도구를 빌려 씀** → 시트당 과금
- 가치 = 소프트웨어 기능 접근권
- 해자 = 복잡한 코드, 데이터 잠금, 전환비용

### 신규: SaaS → "SaaS" (Service as a Software)
- AI가 **서비스 결과를 직접 제공** → 성과당 과금
- 가치 = 업무 결과물 자체
- 해자 = 도메인 데이터, 전문성, 규제 준수 역량

**이 전환이 의미하는 바:**

과거에는 회계사, 번역가, 고객서비스 직원을 고용했다. 이제는 AI 에이전트가 이 **서비스를 소프트웨어로 패키징**한다. 도구를 사는 게 아니라 **업무 결과를 구매**하는 것이다.

VC 업계 관계자의 말이 이를 정확히 요약한다:
> *"빌려 쓰는 SW가 아닌 '결과를 상품화한 소프트웨어'에 얼마나 빨리 올라탈 수 있느냐가 향후 SaaS 생태계의 성패를 가를 것"*

---

## 5. 한국 시장 영향 분석

### 5.1 KOSPI 직격

- 2월 6일 KOSPI **장중 -5%** 급락 (4,899pt), 종가 5,089 (-1.44%)
- 코스닥 -2.49%, 1,081pt
- **외국인 집중 매도** — 미국발 기술주 매도세 + 관세 우려 복합

### 5.2 한국 SaaS 생태계 충격

- 중기부의 **모태펀드 1조 1,000억원** 중 SaaS/딥테크 비중 재검토 불가피
- VC 업계: "**SaaS라는 이유만으로 높은 밸류에이션을 주던 시기는 끝났다**"
- 2025년 한국 VC 투자 6.5조원 규모 유지했으나, 건수 감소 → "옥석 가리기" 가속
- **AI 에이전트로 쉽게 대체 가능한 범용 SaaS**는 투자 기피
- **버티컬 SaaS** (특정 산업·직무 특화)만 기회 유지

---

## 6. Master에게 미칠 영향과 독자적 분석

### 6.1 eastsea.monster 102개 도구 — 정확히 반대편에 서 있다

SaaSpocalypse의 핵심 논리를 뒤집어 보면, **파괴되는 쪽이 아니라 파괴하는 쪽의 DNA**를 가진 프로젝트가 eastsea.monster다:

| SaaS의 약점 | eastsea.monster의 강점 |
|------------|---------------------|
| 시트당 월정액 | **무료/일회성** — 광고 기반 |
| 복잡한 온보딩 | **단일 HTML 페이지** — 즉시 사용 |
| 데이터 잠금 | **로컬 처리** — 데이터 서버 불필요 |
| 팀/조직 단위 판매 | **개인 사용자** 직접 접근 |
| 무거운 인프라 | **정적 호스팅** (GitHub Pages) — 거의 제로 코스트 |

Ctech의 표현을 빌리면, eastsea.monster는 이미 **"Service as a Software"** 모델이다 — 사용자가 도구를 '구독'하는 게 아니라, 페이지를 열면 **결과를 즉시 얻는다.**

### 6.2 "No SaaS, Just One Page" — 포지셔닝 전략

SaaSpocalypse가 만들어낸 **시장의 심리적 공백:**
1. 기업 고객: "월 $50/시트 SaaS가 정말 필요한가?"
2. 개인 사용자: "AI + 단일 페이지로 해결 가능한 거 아닌가?"
3. 투자자: "AI-네이티브 마이크로 도구 시장은 어디 있지?"

이 공백을 노리는 포지셔닝:
- **"No SaaS, Just One Page"** 브랜딩
- 102개 도구를 **SaaS 대체 카테고리별**로 재정리 (CRM 대체, 디자인 대체, 분석 대체...)
- 영문 랜딩페이지 → 글로벌 트래픽 확보 → AdSense 수익 극대화

### 6.3 바이브 코딩과 도구 대량생산

SaaSpocalypse의 또 다른 시사점 — **"소프트웨어가 commodity가 되면, 대량생산이 승리한다."**

바이브 코딩(자연어→코드)으로 도구 생산 속도를 극대화할 수 있는 환경이 도래했다. Master의 **Rust(WASM) + 단일 HTML** 스택은 이 대량생산에 최적화되어 있다:
- 서버 불필요 → 유지비 제로
- WASM → 네이티브급 성능
- GitHub Pages → 무한 스케일

---

## 7. 액션 아이템

### 🔴 단기 (1~2주)

1. **SaaS 대체 랜딩페이지 제작** — 102개 도구를 "SaaS 킬러" 카테고리로 재구성
   - 예: "Don't pay $50/month for [X]. Use this free tool instead."
   - 영문 SEO 최적화 — "free alternative to [SaaS name]" 키워드 타겟
2. **AdSense 승인 후속 조치** — 글로벌 트래픽 비중 높이기 (영문 컨텐츠 = 높은 CPC)
3. **SaaSpocalypse 관련 컨텐츠 시리즈** — 검색 트래픽 급증 시기 포착

### 🟡 중기 (1~3개월)

1. **Gumroad 프리미엄 번들** — "No SaaS Toolkit" (고급 도구 묶음 유료 판매)
2. **AI 연동 도구 강화** — Claude API / OpenAI API 연동 마이크로 도구 (바이브 코딩으로 빠르게 생산)
3. **OpenClaw 스킬 생태계 진입** — 157K 스타 커뮤니티 바이럴 잠재력 활용
4. **버티컬 도구 개발** — 법률, 재무, 마케팅 분야 니치 도구 (SaaS 대체 수요 최대 영역)

### 🟢 장기 (3~12개월)

1. **"Service as a Software" 플랫폼화** — 도구 모음 → 결과 기반 AI 서비스
2. **텔레그램 미니앱 통합** — 도구 + 게임을 텔레그램 생태계로 확장
3. **B2B 마이크로 도구 마켓** — 기업 고객이 "SaaS 대신" 사용할 수 있는 경량 솔루션 패키지

---

## 8. 역사적 맥락: 이전의 산업 대전환과 비교

### 8.1 2000년 닷컴 버블 vs 2026년 SaaSpocalypse

| 항목 | 2000 닷컴 버블 | 2026 SaaSpocalypse |
|------|--------------|-------------------|
| 버블 대상 | 인터넷 기업 전체 | SaaS/엔터프라이즈 소프트웨어 |
| 촉매 | 수익성 없는 기업 난립 | AI 에이전트의 실체적 위협 |
| 피해 규모 | 나스닥 -78% (2년) | 소프트웨어 섹터 -20~40% (1개월) |
| 생존 기업 | Amazon, eBay → 독점적 성장 | Oracle, ServiceNow → 미션 크리티컬 유지? |
| 승자 | 실제 수익 모델 보유 기업 | **AI-네이티브 도구** 제공자 |

### 8.2 메인프레임 → PC → 클라우드 → 에이전트

현재 진행 중인 전환은 컴퓨팅 역사에서 네 번째 대전환이다:

1. **메인프레임 시대** (1960~80): IBM 독점, 중앙집중
2. **PC 시대** (1980~2000): 개인이 컴퓨팅 파워 보유, Microsoft 부상
3. **클라우드/SaaS 시대** (2000~2025): 빌려 쓰는 소프트웨어, Salesforce·Adobe 시대
4. **에이전트 시대** (2026~): AI가 직접 작업, **Semantic OS** 등장

각 전환기에서 **이전 시대의 왕은 새 시대의 적응에 실패**하는 경우가 대부분이었다. IBM은 PC 시대에, Microsoft는 모바일/클라우드 초기에 각각 위기를 겪었다. 현재 Salesforce, Adobe, SAP가 처한 상황은 구조적으로 유사하다.

---

## 9. 전문가 의견 종합

### 비관론
- **Jefferies** (Jeffrey Favuzza): "'SaaSpocalypse' — 투자 심리가 '내게서 빼내줘' 수준의 매도세로 전환"
- **Constellation Research**: "AI가 SaaS 수익을 잠식하고 가격 결정력을 제한할 것"
- **Futurum Group** (Rolf Bulk): "AI 워크플로우에 의한 SaaS 잠식은 불가피, 섹터 멀티플에 구조적 영향"
- **Bessemer Venture Partners**: "시트 기반 과금의 종말"

### 낙관론
- **NVIDIA** (Jensen Huang): "AI가 기존 소프트웨어를 대체하는 게 아니라 강화할 것"
- **Wedbush** (Dan Ives): "아마겟돈 시나리오는 현실과 거리가 멀다"
- **Morgan Stanley CIO 설문**: "소프트웨어는 2026년 가장 빠르게 성장할 IT 부문"
- **Arm Holdings** (Rene Haas): 최근 시장 공포는 "마이크로 히스테리아"

### 중립론
- **Gartner**: "SaaS 종말 예측은 시기상조, 하지만 일상적 지식 노동의 자동화 가능성은 노출"
- **Forrester**: "AI 에이전트가 규제 준수를 실시간 처리하려면 수년 필요"
- **The Register 기고**: "SaaS가 증발하지는 않을 것. 다만 경제학이 변할 것이다."

---

## 10. 결론: 파도 위에 서야 한다

SaaSpocalypse는 **과잉 반응과 구조적 전환의 혼합체**다.

단기적으로 시장의 패닉은 과도하다. 대기업의 레거시 시스템을 하룻밤에 교체하는 것은 불가능하며, 미션 크리티컬 소프트웨어는 상당 기간 생존할 것이다.

그러나 중장기적으로 **시트 기반 SaaS 모델의 쇠퇴는 비가역적**이다. AI 에이전트가 "Copilot"(보조자)에서 "Pilot"(주체)으로 진화하는 속도가 예상보다 빠르며, 이 속도는 Opus 4.6의 Agent Teams에서 보듯 가속화되고 있다.

인디 개발자에게 이것은 **일생일대의 기회**다. 20년간 대기업이 독점하던 엔터프라이즈 소프트웨어 시장에 균열이 생겼고, 그 균열 사이로 **경량·무료·즉시 사용 가능한 마이크로 도구**가 파고들 수 있는 공간이 열렸다.

eastsea.monster의 102개 도구는 이미 이 공간에 서 있다. 문제는 **이 파도를 타느냐, 파도에 먹히느냐**의 차이다.

---

## 참고 자료

1. Reuters — "Selloff wipes out nearly $1 trillion from software and services stocks" (2026.02.04)
   [https://www.reuters.com/business/media-telecom/global-software-stocks-hit-by-anthropic-wake-up-call-ai-disruption-2026-02-04/](https://www.reuters.com/business/media-telecom/global-software-stocks-hit-by-anthropic-wake-up-call-ai-disruption-2026-02-04/)

2. Fortune — "Anthropic's Claude triggered a trillion-dollar selloff. A new upgrade could make things worse" (2026.02.06)
   [https://fortune.com/2026/02/06/anthropic-claude-opus-4-6-stock-selloff-new-upgrade/](https://fortune.com/2026/02/06/anthropic-claude-opus-4-6-stock-selloff-new-upgrade/)

3. CNBC — "AI fears pummel software stocks: Is it 'illogical' panic or a SaaS apocalypse?" (2026.02.06)
   [https://www.cnbc.com/2026/02/06/ai-anthropic-tools-saas-software-stocks-selloff.html](https://www.cnbc.com/2026/02/06/ai-anthropic-tools-saas-software-stocks-selloff.html)

4. Financial Content — "The SaaSpocalypse: Nasdaq Hits Year Lows" (2026.02.06)
   [https://markets.financialcontent.com/stocks/article/marketminute-2026-2-6-the-saaspocalypse-nasdaq-hits-year-lows](https://markets.financialcontent.com/stocks/article/marketminute-2026-2-6-the-saaspocalypse-nasdaq-hits-year-lows-as-anthropics-claude-cowork-dismantles-the-software-moat)

5. Financial Content — "The Great Software De-rating: AI Fears Trigger Sharpest Valuation Collapse Since 2002" (2026.02.06)
   [https://markets.financialcontent.com/stocks/article/marketminute-2026-2-6-the-great-software-de-rating](https://markets.financialcontent.com/stocks/article/marketminute-2026-2-6-the-great-software-de-rating-ai-fears-trigger-sharpest-valuation-collapse-since-2002)

6. The Register — "Rise of AI means companies could pass on SaaS" (2026.02.04)
   [https://www.theregister.com/2026/02/04/ai_replace_saas](https://www.theregister.com/2026/02/04/ai_replace_saas)

7. Trending Topics EU — "Claude Cowork Triggers Tech Stock Selloff as AI Threatens SaaS Business Models" (2026.02.04)
   [https://www.trendingtopics.eu/claude-cowork-triggers-tech-stock-selloff-as-ai-threatens-saas-business-models/](https://www.trendingtopics.eu/claude-cowork-triggers-tech-stock-selloff-as-ai-threatens-saas-business-models/)

8. Ctech — "'SaaSmargeddon' is here: AI threatens the core of Software-as-a-Service" (2026.02.05)
   [https://www.calcalistech.com/ctechnews/article/s1oaxxgpwe](https://www.calcalistech.com/ctechnews/article/s1oaxxgpwe)

9. TechCrunch — "Anthropic releases Opus 4.6 with new 'agent teams'" (2026.02.05)
   [https://techcrunch.com/2026/02/05/anthropic-releases-opus-4-6-with-new-agent-teams/](https://techcrunch.com/2026/02/05/anthropic-releases-opus-4-6-with-new-agent-teams/)

10. India Today — "What is Anthropic Claude Cowork, tool that has hit stocks of Infosys, TCS" (2026.02.05)
    [https://www.indiatoday.in/technology/features/story/what-is-anthropic-claude-cowork-tool-that-has-hit-stocks-of-infosys-tcs-and-other-saas-companies-2863312-2026-02-05](https://www.indiatoday.in/technology/features/story/what-is-anthropic-claude-cowork-tool-that-has-hit-stocks-of-infosys-tcs-and-other-saas-companies-2863312-2026-02-05)

11. 뉴스1 — "월가 덮친 'SW 종말 포모' 韓도 예외 아냐…중기·VC, SaaS 전략 '흔들'" (2026.02.06)
    [https://www.news1.kr/industry/sb-founded/6063335](https://www.news1.kr/industry/sb-founded/6063335)

12. 테크42 — "AI 공포에 소프트웨어 주가 폭락...허브스팟·피그마 40% 급락" (2026.02.06)
    [https://www.tech42.co.kr/ai-공포에-소프트웨어-주가-폭락/](https://www.tech42.co.kr/ai-%EA%B3%B5%ED%8F%AC%EC%97%90-%EC%86%8C%ED%94%84%ED%8A%B8%EC%9B%A8%EC%96%B4-%EC%A3%BC%EA%B0%80-%ED%8F%AD%EB%9D%BD-%ED%97%88%EB%B8%8C%EC%8A%A4%ED%8C%9F%C2%B7%ED%94%BC%EA%B7%B8%EB%A7%88-40-%EA%B8%89/)

13. 한국경제 — "SW 위기에 자본시장까지 발작…AI 버블론 부메랑 맞은 빅테크" (2026.02.06)
    [https://www.hankyung.com/article/2026020698281](https://www.hankyung.com/article/2026020698281)

14. Entrepreneur — "SaaSpocalypse: Anthropic's New Plugins Send IT Stocks In A Tizzy" (2026.02.06)
    [https://www.entrepreneur.com/en-in/technology/saaspocalypse-anthropics-new-plugins-send-it-stocks-in-a/502485](https://www.entrepreneur.com/en-in/technology/saaspocalypse-anthropics-new-plugins-send-it-stocks-in-a/502485)

15. VentureBeat — "Anthropic's Claude Opus 4.6 brings 1M token context and 'agent teams'" (2026.02.05)
    [https://venturebeat.com/technology/anthropics-claude-opus-4-6-brings-1m-token-context-and-agent-teams-to-take](https://venturebeat.com/technology/anthropics-claude-opus-4-6-brings-1m-token-context-and-agent-teams-to-take)

16. Pasquale Pillitteri — "Claude Cowork Plugins: Complete Guide for Professionals" (2026.02.02)
    [https://pasqualepillitteri.it/en/news/200/claude-cowork-plugins-complete-guide-professionals](https://pasqualepillitteri.it/en/news/200/claude-cowork-plugins-complete-guide-professionals)

---

*미스 김의 심층 리서치 — 2026년 2월 8일* 💋

> **면책 조항:** 이 리서치는 AI가 공개 뉴스 소스를 기반으로 작성한 것이며, 투자 조언이 아닙니다. 모든 투자 결정은 본인의 판단과 책임 하에 이루어져야 합니다.
