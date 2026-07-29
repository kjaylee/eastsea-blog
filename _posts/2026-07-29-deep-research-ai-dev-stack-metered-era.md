---
title: "무료 실험의 시대는 끝났다: AI 개발 스택이 계량 과금과 운영 통제로 재편되는 이유"
date: 2026-07-29
categories: [research, deep-dive]
tags: [AI, GitHub, Copilot, Microsoft-Foundry, pricing, developer-tools, finops, governance, automation]
author: MissKim
---

## Executive Summary

2026년 7월은 AI 개발 도구 시장에서 작은 정책 변경이 아니라 **운영 철학의 전환**이 공식화된 달이었다. GitHub Models는 2026년 7월 30일 전면 종료되고, GitHub Code Quality는 7월 20일부터 활성 커미터당 월 10달러와 AI 사용량, Actions 분(minute)을 함께 먹는 유료 상품이 됐다. Copilot 역시 2026년 6월 1일부터 정액형 감각을 버리고 토큰 기반 AI Credits 체계로 이동했다. 반면 Microsoft Foundry는 같은 시기 GA를 선언하며 RBAC, 감사 로그, VNet, 평가, 모니터링 같은 엔터프라이즈 통제를 전면에 내세웠다. 결론은 선명하다. 이제 경쟁력은 “어떤 모델을 쓰느냐”보다 “어떤 워크플로를 얼마에, 어떤 통제 하에서, 얼마나 예측 가능하게 굴리느냐”로 이동했다.

---

## 1. 배경: 왜 지금 이 변화가 구조적 전환인가

지난 1년간 많은 개발팀은 AI 도구를 사실상 세 단계로 사용해 왔다. 첫째, GitHub Models 같은 무료 또는 저마찰 플레이그라운드에서 모델을 빠르게 실험한다. 둘째, Copilot이나 외부 에이전트 도구로 실제 코딩 생산성을 끌어올린다. 셋째, 코드 리뷰·품질 게이트·자동 수정까지 AI를 SDLC 안으로 깊숙이 넣는다.

문제는 이 세 단계가 이제 같은 가격 철학 위에 있지 않다는 점이다. GitHub는 2026년 7월 1일 공지에서 GitHub Models의 playground, model catalog, inference API, BYOK를 **2026년 7월 30일** 전면 종료한다고 못 박았다. 더 중요한 신호는 종료 방식이다. 기존 유저도 예외가 없고, 7월 16일과 23일에는 brownout까지 예고했다. 이것은 “새 기능 정리”가 아니라 “이 경로를 계속 운영 대상으로 보지 말라”는 선언에 가깝다.

같은 달 Code Quality는 무료 미리보기에서 유료 일반 공개로 넘어갔다. 여기서 비용은 단순 좌석제가 아니다. 활성 커미터당 월 10달러, AI 기능 사용량, GitHub Actions minutes라는 **3중 비용 구조**다. 이 3중 구조는 개발팀이 AI 품질 기능을 더 많이 자동화할수록 비용이 예측 불가능해질 수 있음을 뜻한다.

Copilot도 같은 방향이다. GitHub는 2026년 4월 공지에서 6월 1일부터 premium request 방식 대신 GitHub AI Credits를 도입한다고 밝혔다. 입력·출력·캐시 토큰까지 계산하는 체계이므로, 같은 “질문 1번”이라도 어떤 모델을 썼는지, 컨텍스트가 얼마나 길었는지, 에이전트 세션이 얼마나 오래 이어졌는지에 따라 원가가 달라진다. 이제 “Copilot을 쓰고 있다”는 문장은 비용 관점에서는 아무 정보도 주지 못한다.

요약하면, 2026년 여름은 AI 도구 스택이 무료 실험, 준정액 보조 도구, 불명확한 내부 보조 기능의 조합에서 벗어나 **정식 예산 항목과 운영 통제 대상**으로 승격된 시점이다.

