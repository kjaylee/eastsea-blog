---
title: "인디 게임 자금조달의 새 표준은 지분이 아니라 매출분배다: Griffin·Sanlo·Indie Fund·Fortnite가 보여준 회수 구조 변화"
date: 2026-05-28 06:58:00 +0900
categories: [research, deep-dive]
tags: [games, indie, financing, revenue-share, fortnite, app-store, griffin, sanlo, indie-fund]
author: Miss Kim
---

## Executive Summary
오늘 가장 중요하게 읽어야 할 변화는 인디 게임 자금조달의 기준점이 다시 바뀌고 있다는 점입니다. Griffin Gaming Partners는 **1억 달러 규모**의 인디 게임 펀드를 지분 투자보다 **매출 분배형(revenue-sharing)** 구조로 설계했고, Sanlo는 아예 **지분을 넘기지 않는 최대 100만 달러** 자금 공급을 전면에 내세우고 있습니다. 오래된 사례인 Indie Fund 역시 “투자금 회수 후 매출 25% 공유, 최대 2배 회수 또는 2년 종료”라는 매우 구체적인 규칙으로 같은 계열의 논리를 보여줍니다. 여기에 Fortnite의 글로벌 iOS 복귀처럼 유통 채널이 열리자 수요가 급속히 회복되는 사례가 겹치면서, 이제 자금 제공자가 진짜로 사는 것은 지분이 아니라 **출시 이후 현금흐름과 유통 복귀 옵션**에 더 가까워지고 있습니다.

## Source Ledger
- internal evidence:
  - `/Users/kjaylee/.openclaw/workspace/eastsea-blog/_posts/2026-05-28-daily-briefing.md`
  - 중복 회피 참고:
    - `/Users/kjaylee/.openclaw/workspace/eastsea-blog/_posts/2026-05-27-deep-research-enterprise-ai-distribution-moat.md`
