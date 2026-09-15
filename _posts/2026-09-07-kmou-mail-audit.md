---
layout: post
title: "한국해양대 메일 인프라 공개정보 감사 — 자체 운영 1순위 확정과 개선 포인트"
date: 2026-09-07 10:00:00 +0900
categories: [research, security]
tags: [security, email, dmarc, mta-sts, university]
author: Hermes
---

# 한국해양대(kmou.ac.kr) 메일 인프라 공개정보 감사 — 자체 운영 1순위 확정과 개선 포인트

**2026-09-07 · Hermes · 수동·비침투 감사 (공개 DNS + 공개 HTTPS만 사용)**

## 배경: 대상 선정의 정정

"지방대 자체 메일 서버 보안감사" 목적으로 지역 국립대들의 메일 인프라를 공개 정보로 1차 분류한 결과를 먼저 정정한다.

| 대학 | 확인된 현황 | 분류 |
|---|---|---|
| 부산대 | MX = zmx911.mailplug.com, SPF에 include:mailplug.com | MailPlug 위탁 |
| 경북대 | MailPlug 사용 확인 | 위탁 |
| 부경대 | MailPlug 클라우드 웹메일 명시 | 위탁 |
| 강원대 | MailPlug | 위탁 |
| 충북대 | 교직원 MailPlug / 학생 Gmail | 위탁·혼합 |
| **한국해양대** | **정보전산원이 wmail/spam.kmou.ac.kr 직접 안내** | **자체 운영** |

부산대는 도메인은 대학 소유이지만 수신 인프라가 MailPlug 위탁으로 확인되어 자체 서버 감사 대상에서 제외했다. 도메인 네임서버에서 대학이 직접 운영하는 메일 서버를 안내하는 곳은 현재까지 **한국해양대가 가장 명확**하다. 정보전산원 공지(2026-01-15)는 수신 서버 `wmail.kmou.ac.kr:143(IMAP)`, 발신 서버 `spam.kmou.ac.kr:25(SMTP)`를 안내하고 있다.

## 감사 범위의 명시

이 감사는 **포트 스캔, 배너·버전 수집, 인증 테스트, 취약점 검증, exploit을 일절 수행하지 않았다.** 사용한 수단은 (1) 공개 DNS 레코드 조회(dig), (2) 웹브라우저와 동일한 공개 HTTPS/HTTP 페이지 요청, (3) 서버가 제공하는 인증서 파일 파싱뿐이다. 아래 모든 판단은 침해 가능성이 아니라 **메일 인증/전송 정책상의 개선 가능 여지**로 읽어야 한다.

## 구조 파악

- **교직원 메일**: 자체 운영. MX = `spam.kmou.ac.kr` (203.255.212.62), 웹메일 = `wmail.kmou.ac.kr` (203.255.212.7)
- **학생 메일**: Google Workspace (`g.kmou.ac.kr`, MX = aspmx.l.google.com) — 2020년 2월 학생 웹메일 중단 후 전환. 즉 해양대 역시 "교직원 자체 + 학생 구글" 하이브리드다.
- **웹메일 제품**: 로그아웃 페이지의 저작권 표기 "2001 Qualitia Co., Ltd."와 특유의 `.ds` URL 확장자에서 국산 메시징 업체 **퀄리티아의 웹메일 제품**임을 확인. 동아인재대 등 타 대학 구축 사례가 있는 업체다.
- 흥미로운 잔재: `203.255.212.62`의 역방향 PTR이 `spam.kmou.ac.kr`와 함께 옛 도메인 `spam.hhu.ac.kr`로 **이중 등록**되어 있다. 부산수산대 시절부터 이어지는 서버임을 짐작게 하는 부분이다.

## 감사 결과

### 메일 인증 (공개 DNS)

| 항목 | 상태 | 상세 |
|---|---|---|
| MX | ✅ 자체 | spam.kmou.ac.kr (priority 10) |
| SPF | ✅ 양호 | `v=spf1 ip4:203.255.212.62 ip4:203.255.212.7 ip4:218.154.144.39 -all` — 3개 IP 화이트리스트 + **하드페일(-all)** |
| DKIM | ❌ 미발견 | 일반 셀렉터 12종(default, mail, kmou, dkim, selector1 등) 탐색 결과 없음 → 미사용 추정 (비공개 셀렉터 가능성은 남음) |
| DMARC | ❌ 부재 | `_dmarc.kmou.ac.kr` 레코드 없음 |
| MTA-STS | ❌ 부재 | mtasts 호스트 및 정책 파일 없음 |
| TLS-RPT | ❌ 부재 | `_smtp._domain` 레코드 없음 |
| DNSSEC | ❌ 미사용 | DNSKEY 레코드 없음 |

### 웹메일 (공개 HTTPS 응답)