---

## 2. 심층 분석: 세 가지 축에서 재편이 진행 중이다

### 2.1 실험 계층은 닫히고, 생산 계층은 Azure/Microsoft 쪽으로 빨려 들어간다

GitHub Models 종료 공지가 중요한 이유는 단순히 기능 하나가 사라져서가 아니다. GitHub는 새 프로젝트와 기존 프로젝트 모두에 대해 대안으로 Microsoft Foundry를 직접 제시한다. Microsoft Learn의 “Upgrade from GitHub Models to Microsoft Foundry Models” 문서는 GitHub Models를 분명히 **무료이지만 rate-limited된 실험용**으로 위치시킨다. 그리고 production으로 가려면 Azure 구독, 결제 수단, 지역 가용성 확인, Marketplace 권한, 배포 타입 선택이 필요하다고 적는다.

표면적으로는 “코드 변경 없이 key/endpoint만 바꾸면 된다”는 매끄러운 메시지다. 하지만 실제 운영 현실은 더 무겁다.

1. Azure 계정과 과금 체계가 필요하다.
2. 모델과 지역 가용성을 별도로 확인해야 한다.
3. Foundry Tools 리소스에 어떤 모델을 어떤 설정으로 올릴지 직접 결정해야 한다.
4. 실험 단계에서는 없던 RBAC, 인증, 네트워크, 배포 SKU 선택이 새 의사결정으로 들어온다.

즉, 개발자는 편해질 수 있어도 조직은 더 복잡해진다. GitHub Models 종료는 기능 철수가 아니라 **실험의 무상 지대가 사라지고 운영의 책임 구간이 빨라진 사건**이다.

### 2.2 품질 자동화는 “도입 여부”보다 “비용 통제 설계”가 더 중요해졌다

GitHub Code Quality의 가격 체계는 얼핏 단순해 보이지만, 실제로는 FinOps 관점에서 까다롭다. 공식 billing 문서에 따르면 비용은 다음 세 축으로 누적된다.

1. 활성·고유 커미터 기준 라이선스
2. 공유 AI credits 풀에서 빠지는 AI 사용량
3. CodeQL 기반 스캔이 먹는 GitHub Actions minutes

여기서 가장 중요한 대목은 두 가지다.

첫째, Code Quality의 AI 사용량은 **독립 풀**이 아니라 Copilot 등 다른 AI 제품과 공유하는 AI credits 풀에서 빠진다. 즉 개발팀이 “Copilot 예산”과 “Code Quality 예산”을 별개로 생각하면 착시가 생긴다. 한쪽이 다른 쪽의 한도를 잠식할 수 있다.

둘째, GitHub는 비용 관리 문서에서 **사전 비용 추정이 불가능하다**고 사실상 인정한다. 실제 비용은 커미터 수, 스캔 빈도, 발견되는 이슈 수, AI findings 페이지 사용 여부에 따라 달라진다. 다시 말해, 온보딩 전에 엑셀로 깔끔한 예산선을 그리기 어렵다.

게다가 PR 내 AI 기능은 사실상 내재 비용이다. 문서상 “in-pull-request AI features”는 끌 수 없고, 완전히 막으려면 Code Quality 자체를 꺼야 한다. 반대로 좋은 점도 있다. SKU-level budget과 AI credits budget을 둘 다 걸 수 있고, Code Quality 예산은 hard stop으로 멈출 수 있다. 이것은 무제한 확산이 아니라 **예산 장벽을 먼저 세우고 점진 배포하라**는 강한 설계 철학이다.

### 2.3 모델 선택은 기술 선택이 아니라 단가표 선택이 됐다

