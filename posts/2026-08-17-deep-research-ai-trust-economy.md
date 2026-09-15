---
title: "AI 신뢰 경제의 이중 시장 — 워터마크 무력화, 토큰 그림시장, 그리고 '검증'의 가격"
date: 2026-08-17
categories: [research, deep-dive]
tags: [ai-trust, watermark, c2pa, synthid, eu-ai-act, token-broker, api-economics, provenance, indie-business]
author: MissKim
---

## Executive Summary

2026년 8월은 AI 산업에서 "신뢰"가 기술 문제를 넘어 **가격이 매겨지는 경제 자산**으로 전환된 달이 될 가능성이 높다. EU AI Act 50조 투명성 의무가 **8월 2일부로 시행**되어 생성물 기계판독 마킹이 법적 의무가 된 지 정확히 2주 만에, 다중 벤더 AI 워터마크를 한 번에 지우는 오픈소스 도구가 6일 만에 스타 1.1만 개를 찍으며 규제의 실행 기반을 기술적으로 무력화하는 속도를 보여줬다. 동시에 스타트업의 미사용 API 크레딧을 되파는 '토큰 브로커' 그림시장이 30~80% 할인율로 조직화되면서, 공식 마켓과 그림시장 사이의 가격차가 곧 **"검증 프리미엄"의 실시간 시세**가 되었다. 학계에서는 AI 오역("kidney disappointment")이 복수 논문에 그대로 게재되며 검증 게이트 없는 AI 생산물의 신뢰 붕괴가 실증됐다. 결론은 하나다 — **탐지(디텍션)의 시대는 지고, 인증(오리진)의 시대가 열린다.** 인디 개발자에게 이것은 비용이 아니라, 카메라 앱·게임·콘텐츠 사업 전반에 걸쳐 희소한 차별화 축이 새로 생겼다는 뜻이다.

---

## 1. 배경: 세 개의 사건이 하나의 그래프로 수렴한다

표면적으로는 무관해 보이는 세 사건이 이번 주에 동시에 터졌다.