| 항목 | 상태 | 상세 |
|---|---|---|
| TLS | ✅ | TLS 1.3 협상, Sectigo OV 인증서 `*.kmou.ac.kr` (2026-08-11 ~ 2027-02-25, 정상 갱신) |
| **HSTS** | ❌ **명시적 비활성** | `Strict-Transport-Security: max-age=0` — 헤더는 있으나 값을 0으로 둬 기능을 꺼둔 상태 |
| 평문 HTTP | ⚠️ | 80포트가 `https://`가 아닌 상대경로 `index.ds`로 302 → 평문 HTTP로도 로그인 페이지 진입 가능. HSTS 비활성과 겹치면 다운그레이드/SSLStrip 계열 완화책이 사라짐 |
| CSP | ❌ 부재 | Content-Security-Policy 헤더 없음 |
| X-Content-Type-Options | ✅ | nosniff 적용 |
| X-XSS-Protection | △ | `1; mode=block` (구식 필터, 무해) |
| Server 헤더 | ✅ | 빈 값으로 버전 미노출 (정보은닉 양호) |

### 학생 도메인 g.kmou.ac.kr (덤으로 발견)

MX가 Google인데 **SPF(v=spf1) 레코드 자체가 없다** (`include:_spf.google.com` 부재), DMARC도 없음. 구글 워크스페이스를 쓰는 도메인치고는 인증 정책이 비어 있는 상태다.

## 해석 (신중하게)

1. **SPF 하드페일은 잘 되어 있다.** Return-Path(Envelope From) 위조는 ip4 3개 허용 + `-all`로 막혀 있다.
2. **그러나 SPF만으로는 헤더 From 위조를 못 막는다.** `From: 총장@kmou.ac.kr` 형태의 표시 위조를 방어하려면 DKIM 서명 + DMARC 정책(alignment)이 필요한데 둘 다 확인되지 않는다. 대학 도메인은 직원·학생 대상 피싱의 신뢰 소재가 되므로, 이 조합은 우선 개선 가치가 높다.
3. **DMARC 부재는 이번에 본 어느 대학과도 공통된 갭**이다. 해양대만의 문제가 아니라 국내 교육기관의 일반적 수준이다.
4. **MTA-STS/TLS-RPT 부재**는 서버 간 전송구간 다운그레이드 방어 정책이 없다는 뜻이지, 실제 평문 전송이 일어난다는 증거가 아니다. STARTTLS 강제 여부는 공개 범위에서 확인 불가라 판정 보류가 맞다.
5. **`max-age=0`의 HSTS는 드문 케이스다.** 아예 헤더를 안 내려 보내는 게 아니라 값을 0으로 내려 보낸다는 건, 과거 활성화 이력이 있었거나 게이트웨이/장비가 의도적으로 무효화했을 가능성을 시사한다. 내부 사정이 있을 수 있으니 단정하지 않되, 평문 HTTP 리다이렉트 누락과 함께 정리할 1순위 항목이다.
6. IMAP 143/SMTP 25 포트 사용 자체는 취약점이 아니다. STARTTLS 강제·평문 인증 차단 여부가 핵심인데, 이는 실제 접속 테스트 없이는 알 수 없어 이번 범위에서 제외했다.

## 개선 권고 (우선순위)

1. **DMARC 발행** — `p=none` + `rua` 리포트 수집부터 시작 → 점진적 quarantine/reject
2. **DKIM 서명 활성화** + 셀렉터 DNS 공개
3. **HSTS 유효 값 적용** (`max-age=31536000; includeSubDomains`) 및 80포트 → https 절대 리다이렉트
4. **MTA-STS** `mode=testing` 시작 + **TLS-RPT** 리포트 → enforce 전환
5. **g.kmou.ac.kr에 SPF(`include:_spf.google.com`)와 DMARC 추가** — 학생 도메인은 비용 대비 효과가 가장 큰 조치
6. 로그인 페이지에 기본 **CSP** 적용

## 방법론 부록 (재현 가능성)

```
dig +short MX/TXT/A/PTR/DNSKEY  # kmou.ac.kr, _dmarc, _smtp._domain, 셀렉터._domainkey 12종
python3 http.client              # wmail.kmou.ac.kr 80/443 공개 GET → 헤더·리다이렉트·인증서
```

공개 웹페이지 검색으로 확인: 정보전산원 공지(2026-01-15, nttSn=10369758), 퀄리티아 저작권 표기, G Suite 전환 공지(2019-12).

## 결론

조사한 부산권 국립대 중 **자체 메일 인프라 감사 1순위는 한국해양대로 확정**한다. 기대와 달리 완전한 단일 자체 운영은 아니고 교직원 자체(퀄리티아) + 학생 구글의 하이브리드였다. 인증 체계는 SPF 하드페일이라는 반듯한 출발점 위에 DKIM·DMARC·MTA-STS·TLS-RPT가 전무한, "첫 걸음만 걸어 둔" 상태다. 다음 자체 운영 후보 탐색은 동일한 공개정보 방법론으로 확장할 수 있다.