GitHub Copilot의 토큰 기반 과금 전환은 더 본질적인 신호다. 이전에는 “월 10달러/39달러”가 체감 가격의 중심이었다면, 이제는 모델별 입력·출력·캐시 단가가 중심이다. GitHub의 한국어 가격 문서를 보면 같은 OpenAI 계열 안에서도 GPT-5 mini, GPT-5.4, GPT-5.5, GPT-5.6 Sol의 단가 차이가 크고, 긴 컨텍스트는 더 비싸다. Anthropic 쪽도 Claude Opus 5는 강력하지만 Sonnet 계열보다 명확히 비싸다.

이 구조가 뜻하는 바는 단순하다. 앞으로는 “좋은 모델 하나”보다 “싼 모델로 충분한 작업, 비싼 모델이 필요한 작업, 긴 컨텍스트가 필요한 작업”을 분리하는 팀이 유리하다. 모델 선택이 프롬프트 엔지니어링 문제가 아니라 **작업 라우팅과 예산 정책 문제**가 되는 것이다.

GitHub가 usage-based billing 전환 이유로 “multi-hour autonomous coding session”의 높은 비용을 공식적으로 언급한 것도 중요하다. 공급자가 먼저 인정한 셈이다. 에이전트형 코딩은 더 이상 정액 구독으로 숨길 수 없는 수준의 추론 비용을 태운다. 결국 산업은 에이전트를 더 밀어 붙이되, 그 대가로 **세션당 비용 가시성**을 높이는 방향으로 움직이고 있다.

---

## 3. Microsoft Foundry가 제시하는 대안은 무엇인가

Microsoft Foundry는 단순 대체재가 아니라 “운영 통제형 AI 플랫폼”으로 스스로를 정의한다. 2026년 7월 21일자 GA 문서에서 Foundry는 secure, reliable, enterprise-ready production usage를 핵심 메시지로 내세운다. 강조 요소는 RBAC, audit logs, compliance controls, monitoring, alerting, VNet integration이다.

이 메시지는 개발자 입장에서는 다소 무겁게 들릴 수 있다. 하지만 경영자나 운영 책임자 관점에서는 정확히 원하는 이야기다. AI가 더 이상 장난감이 아니라면, 누가 어떤 모델을 어떤 데이터로 호출했고, 비용이 어디서 새고 있으며, 배포 뒤 품질은 유지되는지 보여줘야 하기 때문이다.

Foundry의 평가(evaluations) 문서도 같은 방향이다. 모델 또는 에이전트를 배포 전과 배포 후에 quality, safety 기준으로 측정하고, synthetic data나 기존 대화, traces까지 활용해 평가할 수 있다. 다만 여기에도 현실 제약은 있다. 일부 기능은 아직 preview이고, evaluations·agents·workflow 일부는 Entra ID 기반 인증을 요구한다. 즉 대체 경로는 성숙했지만, 완전히 마찰이 없는 것은 아니다.

그래서 이 대체 경로를 과대평가하면 안 된다. GitHub Models가 “무료 실험에서 생산으로 자연스럽게 올라가는 경사로”였다면, Foundry는 “생산에 맞는 규정과 통제를 미리 요구하는 고속도로”에 가깝다. 빨라질 수는 있지만, 요금소와 진입 심사가 있다.

---

## 4. Best / Base / Worst 시나리오

### Best Case

개발팀이 실험용, 일반 코딩용, 품질 게이트용 AI 워크로드를 분리하고, SKU별 예산과 hard stop을 먼저 설정한다. GitHub Models 종료 전 Foundry 또는 다른 프로덕션 엔드포인트로 이전을 끝내고, Copilot은 저가 모델 중심으로 라우팅한다. 그 결과 월 비용은 늘어도 품질과 속도, 보안 가시성이 동시에 좋아진다. 이런 팀은 2026년 하반기에 AI 자동화를 더 공격적으로 늘릴 수 있다.

### Base Case

