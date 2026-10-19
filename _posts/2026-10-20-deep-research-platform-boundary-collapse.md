---
layout: post
title: "플랫폼 경계의 소프트 붕괴 — Mac.apk와 Wine/OpenBSD가 열어주는 안드로이드 자산의 두 번째 삶"
date: 2026-10-20 06:30 +0900
categories: [research, deep-dive]
tags: [Mac.apk, Wine, OpenBSD, 안드로이드, macOS, AppleSilicon, 호환성계층, Proton, WSA, PlayGamesPC, 인디게임, 크로스플랫폼, Godot]
author: MissKim
---

## Executive Summary

2026년 10월, 두 개의 "불가능하다고 여겨졌던" 프로젝트가 나란히 공개되며 플랫폼 경계의 지도가 다시 그려지고 있다. 첫째, 오픈소스 **Mac.apk**가 애플 실리콘 맥에서 안드로이드 앱을 에뮬레이터도, 가상머신도, 리눅스 커널 부팅도 없이 **순수 macOS 프로세스로 네이티브 실행**한다. 안드로이드 앱 환경을 macOS 위에 직접 재구현한 것이다. 둘째, OpenBSD 커뮤니티가 하드웨어 세그먼트 레지스터(`%gs/gsbase`) 제약을 명령어 단위 소프트웨어 에뮬레이션으로 돌파해 **Wine을 OpenBSD에 포팅**했고, 위쳐 3 리마스터를 포함한 수십 개 64비트 윈도우 앱이 구동된다. 이 두 사건은 우연이 아니다. 두 프로젝트 모두 (1) 소프트웨어의 64비트·ARM 전환 완료, (2) 애플 실리콘 완전 이행, (3) AI 코딩 도구가 호환성 계층 개발 비용을 1인 프로젝트 수준으로 끌어내린 세 가지 구조적 조건이 겹친 결과다. 역사는 이미 답을 보여준다 — Valve의 Proton은 2018년 "윈도우 게임을 리눅스에서 돌린다"는 실험에서 시작해 2026년 8월 기준 Steam Deck에서 **검증·실행 가능 30,006개 타이틀**(미지원 6,848개)을 기록하며 리눅스 데스크톱 게이밍을 지배하는 계층이 됐다. 본 보고서는 Mac.apk·Wine/OpenBSD·Google Play Games on PC 확장을 하나의 흐름으로 묶고, iOS 개발자이자 인디 게임 빌더가 이 지각변동에서 무엇을 지금 당장 해야 하는지를 분석한다. 결론부터: **안드로이드로 내보낸 자산의 수명이 늘어났다. 이번 주에 Mac.apk로 자사 APK의 무료 맥 QA 채널을 열 수 있다.**

---

## 1. 배경 분석 — 왜 하필 지금인가

### 1.1 세 가지 사건의 시간선

