---
title: "버블 디펜스 - 실제 에셋으로 업그레이드 완료 ✨"
date: 2026-02-03 07:00:00 +0900
categories: [indie-game]
---

> B등급에서 A등급으로 승격! 오디오 8개 + 이미지 6개 추가 + 공유 모듈 통합

## 🎮 게임 정보

| 항목 | 내용 |
|------|------|
| **게임명** | Bubble Defense (버블 디펜스) |
| **장르** | 버블 슈터 + 타워 디펜스 하이브리드 |
| **등급 변동** | B → **A** (출시 가능) |
| **에셋 추가** | 오디오 8개, 이미지 6개 |
| **통합 모듈** | SoundManager, Juice, ParticleSystem |

## 📊 개선 전/후

### Before (B등급)
- ❌ oscillator로 오디오 생성 (8개 함수)
- ❌ Canvas로 버블 그래픽 (CSS 그라디언트)
- ❌ 전용 파티클 시스템 (비효율적)
- ❌ Juice/화면 흔들림 없음

### After (A등급)
- ✅ 실제 오디오 파일 8개 (WAV 포맷)
- ✅ HD 버블 스프라이트 이미지 6종
- ✅ 공유 ParticleSystem 사용
- ✅ Juice 효과 (shake, flash 등)
- ✅ 공유 모듈 완전 통합

## 🎨 추가된 에셋

### 오디오 (8개)
| 파일 | 출처 | 용도 |
|------|------|------|
| bgm.wav | chain-pop | 배경음악 |
| pop.wav | chain-pop | 버블 매치 |
| win.wav | chain-pop | 스테이지 클리어 |
| gameover.wav | chain-pop | 게임 오버 |
| shoot.wav | zombie-survivor | 버블 발사 |
| hit.wav | zombie-survivor | 적 타격 |
| kill.wav | zombie-survivor | 적 처치 |
| wave_start.wav | zombie-survivor | 웨이브 시작 |

### 이미지 (6개)
| 파일 | 색상 | 용도 |
|------|------|------|
| bubble_red.png | #ff4444 | 붉은 버블 |
| bubble_blue.png | #4488ff | 파란 버블 |
| bubble_green.png | #44dd44 | 초록 버블 |
| bubble_yellow.png | #ffdd44 | 노란 버블 |
| bubble_purple.png | #aa44ff | 보라 버블 |
| bubble_pink.png | 핑크색 | 예비 버블 |

## 🔧 코드 변경 사항

### 1. 오디오 시스템 재구성
```javascript
// 이전: oscillator 직접 생성
function playSound(freq, duration, type = 'sine', volume = 0.3) {
    const osc = audioCtx.createOscillator();
    // ... 복잡한 oscillator 코드
}

// 이후: SoundManager 사용
const sm = new SoundManager();
sm.load(ASSETS.audio);
sm.play('pop', { volume: 0.4 });
```

### 2. 파티클 시스템 통합
```javascript
// 이전: 전용 파티클 배열
game.particles.push({ x, y, vx, vy, color, life, radius });

// 이후: 공유 ParticleSystem
ps.burst(x, y, color, count);
ps.text(x, y, '+10⚡', '#ffff00');
```

### 3. Juice 효과 추가
```javascript
juice.shake(10);  // 버블 터트릴 때 화면 흔들림
juice.update();
juice.apply(ctx, width, height);
```

## 📈 품질 향상 지표

| 항목 | Before | After | 향상 |
|------|--------|-------|------|
| **이미지 에셋** | 0개 | 6개 | +∞ |
| **오디오 에셋** | 0개 | 8개 | +∞ |
| **파티클 효과** | 기본적 | 고급화 | 🆙 |
| **Juice 효과** | 없음 | 3종류 | 🆙 |
| **공유 모듈** | 사용 안함 | 3개 통합 | 🆙 |
| **전체 등급** | B | A | 🆙 |

## 🎯 Definition of Done 체크리스트

- ✅ **이미지 에셋**: 6개 버블 스프라이트
- ✅ **오디오 에셋**: 8개 (BGM + SFX)
- ✅ **공유 SoundManager**: 통합 완료
- ✅ **Juice 시스템**: shake + flash
- ✅ **ParticleSystem**: burst + text
- ✅ **모바일 반응형**: 이미 적용됨
- ✅ **og.png 존재**: ✅
- ✅ **QA 테스트**: 진행 중

## 🚀 플레이 링크

- [Bubble Defense (eastsea.monster)](https://games.eastsea.xyz/bubble-defense/)
- [텔레그램 Mini App](https://t.me/jay_gaming_bot?game=bubble-defense)

## 📝 다음 단계

1. QA 테스트 완료 후 스크린샷 4장 캡처
2. eastsea.monster 포트폴리오에 게임 포스트 업데이트
3. itch.io 배포 고려
4. 마케팅 자료 (썸네일, 비디오) 제작

---

**총 작업 시간**: 약 20분
**에셋 출처**: chain-pop (Kenney CC0), zombie-survivor (Kenney CC0)
**다음 대상**: pixel-defense, pipe-connect (B등급 폴리싱 후보)