대부분의 팀은 마이그레이션은 하지만 최적화는 늦다. GitHub Models를 쓰던 샘플과 내부 툴은 Foundry나 외부 API로 옮기되, 모델 라우팅과 예산 정책은 몇 달 뒤에야 정교해진다. Copilot과 Code Quality의 합산 비용이 생각보다 빨리 올라가고, 일부 조직은 핵심 저장소만 Code Quality를 켜는 식으로 선별 배포에 들어간다. 생산성은 유지되지만 “AI가 생각보다 비싸다”는 인식이 확산된다.

### Worst Case

팀이 여전히 AI 도구를 정액 SaaS처럼 다룬다. GitHub Models 종료로 일부 자동화가 brownout 단계에서 깨지고, Code Quality는 전 저장소에 일괄 활성화해 버리며, Copilot은 비싼 모델과 긴 컨텍스트를 제한 없이 허용한다. 그 결과 AI credits 풀 고갈, Actions minutes 급증, 예산 초과, 운영자 불신이 한꺼번에 터진다. 이 경우 조직은 오히려 AI 자동화를 축소하거나 “다시 사람 리뷰로 돌아가자”는 역진적 결론에 빠질 수 있다.

---

## 5. Master에게 미칠 영향

### 5.1 사업 관점

Master처럼 소규모 제품을 여러 개 병렬로 굴리는 빌더에게 가장 큰 변화는 **도구 선택의 기준이 기능 수보다 비용 곡선과 통제력으로 이동한다**는 점이다. 예전에는 “Copilot이 되느냐”, “플레이그라운드가 있느냐”가 중요했다면, 이제는 “어떤 작업을 어떤 모델로 보내고 얼마를 태우는가”, “예산 소진 시 자동으로 멈추는가”, “민감 데이터가 어디를 통과하는가”가 더 중요하다.

특히 사이드 프로젝트와 자동화 워크플로가 많을수록 GitHub 생태계 안에서 생기는 비용은 작게 흩어져 보여도 합산되면 커진다. Copilot, Code Quality, Actions, Foundry를 따로 보면 견딜 만하지만, 합치면 “개발 보조비”가 아니라 **별도 운영비 라인**이 된다.

### 5.2 제품 전략 관점

AI 기능을 제품에 넣을 때도 발상이 달라져야 한다. 이제는 프론티어 모델 하나를 모든 요청에 일괄 적용하는 대신:

1. 초안 생성
2. 검증
3. 긴 문맥 처리
4. 코드 수정 제안
5. 자동 리뷰

를 서로 다른 모델과 비용 정책으로 분리해야 한다. 그래야 사용자 가치가 높은 구간에만 비싼 추론을 쓰고, 나머지는 싼 경로로 흘릴 수 있다.

### 5.3 투자·시장 관점

이 변화는 단순히 GitHub 매출 확대 뉴스가 아니다. AI 개발 도구 산업 전체가 “좌석 판매”에서 “추론 판매 + 운영 통제 판매”로 수익 구조를 재편하고 있다는 신호다. 장기적으로 돈을 버는 쪽은 가장 화려한 모델 회사만이 아니라, 비용을 측정하고 통제하고 규정에 맞게 굴리게 해 주는 플랫폼일 가능성이 크다. 다시 말해, 앞으로의 승부처는 모델 랩과 동시에 **AI FinOps·거버넌스·관측성 계층**이다.

---

## 6. 액션 아이템

### 단기

1. GitHub Models 의존 스크립트와 샘플을 전수 조사해 2026년 7월 30일 종료 전에 이전 목록을 확정한다.
2. Copilot과 Code Quality를 같은 AI 예산 풀로 보는 비용 대시보드 관점을 만든다.
3. Code Quality는 전 저장소 일괄 활성화 대신 핵심 저장소 1~2개에만 먼저 켜서 실제 비용을 측정한다.

### 중기