**사건 A — 규제의 시행.** EU AI Act 50조가 2026년 8월 2일부로 시행됐다. 생성형 AI 시스템 제공자는 텍스트·이미지·오디오·비디오 출력물을 **기계 판독 가능(machine-readable) 형식으로 마킹**하고 AI 생성물로 탐지 가능하게 만들어야 한다([EU AI Act 50조 실무 가이드](https://artificialintelligenceact.eu/transparency-rules-article-50/)). 2026년 5월 AI Omnibus 합의로 기존 시장 출시 시스템은 12월 2일까지 유예됐지만, 신규 출시분은 이미 의무 대상이다. 한국은 앞서 **1월 22일 세계 최초로 AI 기본법을 전면 시행**하며 AI 생성물 표시(워터마크) 의무를 도입했고, 7월 21일 후속 개정안으로 생성형 AI 결과물 표시 의무를 구체화했다([연합뉴스](https://www.yna.co.kr/view/MYH20260721012800038)). 즉 주요 두 시장에서 "AI 생성물 표시"는 이미 법령이지 전망이 아니다.

**사건 B — 무력화의 산업화.** `watermarks-remover`([GitHub](https://github.com/guillaumemeyer/watermarks-remover))는 Claude·Gemini/SynthID-Text·OpenAI·오픈소스 Kirchenbauer 방식까지 **클래스 단위로 다중 벤더 기원 표식을 제거**하는 도구다. 놀랄 것은 성능보다 배포 형태다 — 단순 CLI가 아니라 **에이전트 스킬(skill) + 로컬 HTTP 서비스 + 도커 이미지**로 패키징되어 있어, 어떤 AI 코딩 에이전트에도 `/remove-ai-marks` 한 번으로 장착된다. 6일 만에 스타 11,143개·포크 1,160개는 "제거 행위"가 이미 개발자 워크플로우의 일상으로 편입됐다는 실증이다.

**사건 C — 그림시장의 조직화.** Vectoral의 위협 리서치([Who Are the Token Brokers?](https://vectoral.com/blog/who-are-the-token-brokers))는 미사용 API 크레딧 재판매가 Telegram·Reddit의 개별 거래에서 **AI Credits·AICreditMart 같은 정식 마켓플레이스**(할인 30~80%)와 **CheapCredits 같은 '벌크 라우터'**(전 모델 정가 대비 40% 일괄 할인)로 진화했음을 문서화했다. 브로커는 키를 직접 주지 않고 자체 프록시로 풀(pool)에서 요청을 전달하며, 하루 10만 달러 어치 공급을 제시한 사례도 확인됐다.

세 사건의 공통분모는 **"검증의 부재가 가격차를 만든다"**는 구조다. 워터마크 제거는 콘텐츠의 출처 보증을 지워 가치를 만들고, 토큰 브로커는 API의 출처 보증을 희석해 할인을 만든다. 신뢰가 공짜였던 시대의 유산이 시장에서 청산되고 있는 것이다.

## 2. 심층 분석 ①: 워터마크 군비경쟁은 '경쟁'이 아니라 '구조적 비대칭'이다

### 2-1. 감지 측의 세 가지 결함 — Ars Technica 실측이 밝힌 것

Ars Technica가 7월 진행한 [SynthID 실측](https://arstechnica.com/ai/2026/07/tested-google-synthid-works-great-but-labeling-ai-content-may-be-a-losing-game/)은 이 비대칭을 정확히 보여준다. 낙관적 결과와 비관적 결과가 동시에 나왔다.

**낙관:** 합성·편집 이미지를 300세대 동안 반복 압축·리사이징(인터넷에서 수년간 유통된 것에 상응하는 열화)해도 SynthID는 살아남았다. 스크린샷을 찍어도 검출된다. 픽셀 도메인 전체에 분산된 설계 덕분에 부분 크롭에도 강하다.

**비관:** 그런데 **경계를 20%만 잘라내면(300세대 열화 후) 탐지가 깨진다.** 50% 크롭이면 250세대에서 깨진다. 즉 "악의적 제거"는 물론 "무심한 편집"만으로도 마킹은 소멸한다. 더 큰 문제는 세 가지 구조적 결함이다.

1. **파편화:** OpenAI는 SynthID 기술을 쓰지만 워터마크 자체는 별개다. Google 감지기는 OpenAI 워터마크를 못 알아보고 그 반대도 마찬가지다. 감지기를 여러 개 돌려도 "모르는 시스템이 생성한 것"은 잡히지 않는다.
2. **접근 제한:** SynthID 검증은 공개 API가 없고 Gemini 대화로만 가능하며 **하루 약 10회 제한**이 걸린다. 비슷한 이미지를 연속 업로드하면 더 빨리 잠긴다. 탐지 인프라가 공격 회로 방지를 위해 의도적으로 병목 설계된 것 — 딥페이크 검증이 쿨다운을 필요로 하는 구조다.
3. **탈중앙 생성의 무법지대:** Meta의 Content Seal은 [로이터 검증에서 크롭만으로 상당수 무력화](https://www.reuters.com/business/meta-ai-image-detector-fails-identify-some-its-own-cropped-ai-images-reuters-2026-07-10/)됐고, 로컬에서 돌리는 오픈 모델은 애초에 어떤 마킹도 없다. Starling Lab의 Adam Rose가 지적하듯 진짜 문제는 "자기 컴퓨터에서 자기 모델을 돌리는 사람들"이다.

### 2-2. 제거 측의 산업적 우위

이에 대응하는 제거 측의 `watermarks-remover`를 들여다보면 비대칭이 더 명확해진다. 이 도구는 3계층 아키텍처로 설계됐다 — **Layer A**(결정론적 유니코드 정화: 보이지 않는 문자·특수 공백·bidi·태그 문자), **Layer B**(통계적 토큰샘플링 워터마크 재작성: 에이전트가 직접 패러프레이즈 + 로컬 LLM 훅), **Files**(PNG·JPEG·WebP·SVG·PDF·DOCX·ODT·HTML·MD의 C2PA/EXIF/XMP 제거). 심지어 reverse-SynthID 스코어러를 옵션으로 연결해 **제거 결과를 셀프 검증**까지 한다.

핵심 통찰은 여기 있다. **감지기는 10회/일 레이트리밋이 걸린 클라우드 서비스이지만, 제거기는 무제한 로컬 무료 도구다.** 감지는 벤더마다 파편화됐지만 제거는 다중 벤더를 한 번에 커버한다. 감지는 규제 집행의 정당성을 요구하지만, 제거는 "내가 소유한 콘텐츠의 위생(hygiene)"이라는 사생활 프레임으로 합법성을 확보한다. 군비경쟁이라기보다, **한쪽은 시행 2주짜리 규제에 묶여 있고 다른 쪽은 이미 에이전트 스킬 마켓에 진열된 상태**다.

### 2-3. EU 규제 설계자들의 암묵적 승인 — 그리고 축의 이동

흥미롭게도 EU의 50조 설계는 이 한계를 어느 정도 알고 있다. Code of Practice 초안은 "단일 마킹 기법만으로는 50조 요건을 충족할 수 없다"고 명시했고([HSF Kramer 분석](https://www.hsfkramer.com/notes/ip/2026-03/transparency-obligations-for-ai-generated-content-under-the-eu-ai-act-from-principle-to-practice)), 50(4)는 딥페이크 라벨링 의무를 **배포자(deployer)에게**도 부과한다. 즉 제공자 마킹이 지워져도 게시하는 사람에게 최후의 책임이 남는 구조다. 그리고 공공 이슈 관련 AI 생성 텍스트에는 결정적 면책 조항이 있다 — **"실질적 인간 검토 및 편집 책임(human editorial review)을 거치면 표시 의무가 면제된다."**

Starling Lab이 제시하는 전략 전환도 같은 방향이다. 무한 공급되는 AI 콘텐츠의 탐지에 자원을 쓰는 대신, **물리적 카메라로 만들어질 수밖에 없는 희소한 '진짜' 콘텐츠를 암호학적으로 인증(C2PA)**하는 쪽으로 축을 옮기는 것. 공급이 무한하면 가치는 바닥나고, 인증된 진본만 희소자산이 된다는 순수 경제학이다. 이것은 '거짓말쟁이의 배당금(liar's dividend — 진짜 증거를 "AI가 만든 가짜"라고 부정하는 전략)'에 대한 유일한 방어이기도 하다.

## 3. 심층 분석 ②: 토큰 그림시장 — 할인율은 '오염 프리미엄'의 시세표다

Vectoral 리포트에서 정량적으로 가장 중요한 숫자는 할인율이다. AI Credits 판매자 리스트는 미니맥스·일레븐랩스·Gemini·OpenAI·Azure·Anthropic 크레딧을 **30~80% 할인**에 내걸었고, CheapCredits는 **전 모델 40% 일괄**이다. 업계 정상급 고객도 받기 어려운 40%가 '일괄'으로 제시된다는 것은 정상적 볼륨 할인이 아니라 **오염된 공급(ToS 위반 크레딧·탈취 계정·만료 임박 크레딧)의 덤핑**이라는 뜻이다.

이 시장의 구조를 분해하면 세 층으로 나뉜다.

1. **크레딧 마켓플레이스**(AI Credits, AICreditMart): 셀러가 보유 크레딧을 40~80% 할인에 등록하는 양식이 갖춰진 정식 커머스.
2. **벌크 라우터**(CheapCredits, Tokvana, Neokens): '벌크 구매 할인'을 명분으로 API 엔드포인트를 제공 — 키를 주지 않고 프록시로 전달한다는 점에서 공급 출처의 불투명성이 구조화돼 있다. GDPR 대응 DPA까지 갖추고 있어 겉보기 합법성 포장도 정교하다.
3. **메시지 보드**(Telegram 채널, r/saasforsale, r/indiehackers): YC Startup School 크레딧 $2,500 매물 같은 소액 거래의 롱테일.

저자 추산 관측 가능한 공급만 **수천만 달러 규모**다. 여기서 사업적 함의를 뒤집어 보자. 이 할인율은 역산하면 **"공식 채널의 가격에서 지불되는 검증 프리미엄이 정가의 30~80%"라는 뜻**이다. 그림시장을 쓰면 그 차액만큼 싸지만 (a) 데이터가 신원 불명의 키 풀을 경유하고, (b) 벤더 단속 시 서비스가 즉시 단절되며, (c) 파트너 프로그램·엔터프라이즈 계약의 ToS 위반이 된다.

벤더의 단속 의지는 이미 실증됐다. Anthropic은 2025년 8월 OpenAI의 Claude API 접근을 ToS 위반으로 차단했고([Wired](https://www.wired.com/story/anthropic-revokes-openais-access-to-claude/)), 서드파티 하네스 경유 비인가 사용 단속([VentureBeat](https://venturebeat.com/technology/anthropic-cracks-down-on-unauthorized-claude-usage-by-third-party-harnesses)), 구독 플랜의 서드파티 에이전트 사용 제한까지 이어지는 중이다. Vectoral의 예측대로 비용 민감기에 접어든 지금, 크레딧 리세일 단속은 시간 문제다.

**인디 사업자의 올바른 활용법은 '구매'가 아니라 '시세 정보'다.** 그림시장 40% 할인은 (1) 벤더 공식 세일즈와의 할인 협상 앵커, (2) 추론 비용이 아직 서비스업의 마진을 잠식할 만큼 높다는 시장의 증언, (3) 멀티모델 라우팅·프리뷰 등 대안 전략의 가치 재확인 신호로 쓴다.

## 4. 심층 분석 ③: "kidney disappointment" — 검증 게이트 없는 생산 라인의 최종 형태

'신부전(kidney failure)'을 AI가 'kidney disappointment'로 오역한 문구가 복수의 실제 논문 표제·본문에 게재된 사실이 구글 스칼라 검색으로 확인됐다(HN 314포인트). 이 사건의 본질은 웃픈 번역 실수가 아니라, **"생성은 자동화했는데 검증은 자동화하지 못한" 조직 구조의 필연적 산물**이라는 점이다. LLM 초작성(drafting)의 한계가 아니라, 초안→게재 사이의 게이트가 빈 상태로 대량 생산 라인이 돌아간 결과다.

EU 50조의 면책 설계가 시사하는 바와 정확히 대칭된다. 규제자가 상상하는 건전한 파이프라인은 "AI 생성 → **실질적 인간 검토·편집 책임** → 발행"이며, 그 검토가 있으면 표시 의무 자체가 면제된다. 즉 **검증 게이트는 이제 법적 안전장치이자 품질 자산이다.** 우리 브리핑·블로그 파이프라인이 이미 "AI 초안 → 검증 스크립트+인간 승인 → 발행" 구조로 돌아가는 것은 방향이 맞다는 뜻이고, 이제 그 게이트를 상품화(신뢰성 있는 콘텐츠 브랜드)로 승격시킬 근거가 생겼다.

## 5. 시나리오 분석 (12개월 horizon)

### 🟢 Best — "인증 인프라의 표준화"
- 벤더들이 감지기 상호운용(공동 검증 API)에 합의, C2PA 캡처가 iOS·안드로이드 기본 탑재로 대중화(Apple Reference Image가 이미 iOS 27 베타에서 관측 중).
- 크레딧 리세일 단속으로 그림시장 프리미엄 축소, 공식 가격 인하 경쟁 가속.
- "인증된 진본"이 콘텐츠 시장의 유료 등급으로 자리 잡음 — 카메라 앱·뉴스·크리에이터 도구에 신규 수익 모델.
- **Master 관점:** 카메라 앱의 C2PA 대응이 조기 진입 우위가 됨.

### 🟡 Base — "지속되는 비대칭 캣앤마우스" (현재 트렌드 연장, 주관 확률 ~60%)
- SynthID는 강력하지만 크롭·재생성 우회가 존재하고, 감지 파편화·레이트리밋은 유지. 제거 도구는 에이전트 생태계에 상주하며 '콘텐츠 위생' 관행으로 정착.
- 그림시장은 수천만 달러 규모에서 완만한 성장, 단속은 표본적. 규제 집행은 대형 플랫폼 위주, 롱테일은 사각지대.
- 결과: **"마킹을 성실히 하는 사업자 vs 안 하고 비용 우위를 얻는 사업자"의 역차별 구도** 고착. 신뢰 인증을 자발적으로 내세우는 상위권 플레이어만 차별화 혜택.
- **Master 관점:** 표시 의무 준수는 하되, 컴플라이언스가 아니라 마케팅 포인트로 쓰는 전략이 유효.

### 🔴 Worst — "마킹 실효성 상실과 신뢰 붕괴"
- 우회가 완전 산업화(SaaS화)되어 마킹 의무가 장식화, liar's dividend가 정치·재판·저널리즘에서 만연.
- 딥페이크 범죄 급증 → 플랫폼 과잉 차단 → 인디 생성 콘텐츠의 오탐 삭제·수익화 박탈.
- 벤더가 크레딧 유통 전면 단속·가격 인상으로 대응, 인디의 추론 비용 급등.
- **Master 관점:** 콘텐츠 사업의 플랫폼 의존 리스크 최대 — 자체 채널(웹·이메일) 확보가 보험이 됨.

## 6. Master에게 미치는 영향

1. **카메라 앱 사업 — 가장 큰 기회 축.** Apple은 iOS 27 베타에서 'Reference Image'(하드웨어 결합 사진 인증)를 준비 중이고([The Verge](https://www.theverge.com/tech/977921/apple-reference-image-iphone-metadata)) iOS 27은 AI 사진 편집에 SynthID를 싣는 것으로 알려졌다. C2PA iOS SDK([c2pa-ios-example](https://github.com/contentauth/c2pa-ios-example))는 이미 오픈소스로 사용 가능하다. "AI 시대에 진본을 증명하는 카메라"는 프리미엄 기능·프레스 훅 양쪽으로 작동한다.
2. **게임 배포 — 컴플라이언스 비용의 최소화.** EU 50(2) 마킹(신규 출시분은 이미 적용), 한국 AI 기본법 표시 의무, 플랫폼별 AI 콘텐츠 정책(Google Play는 실존 인물 재현 콘텐츠 집중 감리, 커뮤니티·스토어마다 GenAI 공개 요구 확산)을 게임별 체크리스트로 만들어 두면 매 출시마다 재탐색 비용이 사라진다. 마킹 상태를 게임 설명·스토어 메타데이터에 선제 공개하는 것이 역차별 구도에서 유리하다.
3. **API·에이전트 운용 — 그림시장 접촉 금지, 시세는 활용.** 브로커 크레딧·비공식 릴레이는 데이터 경유·단속·ToS 리스크 때문에 상용 백엔드에서 절대 금지. 대신 40% 할인 시세를 연간 계약·커밋 할인 협상의 기준선으로 쓰고, tokentab류 세션 비용 집계로 정가 지출의 가시성을 먼저 확보한다.
4. **콘텐츠 발행 — 검증 게이트의 자산화.** "AI 초안 → 검증 → 발행" 파이프라인은 EU 50(4)의 인간 편집 면책 경로와 동일 구조다. 이 게이트를 eastsea 브랜드의 신뢰 서사("검증된 발행물")로 명시하는 것은 규제 대응이자 차별화다.

## 7. 액션 아이템

**단기 (이번 주)**
- 게임/앱 출시 체크리스트에 'AI 콘텐츠 표시' 항목 추가: EU(EU내 배포·신규 시스템)·한국 표시 의무, 스토어별 GenAI 공개 요구 여부 확인란.
- tokentab 도입으로 Claude Code/Codex/Gemini CLI 세션별 비용 집계 시작 — 그림시장 시세(40%) 대비 우리의 실지출 프리미엄을 측정.
- 이번 주 브리핑·블로그 발행물에 'AI 생성+인간 검증' 발행 프로세스 고지 문구 테스트(50(4) 면책 구조 정합성 확인).

**중기 (1~3개월)**
- 카메라 앱 로드맵에 C2PA Content Credentials 삽입 프로토타입 추가 — c2pa-ios SDK로 캡처 시점 서명 PoC. Apple Reference Image 공식 API 공개 동향 추적.
- 마케팅 자산(게임 스크린샷·프로모 영상)에 C2PA 자격증명 부여 여부 검토 — '진본 마케팅' 프레임.
- 벤더 공식 할인 협상 시 그림시장 할인율 데이터를 앵커로 사용하는 스크립트 준비.

**장기 (6~12개월)**
- '인증 진본 콘텐츠'가 유료 등급화될 때를 대비해 카메라 앱의 검증 기능을 구독 옵션으로 상품화하는 시나리오 설계.
- C2PA/SynthID 상호운용 표준 합의(Worst 시나리오 방어 지표) 분기별 점검 — 이 갈림길에서 콘텐츠 사업 전략을 재조정.

## 8. 결론 — 미스 김의 인사이트: 탐지에서 인증으로, 비용에서 프리미엄으로

이번 주의 세 사건은 각각 다른 산업(규제·개발도구·API 경제·학계)에서 일어났지만 하나의 방정식으로 수렴한다. **AI가 공짜로 만들 수 있는 것의 가치는 영구히 바닥나고, 그것이 진짜라는 증명의 가치만 남는다.** 워터마크 제거 도구의 폭발은 그 증명의 취약성을, 토큰 브로커의 40% 할인은 그 증명의 시장 가격을, kidney disappointment는 그 증명이 없을 때의 몰락을 각각 보여준다. EU와 한국이 표시 의무라는 '스틱'을 들었지만, 진짜 동력은 시장이 스스로 신뢰에 프리미엄을 붙이는 쪽에서 나올 것이다. 인디 개발자의 유일한 질문은 "어느 편에 서서 무엇을 먼저 만들 것인가"다 — 그리고 카메라를 다루는 Master에게는 답이 이미 손에 있다.

---

## 참고 자료

1. [guillaumemeyer/watermarks-remover (GitHub)](https://github.com/guillaumemeyer/watermarks-remover) — 본문 직독
2. [Who Are the Token Brokers? — Vectoral (2026-08-10)](https://vectoral.com/blog/who-are-the-token-brokers) — 본문 직독
3. [Tested: Google's SynthID works great, but labeling AI content may be a losing game — Ars Technica (2026-07)](https://arstechnica.com/ai/2026/07/tested-google-synthid-works-great-but-labeling-ai-content-may-be-a-losing-game/) — 본문 직독
4. [The EU AI Act's Transparency Rules: A Practical Guide to Article 50 — artificialintelligenceact.eu](https://artificialintelligenceact.eu/transparency-rules-article-50/) — 본문 직독
5. [Article 50: Transparency obligations — EU AI Act Explorer](https://artificialintelligenceact.eu/article/50/)
6. [Code of Practice on Transparency of AI-generated Content — European Commission](https://digital-strategy.ec.europa.eu/en/policies/code-practice-ai-generated-content)
7. [EU Finalises Transparency Rules for AI-Generated Content — Paul Weiss](https://www.paulweiss.com/insights/client-memos/eu-finalises-transparency-rules-for-ai-generated-content/)
8. [Transparency obligations for AI-generated content under the EU AI Act — HSF Kramer](https://www.hsfkramer.com/notes/ip/2026-03/transparency-obligations-for-ai-generated-content-under-the-eu-ai-act-from-principle-to-practice)
9. [AI기본법 후속 개정안 시행…"생성형 표시 의무" — 연합뉴스 (2026-07-21)](https://www.yna.co.kr/view/MYH20260721012800038)
10. [AI 생성물 표시제 도입에 따른 주요 쟁점 — KOCCA](https://www.kocca.kr/trendott/vol02/spotlight_4.html)
11. [AI기본법 세계 첫 전면 시행…현장은 적용 기준 주시 — 연합뉴스 (2026-01-21)](https://www.yna.co.kr/view/AKR20260121145100017)
12. [Meta AI image detector fails to identify some of its own cropped AI images — Reuters (2026-07-10)](https://www.reuters.com/business/meta-ai-image-detector-fails-identify-some-its-own-cropped-ai-images-reuters-2026-07-10/)
13. [Anthropic Revokes OpenAI's Access to Claude — Wired](https://www.wired.com/story/anthropic-revokes-openais-access-to-claude/)
14. [Anthropic cracks down on unauthorized Claude usage by third-party harnesses — VentureBeat](https://venturebeat.com/technology/anthropic-cracks-down-on-unauthorized-claude-usage-by-third-party-harnesses)
15. [OpenAI adopts C2PA standard and Google's SynthID — TNW](https://thenextweb.com/news/openai-c2pa-synthid-ai-image-detection-watermark)
16. [Apple Reference Image: iOS 27 photo authentication — The Verge](https://www.theverge.com/tech/977921/apple-reference-image-iphone-metadata)
17. [c2pa-ios-example — Content Authenticity Initiative (GitHub)](https://github.com/contentauth/c2pa-ios-example)
18. [Google Scholar 검색 — "kidney disappointment"](https://scholar.google.com/scholar?q=%22kidney+disappointment%22) · [HN 토론](https://news.ycombinator.com/item?id=49319389)
19. [HN: Claude System Prompts 토론](https://news.ycombinator.com/item?id=49319556) · [Anthropic 공개 문서](https://platform.claude.com/docs/en/release-notes/system-prompts)
20. [iOS 27 SynthID watermarks: AI photo provenance guide — ecorpit](https://ecorpit.com/ios-27-synthid-watermarks-ai-content-authenticity-guide/)
