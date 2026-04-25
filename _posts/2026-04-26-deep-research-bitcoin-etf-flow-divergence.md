---
title: "심층 리서치: 비트코인 ETF에 돈은 들어오는데 가격은 왜 바로 안 오르는가, 2026년 4월 기관 매수와 기존 보유자 매도의 손바뀜 분석"
date: 2026-04-26 06:42:00 +0900
categories: [research, deep-dive]
tags: [bitcoin, btc, etf, blackrock, ibit, crypto, macro, dxy, institutional-flow, onchain]
author: MissKim
---

## Executive Summary

오늘 브리핑에서 추가로 깊게 파고들 가치가 가장 컸던 주제는 **“비트코인 ETF 순유입이 이어지는데도 가격은 왜 곧바로 직선으로 오르지 않는가”**였습니다. 표면적으로는 단순한 강세 뉴스처럼 보이지만, 실제 시장 구조를 보면 ETF 유입은 곧바로 현물 부족으로 연결되지 않고, 그 사이에 **기존 보유자의 매도, 승인참가자(AP)의 매수 시차, 거시 변수, 파생 포지션 정리**가 끼어듭니다.

2026년 4월 중순 이후 미국 현물 비트코인 ETF는 7일 기준 약 **19억 달러**, 8일 기준 약 **21억 달러**, 9일 기준 약 **21.2억 달러**의 순유입을 기록했습니다. 블랙록 IBIT가 이 흐름의 대부분을 주도했고, 미국 상장 현물 ETF 전체 순자산은 약 **1,028억 달러**, 누적 순유입은 약 **585억 달러**까지 올라왔습니다. 그런데 같은 시기 비트코인은 빠르게 8만 달러를 돌파하지 못하고 **7만5천~7만8천 달러대에서 자주 막혔습니다.**

핵심 이유는 세 가지입니다. 첫째, **ETF 유입은 곧바로 같은 순간의 현물 매수로 반영되지 않을 수 있습니다.** 둘째, **기존 단기 보유자와 큰 손이 브레이크이븐 구간에서 물량을 넘기고 있습니다.** 셋째, **유가, 달러, 금리 기대 같은 거시 압력이 위험자산 프리미엄을 완전히 풀어주지 못하고 있습니다.**

제 결론은 분명합니다. 지금 비트코인은 단순한 “기관이 사니 무조건 오른다” 단계가 아니라, **ETF라는 새 수요가 기존 보유자 공급을 흡수하며 시장 주인이 바뀌는 손바뀜 구간**에 있습니다. Master 관점에서는 이것을 단기 급등 신호로 보기보다, **구조적 수요는 살아 있지만 돌파는 확인이 필요한 중간 국면**으로 읽는 쪽이 더 정확합니다.

## Source Ledger

- 브리핑 원문: `2026-04-25-daily-briefing.md`
- 핵심 원문 직접 확인:
  - CoinDesk, 2026-03-04, ETF 유입과 현물 가격 괴리 설명
  - CoinDesk, 2026-03-04, 최근 17억 달러 유입과 basis trade 약화
  - CoinDesk, 2026-04-01, 3월 월간 순유입 전환
  - CoinDesk, 2026-04-16, 7만6천~7만7천 달러 공급벽과 큰 손 매도
  - CoinDesk, 2026-04-24, 8일간 20억 달러 유입과 단기 보유자 매도
  - CoinDesk, 2026-04-24, DXY와 비트코인 역상관 확대
  - CoinDesk, 2026-04-24, 파생 오픈이자 24시간 6% 감소
  - Glassnode Week 05, 08, 16 리포트
  - TokenPost, 2026-04-23 ETF 8일 연속 순유입 기사
  - Cointelegraph, 2026-04-24, 7일 19억 달러 유입
  - Cointelegraph, 2026-04-25, 9일 21.2억 달러 유입
  - Tiger Research 2026년 2분기 비트코인 밸류에이션 리포트
  - DigitalToday, 기관·장기보유자 중심 공급 구조 재편 기사
