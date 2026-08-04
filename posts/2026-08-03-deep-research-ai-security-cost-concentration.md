---
title: "AI는 이제 보안과 비용, 집중 리스크로 판정된다"
date: 2026-08-03
categories: [research, deep-dive]
tags: [ai, security, copilot, kospi, bitcoin, governance, semiconductors]
---

# AI는 이제 보안과 비용, 집중 리스크로 판정된다

## Executive Summary
- 오늘 브리핑의 공통분모는 성능 경쟁이 아니라 운영 규율입니다. AI, 시장, 암호자산 모두 "얼마나 똑똑한가"보다 "얼마나 통제 가능한가"로 재평가받고 있습니다.
- 백악관의 AI 보안 프레임워크와 Open Secure AI Alliance는 모델의 순수 성능보다 검증, 추적, 감사 가능성이 시장 진입 조건이 되고 있음을 보여줍니다.
- GitHub Copilot의 사용량 과금 전환은 AI가 더 이상 구독형 소프트웨어가 아니라 계량 가능한 인프라 비용이라는 사실을 분명히 합니다.
- KOSPI와 비트코인 사례는 좋은 내러티브와 실제 손익이 다를 수 있음을 다시 확인시킵니다. 집중과 레버리지, 그리고 복구 불가능한 보안 결함은 결국 가격을 무너뜨립니다.

## 이번 브리핑에서 뽑아낸 심층 주제
1. AI 보안 표준화와 사고 공개의 의무화
2. Copilot 사용량 과금과 AI 예산 통제
3. KOSPI 반도체 집중과 변동성
4. 비트코인 custody와 기업 재무의 분리

이 네 가지는 서로 따로 놀지 않습니다. 공통 질문은 하나입니다. 누가 시스템을 보고 있고, 누가 비용을 내고, 누가 실패 시 책임을 지는가입니다.

## 핵심 아이템 12개
**[01]** 백악관은 AI 모델의 사이버 능력을 분류형 벤치마킹으로 보고, 개발사와의 자발적 프레임워크를 사실상 기준선으로 만들고 있습니다.
**[02]** 공개 전 30일 수준의 조기 접근은 안전 검증을 제도화하지만, 명시적 허가제는 만들지 않습니다.
**[03]** Linux Foundation과 NVIDIA는 열린 모델, 열린 가중치, 열린 하네스가 보안의 전제라고 못 박습니다.
**[04]** Hugging Face 사고는 공개 모델보다 내부 데이터셋과 자격 증명이 먼저 위험해진다는 점을 보여줍니다.
**[05]** GitHub Copilot은 전 플랜이 사용량 기반 과금으로 바뀌었고, AI 크레딧이 비용의 기본 단위가 되었습니다.
**[06]** 조직 단위가 아니라 사용자별 예산과 사용량 경보를 걸지 않으면 헤비 유저가 풀 전체를 먼저 소진할 수 있습니다.
**[07]** Copilot 코드 리뷰는 AI 크레딧에 더해 GitHub Actions 분까지 소비해, 생산성과 비용이 동시에 움직입니다.
**[08]** KOSPI는 실적이 좋아도 지수 구조가 너무 좁아 변동성이 커지고, 레버리지 ETF가 그 진폭을 키웠습니다.
**[09]** 삼성전자와 SK하이닉스의 실적은 강하지만, 주가는 설비투자와 중국 경쟁 우려를 더 민감하게 반영하고 있습니다.
**[10]** 골드만삭스는 KOSPI를 약 7배 선행 PER로 보며 여전히 저평가 구간이라고 봅니다.
**[11]** Coldcard 사고는 펌웨어 업데이트가 기존 시드를 자동 복구해 주지 않으며, 엔트로피 생성 자체가 핵심 리스크임을 보여줍니다.
**[12]** Strategy는 비트코인을 영구 보유 자산이 아니라 USD Reserve와 배당 방어를 위한 유동성 수단으로 쓰고 있습니다.

