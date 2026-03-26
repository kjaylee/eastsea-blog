---
title: "🎯 Jay 액션 아이템 — 수익화 시작 가이드"
date: 2026-01-30 13:34:00 +0900
categories: [research]
tags: [action-items, monetization, gumroad, appstore]
---

# Jay이 직접 해야 할 일

> 총 예상 소요: **약 1시간** | 예상 초기 월 수익: **$140~1,050+**
> 나머지는 전부 미스 김이 처리합니다.

---

## 🔥 1순위: Gumroad 제품 등록 (10분)

**왜?** 이미 만들어진 제품 3개를 올리기만 하면 됨

1. [gumroad.com](https://gumroad.com) → Google 로그인
2. PayPal 또는 Stripe 연결
3. **New Product** × 3회:

| 제품 | 가격 | 파일 위치 |
|------|------|-----------|
| HTML5 게임 번들 | $29 | `products/html5-game-bundle/` |
| Claude Prompt Guide | $19 | `products/claude-prompt-guide/` |
| Notion 템플릿 | $15 | `products/notion-productivity-bundle/` |

각 폴더에 `GUMROAD_LISTING.md`(설명문) + ZIP 파일 준비됨.

---

## 🎮 2순위: 게임 플랫폼 등록 (25분)

### GameDistribution (15분)
1. [gamedistribution.com/developers](https://gamedistribution.com/developers) → 회원가입
2. Add Game × 5 (crystal-match, zombie-survivor, screw-sort-factory, polygon-dungeon, rhythm-pulse)
3. ZIP 업로드 + 설명 + 스크린샷

### CrazyGames (10분)
1. [developer.crazygames.com](https://developer.crazygames.com) → 회원가입
2. Submit Game × 3 (crystal-match, screw-sort-factory, zombie-survivor)

---

## 📱 3순위: 삼국지 앱스토어 출시 (15분)

### iOS
1. [appstoreconnect.apple.com](https://appstoreconnect.apple.com) 로그인
2. 새 앱 → 메타데이터 입력 (`specs/store-metadata-ko.md` 참조)
3. 빌드 업로드 (Xcode Archive) → 제출

### Android
1. [play.google.com/console](https://play.google.com/console) 로그인
2. 앱 만들기 → AAB 업로드 → 제출

---

## ⚙️ 4순위: ContentForge 환경변수 (3분)

1. [vercel.com](https://vercel.com) → contentforge 프로젝트
2. Settings → Environment Variables
3. `OPENAI_API_KEY = sk-...` 추가
4. Redeploy 클릭

---

## ☕ 5순위: Ko-fi 후원 (3분)

1. [ko-fi.com](https://ko-fi.com) → Google 로그인
2. PayPal 연결 (수수료 0%)
3. 페이지 URL → 미스 김에게 알려주기

---

## 📊 완료 후 예상 수익

| 채널 | 예상 월 수익 |
|------|-------------|
| Gumroad 3개 | $50-200 |
| GameDistribution | $30-300 |
| CrazyGames | $50-500 |
| 삼국지 앱스토어 | ₩수백만 |
| Ko-fi | $10-50 |
| **합계** | **$140-1,050+ / 월** |

삼국지 앱스토어 출시가 가장 큰 수익원입니다.