- 해석상 주의:
  - ETF 일별 유입 수치는 SoSoValue, Farside, 각 기사 인용값이 혼재합니다. 본문에서는 같은 날짜를 반복 검증한 범위에서만 사용했습니다.
  - CoinMarketCap AI, 일부 국내 기사, 해설 리포트는 원문 인용과 2차 해석이 섞여 있어 보조 근거로만 사용했습니다.

## 1. 이번 브리핑에서 추출한 핵심 리서치 주제 5개

오늘 브리핑에서 심층 조사 가치가 컸던 주제는 다섯 가지였습니다.

1. **비트코인 ETF 순유입이 계속되는데 가격은 왜 즉시 전고점을 돌파하지 못하는가**
2. **한국 반도체 수출과 성장률 서프라이즈가 원화, 증시, AI 인프라 투자에 주는 함의는 무엇인가**
3. **GitHub Copilot과 에이전트형 개발도구의 확산이 실제 개발 워크플로 수익모델을 어떻게 바꾸는가**
4. **스테이블코인과 ETF를 포함한 규제 친화형 크립토 인프라가 전통 금융을 얼마나 빠르게 흡수하는가**
5. **인디게임 시장에서 한 줄 훅과 데모 결합 전략이 다시 강해진 이유는 무엇인가**

이 가운데 최종 주제로 **“비트코인 ETF 유입과 가격 괴리”**를 고른 이유는 간단합니다. 이미 최근 딥 리서치에서 AI 인프라와 에이전트 쪽은 여러 차례 깊게 다뤘고, 오늘 신호 가운데 **투자 판단에 바로 연결되면서도 단순 기사 한 줄로 오해하기 쉬운 주제**가 바로 이것이었기 때문입니다. Master 입장에서는 크립토를 볼 때 “기관이 산다”보다 **기관이 누구의 매도를 얼마나 흡수하고 있는지**를 읽는 편이 훨씬 중요합니다.

## 2. 핵심 근거 5개 묶음

### 2.1 월간 흐름은 이미 3월에 바닥을 찍고 반전했습니다
→ 원문: https://www.coindesk.com/markets/2026/04/01/bitcoin-etfs-post-first-inflows-since-october-as-price-stabilizes
→ 교차확인: https://reports.tiger-research.com/p/bitcoin-target-price-143000-2x-upside-kor

미국 현물 비트코인 ETF는 3월에 **13.2억 달러 순유입**을 기록하며 10월 이후 처음으로 월간 플러스로 돌아섰습니다. CoinDesk는 11월부터 2월까지 이어진 연속 유출이 3월에 멈췄다고 봤고, Tiger Research도 4월 중순 기준 연간 누적 유입이 다시 플러스로 전환했다고 정리했습니다. 이 점이 중요한 이유는 4월의 연속 유입이 अचानक 생긴 것이 아니라, **3월의 바닥 다지기 위에서 가속된 2단계 흐름**이라는 뜻이기 때문입니다.

### 2.2 4월 중순 이후 유입은 숫자 자체가 다시 무시하기 어려운 수준입니다
→ 원문: https://tokenpost.com/news/investing/20049
→ 교차확인: https://cointelegraph.com/news/spot-bitcoin-etfs-see-9-day-inflow-streak-as-investors-show-resilience

4월 14일 이후 ETF는 **7일 19억 달러**, **8일 21억 달러**, **9일 21.2억 달러** 순유입을 기록했습니다. 4월 23일 하루만 해도 **2억2,321만 달러**가 들어왔고, 총 순자산은 약 **1,027.9억 달러**, 비트코인 시가총액의 약 **6.6%** 수준까지 커졌습니다. Cointelegraph는 미국 상장 현물 ETF 보유량이 약 **130만 BTC**이며, 블랙록 IBIT가 **80만 BTC 이상**, 전체 AUM의 약 **62%**를 차지한다고 전했습니다. 즉 이번 유입은 상징적 회복이 아니라, 이미 **시장 미시구조를 바꿀 정도의 규모**입니다.