## 배경 분석
AI가 빠르게 퍼질수록 시장은 모델 능력보다 운영 체계를 먼저 봅니다. 왜냐하면 AI는 이제 실험실의 장난감이 아니라, 코드 작성, 보안 검토, 자산 운용, 고객 대응, 인프라 제어까지 건드리는 실전 도구가 되었기 때문입니다. 실전 도구는 멋져 보이는 데서 끝나지 않습니다. 추적 가능해야 하고, 감사 가능해야 하며, 비용이 예측 가능해야 합니다.

같은 흐름이 시장에도 보입니다. 반도체 주도 랠리는 실제 실적이 받치고 있지만, 그 실적이 지수 전체의 안정성을 보장하지는 않습니다. KOSPI는 구조적으로 몇 개 종목과 몇 개 내러티브에 과도하게 묶여 있습니다. 비트코인도 마찬가지입니다. 가격이 좋아 보여도 보관 체계가 허술하면 자산은 자산이 아닙니다.

이번 브리핑은 결국 하나의 방향을 가리킵니다. "좋은 이야기"가 아니라 "운영 가능한 이야기"만 오래 갑니다.

## 심층 분석 1: AI 보안은 이제 규범과 감사의 문제입니다
백악관은 AI 혁신과 보안을 함께 끌고 가는 방향으로 움직이고 있습니다. 핵심은 세 가지입니다. 첫째, 고급 AI 모델의 사이버 능력을 평가하는 분류형 벤치마킹 과정. 둘째, 개발사와 정부가 협력하는 자발적 프레임워크. 셋째, 공개 전에 제한된 기간 동안 신뢰할 수 있는 파트너와 먼저 검증하는 구조입니다. 다만 이 체계는 명시적으로 강제 허가제나 사전 승인제를 만들지 않는다고 못 박고 있습니다. 즉, 법적 강제보다 사실상의 기준선 형성에 가깝습니다.  
근거: [백악관 행정명령](https://www.whitehouse.gov/presidential-actions/2026/06/promoting-advanced-artificial-intelligence-innovation-and-security/), [백악관 팩트시트](https://www.whitehouse.gov/fact-sheets/2026/06/fact-sheet-president-donald-j-trump-promotes-advanced-artificial-intelligence-innovation-and-security/)

여기서 더 중요한 것은 Open Secure AI Alliance입니다. NVIDIA와 Linux Foundation은 열린 모델, 열린 가중치, 열린 에이전트 하네스가 보안의 전제라고 주장합니다. 이유는 단순합니다. 공격자가 AI를 쓰는 시대에는 방어자도 동급의 관찰 가능성과 재현 가능성을 가져야 하기 때문입니다. 닫힌 상자 안에서만 돌아가는 안전성은 이제 방어 논리가 약합니다. 보안은 더 이상 "보여주지 않는 것"이 아니라 "보여주고 고칠 수 있는 것"으로 옮겨갑니다.  
근거: [NVIDIA 발표](https://blogs.nvidia.com/blog/open-secure-ai-alliance/), [Linux Foundation 해설](https://www.linuxfoundation.org/blog/open-models-and-open-weights-are-foundational-to-secure-ai)

이 논리를 현실로 끌어내린 사례가 Hugging Face의 보안 사고입니다. Hugging Face는 제한된 내부 데이터셋과 자격 증명에 대한 무단 접근이 있었음을 인정했고, 공개 모델과 공개 데이터셋, 스페이스에는 훼손 징후가 없다고 밝혔습니다. 중요한 포인트는 사고의 존재 자체보다, 무엇이 노출됐고 무엇이 지켜졌는지를 구분해 공개했다는 점입니다. AI 인시던트는 이제 단순한 해킹 뉴스가 아니라 공급망, 자격 증명, 모델 접근, 공개 범위를 함께 보는 운영 사건입니다.  
근거: [Hugging Face 사고 공개](https://huggingface.co/blog/security-incident-july-2026)

### 시나리오
Best: 공개 벤치마크, 사고 보고, 추적 가능한 에이전트 하네스가 업계 표준이 됩니다. 보안이 늦은 조직은 조달에서 탈락하고, 보안이 빠른 조직이 신뢰를 가져갑니다.  
Base: 강제 규제는 아니지만, 대기업과 정부 조달 시장에서 사실상의 표준이 굳어집니다. "보안 문서가 있는 모델"과 "없는 모델"의 가격 차이가 생깁니다.  
Worst: 표준이 국가별로 갈라지고, 사고 공개가 늦어지면서 AI 도입이 법무·보안 검토 때문에 지연됩니다. 이 경우 기술 우위보다 규제 대응력이 먼저 경쟁력이 됩니다.

## 심층 분석 2: Copilot은 이제 생산성 도구가 아니라 계량형 인프라입니다
GitHub는 Copilot 전 플랜을 사용량 기반 과금으로 전환했습니다. 조직과 기업용 Copilot 사용은 AI 크레딧으로 계량되며, 코드 리뷰는 AI 크레딧뿐 아니라 GitHub Actions 분까지 소모합니다. 관리자는 사용자별 예산을 두어 전체 풀을 통제할 수 있고, 대시보드는 이번 과금 주기 동안 실제로 얼마나 사용했는지도 보여줍니다. 문서상으로는 AI 크레딧 1개가 0.01달러에 해당하며, 예산은 사용자, 조직, 비용 센터, 기업 단위로 겹쳐서 관리됩니다.  
근거: [GitHub 블로그](https://github.blog/news-insights/company-news/github-copilot-is-moving-to-usage-based-billing/), [GitHub 변경 로그](https://github.blog/changelog/2026-06-01-updates-to-github-copilot-billing-and-plans/), [GitHub 사용량 표시 변경](https://github.blog/changelog/2026-07-20-copilot-users-can-now-see-ai-credits-used-per-billing-cycle/), [GitHub 문서](https://docs.github.com/en/copilot/concepts/billing), [예산 제어 문서](https://docs.github.com/en/copilot/concepts/billing/budgets-for-usage-based-billing)

이 변화가 중요한 이유는 매우 실무적입니다. 예전에는 Copilot이 사람 한 명당 좌석 하나의 문제였다면, 지금은 에이전트 세션 하나가 예산을 통째로 먹어버릴 수 있는 문제입니다. GitHub도 이를 알고 있기 때문에, 개별 사용량이 아니라 조직의 전체 풀과 예산 제어를 전면에 세웁니다. 특히 2026년 6월 1일 이후 사용량 기반 과금이 활성화됐고, 2026년 8월 현재는 전환기의 관성 때문에 잘 안 보이던 비용이 점점 드러나는 구간입니다. 9월 1일 이후에는 프로모션 구간이 끝나기 때문에, 지금이 실제 베이스라인을 잡을 마지막 시간대에 가깝습니다.  
근거: [예산 시작 가이드](https://docs.github.com/en/copilot/tutorials/budgets/getting-started-with-budget-controls)

이건 단순한 가격 정책이 아닙니다. AI 코딩의 생산성은 이제 "더 많이 쓰면 더 좋다"가 아니라 "누가 얼마를 쓰는지 통제할 수 있느냐"로 판정됩니다. 팀이 에이전트형 워크플로를 본격 도입할수록, 개발 비용은 인건비와 별개로 AI 크레딧, Actions 분, 모델 선택 비용으로 쪼개집니다. 즉, Copilot은 생산성 도구이면서 동시에 새로운 COGS 항목입니다.

### 시나리오
Best: 사용량 대시보드와 예산 경보가 정착되고, 팀은 높은 생산성 대비 낮은 비용 구조를 만듭니다. AI 도구는 실제 수익성 개선으로 이어집니다.  
Base: 사용량은 늘지만 관리가 뒤따르지 않아 일부 팀에서 비용 급증이 발생합니다. 생산성 향상은 있지만, 회계적으로는 추가 관리 비용이 붙습니다.  
Worst: 예산 제어 없이 에이전트 세션이 확산되면서 소수의 헤비 유저가 전체 풀을 소진합니다. AI는 도입됐지만, 남는 것은 청구서와 통제 실패입니다.

## 심층 분석 3: KOSPI는 좋아 보이는 실적과 불안한 구조가 동시에 보입니다
골드만삭스는 한국 증시에 대해 강한 낙관을 유지합니다. 12개월 KOSPI 목표치를 9,000으로 올렸고, 반도체 메모리 슈퍼사이클과 장기 공급 계약, 밸류업 프로그램 진전을 근거로 들었습니다. 같은 보고서에서 KOSPI는 약 7배의 선행 PER로 거래돼 여전히 싸다고 봅니다. 다만 이 낙관은 "기업 이익"에 대한 것이지, "지수의 안정성"에 대한 것은 아닙니다.  
근거: [Goldman Sachs KOSPI 전망](https://www.goldmansachs.com/insights/articles/koreas-stock-market-is-forecast-to-set-fresh-highs)

실적만 보면 삼성전자와 SK하이닉스는 분명 강합니다. AP는 삼성전자의 2분기 영업이익이 89.5조 원, 매출이 171.5조 원으로 사상 최대라고 전했고, SK하이닉스도 기록적인 매출을 냈다고 보도했습니다. 동시에 두 회사의 주가는 급락했습니다. 이유는 간단합니다. 시장은 실적의 현재값이 아니라, 앞으로 그 실적이 얼마나 오래 유지될지, 그 과정에서 얼마나 많은 설비투자가 필요한지를 함께 보기 때문입니다.  
근거: [AP 삼성 실적 보도](https://apnews.com/article/samsung-ai-profit-memory-chips-10c2c548a392988862d8c7bd3f6fae05)

문제는 지수 구조입니다. 최근 KOSPI는 5% 이상 급락했다가 18% 반등하는 등 극단적인 진폭을 보였고, 시장은 레버리지 ETF와 반도체 집중에 크게 흔들렸습니다. BI는 삼성전자와 SK하이닉스가 지수의 절반 이상을 차지하고, 레버리지 상품이 하락을 증폭시켰다고 짚었습니다. ET는 KOSPI가 33% 이상 고점 대비 밀렸다고 전했습니다. 이건 개별 기업의 문제가 아니라, 지수의 집중도와 투자자의 레버리지 구조가 함께 만든 문제입니다.  
근거: [Business Insider KOSPI 변동성](https://www.businessinsider.com/kospi-stock-index-sk-hynix-situational-awareness-leopold-aschenbrenner-leverage-2026-8), [Business Insider 반도체 급락](https://www.businessinsider.com/stock-market-today-chip-memory-selloff-south-korea-kospi-index-2026-7), [ET KOSPI 기사](https://economictimes.indiatimes.com/markets/us-stocks/news/kospi-slumps-5-after-record-breaking-18-surge-whats-ahead-for-south-koreas-seesaw-like-stock-market/articleshow/132825018.cms?from=mdr)

### 시나리오
Best: 메모리 슈퍼사이클이 예상보다 길어지고, 외국인 자금이 들어오며, 밸류업과 자사주 소각이 지수의 저평가를 해소합니다. 이 경우 한국 반도체는 장기 주도주가 됩니다.  
Base: 실적은 계속 좋지만, KOSPI는 집중도 때문에 큰 박스권 변동성을 유지합니다. 종목은 강해도 지수는 불안합니다.  
Worst: 중국 경쟁과 설비투자 부담, 레버리지 청산이 겹치면서 지수의 재평가가 지연됩니다. 실적은 버텨도 투자 심리는 오래 흔들립니다.

## 심층 분석 4: 비트코인은 이제 보관과 재무정책을 분리해서 봐야 합니다
Coldcard 보안 공지는 불편하지만 정확합니다. 문제는 단순한 지갑이 아니라 시드 생성 과정이었습니다. COINKITE는 영향받은 펌웨어에서 생성된 시드가 위험할 수 있으며, 펌웨어를 업데이트해도 기존 시드는 복구되지 않는다고 밝혔습니다. 즉, 장치를 고쳤다고 자산이 자동으로 안전해지지 않습니다. 시드가 생성된 순간의 엔트로피가 이미 취약하면, 그 취약성은 그대로 남습니다.  
근거: [COINKITE 보안 공지](https://blog.coinkite.com/coldcard-mk3-seed-generation-warning/), [COINKITE 엔트로피 해설](https://blog.coinkite.com/entropy-technical-backgrounder/)

The Hacker News는 이 결함이 1,196개 주소에서 41분 만에 1,082.65 BTC, 약 7,020만 달러를 빼앗긴 사건으로 이어졌다고 정리했습니다. 이후 다른 관측에서는 피해 범위가 4,585개 주소, 약 1,367 BTC, 최근 가격 기준 약 8,900만 달러에 이르는 것으로 추정됐습니다. 숫자의 세부는 추정치마다 조금씩 달라도, 핵심은 동일합니다. 콜드월렛은 "차가운" 저장장치이지, 엔트로피 검증을 대체하는 면허가 아닙니다.  
근거: [The Hacker News](https://thehackernews.com/2026/08/coldcard-hardware-wallet-flaw-linked-to.html), [CoinDesk 요약](https://www.coindesk.com/tech/2026/08/02/bitcoin-cold-wallet-attack-spreads-to-4-500-addresses-as-losses-near-usd89-million)

같은 날 Strategy는 BTC를 재무 유동성 관리의 수단으로 다시 사용하고 있습니다. SEC 8-K에는 BTC Monetization Program이 명시돼 있고, 최대 12.5억 달러까지 비트코인을 매도해 USD Reserve를 보강할 수 있다고 적혀 있습니다. WSJ는 실제로 1,638 BTC를 팔아 약 1억500만 달러를 확보했다고 보도했습니다. 이건 비트코인을 믿느냐 마느냐의 문제가 아닙니다. 비트코인을 기업 재무의 영구 축적으로만 보는 시대가 끝나고, 배당과 매입과 유동성 방어를 위한 조절 자산으로 보는 시대가 열렸다는 뜻입니다.  
근거: [Strategy 8-K](https://www.sec.gov/Archives/edgar/data/1050446/000119312526295586/mstr-20260706.htm), [Strategy 공시 요약](https://www.strategy.com/press/strategy-sells-3-588-btc-to-fund-digital-credit-dividends-now-holds-843-775-and-2-55b), [WSJ 보도](https://www.wsj.com/livecoverage/stock-market-today-dow-sp-500-nasdaq-08-03-2026/card/strategy-sells-105-million-of-bitcoin-7WqoOGNEx07IFQjWcsqFq), [MarketWatch 후속](https://www.marketwatch.com/livecoverage/stock-market-today-dow-s-p-500-nasdaq-oil-signs-deescalation-us-iran-war-pmi-palantir/card/bitcoin-rises-despite-strategy-s-sale-of-1-638-tokens-last-week-BBrufXkjwO4hcf7BsLtz)

### 시나리오
Best: 시드 생성과 복구 절차가 표준화되고, 기업들은 자산 보관과 재무 정책을 분리한 뒤 더 성숙한 운용을 합니다.  
Base: 사고는 국지적으로 반복되지만, 시장은 "지갑 브랜드"가 아니라 "운영 프로세스"를 보기 시작합니다.  
Worst: 보관 사고와 유동성 방어 매도가 동시에 터지면서, 개인은 물론 기업 재무에서도 비트코인 신뢰가 더 크게 흔들립니다.

## Master에게 미칠 영향
첫째, AI를 쓰는 조직은 이제 모델 선정만으로는 부족합니다. 모델이 무엇이냐보다 어떤 데이터가 지나가고, 어떤 로그가 남고, 누가 인시던트를 읽을 수 있는지가 더 중요합니다.  
둘째, 개발 생산성은 AI 도구 사용량의 함수가 되었습니다. 그러니 AI 도입은 HR 이슈가 아니라 예산과 운영 통제 이슈입니다.  
셋째, 한국 반도체와 KOSPI는 이야기보다 구조를 보셔야 합니다. 실적이 좋아도 지수 변동성은 별개이고, 레버리지와 집중이 심할수록 회복은 더 거칠어집니다.  
넷째, 디지털 자산은 수익률이 아니라 보관 체계와 유동성 정책으로 먼저 평가해야 합니다. 하드웨어 지갑 하나로 리스크가 끝나지 않습니다.

## 액션 아이템
### 단기
- AI 도구 사용 현황을 점검하고, 모델별·팀별·프로젝트별 예산을 바로 걸어 두십시오.
- Copilot이나 유사 에이전트 도입 조직은 사용자별 예산과 사용량 경보를 켜고, 헤비 유저를 먼저 식별하십시오.
- 암호자산 보유분이 있다면 시드 생성 방식, 백업 절차, 복구구문 보관 방식을 다시 확인하십시오.

### 중기
- AI 보안 리뷰 체크리스트를 만드십시오. 모델 접근, 데이터 경로, 로그 보존, 인시던트 대응, 외부 공유 범위를 한 장으로 정리해야 합니다.
- KOSPI나 반도체 관련 노출이 있다면 레버리지 상품 비중을 먼저 줄이고, 개별 종목 집중을 재검토하십시오.
- 비트코인은 보관 정책과 재무 정책을 분리한 문서로 다루십시오. "얼마를 가졌는가"와 "어떻게 보관하는가"는 전혀 다른 질문입니다.

### 장기
- 사내 AI 거버넌스를 운영 문서로 고정하십시오. 보안, 법무, 재무, 개발이 각각 따로 놀면 비용만 커집니다.
- 반도체와 AI 인프라 투자는 슈퍼사이클만 보지 말고, 공급 계약, 자사주 정책, 자본 지출 회수 기간까지 같이 보십시오.
- 디지털 자산은 브랜드가 아니라 복구 가능성, 감사 가능성, 책임 분리로 평가하는 습관을 만드십시오.

## 참고 자료
- [백악관 행정명령: Promoting Advanced Artificial Intelligence Innovation and Security](https://www.whitehouse.gov/presidential-actions/2026/06/promoting-advanced-artificial-intelligence-innovation-and-security/)
- [백악관 팩트시트: President Donald J. Trump Promotes Advanced Artificial Intelligence Innovation and Security](https://www.whitehouse.gov/fact-sheets/2026/06/fact-sheet-president-donald-j-trump-promotes-advanced-artificial-intelligence-innovation-and-security/)
- [NVIDIA: Industry Leaders Unite in Open Secure AI Alliance for AI Safety and Security](https://blogs.nvidia.com/blog/open-secure-ai-alliance/)
- [Linux Foundation: Open Models and Open Weights Are Foundational to Secure AI](https://www.linuxfoundation.org/blog/open-models-and-open-weights-are-foundational-to-secure-ai)
- [Hugging Face: Security incident disclosure — July 2026](https://huggingface.co/blog/security-incident-july-2026)
- [GitHub Blog: GitHub Copilot is moving to usage-based billing](https://github.blog/news-insights/company-news/github-copilot-is-moving-to-usage-based-billing/)
- [GitHub Changelog: Updates to GitHub Copilot billing and plans](https://github.blog/changelog/2026-06-01-updates-to-github-copilot-billing-and-plans/)
- [GitHub Changelog: Copilot users can now see AI credits used per billing cycle](https://github.blog/changelog/2026-07-20-copilot-users-can-now-see-ai-credits-used-per-billing-cycle/)
- [GitHub Docs: GitHub Copilot billing](https://docs.github.com/en/copilot/concepts/billing)
- [GitHub Docs: Budgets for usage-based billing](https://docs.github.com/en/copilot/concepts/billing/budgets-for-usage-based-billing)
- [GitHub Docs: Getting started with budget controls](https://docs.github.com/en/copilot/tutorials/budgets/getting-started-with-budget-controls)
- [Goldman Sachs: Korea’s Stock Market Is Forecast to Set Fresh Highs](https://www.goldmansachs.com/insights/articles/koreas-stock-market-is-forecast-to-set-fresh-highs)
- [AP News: Samsung reports record profit as South Korean chip giants benefit from global AI boom](https://apnews.com/article/samsung-ai-profit-memory-chips-10c2c548a392988862d8c7bd3f6fae05)
- [Business Insider: Kospi, Situational Awareness Tell Similar Story of Big Investing Trap](https://www.businessinsider.com/kospi-stock-index-sk-hynix-situational-awareness-leopold-aschenbrenner-leverage-2026-8)
- [Business Insider: US Chipmakers Are Getting Crushed by More AI Jitters in Asia](https://www.businessinsider.com/stock-market-today-chip-memory-selloff-south-korea-kospi-index-2026-7)
- [The Economic Times: Kospi slumps 5% after record-breaking 18% surge](https://economictimes.indiatimes.com/markets/us-stocks/news/kospi-slumps-5-after-record-breaking-18-surge-whats-ahead-for-south-koreas-seesaw-like-stock-market/articleshow/132825018.cms?from=mdr)
- [COINKITE Blog: Coldcard Security Advisory](https://blog.coinkite.com/coldcard-mk3-seed-generation-warning/)
- [COINKITE Blog: Technical Deep Dive into the Entropy Issue](https://blog.coinkite.com/entropy-technical-backgrounder/)
- [The Hacker News: Coldcard Hardware Wallet Flaw Linked to $70 Million Bitcoin Theft in 41 Minutes](https://thehackernews.com/2026/08/coldcard-hardware-wallet-flaw-linked-to.html)
- [CoinDesk: Bitcoin cold-wallet attack spreads to 4,500 addresses as losses near $89 million](https://www.coindesk.com/tech/2026/08/02/bitcoin-cold-wallet-attack-spreads-to-4-500-addresses-as-losses-near-usd89-million)
- [Strategy 8-K](https://www.sec.gov/Archives/edgar/data/1050446/000119312526295586/mstr-20260706.htm)
- [Strategy: Strategy Sells 3,588 BTC to Fund Digital Credit Dividends](https://www.strategy.com/press/strategy-sells-3-588-btc-to-fund-digital-credit-dividends-now-holds-843-775-and-2-55b)
- [WSJ: Strategy Sells $105 Million of Bitcoin](https://www.wsj.com/livecoverage/stock-market-today-dow-sp-500-nasdaq-08-03-2026/card/strategy-sells-105-million-of-bitcoin-7WqoOGNEx07IFQjWcsqFq)
- [MarketWatch: Bitcoin rises despite Strategy’s sale of 1,638 tokens last week](https://www.marketwatch.com/livecoverage/stock-market-today-dow-s-p-500-nasdaq-oil-signs-deescalation-us-iran-war-pmi-palantir/card/bitcoin-rises-despite-strategy-s-sale-of-1-638-tokens-last-week-BBrufXkjwO4hcf7BsLtz)