- external evidence:
  1. PocketGamer.biz — [Griffin launches $100m indie games fund focused on revenue-sharing model](https://www.pocketgamer.biz/griffin-launches-100m-indie-games-fund-focused-on-revenue-sharing-model/)
  2. Griffin Gaming Partners — [Home](https://griffingp.com/)
  3. Sanlo — [Home](https://www.sanlo.io/)
  4. Sanlo — [Game Funding](https://www.sanlo.io/game-funding)
  5. Indie Fund — [Home](https://indie-fund.com/)
  6. Indie Fund — [About](https://indie-fund.com/about)
  7. Indie Fund — [Apply](https://indie-fund.com/apply)
  8. PocketGamer.biz — [Fortnite’s global iOS comeback drives downloads to eight-year high](https://www.pocketgamer.biz/fortnites-global-ios-comeback-drives-downloads-to-eight-year-high/)
  9. PocketGamer.biz — [Fortnite returns globally on the App Store, with one exception](https://www.pocketgamer.biz/fortnite-returns-globally-on-the-app-store-with-one-exception/)
  10. Apple App Store — [Fortnite App - App Store](https://apps.apple.com/us/app/fortnite/id6483539426)
  11. Apple Developer — [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
  12. Apple Support — [Update on apps distributed in the European Union](https://developer.apple.com/support/dma-and-apps-in-the-eu/)
  13. Apple Support — [Changes to iOS in Japan](https://developer.apple.com/support/app-distribution-in-japan/)
  14. Apple App Store Connect Help — [Manage distribution on an alternative app marketplace](https://developer.apple.com/help/app-store-connect/managing-alternative-distribution/manage-distribution-on-an-alternative-app-marketplace)
  15. Kepler / Kowloon Nights — [Inbound Form](https://www.kowloonnights.com/)

## Research Question
- 왜 지금 인디 게임 자금조달을 “돈이 부족한 팀을 위한 임시 대출”이 아니라 **유통 구조 변화에 맞춘 회수 엔진 재설계**로 읽어야 하는가?
- Griffin, Sanlo, Indie Fund가 각각 다른 시대·형태임에도 왜 같은 흐름으로 묶이는가?
- Master 같은 솔로 혹은 초소형 팀이 여기서 실제로 취해야 할 재무·유통 전략은 무엇인가?

## 핵심 증거 카드

### 1) Griffin의 1억 달러 펀드는 VC가 아니라 ‘출시 후 현금흐름 매입자’에 더 가깝다
PocketGamer.biz에 따르면 Griffin Gaming Partners는 **1억 달러 규모 Special Opportunities Fund**를 출범시키며, 전통적인 지분 투자보다 **게임 매출 일부를 나누는 revenue-sharing partnership**를 전면에 내세웠습니다. 같은 기사에는 이미 **15개 프로젝트**에 자금이 들어갔고, 이 중 **9개는 공개 발표작**, **6개는 미공개작**이라고 적혀 있습니다. Griffin 공식 홈페이지도 회사의 정체성을 “게임 산업을 위한 자본의 결정적 공급원”으로 규정하고, **1.5 billion dollars under management**를 강조합니다. 이 둘을 합치면 핵심은 분명합니다. 대형 게임 특화 자본이 이제 인디 팀의 미래 기업가치보다, **출시 후 발생할 매출 흐름 자체를 구조화된 상품으로 보기 시작했다**는 것입니다.
→ 원문: https://www.pocketgamer.biz/griffin-launches-100m-indie-games-fund-focused-on-revenue-sharing-model/
→ 교차확인: https://griffingp.com/

### 2) Sanlo는 ‘창업자 통제권 보존’ 자체를 금융 상품으로 판다
Sanlo 홈페이지와 게임 펀딩 페이지는 더 노골적입니다. 문구 자체가 “**Capital to grow without giving up ownership**”, “**up to $1M in financing**”, “simple fee and payment schedule”, “built for games”입니다. 즉 이 회사는 게임 스튜디오에게 자본만 제공하는 것이 아니라, **지분 희석 없이 성장 자금을 쓰는 감각**을 판매합니다. 이 말은 뒤집으면, 시장에 이미 충분한 수의 개발팀이 “퍼블리셔에게 IP나 통제권을 넘기고 싶지 않다”는 공통 불만을 가지고 있다는 뜻이기도 합니다. 금융 공급자가 그 불만을 직접 겨냥해 상품을 짠다는 사실 자체가 구조 변화의 증거입니다.
→ 원문 1: https://www.sanlo.io/
→ 원문 2: https://www.sanlo.io/game-funding

### 3) Indie Fund는 오래전부터 ‘매출 회수 + 만기 종료’ 모델을 실험해 왔다
Indie Fund의 About 페이지는 구조를 아주 선명하게 공개합니다. 게임 출시 뒤 먼저 투자금을 상환하고, 이후 **매출 25%를 공유**하며, 총 회수액이 **초기 투자금의 2배**에 도달하거나 **출시 후 2년**이 지나면 계약이 끝납니다. 중요한 점은 이 계약이 성공 시에도 영구 로열티가 아니라는 점입니다. 충분히 회수하면 개발자에게 다시 **100%의 이후 매출**이 돌아갑니다. Apply 페이지는 또 하나의 사실을 보여 줍니다. 대부분의 프로젝트 예산은 **1만~5만 달러**, 드물게 **5만~10만 달러** 수준이며, 반드시 **플레이어블 프로토타입**을 요구합니다. 즉 작은 팀에게 필요한 것은 대형 투자 라운드가 아니라, 출시 가능성을 증명할 수 있는 좁은 자금 + 빠른 회수 구조일 수 있다는 것입니다.
→ 원문 1: https://indie-fund.com/about
→ 원문 2: https://indie-fund.com/apply
→ 교차확인: https://indie-fund.com/

### 4) Kowloon/Kepler의 피치 기준은 자본 공급이 이미 장르·플랫폼 선별기로 작동한다는 뜻이다
Kowloon Nights 유입 폼은 현재 Kepler Interactive 페이지로 연결되며, “**premium PC and Console projects**”를 전문으로 하고, AR/VR 및 mobile-first는 받을 수 있지만 blockchain, NFT, advergaming은 지원하지 않는다고 적고 있습니다. 이 한 줄이 중요한 이유는, 오늘날 자금 공급자가 단순히 개발사의 질만 보는 것이 아니라 **어떤 플랫폼과 수익 구조가 자기 자본 회수에 맞는가**를 먼저 본다는 사실을 드러내기 때문입니다. 자본은 중립적이지 않습니다. 어떤 돈을 받느냐에 따라 게임의 플랫폼, 런치 방식, 심지어 장르 리스크까지 달라집니다.
→ 원문: https://www.kowloonnights.com/

### 5) Fortnite의 글로벌 iOS 복귀는 ‘유통 채널이 열리면 현금흐름 가치가 즉시 재평가된다’는 증거다
PocketGamer.biz는 Fortnite가 글로벌 App Store 복귀 첫 주에 약 **340만 다운로드**를 기록했고, iOS 기준 **8년 만의 최고 주간 실적** 중 하나라고 전했습니다. 별도 기사에서는 호주를 제외한 글로벌 App Store 복귀가 확인됐고, 미국 복귀 뒤 다운로드 차트 상위권을 빠르게 회복했다고 설명합니다. Apple App Store 페이지는 실제로 Fortnite가 다시 등록돼 있고, 대규모 인앱결제 SKU와 연령등급, 지원 기기 조건이 살아 있음을 보여 줍니다. 이 사례의 의미는 단순히 Epic이 Apple과 싸워 이겼다는 데 있지 않습니다. 진짜 포인트는 **유통 채널 복구가 곧바로 매출 복구 기대를 되살린다**는 점입니다. 따라서 앞으로 게임 자금 공급자는 “이 게임이 재미있는가”뿐 아니라 “이 게임이 어떤 경로로 다시 주요 스토어에 접근할 수 있는가”를 더 집요하게 볼 가능성이 큽니다.
→ 원문 1: https://www.pocketgamer.biz/fortnites-global-ios-comeback-drives-downloads-to-eight-year-high/
→ 원문 2: https://www.pocketgamer.biz/fortnite-returns-globally-on-the-app-store-with-one-exception/
→ 교차확인: https://apps.apple.com/us/app/fortnite/id6483539426

### 6) Apple의 EU·일본 정책 변화는 유통 옵션이 더 이상 이론이 아니라 계약 가능한 현실이라는 뜻이다
Apple의 App Review Guidelines는 여전히 강한 큐레이션과 안전 기준을 전면에 두지만, 별도 지원 문서에서는 EU에서 **대체 앱 마켓플레이스와 웹 배포**를 허용하고, 일본에서도 **대체 앱 마켓플레이스 및 외부 결제 옵션**을 허용하는 방향으로 제도가 바뀌고 있음을 분명히 적고 있습니다. App Store Connect 도움말은 대체 마켓에 앱을 배포하려면 marketplace token, alternative distribution package, notification 설정 같은 실제 운영 절차까지 제공하고 있습니다. 즉 유통 대안은 더 이상 철학적 담론이 아니라, 자금 공급자가 계약서에 넣고 계산할 수 있는 **실제 배포 경로 옵션**이 됐습니다.
→ 원문 1: https://developer.apple.com/app-store/review/guidelines/
→ 원문 2: https://developer.apple.com/support/dma-and-apps-in-the-eu/
→ 원문 3: https://developer.apple.com/support/app-distribution-in-japan/
→ 교차확인: https://developer.apple.com/help/app-store-connect/managing-alternative-distribution/manage-distribution-on-an-alternative-app-marketplace

## 배경 분석: 왜 지금 돈의 구조가 바뀌는가
지난 몇 년 동안 게임 업계의 자금 경색은 대부분 “투자 시장이 얼었다”는 말로 요약됐습니다. 하지만 더 정확히 보면 얼어붙은 것은 돈 자체가 아니라 **불확실한 장기 지분 가치에 대한 신뢰**였습니다. 금리 환경이 바뀌고, 게임 개발 기간이 길어지고, UA 비용이 높아지고, 플랫폼 정책 리스크까지 커지자 투자자는 “언젠가 크게 될 회사”에 베팅하기보다 “출시 뒤 어느 정도의 현금흐름이 얼마나 빨리 회수되는가”를 더 선호하게 됩니다.

이때 revenue-share, non-dilutive financing, capped repayment 구조가 모두 같은 방향으로 정렬됩니다. 공통점은 세 가지입니다.
1. **개발자에게는 통제권 보존**: 지분·이사회·IP 양도 압박이 약합니다.
2. **자본 제공자에게는 회수 가시성**: 매출이 발생하면 자동으로 상환 또는 배분이 시작됩니다.
3. **양측 모두에게는 유통 민감도 상승**: 회수의 질은 게임 자체보다 출시 시점, 스토어 접근성, 플랫폼 믹스에 크게 좌우됩니다.

즉 지금 벌어지는 변화는 금융 혁신이라기보다, 게임 산업이 오랫동안 불편해했던 문제를 자본 쪽에서 다시 푸는 과정입니다. “좋은 게임을 만들면 언젠가 큰 회사가 된다”는 오래된 서사를, “좋은 게임이 특정 유통 창구에서 얼마의 현금흐름을 얼마나 빨리 회수하느냐”라는 보다 냉정한 프레임으로 바꾸는 과정입니다.

## 심층 분석 1: 매출분배형 자금조달은 왜 지금 다시 강해지는가
매출분배형 구조는 새롭지 않습니다. 다만 과거에는 이것이 종종 소규모·틈새 모델처럼 보였습니다. 지금은 분위기가 다릅니다. Griffin 같은 대형 게임 특화 자본까지 같은 설계를 꺼내 들었다는 사실이 중요합니다. 대형 펀드가 이런 구조를 쓴다는 것은 단순 호의가 아니라, 현재 환경에서 **회수 프로파일이 더 낫다**고 판단했다는 뜻입니다.

그 이유는 명확합니다.
- 개발비 상승: 팀 규모는 작아도 외주, 아트, 라이브옵스, QA, 포팅 비용이 누적됩니다.
- 출시 불확실성: Steam만으로 끝나지 않고 콘솔, 모바일, 지역별 스토어 정책이 실적을 흔듭니다.
- 밸류에이션 경계: 초기 스튜디오 가치를 높게 잡는 것이 오히려 후속 라운드에서 독이 될 수 있습니다.
- 창업자 피로도: 퍼블리셔 계약이나 지분 희석 뒤 통제권을 잃는 경험이 널리 공유됐습니다.

그래서 매출분배형 구조는 양쪽에 모두 설득력이 생깁니다. 개발자는 “대박을 다 빼앗기지 않으면서 시간을 번다”고 느끼고, 자본 제공자는 “실제 매출에서 먼저 회수한다”고 느낍니다. 특히 인디 팀에게는 기업가치 협상보다 **어떤 조건에서 얼마를 얼마나 빨리 회수당하는가**가 훨씬 더 실무적인 질문입니다.

## 심층 분석 2: 유통 옵션이 자금조달 조건을 바꾸는 시대가 왔다
Fortnite 사례가 중요한 이유는, 유통 채널 변화가 수요와 현금흐름에 얼마나 즉각적인 영향을 미치는지 수치로 보여 줬기 때문입니다. 강한 IP는 스토어가 열리면 다시 올라옵니다. 이 논리를 인디 게임에 그대로 복사할 수는 없지만, 투자자와 자금 제공자의 사고방식에는 영향을 줍니다. 왜냐하면 그들은 이제 “콘텐츠 품질”과 함께 “유통 재개 가능성”, “지역별 재런치 여지”, “대체 스토어 활용 가능성”, “웹 배포나 외부 결제의 채택 옵션”까지 회수 모델에 넣을 수 있기 때문입니다.

Apple의 EU·일본 문서는 이 점을 제도 차원에서 뒷받침합니다. 대체 마켓 배포와 웹 배포가 현실이 되면, 모바일 게임의 미래 현금흐름은 하나의 App Store 정책에만 묶이지 않을 수 있습니다. 물론 Apple은 여전히 보안·안전·심사 기준을 강조하고 있고, 일본 문서에서도 대체 결제나 대체 마켓에는 추가 의무와 통제가 붙습니다. 그러나 자본 제공자 입장에서는 그조차 좋은 소식일 수 있습니다. 이유는 단순합니다. **옵션이 하나라도 더 많아지면 회수 시나리오를 더 많이 설계할 수 있기 때문**입니다.

즉 과거의 게임 금융이 “게임이 성공하느냐”에만 걸려 있었다면, 앞으로의 게임 금융은 “어떤 유통 경로를 몇 개나 확보하고, 어느 경로가 막혀도 다른 경로가 살아 있는가”를 더 중요하게 볼 가능성이 높습니다.

## 심층 분석 3: Indie Fund와 Sanlo는 같은 철학의 양끝에 있다
Indie Fund는 커뮤니티 기반 투자 신디케이트의 고전적 버전이고, Sanlo는 훨씬 더 금융상품화된 버전입니다. 그런데 둘 다 본질은 같습니다. **개발자를 완전히 집어삼키지 않고, 매출 흐름에서 제한적으로 회수한다**는 철학입니다.

Indie Fund의 강점은 계약이 놀랄 만큼 명확하다는 점입니다. 투자금 상환 후 매출 25%, 최대 2배 회수, 2년 만기. 이 구조는 개발자에게 “최악의 경우 영원한 족쇄는 아니다”라는 심리적 안전을 줍니다. Sanlo는 여기에 속도와 편의, 데이터 기반 심사, 라인오브크레딧 같은 금융적 유연성을 더합니다. 즉 Indie Fund가 문화적으로 “인디 친화적 자본”을 만들었다면, Sanlo는 그것을 더 반복 가능한 SaaS형 금융 오퍼링으로 바꾸고 있는 셈입니다.

이 흐름의 끝에 Griffin이 있습니다. Griffin은 벤처 캐피털의 자본력과 네트워크를 가진 플레이어가 이제 같은 철학을 더 큰 규모로 적용하기 시작했다는 신호입니다. 그래서 이것은 단발성 뉴스가 아니라, **인디 금융의 제도화**로 읽어야 합니다.

## 심층 분석 4: Master에게 중요한 것은 ‘큰 돈’이 아니라 ‘회수 속도를 설계할 권리’다
Master 같은 솔로 빌더나 초소형 팀이 이 흐름에서 배워야 할 것은 단순히 “투자 받을 수 있다”가 아닙니다. 오히려 핵심은 **작은 성공을 큰 희석 없이 반복할 수 있는 구조를 미리 설계하라**는 데 있습니다.

특히 HTML5 게임, 모바일 앱, 캐주얼·니치 타이틀 같은 영역에서는 회사 전체 가치를 비싸게 인정받는 것보다, 첫 출시와 첫 현금흐름을 만들고 그것을 재투자하는 루프가 더 중요할 수 있습니다. 그 관점에서 revenue-share나 capped repayment 모델은 단순한 차선책이 아니라, 오히려 창업자에게 더 맞는 1차 전략일 수 있습니다.

여기서 중요한 실무 포인트는 세 가지입니다.
1. **프로토타입 품질**: Indie Fund가 플레이어블 프로토타입을 필수로 요구하듯, 지금 자금은 아이디어보다 검증 가능한 빌드에 반응합니다.
2. **유통 설계**: 어떤 스토어를 먼저 갈지, 모바일이면 App Store 정책 변화와 대체 배포 옵션을 어떻게 볼지, 지역별 재런치 가능성을 어떻게 남길지 정리돼 있어야 합니다.
3. **회수 우선순위 이해**: 돈을 빌리는 순간 무엇을 잃는지보다, 언제부터 얼마나 현금흐름이 빠져나가는지를 먼저 계산해야 합니다.

## Best / Base / Worst 시나리오

### Best Case
매출분배형 자금조달과 대체 유통 옵션이 동시에 확대되면서, 소규모 스튜디오도 지분을 거의 내주지 않고 첫 작품 또는 두 번째 작품을 연속 출시할 수 있습니다. 이 경우 승자는 퍼블리셔가 아니라, **프로토타입 검증력과 유통 실무를 갖춘 작은 팀**이 될 수 있습니다.

### Base Case
자본 공급은 늘어나지만 아무에게나 열리지는 않습니다. 자금은 여전히 프로토타입, 시장성, 플랫폼 적합성, 회수 경로가 명확한 팀에 집중됩니다. 대체 스토어와 웹 배포도 현실적 옵션이 되지만, 보안·심사·운영 비용 때문에 모든 팀이 쉽게 쓰지는 못합니다. 이 경우 가장 현실적인 결론은, **좋은 게임 + 명확한 회수 시나리오 + 제한된 유통 리스크**를 함께 제시하는 팀만 혜택을 본다는 것입니다.

### Worst Case
개발자는 지분을 안 뺏긴다는 말에 안심하지만, 실제로는 매출 초반을 너무 많이 양도해 라이브 운영 자금이 마르는 문제가 생길 수 있습니다. 대체 유통도 정책 변화는 있었지만 실제 사용자 습관 전환이 더딜 수 있습니다. 이 경우 revenue-share는 창업자 친화적 포장 아래 **초기 현금흐름을 갉아먹는 보이지 않는 세금**이 될 수 있습니다.

제 판단으로는 지금은 **Base Case가 가장 유력**합니다. 돈의 형태는 분명 바뀌고 있지만, 그 혜택은 결국 프로토타입·유통 전략·장르 적합성까지 함께 준비된 팀에게만 실질적으로 돌아갈 가능성이 높기 때문입니다.

## Master에게 미칠 영향
첫째, 앞으로 게임/앱 프로젝트는 “얼마를 조달할 수 있나”보다 “어떤 회수 구조를 감당할 수 있나”를 먼저 봐야 합니다. 작은 팀일수록 희석보다 현금흐름 상환이 유리할 수 있지만, 매출 초반이 얇으면 오히려 운영 여력이 더 줄어들 수 있습니다.

둘째, 모바일 또는 크로스플랫폼 게임은 유통 옵션을 제품 설계 초기에 포함해야 합니다. EU·일본 정책 변화를 당장 활용하지 않더라도, 어떤 스토어 의존성이 위험한지 미리 점검하는 팀이 자금 협상에서도 유리합니다.

셋째, 프로토타입 우선주의가 더 강해질 가능성이 높습니다. 아이디어 피치만으로 자금을 당기기보다, 작아도 돌아가는 데모와 실제 잔존·과금 가설을 보여 주는 편이 훨씬 설득력 있습니다.

넷째, Master의 자산형 전략—작은 게임 여러 개, 빠른 출시, 유통 채널 다변화—는 오히려 지금 시장 구조와 더 잘 맞습니다. 거대한 스튜디오 기업가치 게임보다, **짧은 회수 주기를 가진 실전 자산 포트폴리오**가 자금조달 구조 변화와 궁합이 좋습니다.

## 액션 아이템

### 단기
1. 현재 또는 예정 프로젝트별로 **출시 후 12개월 현금흐름표**를 만든다. 광고, 인앱결제, 플랫폼 수수료, UA, 운영비를 넣고 revenue-share 상환이 붙을 때 손익분기점이 어떻게 달라지는지 계산한다.
2. 각 프로젝트에 대해 **유통 1순위 / 2순위 / 차선 경로**를 적는다. Steam, itch.io, Telegram Mini App, App Store, 대체 마켓 등 어떤 채널이 막혀도 다음 경로가 있는지 확인한다.
3. 외부 자금을 검토한다면, 밸류에이션보다 먼저 **회수 캡(cap), 회수 기간, 매출 분배율, 조기상환 가능성**을 비교표로 만든다.

### 중기
1. 투자나 퍼블리셔 피치 자료를 “세계관”보다 **프로토타입 + KPI 가설 + 유통 계획 + 회수 시나리오** 중심으로 다시 짠다.
2. 모바일 프로젝트는 App Store 정책 리스크와 대체 배포 가능성을 체크리스트화한다. 특히 지역별 정책 차이와 외부 결제 옵션이 향후 어떤 실험 기회를 줄지 정리한다.
3. 게임별로 초기 매출을 재투자해 다음 타이틀을 굴리는 **자체 회전형 포트폴리오 구조**를 설계한다. revenue-share 자금은 이 루프를 앞당기는 도구인지, 망가뜨리는 도구인지 숫자로만 판단한다.

### 장기
1. Master의 게임 사업은 “대박 1개”보다 **회수 가능한 자산 5~10개 묶음**을 목표로 두는 편이 현재 금융 환경과 더 잘 맞습니다.
2. 나중에 외부 자본을 쓰더라도, IP와 운영권을 오래 보유할 수 있는 구조만 고른다. 특히 모바일/라이브옵스 자산은 장기적 잔존가치가 있으므로 초기에 너무 싸게 넘기면 안 됩니다.
3. 자금조달 문서와 유통 문서를 분리하지 말고 하나의 투자 내러티브로 묶는다. 앞으로 돈은 제품만이 아니라 **배포 가능성**을 보고 들어옵니다.

## 미스 김 인사이트
- 지금 인디 게임 금융의 핵심 변화는 “누가 돈을 주느냐”가 아니라 **누가 매출 초반을 얼마나 가져가느냐**입니다.
- Fortnite 사례는 강한 유통 채널 하나가 다시 열릴 때 현금흐름 가치가 얼마나 빠르게 재평가되는지 보여 줍니다. 투자자는 이미 이 교훈을 학습하고 있을 가능성이 큽니다.
- 따라서 인디 팀의 협상력은 피치 덱의 미사여구보다, **프로토타입·유통 옵션·초기 매출 구조**를 얼마나 구체적으로 설명할 수 있느냐에서 나옵니다.
- Master에게 가장 유리한 전략은 큰 희석을 감수한 회사 만들기 게임보다, 작은 자산을 반복 출시하며 회수 주기를 짧게 관리하는 구조입니다.

## Practical Conclusion
오늘의 Griffin, Sanlo, Indie Fund, Fortnite, Apple 문서를 함께 놓고 보면 결론은 꽤 명확합니다. 인디 게임 자금조달은 더 이상 “VC를 받을까, 퍼블리셔를 잡을까”의 이분법이 아닙니다. 지금 시장은 **유통 경로가 살아 있는 게임의 미래 매출을 어떻게 선매입하고, 얼마나 제한적으로 회수할 것인가**라는 쪽으로 움직이고 있습니다. 그래서 앞으로 가장 강한 인디 팀은 가장 큰 돈을 끌어오는 팀이 아니라, **가장 적은 희석으로 가장 빠른 현금흐름 회전 구조를 설계하는 팀**일 가능성이 큽니다.

## 참고 자료
1. PocketGamer.biz, “Griffin launches $100m indie games fund focused on revenue-sharing model”  
   https://www.pocketgamer.biz/griffin-launches-100m-indie-games-fund-focused-on-revenue-sharing-model/
2. Griffin Gaming Partners, “Home”  
   https://griffingp.com/
3. Sanlo, “Home”  
   https://www.sanlo.io/
4. Sanlo, “Video game funding”  
   https://www.sanlo.io/game-funding
5. Indie Fund, “Home”  
   https://indie-fund.com/
6. Indie Fund, “About”  
   https://indie-fund.com/about
7. Indie Fund, “Apply”  
   https://indie-fund.com/apply
8. PocketGamer.biz, “Fortnite’s global iOS comeback drives downloads to eight-year high”  
   https://www.pocketgamer.biz/fortnites-global-ios-comeback-drives-downloads-to-eight-year-high/
9. PocketGamer.biz, “Fortnite returns globally on the App Store, with one exception”  
   https://www.pocketgamer.biz/fortnite-returns-globally-on-the-app-store-with-one-exception/
10. Apple App Store, “Fortnite App - App Store”  
   https://apps.apple.com/us/app/fortnite/id6483539426
11. Apple Developer, “App Review Guidelines”  
   https://developer.apple.com/app-store/review/guidelines/
12. Apple Support, “Update on apps distributed in the European Union”  
   https://developer.apple.com/support/dma-and-apps-in-the-eu/
13. Apple Support, “Changes to iOS in Japan”  
   https://developer.apple.com/support/app-distribution-in-japan/
14. Apple App Store Connect Help, “Manage distribution on an alternative app marketplace”  
   https://developer.apple.com/help/app-store-connect/managing-alternative-distribution/manage-distribution-on-an-alternative-app-marketplace
15. Kepler / Kowloon Nights, “Inbound Form”  
   https://www.kowloonnights.com/

🔴 Red Team:
- [공격 1]: Griffin, Sanlo, Indie Fund를 한 흐름으로 묶는 해석은 타당하지만, 실제 시장에서는 퍼블리셔 선급금이나 플랫폼 MG가 여전히 더 큰 비중일 수 있습니다.
- [공격 2]: Fortnite의 글로벌 복귀를 인디 게임 현금흐름 논리에 연결하는 것은 강한 IP 사례를 일반화하는 위험이 있습니다.
- [방어/완화]: 그래서 본문은 ‘모든 팀이 동일한 혜택을 본다’고 쓰지 않았고, Base/Worst 시나리오에서 매출 초반 잠식과 대체 유통 채택 한계를 명시했습니다. 또한 Fortnite는 일반화 근거가 아니라 ‘유통 복귀가 현금흐름 가치에 미치는 방향성 증거’로만 제한했습니다.
- [합의]: 🟢극복

✅ Anti-rationalization: Pass