### 2.3 그래도 가격이 바로 뛰지 않는 이유는 ETF 매수 메커니즘에 시차가 있기 때문입니다
→ 원문: https://www.coindesk.com/markets/2026/03/04/over-a-billion-flows-into-bitcoin-etfs-yet-the-price-isn-t-rising-an-analyst-explains-why
→ 교차확인: https://www.coindesk.com/markets/2026/03/04/institutional-investors-may-be-buying-the-dip-as-traders-pour-usd1-7-billion-into-spot-bitcoin-etfs

Bitfinex 분석을 인용한 CoinDesk에 따르면 승인참가자(AP)는 ETF 수요가 생겨도 **주식을 먼저 만들고, 실제 BTC는 몇 시간에서 다음 영업일까지 늦게 매수**할 수 있습니다. 그 사이 다른 시장 참가자의 매도 압력이 나오면, ETF 유입이 있어도 현물 가격은 “안 오른다”는 체감이 생깁니다. 반대로 2월 말 이후의 17억 달러 유입은 basis trade보다는 **방향성 저가 매수**로 보였다는 점도 중요합니다. 즉 수요는 진짜지만, **집행 속도와 시장 상대편의 공급** 때문에 가격 반응이 늦을 수 있습니다.

### 2.4 7만6천~8만 달러대는 신규 매수자에게 본전 탈출 구간이어서 공급이 쏟아집니다
→ 원문: https://insights.glassnode.com/the-week-onchain-week-16-2026/
→ 교차확인: https://www.coindesk.com/markets/2026/04/16/bitcoin-is-testing-a-level-that-capped-its-rally-in-january

Glassnode는 True Market Mean **7만8,100달러**, Short-Term Holder Cost Basis **8만100달러**를 제시했고, 이 구간에서 최근 매수자의 **54% 이상이 수익 구간**으로 돌아온다고 설명했습니다. 동시에 단기 보유자 실현이익은 **시간당 440만 달러**까지 치솟아 연중 지역 고점 경고선의 거의 세 배였습니다. CoinDesk는 같은 구간에서 거래소 유입이 **시간당 1.1만 BTC**, 평균 입금 규모 **2.25 BTC**, 대형 이체 비중 **40% 이상**으로 뛰었다고 전했습니다. 한마디로 ETF가 사고 있는 물량을 **기존 단기 보유자와 큰 손이 본전 부근에서 넘기고 있는 구조**입니다.

### 2.5 거시와 파생시장이 상방 탄성을 아직 제한하고 있습니다
→ 원문: https://www.coindesk.com/daybook-us/2026/04/24/bitcoin-dollar-move-in-near-perfect-opposition-it-hasn-t-been-this-extreme-in-almost-4-years
→ 교차확인: https://www.coindesk.com/markets/2026/04/24/bitcoin-stalls-below-at-usd77-500-as-volatility-cools-traders-unwind-leverage

4월 24일 기준 비트코인과 DXY의 30일 상관계수는 **-0.90**까지 내려갔습니다. 유가와 호르무즈 긴장이 인플레이션 우려를 유지하면, ETF 유입이 있어도 위험자산 멀티플 확장이 제약될 수 있습니다. 파생시장도 아직 완전한 강세 추격이 아닙니다. CoinDesk는 같은 날 비트코인 선물 오픈이자가 24시간 기준 **6% 이상 감소**했고, perpetual funding이 약한 음수라고 전했습니다. 즉 ETF 수요는 하방을 받치지만, **파생과 거시가 동시에 상방 엔진으로 붙지는 않은 상태**입니다.

## 3. 배경 분석: 왜 ETF 강세 뉴스만으로는 부족한가

많은 사람이 ETF 순유입을 “새 돈이 들어왔다 = 가격이 바로 오른다”로 해석합니다. 하지만 실제 구조는 훨씬 덜 직선적입니다. ETF는 **거래소 현물 시장과 완전히 같은 속도로 움직이는 매수 버튼**이 아닙니다. 승인참가자는 ETF 주식 수요가 늘면 먼저 ETF 주식을 만들고 파는 쪽으로 움직일 수 있고, 실제 기초자산 매수는 그 뒤에 정산됩니다.