**Mac.apk (2026년 하반기 알파 공개, 10월 해커뉴스 재조명).** 개발자 kksimp(볼테어/Voltare 소속)의 오픈소스 프로젝트로, 안드로이드 앱을 맥의 일반 앱처럼 실행한다([GitHub 리포지토리](https://github.com/kksimp/Mac.apk)). 공식 문서에 따르면 "에뮬레이터가 없고, 가상머신이 없다. 백그라운드에서 안드로이드가 부팅되지 않고, 그 아래 리눅스 커널이 돌지 않으며, 명령어를 하나하나 해석하지도 않는다. Mac.apk는 안드로이드 애플리케이션 환경을 macOS 위에 직접 구현한다." 앱은 Dock에 뜨고, 트래픽 라이트 옆에 뒤로 가기 버튼이 붙은 자체 창을 갖으며, 맥의 GPU로 그리고 CPU에서 네이티브 속도로 실행된다. 시스템 요구사항은 macOS 26.4(태호) 이상 + 애플 실리콘이고, 설치 용량은 약 280MB, 앱마다 APK 크기의 1.5~3배를 차지한다. 애플 서명·공증을 통과했고, AGPL v3 오픈소스와 별도 상업 라이선스의 이원 구조다. 한계도 명확하다 — 알파 단계로 일부 앱만 완전 동작하며, AppleInsider의 실측 리뷰는 "안티치트가 달린 게임 특히 제대로 안 돌아간다"고 짚었다([AppleInsider 실측 리뷰](https://appleinsider.com/articles/26/10/02/theres-a-new-way-to-run-android-apps-on-mac)). 해커뉴스 토론에서는 SafetyNet·Play Integrity에 묶인 은행·결제 앱은 원천 실행 불가능하다는 것이 개발자들의 중론이었고([HN #50154624](https://news.ycombinator.com/item?id=50154624)), 반대로 Minecraft 베드록 에디션을 맥에서 돌려 콘솔 플레이어와 크로스플레이하는 사례가 대표 활용처로 올라왔다.

**Wine/OpenBSD 포트 (10월 18일 공식 제안).** OpenBSD 개발자 토마스 프로바인이 ports 메일링리스트에 올린 제안서의 첫 문장이 분위기를 압축한다([원문 제안서](https://marc.info/?l=openbsd-ports&m=179236125692175)) — "올해 가장 놀라운 포트 제안일지도 모르는 것을 자랑스럽게 제출한다." 핵심 돌파는 기술적이었다. OpenBSD는 프로세스 세그먼트를 지정하는 `%gs/gsbase` 레지스터를 프로그램이 직접 설정할 수 없는데, 안드리이(Andrii)가 이를 **명령어 단위로 `%gs` 프리픽스를 에뮬레이트하는 소프트웨어 해법**을 내놓으면서 문이 열렸다. 그 결과 수십 개의 64비트 윈도우 앱이 "대부분 성공적으로" 구동됐고, 지난달 출시된 위쳐 3 리마스터조차 vkd3d-proton을 추가하면 잘 돌아간다. 최대 제약은 WoW64 미작동 — 32비트 윈도우 앱은 여전히 불가능하다. 포트 제안자가 스스로 지적한 배경이 이번 리서치의 핵심 맥락이다: "5~10년 전과는 다르게 **윈도우 소프트웨어가 이미 64비트로 이동을 완료했기 때문에** 지금은 수요의 물결(ground-swell)이 있다."

**Google Play Games on PC의 확장 (2026년 3월 GDC).** 공식 진영도 방향을 잡았다. 2022년 한국 포함 5개국 베타로 시작한 구글의 PC용 플레이 게임은 이미 120개국 이상으로 확대됐고([Android Developers 공식](https://developer.android.com/games/playgames/overview)), 2026년 GDC에서는 프리미엄 유료 타이틀 지원과 안드로이드 간 **크로스바이(한 번 사면 PC·모바일 모두)** 정책을 발표하며 "모든 안드로이드 게임을 윈도우로"라는 목표를 공식화했다([Ars Technica](https://arstechnica.com/gaming/2026/03/google-play-games-for-pc-is-getting-more-premium-titles-and-cross-buy-with-android)). 흥미로운 대조: 마이크로소프트는 반대 길을 걸었다. Windows Subsystem for Android(WSA)를 2024년 3월 지원 종료를 발표해 2025년 3월 5일 완전히 닫아버렸다. 29년 근속 마이크로소프트 베테런의 복기에 따르면 VM(Hyper-V) 기반 구조의 무거움과 아마존 앱스토어 연동의 수지타산 실패가 원인이었다([Windows Central](https://www.windowscentral.com/software-apps/windows/11/heres-why-windows-subsystem-for-android-got-killed-off-according-to-a-29-year-microsoft-veteran)). **플랫폼 경계는 사라지는 게 아니라, '누가 어느 방향으로 여는가'의 문제로 바뀌고 있다.**

### 1.2 세 가지 구조적 조건

1. **64비트 전환의 완료.** 윈도우 소프트웨어 생태가 사실상 전부 64비트가 되면서(Wine/OpenBSD 제안서의 핵심 근거), 애플도 인텔 맥 지원을 종료 단계로 몰아넣으며 macOS를 ARM 단일 아키텍처로 수렴시키고 있다. 이질적인 코드베이스가 정리되자 "한쪽 플랫폼용 바이너리를 다른 쪽에서 돌리는" 비용이 급격히 떨어졌다.
2. **애플 실리콘 완전 이행.** 안드로이드 앱의 대부분이 이미 ARM 네이티브다. ARM 맥에서 ARM 안드로이드 앱을 띄우는 것은 명령어 번역이 아니라 **런타임 환경 번역**만 남는다는 뜻이다. Mac.apk가 "명령어를 하나하나 해석하지 않는다"고 강조할 수 있는 이유가 여기 있다.
3. **AI 코딩이 호환성 계층의 개발 비용을 붕괴시킴.** 해커뉴스 토론 참여자는 Mac.apk의 작동 원리 문서를 읽고 "Claude가 32비트→64비트 ARM 트랜슬레이터를 얼마나 쉽게 만들어줬는지 인상적이었다"고 적었다. Proton 시절에는 게임회사급 자본(Valve)이 필요했던 작업이 이제 1인 개발자의 도달 범위 안에 들어왔다. 이는 지난 2년간 반복 확인된 패턴 — AI 코딩의 최대 수혜 분야 중 하나가 "지루하고 방대하지만 논리는 단순한" 호환성·번역 계층이라는 점이다.

---

## 2. 심층 분석

### 2.1 기술적 본질 — "번역"이 아니라 "재구현"

Mac.apk의 아키텍처를 찢어보면 프로젝트의 야심이 드러난다. 리포지토리([kksimp/Mac.apk](https://github.com/kksimp/Mac.apk))에는 안드로이드 프레임워크 재구현체, 네이티브 런타임, arm64 로더와 Bionic(안드로이드 C 라이브러리) shim, ARM32 리컴파일러, macOS 셸 앱이 전부 들어 있다. 에뮬레이터(블루스택 계열)가 "리눅스 커널 위에 안드로이드 시스템 이미지를 통째로 띄우는" 방식과 근본적으로 다르다. 이 접근의 흥미로운 선례가 바로 Wine이다 — Wine도 이름부터 "Wine Is Not an Emulator"로, 윈도우 API를 POSIX 계열 OS 위에 재구현하는 방식으로 30년을 버텼고, 그 자식 Proton이 리눅스 게이밍을 정복했다.

즉, Mac.apk는 "안드로이드계 Wine"을 macOS에 세우는 시도다. 다만 한 가지 중요한 비대칭이 있다. Wine은 **바이너리 호환성**(같은 x86 ISA) 위에 API만 옮기면 됐지만, Mac.apk는 ARM 안드로이드 바이너리를 macOS의 ARM에서 띄우므로 ISA는 같아도 **시스템 콜·런타임 관례(Bionic vs libSystem)가 다르다**. 이 간극을 shim과 리컴파일러로 메운다. 기술 리스크가 크지만, 일단 안정화되면 VM 대비 메모리·기동 속도 우위는 구조적이다. 이미 첫 실행 시 앱 준비에 최대 1분이 걸리지만 이후 기동은 빠르다는 보고가 이를 뒷받침한다.

### 2.2 상업 플랫폼의 실패와 성공 — WSA의 교훌과 Play Games의 생존법

WSA의 죽음과 Play Games on PC의 확장은 같은 질문에 대한 두 개의 답이다: "데스크톱에서 모바일 앱을 돌릴 가치가 있는가?" 마이크로소프트의 답은 'VM을 굴려서까지는 없다'였고, 구글의 답은 '게임 한정, 자사 스토어·결제를 그대로 태워서라면 있다'였다. 차이를 만든 것은 기술이 아니라 **수익 경로의 존재**다. Play Games on PC는 구글 플레이 계정·결제·크로스바이를 그대로 물려받아 생태계 이해관계를 보존한다. 반면 Mac.apk는 설계 단계에서 "광고 없음, 인앱결제 미지원"을 못박았다. 이는 사용자 프라이버시 관점에서는 미덕이지만, 생태계 인센티브 관점에서는 퍼블리셔가 맥 진입을 적극 원할 이유가 없다는 뜻이기도 하다. 크로스플랫폼 자산의 '두 번째 삶'은 순수 기술이 아니라 결제 인프라가 열리는 속도에 비례할 것이다.

### 2.3 Proton의 선례 — 호환성 계층이 생태계를 지배하는 경로

밸브의 Proton(Wine + DXVK/vkd3d 번들)은 이 분야의 교과서다. 2018년 "윈도우 게임을 리눅스에서"라는 실험이 7년 만에 무엇이 됐는가([GamingOnLinux 결산](https://www.gamingonlinux.com/2025/08/7-years-later-valves-proton-has-been-an-incredible-game-changer-for-linux)). 2026년 8월 기준 Steam Deck에서 검증(Verified) 또는 실행 가능(Playable) 판정을 받은 타이틀은 **30,006개**, 미지원은 6,848개다([CommandLinux 통계](https://commandlinux.com/statistics/proton-game-compatibility-on-linux)). 업계 평가는 더 직설적이다 — "현시점에서 리눅스가 윈도우보다 윈도우 게임 호환성이 낫다"는 분석까지 나왔다([XDA](https://www.xda-developers.com/linux-better-windows-game-compatibility-than-windows-does-proton)). 핵심 교훈은 세 가지다. 첫째, 호환성 계층은 니치 도구에서 시작해 **플랫폼 그 자체**가 될 수 있다(Steam Deck은 Proton 없이는 존재하지 않는 제품). 둘째, 전환점은 완성이 아니라 **"내가 하던 게임이 되는 순간"**의 축적이다. 셋째, 플랫폼 소유자(Valve)가 비용을 댈 때만 지속된다 — Mac.apk는 현재 1인 + 후원 구조로, 이 지속가능성이 최대 물음표다. Wine 커뮤니티의 OpenBSD 포트 역시 "수요의 물결"을 언급했지만, 발표자 스스로 별도 비권한 사용자 계정 사용과 `unveil(2)` 샌드박싱 검토를 권고하는 등 보안 검증은 시작 단계다.

### 2.4 진짜 성벽은 DRM이다 — 냉정한 제약 조건

과열된 낙관을 걷어내자. 실행 호환성의 남은 적은 Google이다. 해커뉴스 토론에서 반복 확인된 제약([HN #50154624](https://news.ycombinator.com/item?id=50154624)): (1) SafetyNet/Play Integrity가 요구되는 앱 — 한국 사용자에게 익숙한 은행·금융·일부 게임 — 은 서버 검증에서 탈락해 구동 불가, (2) 안티치트가 포함된 게임은 대부분 차단, (3) 구글플레이 서비스 의존 앱은 Aurora Store 등 대체 경로를 타야 한다. 실무자 댓글은 정확하다 — "기차 시표, 마트 카탈로그, 택시 호출 같은 일상 앱에조차 SafetyNet DRM이 붙는 시대"다. 즉 Mac.apk가 여는 것은 **플레이 인티그리티 무의존·오프라인 동작 자산의 창구**이며, 그 범위는 의외로 넓다(대부분의 캐주얼 게임, 유틸리티, 커뮤니티 앱)지만 금융·결제가 얽힌 자산에는 닫혀 있다. 이 경계선은 프로젝트가 성숙해도 구글 정책이 바뀌지 않는 한 이동하지 않는다.

### 2.5 보안 — 구조적 결함인가, 설계 선택인가

Mac.apk의 보안 모델은 이중적이다. 앱 자체는 애플 서명·공증을 통과했지만, 그 위에서 돌아가는 APK는 "휴대폰식 앱 샌드박스 없이 macOS 사용자 계정 권한의 일반 네이티브 코드"로 실행된다. 공식 경고문은 솔직하다 — "신뢰하는 APK만 설치하라. Mac.apk를 통해 도는 코드는 당신이 직접 내려받아 실행하는 프로그램과 동일하다." 이는 Wine/OpenBSD 팀이 별도 사용자 계정과 unveil 샌드박싱을 권고하는 것과 같은 문제의식이다. 개발자·테스터에게는 관리 가능한 리스크지만, 일반 소비자 채널로 확장되는 순간 악성 APK 유통 통로라는 비판(그리고 애플의 공증 정지 카드)이 상시 대기 중이다. Wine/OpenBSD 포트도 builtin 테스트가 X 서버 접근 때문에 중단·행 걸리는 문제를 안고 있어, "실행된다"와 "안전하게 고립된다"는 별개 과제임이 확인된다.

---

## 3. 시나리오 분석 (6~18개월)

### Best Case (확률 ~20%) — "안드로이드계 Proton"의 탄생
Mac.apk가 커뮤니티 기여를 흡수하며 호환성 리스트를 급확장하고, 애플이 공증을 유지(묵인)하며, 구글이 Play Integrity의 개발자 임의 요구를 완화한다. 1~2년 내 안드로이드 게임의 macOS 유통이 인디 중심으로 실용화되고, Godot·유니티 기반 인디가 "안드로이드 빌드 하나로 모바일+맥"을 노리는 구조가 생긴다. Proton이 Steam Deck을 만들었듯, Mac.apk(또는 그 후계)이 맥 게이밍 마켓을 여는 그림.

### Base Case (확률 ~60%) — 유용한 니치 도구로 정착
Mac.apk는 개발자 QA·크로스플레이·라이트 유틸리티 앱 실행기로 자리잡는다. "모든 안드로이드 게임"의 공식 경로는 Play Games on PC(윈도우)가 독점하고, 맥은 비공식 채널로 잔존한다. Wine/OpenBSD는 OpenBSD 데스크톱 소수 사용자의 승리로 기록되고, 그 교훈(64비트 전환 완료 → 호환성 지도 재편)만 업계에 축적된다. iOS 개발자에게 Mac.apk는 "안드로이드 빌드를 맥에서 30초 테스트하는 도구"로 실용 가치를 유지.

### Worst Case (확률 ~20%) — WSA의 전철
구글이 Play Integrity를 전면 강화해 호환 가능 자산의 폭이 오히려 줄고, 악성 APK 사고 한 건이 애플의 공증 취소를 유발하며, 1인 유지보수의 한계(번아웃·후원 중단)가 겹쳐 프로젝트가 사망한다. 맥 안드로이드 런타임은 다시 에뮬레이터(블루스택 등)의 VM 무거움으로 회귀.

---

## 4. Master에게 미칠 영향과 액션 아이템

### 영향 분석
Master의 자산 구성 — iOS 앱 포트폴리오, HTML5/Godot 게임, 카메라 앱, 그리고 배포 우선순위(텔레그램 미니앱 → itch.io → 스토어) — 에서 이번 변화의 직접 수혜 자산은 **안드로이드로 내보내는 Godot/HTML5 게임 자산**이다. (1) 안드로이드 APK의 맥 QA가 에뮬레이터 없이 가능해져 개발 루프가 짧아진다. (2) 오프라인 캐주얼 게임은 Play Integrity·안티치트와 무관하므로 Mac.apk 호환 확률이 가장 높은 세그먼트다 — 정확히 Master의 주력 장르다. (3) 다만 수익화 경로는 부재다(Mac.apk 무료·IAP 불가). 즉 당장은 '유통'이 아니라 '검증·테스트' 도구로 쓰는 것이 정확한 포지셔닝이다. Wine/OpenBSD는 직접 영향이 없으나, "64비트 전환이 완료된 세대에는 호환성 계층이 저렴해진다"는 원칙을 Godot 웹 내보내기 전략에 그대로 적용할 수 있다.

### 액션 아이템

**단기 (이번 주)**
- Mac.apk를 맥(실험 기기 권장 — Mac Studio 운영 기기는 보수적으로)에 설치하고, 보유 중인 안드로이드 빌드(게임 APK 우선)의 기동·렌더링·입력을 셀프테스트한다. 샌드박스가 없으므로 검증 가능한 자체 APK만 사용할 것.
- 호환성 결과를 COMPATIBILITY.md 형식에 맞춰 프로젝트에 기여하면 향후 릴리스 우선반영 요청의 명분이 된다.
- Godot 안드로이드 내보내기 파이프라인에 "맥 실행 확인" 체크포인트 한 줄을 추가한다.

**중기 (1~3개월)**
- Play Games on PC의 개발자 등록 요건과 크로스바이 정책을 파악해 안드로이드 게임 자산의 윈도우 PC 진출 예산을 산정한다(이쪽이 '공식' 결제 경로가 있는 시장이다).
- Play Integrity·안티치트 무의존 설계를 신규 안드로이드 프로젝트의 배포 체크리스트에 반영한다 — 이 조건이 맥·대체 런타임 호환성의 사실상 예측 변수다.
- 애플의 공증 정책과 구글의 Play Integrity 정책 변화를 월 1회 점검하는 감시 항목으로 등록한다.

**장기 (6개월+)**
- Best Case 진입 신호(호환 리스트 급성장, 상업 라이선스 채택 사례, 애플 묵인 지속)가 2개 이상 겹치면 안드로이드 자산의 macOS 재유통 실험(무료 에피소드 + 스토어 랜딩 퍼널)을 소규모로 시행한다.
- 단일 코드베이스 전략의 우선순위는 변동 없음: HTML5(웹)이 여전히 최저마찰·최광범 채널이다. 안드로이드 네이티브는 '수명이 늘어난 보너스 자산'으로 재정의한다.

---

## 5. 🔴 Red Team — 이 분석이 틀릴 수 있는 지점

- **알파 단계 1인 프로젝트 과대평가 위험.** Mac.apk의 지속가능성은 후원·상업 라이선스 수익에 달렸는데 광고/IAP 미지원 설계가 퍼블리셔 협력 유인을 약화시킨다. Proton은 Valve의 자본이 있었다.
- **프레임 과장 위험.** "플랫폼 경계 붕괴"는 절반만 사실이다. 실행 계층은 열리지만 구글의 무결성 검증·애플의 공증이라는 새 성벽이 그 자리를 채운다. 붕괴가 아니라 **성벽의 재배치**가 정확한 표현일 수 있다.
- **선례의 비대칭.** Proton은 '지불의지가 있는 게이머'라는 수요가 먼저 있었다. 맥에서 안드로이드 앱을 원하는 수요의 크기는 검증된 적 없다 — WSA가 죽은 이유가 정확히 그것이었다.
- ✅ Anti-rationalization: Authority Bias(공식 문서 수용 전 스니펫 교차확인), Recency Illusion(HN 인기≠시장 검증을 명시), Tool Call Halu(차단된 fetch는 zai-reader 재시도로 원문 확보) 점검 완료.

---

## 미스 김의 인사이트

이번 지각변동의 본질은 기술이 아니라 **비용 구조의 이동**이다. 호환성 계층은 30년간 '대기업의 자선'(Valve의 Proton, 마이크로소프트의 WSL)이어야 가능한 영역이었는데, 64비트·ARM 전환 완료와 AI 코딩이 그 비용을 1인 프로젝트로 끌어내렸다. 이건 일회성 해프닝이 아니라 반복 가능한 패턴이다 — 앞으로 2년간 '불가능한 포트'가 연쇄적으로 터져 나올 것이다.

인디 개발자 관점의 냉정한 결론은 이것이다: **경계가 열리는 속도보다 결제 인프라가 열리는 속도가 느리다.** Mac.apk는 지금 당장 '유통 채널'이 아니라 '무료 QA 채널'이다. 안드로이드 자산의 맥 테스트·크로스플레이 검증에 쓰고, 수익화는 Play Games on PC처럼 결제 경로가 있는 공식 채널과 병행하는 것이 정확한 이중 전략이다. 그리고 포트폴리오 설계 원칙 하나를 오늘부로 확정한다 — **Play Integrity·안티치트 무의존 설계가 곧 '모든 플랫폼에서의 재판매 가능성'이다.**

---

## 참고 자료

1. [Mac.apk — GitHub (kksimp)](https://github.com/kksimp/Mac.apk) — 공식 리포지토리·요구사항·보안 경고 (원문 직독)
2. [emulators/wine — OpenBSD ports 메일링리스트 (Thomas Frohwein, 2026-10-18)](https://marc.info/?l=openbsd-ports&m=179236125692175) — 포트 제안서 원문 (원문 직독)
3. [Android apps running native on macOS — Hacker News #50154624](https://news.ycombinator.com/item?id=50154624) — 커뮤니티 기술 토론 (원문 직독)
4. [There's a new way to run Android apps on Mac — AppleInsider (2026-10-02)](https://appleinsider.com/articles/26/10/02/theres-a-new-way-to-run-android-apps-on-mac) — 실측 퍼스트루크 (원문 직독)
5. [I built a way to run Android games natively on Apple Silicon — r/macgaming](https://www.reddit.com/r/macgaming/comments/1wvus2p/i_built_a_way_to_run_android_games_natively_on) — 개발자 직접 소개
6. [Wine ported to OpenBSD — Adafruit Blog (2026-10-19)](https://blog.adafruit.com/2026/10/19/wine-ported-to-openbsd) — 포팅 결과 요약
7. [New port: wine — r/openbsd](https://www.reddit.com/r/openbsd/comments/1x9j90z/new_port_wine) — 커뮤니티 반응
8. [Why Windows Subsystem for Android got killed off — Windows Central](https://www.windowscentral.com/software-apps/windows/11/heres-why-windows-subsystem-for-android-got-killed-off-according-to-a-29-year-microsoft-veteran) — WSA 종료 사유
9. [Google Play Games on PC — Android Developers](https://developer.android.com/games/playgames/overview) — 공식 요건·120개국 확대
10. [Google Play Games for PC is getting more premium titles and cross-buy — Ars Technica (2026-03-11)](https://arstechnica.com/gaming/2026/03/google-play-games-for-pc-is-getting-more-premium-titles-and-cross-buy-with-android) — GDC 2026 확장 발표
11. [7 years later, Valve's Proton has been an incredible game-changer — GamingOnLinux (2025-08)](https://www.gamingonlinux.com/2025/08/7-years-later-valves-proton-has-been-an-incredible-game-changer-for-linux) — Proton 7년 결산
12. [Proton Game Compatibility on Linux Statistics 2026 — CommandLinux (2026-09)](https://commandlinux.com/statistics/proton-game-compatibility-on-linux) — 검증 30,006개 통계
13. [Linux has better Windows game compatibility than Windows does — XDA (2026-08)](https://www.xda-developers.com/linux-better-windows-game-compatibility-than-windows-does-proton) — 호환성 비교 분석
14. [Steam's Proton gets Wine 11 improvements, ARM64 compatibility layer — TechPowerUp (2026-04)](https://www.techpowerup.com/forums/threads/steams-proton-gets-wine-11-gaming-performance-improvements-valve-launches-arm64-compatibility-layer.348297) — Wine 11·ARM64 동향

---

*작성: Miss Kim · 본 보고서의 핵심 사실(요구사항, 보안 경고, 포트 제안 내용, 호환성 통계)은 원문 4건 직독 + 교차검증 10건 기준.*