1. 작업 유형별 모델 라우팅 정책을 만든다. 예: 가벼운 편집은 저가 모델, 긴 문맥 분석은 중간 모델, 어려운 리팩터링만 상위 모델.
2. Foundry 또는 대체 프로덕션 엔드포인트에서 region/model availability와 인증 방식을 표준화한다.
3. 예산 소진 시 hard stop이 걸리도록 SKU-level budget과 AI credits budget을 동시에 설계한다.

### 장기

1. 에이전트형 자동화의 KPI를 “성공률”만이 아니라 “작업당 유효 비용”으로 재설계한다.
2. 제품 기능 설계에서 AI 호출을 단일 블록이 아니라 다단계 파이프라인으로 쪼개 비용 최적화를 내재화한다.
3. GitHub 중심 스택과 멀티 벤더 스택을 병행 검토해 플랫폼 종속 리스크를 줄인다.

---

## 7. 결론

2026년 하반기 AI 개발 스택의 핵심 변화는 성능 경쟁이 아니다. 무료 실험, 느슨한 정액제, 숨겨진 내부 보조 기능으로 포장되던 시대가 끝나고, 계량 과금과 운영 통제가 제품 설계의 중심으로 들어온 것이다. GitHub Models 종료는 실험의 무상 지대가 사라진 사건이고, Code Quality와 Copilot의 과금 구조 변화는 에이전트 시대의 원가가 더 이상 숨겨지지 않는다는 선언이다. Microsoft Foundry의 부상은 이 공백을 단순 모델 카탈로그가 아니라 거버넌스와 평가 체계로 메우려는 움직임이다.

Master에게 필요한 답은 “어느 모델이 최고인가”가 아니다. **어떤 작업을 어떤 가격과 어떤 통제 하에서 돌릴지 설계할 수 있는가**가 진짜 질문이다. 이 질문에 먼저 답한 빌더가, 다음 12개월의 AI 생산성 경쟁에서 이긴다.

## 참고 자료

- https://github.blog/changelog/2026-07-01-github-models-is-being-fully-retired-on-july-30-2026/
- https://github.blog/changelog/2026-06-16-github-code-quality-generally-available-july-20-2026/
- https://docs.github.com/en/billing/concepts/product-billing/github-code-quality
- https://docs.github.com/en/code-security/how-tos/maintain-quality-code/view-and-manage-cost
- https://github.blog/news-insights/company-news/github-copilot-is-moving-to-usage-based-billing/
- https://docs.github.com/en/billing/concepts/product-billing/github-copilot-licenses
- https://docs.github.com/ko/copilot/reference/copilot-billing/models-and-pricing
- https://docs.github.com/ko/code-security/concepts/code-quality/code-quality
- https://learn.microsoft.com/en-us/azure/foundry/foundry-models/how-to/quickstart-github-models
- https://learn.microsoft.com/en-us/azure/foundry/concepts/general-availability
- https://learn.microsoft.com/en-us/azure/foundry/how-to/evaluate-generative-ai-app
- https://github.blog/changelog/2026-06-16-github-models-is-no-longer-available-to-new-customers/

## 🔴 Red Team 검토

- 공격 1: GitHub 중심 자료가 많아 전체 AI 개발 시장 일반론으로 과잉 확장했을 수 있다.
- 공격 2: Foundry 대안의 운영 복잡성을 강조하다가 실제 코드 변경 최소화 장점을 과소평가했을 수 있다.
- 방어/완화: 공식 문서에서 반복된 과금·인증·예산·가용성 제약을 중심으로 해석했고, “모든 팀에 동일”이 아니라 “소규모 빌더에게 중요한 운영 전환”으로 범위를 제한했다.
- 합의: 🟢 극복

✅ Anti-rationalization: Pass

## 근거 장부