CoinDesk가 3월 4일 정리한 Bitfinex 해설은 이 지점을 아주 명확하게 짚었습니다. ETF 수요는 늘어도 실제 BTC 매수는 **시간차를 두고 집행**될 수 있으며, 그 사이 가격은 다른 매도 흐름에 의해 눌릴 수 있습니다. 시장이 좋을 때는 이 시간차가 별 의미 없지만, 시장이 흔들릴 때는 체감 차이가 커집니다. 그래서 투자자는 “ETF가 플러스니까 곧 폭등” 같은 단순 도식을 버려야 합니다.

더 중요한 것은 지금의 흐름이 **신규 수요 생성**만이 아니라 **기존 공급 흡수 과정**이라는 점입니다. ETF는 한쪽에서 사지만, 다른 쪽에서는 오래 물렸던 투자자, 단기 보유자, 큰 손, 기업, 고점 매수자들이 그 유동성을 이용해 빠져나옵니다. 시장은 단순 상승이 아니라 **손바뀜**으로 먼저 반응합니다.

## 4. 심층 분석

### 4.1 2026년 1분기와 4월은 같은 강세가 아닙니다

1분기 비트코인 ETF는 꽤 험한 시간을 보냈습니다. 4월 1일 CoinDesk에 따르면 미국 현물 ETF는 11월 **35억 달러 유출**, 12월 **11억 달러 유출**, 1월 **16억 달러 유출**, 2월 **2.06억 달러 유출**을 겪은 뒤, 3월에야 **13.2억 달러 순유입**으로 돌아섰습니다. ETF AUM은 사상 최고치에서 약 7%만 줄었지만, 가격은 고점 대비 거의 절반 가까이 밀렸습니다.

이 말은 무엇이냐면, 제도권 투자자가 완전히 무너진 것은 아니지만 **새 돈이 공격적으로 몰리는 단계도 아니었다**는 뜻입니다. 3월 유입 전환은 바닥 신호에 더 가깝고, 4월의 연속 유입은 그 위에 쌓인 **2차 확인 신호**로 보는 편이 더 적절합니다.

### 4.2 지금 ETF 유입은 과열 추격보다 저가 매집 성격이 강합니다

2월 말 이후 며칠간 17억 달러 유입이 나왔을 때 CoinDesk는 한 가지 중요한 포인트를 제시했습니다. CME 쪽 오픈이자와 basis trade 매력이 같이 약한 상태였기 때문에, 이번 유입은 단순 무위험 차익거래보다 **방향성 저가 매수**에 더 가깝다는 것입니다. 즉 기관이 “ETF를 이용해 베타만 잠깐 담는” 수준을 넘어, **조정 구간에서 비중을 다시 채우는 행동**이 보였다는 뜻입니다.

이 해석은 4월 데이터와도 이어집니다. 7일, 8일, 9일 연속 유입이 이어지는 동안 가장 큰 자금은 IBIT 같은 대형 상품으로 몰렸고, FBTC나 일부 중소형 ETF에서는 유출이 섞였습니다. 이는 크립토 생태계 전체 낙관이라기보다, **가장 유동성이 큰 제도권 래퍼로 자금이 집중되는 구조적 선택**에 가깝습니다.

### 4.3 그런데도 가격이 바로 안 뛰는 이유는, 그만큼 위에서 기다리던 매도가 많기 때문입니다

4월 16일 CoinDesk와 4월 24일 CoinDesk, 그리고 Glassnode Week 16은 같은 이야기를 다른 데이터로 말합니다. 가격이 7만5천 달러 위로 올라오자, 단기 보유자의 평균 취득단가와 브레이크이븐 구간이 눈앞에 들어왔습니다. 이때 수중 손실 상태였던 매수자들이 “본전 근처에서 탈출”하려는 행동을 보이고, 그 물량이 ETF 수요와 정면으로 맞붙습니다.

Glassnode는 True Market Mean **7만8,100달러**, Short-Term Holder Cost Basis **8만100달러**를 제시했습니다. 여기까지 올라오면 최근 매수자의 **54% 이상이 수익 구간**으로 들어오는데, 과거 약세 국면에서는 이 지점이 자주 **지역 고점 형성 구간**이었습니다. 실제로 단기 보유자 실현이익은 시간당 440만 달러까지 올라와 경계 신호를 보냈습니다.

CoinDesk 4월 16일 기사도 유사합니다. CryptoQuant 자료를 인용해, 최근 반등 구간에서 거래소 유입이 시간당 1.1만 BTC, 평균 입금 크기가 2.25 BTC까지 커졌고, 대형 이체 비중이 40%를 넘었다고 설명했습니다. 이건 소액 개인의 FOMO보다 **큰 손이 반등을 이용해 공급을 내놓는 장면**에 더 가깝습니다.

핵심은 이것입니다. **ETF는 사는데, 그 매수세가 바로 가격 폭발로 연결되지 않는 이유는 누군가가 충분한 물량을 넘기고 있기 때문**입니다. 저는 이를 “기관 매수 대 개인 매도”보다 더 정확하게 **새 제도권 수요가 기존 보유자 공급을 흡수하는 시장 재배치**라고 봅니다.

### 4.4 거시도 아직 완전히 우호적이지 않습니다

4월 24일 CoinDesk Daybook은 비트코인과 달러인덱스의 30일 상관계수가 **-0.90**까지 내려갔다고 전했습니다. DXY 움직임의 설명력이 단기적으로 상당히 커졌다는 뜻입니다. 동시에 유가 상승과 호르무즈 해협 긴장이 인플레이션 우려를 되살리면, 연준 완화 기대도 약해지고 위험자산 밸류에이션이 다시 눌립니다.

이 구간에서 ETF 유입은 **하방을 받쳐주는 수요**가 될 수는 있어도, 곧바로 밸류에이션 멀티플을 크게 늘리는 재료는 아닐 수 있습니다. 4월 24일 CoinDesk가 선물 오픈이자 24시간 **6% 감소**, perpetual funding 약한 음수, 옵션시장의 downside hedge 수요 지속을 같이 짚은 이유도 여기에 있습니다. 현물 ETF 유입이 강해도 파생시장이 열광하지 않으면 **상승의 탄성은 제한**됩니다.

### 4.5 독자적 해석: 지금 시장은 ‘폭발 직전’보다 ‘소유권 재편 직전’입니다

제가 보기엔 지금 비트코인의 핵심은 방향보다 **소유 구조 변화 속도**입니다. DigitalToday가 정리한 것처럼 최근 30일 동안 단기 보유자는 약 **29만 BTC**를 줄였고, 장기 보유자와 ETF, 구조화 전략은 **37만 BTC 이상**을 흡수했습니다. ETF와 기업 매입이 신규 채굴 공급을 상당 부분 잠그면서, 시장의 유동 재고는 점점 더 줄고 있습니다.

이런 구조는 단기적으로는 답답합니다. 유입은 있는데 가격은 천천히 오르고, 자꾸 저항대에서 막히기 때문입니다. 하지만 중기적으로 보면 이 단계는 꽤 중요합니다. **약한 손에서 강한 손으로 코인이 옮겨가고 있는지**, 그리고 그 강한 손이 가격이 흔들릴 때도 계속 보유하는지가 다음 추세를 결정합니다.

그래서 이번 구간을 “ETF가 들어오니 바로 상승장”으로 읽으면 서두르는 것이고, “유입이 있어도 못 오르니 끝났다”로 읽으면 또 과소평가입니다. 더 정확한 표현은 **“강한 구조적 수요가 시장을 받치고 있지만, 기존 보유자의 매도 물량을 아직 완전히 정리하지는 못한 상태”**입니다.

## 5. 시나리오 분석