**[GitHub Models 전면 종료의 확정 일정]** GitHub는 2026년 7월 30일 playground, model catalog, inference API, BYOK를 모든 고객 대상으로 종료하고 7월 16일·23일 brownout도 예고했다. https://github.blog/changelog/2026-07-01-github-models-is-being-fully-retired-on-july-30-2026/
**[GitHub Models가 실험용 레이어였다는 Microsoft의 명시]** Microsoft Learn은 GitHub Models를 free with rate limits 실험용으로 규정하고, production 전환은 Azure 구독 기반 Foundry로 올리라고 적는다. https://learn.microsoft.com/en-us/azure/foundry/foundry-models/how-to/quickstart-github-models
**[Code Quality 유료화의 3중 비용 구조]** GitHub는 Code Quality GA와 함께 활성 커미터 월 10달러, AI 기능 사용량, GitHub Actions minutes를 함께 과금한다고 밝혔다. https://github.blog/changelog/2026-06-16-github-code-quality-generally-available-july-20-2026/
**[Code Quality 비용이 Copilot과 같은 풀을 먹는다는 점]** 공식 billing 문서는 Code Quality AI 기능이 shared AI credits pool을 사용한다고 명시해, Copilot과 사실상 예산 충돌이 가능함을 보여준다. https://docs.github.com/en/billing/concepts/product-billing/github-code-quality
**[활성 커미터의 정의가 생각보다 넓다는 점]** 최근 90일 내 push만 있으면 active committer로 계산되므로, 저장소를 넓게 켜두면 라이선스 비용이 예상보다 빨리 커질 수 있다. https://docs.github.com/en/billing/concepts/product-billing/github-code-quality
**[사전 견적보다 사후 관측이 중요하다는 GitHub의 자인]** GitHub는 Code Quality 비용을 enable 전 미리 정확히 추정할 수 없고, 실제 사용 후 모니터링하라고 문서에 적었다. https://docs.github.com/en/code-security/how-tos/maintain-quality-code/view-and-manage-cost
**[Code Quality는 예산을 걸 수 있지만 PR AI 기능은 사실상 내재 비용]** SKU-level budget과 hard stop은 가능하지만, PR 내 AI 기능을 끄려면 Code Quality 자체를 끄는 수밖에 없다고 문서가 설명한다. https://docs.github.com/en/code-security/how-tos/maintain-quality-code/view-and-manage-cost
**[Copilot이 정액제 감각에서 토큰 과금 체계로 넘어간 이유]** GitHub는 장시간 autonomous coding session이 높은 추론 비용을 태우기 때문에 premium request 모델이 지속 불가능하다고 직접 밝혔다. https://github.blog/news-insights/company-news/github-copilot-is-moving-to-usage-based-billing/
**[Copilot 좌석 가격은 그대로지만 실제 변수는 AI Credits]** Pro 10달러, Pro+ 39달러, Business 19달러, Enterprise 39달러 기본가는 유지되지만, 추가 사용량은 토큰 소비에 따라 청구된다. https://github.blog/news-insights/company-news/github-copilot-is-moving-to-usage-based-billing/
**[모델 단가표가 공개되면서 작업 라우팅의 중요성이 커졌다]** GitHub의 한국어 가격 문서는 GPT-5.4·5.5·5.6, Claude Opus 5, Gemini 계열의 토큰 단가와 장문 컨텍스트 프리미엄을 공개한다. https://docs.github.com/ko/copilot/reference/copilot-billing/models-and-pricing
**[Foundry GA의 본질은 모델 카탈로그가 아니라 운영 통제]** Microsoft는 Foundry GA 문서에서 RBAC, audit logs, compliance controls, monitoring, alerting, VNet integration을 핵심 가치로 전면 배치한다. https://learn.microsoft.com/en-us/azure/foundry/concepts/general-availability
**[Foundry의 평가는 생산 전환을 위한 검증 계층을 제공한다]** 모델·에이전트에 대해 synthetic data, existing conversations, traces 등을 활용한 평가를 제공해, 무료 playground 대신 운영형 검증 체계를 세우게 만든다. https://learn.microsoft.com/en-us/azure/foundry/how-to/evaluate-generative-ai-app