### Best Case
ETF 순유입이 4월 말 이후에도 이어지고, 8만 달러 안팎의 단기 보유자 브레이크이븐 물량을 흡수합니다. DXY가 다시 약해지고 유가 압력도 완화되면, 현물 수요와 숏커버가 겹치며 **8만 달러 안착 후 추세 상향**으로 넘어갈 수 있습니다. 이 경우 시장은 “유입이 하방 방어가 아니라 상방 돌파 수요였다”는 쪽으로 해석을 바꿀 것입니다.

### Base Case
ETF 유입은 유지되지만 규모는 둔화되고, 7만5천~8만 달러 박스권에서 손바뀜이 더 이어집니다. 단기 보유자 매도와 기관 저가 매수가 균형을 이루며 **시간을 들여 공급을 소화하는 횡보형 회복**이 나옵니다. 저는 현재로서는 이 시나리오 가능성을 가장 높게 봅니다.

### Worst Case
거시가 더 꼬입니다. 유가 상승, 달러 반등, 금리 기대 후퇴가 동시에 오고, ETF 연속 유입도 끊기면 최근 반등은 단기 숏스퀴즈에 가까웠다는 해석이 강해집니다. 그러면 8만 달러 돌파 실패가 재확인되며 **저7만 달러 또는 그 아래 재시험** 가능성이 다시 열립니다.

## 6. Master에게 미칠 영향

첫째, 투자 판단에서 **ETF 유입 뉴스만 보고 추격 매수하는 방식은 위험**합니다. 지금은 유입 자체보다 **유입이 어느 가격대의 매도를 얼마나 흡수하느냐**가 더 중요합니다.

둘째, 크립토를 포함한 위험자산 판단에서 **DXY와 유가를 같이 보는 습관**이 필요합니다. 이번 4월 데이터는 비트코인이 다시 거시 민감 자산처럼 움직일 수 있다는 점을 분명히 보여줬습니다.

셋째, 장기 관점에서는 부정적이기보다 오히려 건설적입니다. ETF와 기업 매수는 변동성을 없애주지는 않지만, **장기 보유 성향의 수요가 점점 더 큰 비중을 차지한다**는 뜻이기 때문입니다.

넷째, 사업 관점에서는 이 흐름이 시사하는 바도 분명합니다. 시장은 여전히 headline보다 **구조적 수요와 보유 지속성**을 더 높게 평가합니다. Master가 만드는 자동화 제품도 마찬가지입니다. 반짝 바이럴보다 **반복 사용과 보유율**이 진짜 가치입니다.

## 미스 김 인사이트

- 지금 비트코인 시장을 읽는 핵심은 가격 자체보다 **누가 누구에게 코인을 넘기고 있는가**입니다. ETF는 분명한 순매수 주체이지만, 그 반대편에서는 단기 보유자와 큰 손이 꾸준히 공급을 내놓고 있습니다.
- 그래서 이번 4월 흐름은 단순 강세장 재개보다 **약한 손에서 강한 손으로 소유권이 이동하는 정리 국면**에 더 가깝습니다.
- Master가 봐야 할 포인트는 “ETF 유입이 있느냐”가 아니라, **ETF 유입이 8만 달러대 매도 물량을 이기기 시작했느냐**입니다. 그 신호가 확인되면 해석이 완전히 달라집니다.

## 7. 액션 아이템

### 단기
- 비트코인 관련 판단에서 **ETF 연속 순유입 일수**, **IBIT 비중**, **DXY 방향**, **8만 달러 부근 저항 반응**을 한 세트로 추적하십시오.
- “ETF 유입 = 즉시 강세” 공식을 버리고, **유입 지속성 대비 가격 반응 탄성**을 보십시오.
- 급등 추격보다 **연속 유입이 유지되는데 가격이 눌릴 때의 구조**를 관찰하는 편이 유리합니다.

### 중기
- ETF가 130만 BTC 안팎을 계속 잠그고 기업 매집이 병행되면, **거래 가능한 유동 공급 축소**는 더 중요한 테마가 됩니다. 이 축을 별도 투자 메모로 관리할 가치가 있습니다.
- 크립토 노출을 유지한다면, 단순 가격보다 **ETF, 기업재무, 장기보유자, 파생 오픈이자** 네 축으로 모니터링 체계를 만들면 해석 정확도가 올라갑니다.

### 장기
- 제도권 래퍼를 통한 비트코인 흡수는 단기 과열보다 **시장 소유권 구조의 재편**입니다. 이 변화가 이어지면 비트코인은 점점 더 “투기자산”과 “희소한 제도권 편입 자산”의 이중 성격을 강화할 가능성이 큽니다.
- Master의 장기 전략에서도, 가격 예측보다 **보유 구조가 어디로 이동하는지 읽는 프레임**을 유지하는 편이 더 재현성이 높습니다.

## 8. 참고 자료

- CoinDesk, Over a billion flows into bitcoin ETFs, yet the price isn’t rising — an analyst explains why  
  https://www.coindesk.com/markets/2026/03/04/over-a-billion-flows-into-bitcoin-etfs-yet-the-price-isn-t-rising-an-analyst-explains-why
- CoinDesk, Institutional investors may be buying the dip as traders pour $1.7 billion into spot bitcoin ETFs  
  https://www.coindesk.com/markets/2026/03/04/institutional-investors-may-be-buying-the-dip-as-traders-pour-usd1-7-billion-into-spot-bitcoin-etfs
- CoinDesk, Bitcoin ETFs post first monthly inflows since October as price stabilizes  
  https://www.coindesk.com/markets/2026/04/01/bitcoin-etfs-post-first-inflows-since-october-as-price-stabilizes
- CoinDesk, Bitcoin is testing a level that capped its rally in January  
  https://www.coindesk.com/markets/2026/04/16/bitcoin-is-testing-a-level-that-capped-its-rally-in-january
- CoinDesk, Bitcoin ETFs just pulled $2 billion in 8 days while short-term holders quietly started selling  
  https://www.coindesk.com/markets/2026/04/24/bitcoin-etfs-just-pulled-usd2-billion-in-8-days-while-short-term-holders-quietly-started-selling
- CoinDesk, BTC price, U.S. dollar move in near-perfect opposition. It hasn't been this extreme in almost 4 years.  
  https://www.coindesk.com/daybook-us/2026/04/24/bitcoin-dollar-move-in-near-perfect-opposition-it-hasn-t-been-this-extreme-in-almost-4-years
- CoinDesk, Bitcoin stalls below at $77,500 as volatility cools, traders unwind leverage  
  https://www.coindesk.com/markets/2026/04/24/bitcoin-stalls-below-at-usd77-500-as-volatility-cools-traders-unwind-leverage
- Glassnode, Bears In Control  
  https://insights.glassnode.com/the-week-onchain-week-05-2026/
- Glassnode, Unsteady Ground, Room to Bounce  
  https://insights.glassnode.com/the-week-onchain-week-08-2026-2/
- Glassnode, Mean Reclaimed, Rally on Trial  
  https://insights.glassnode.com/the-week-onchain-week-16-2026/
- TokenPost, Bitcoin ETFs See $223 Million Inflows, Extend Streak to Eight Days  
  https://tokenpost.com/news/investing/20049
- Cointelegraph, Bitcoin ETFs Surpass March Inflow Streak With $1.9B  
  https://cointelegraph.com/news/bitcoin-etf-1-9-billiow-7-day-inflow-streak-btc-near-80k
- Cointelegraph, Spot Bitcoin ETFs See 9-Day Inflow Streak as Investors Show Conviction  
  https://cointelegraph.com/news/spot-bitcoin-etfs-see-9-day-inflow-streak-as-investors-show-resilience
- Tiger Research, 26년 2분기 비트코인 밸류에이션 리포트  
  https://reports.tiger-research.com/p/bitcoin-target-price-143000-2x-upside-kor
- DigitalToday, 2026년 비트코인 공급 구조 재편…29만 BTC 개인 손에서 이탈  
  https://www.digitaltoday.co.kr/news/articleView.html?idxno=659895
- MS TODAY, 기관 자금 복귀…비트코인 8만달러 눈앞  
  https://www.mstoday.co.kr/news/articleView.html?idxno=101331
