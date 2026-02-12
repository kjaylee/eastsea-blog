---
title: "Antigravity Gemini가 일반 Gemini보다 똑똑한 진짜 이유 — 에이전트 아키텍처 심층 분석"
date: 2026-02-12
categories: [research, ai]
tags: [Google, Antigravity, Gemini, AI IDE, 에이전트, 아키텍처]
---

# Antigravity Gemini가 일반 Gemini보다 똑똑한 진짜 이유

## Executive Summary

Google Antigravity는 2025년 11월 Gemini 3와 함께 출시된 **에이전트 퍼스트 AI IDE**다. 같은 Gemini 3 Pro 모델인데도 Antigravity 안에서 "더 똑똑하게" 느껴지는 이유는 **모델 자체의 지능 차이가 아니라, 모델을 감싸는 에이전트 아키텍처의 차이**에 있다.

핵심 차별화 요소 5가지:
1. **3-Surface 아키텍처** — 에디터·터미널·브라우저에 에이전트 직접 접근
2. **영속적 Brain** — 프로젝트 맥락을 세션 간 누적 저장
3. **Agent Skills 시스템** — 필요한 맥락만 동적 로딩 (Progressive Disclosure)
4. **Plan-Review-Execute** — 계획→리뷰→자율 실행→자체 검증
5. **Multi-Agent 오케스트레이션** — 병렬 에이전트 디스패치

---

## Antigravity란?

- **제작사:** Google (DeepMind 모델 + 前 Windsurf 팀 주도)
- **출시:** 2025년 11월 18일
- **기반:** VS Code 포크
- **지원 모델:** Gemini 3 Pro/Flash/Deep Think, Claude Sonnet 4.5, GPT-OSS-120B
- **가격:** 프리뷰 기간 무료

Google이 Windsurf 팀을 인수한 후, 해당 팀이 Antigravity의 엔지니어링을 이끌고 있다. "Copilot 시대를 끝내는 Mission Controller"를 표방한다.

---

## 기술 아키텍처 핵심

### 1. Three-Surface 모델

일반 IDE가 에디터 하나만 제공하는 것과 달리, Antigravity는 세 개의 작업 표면을 에이전트에게 제공한다:

- **Editor Surface** — 백그라운드 파일 읽기/쓰기, 비동기 리팩토링
- **Terminal Surface** — Bash/PowerShell 직접 접근, 자체 검증 루프 (코드→컴파일→에러 확인→자동 수정)
- **Browser Surface** — Chromium 인스턴스로 웹 앱 시각 확인, Gemini 3 비전으로 UI "보기", E2E 테스트

### 2. Brain — 영속적 지식 베이스

`.gemini/antigravity/brain/` 디렉토리에 프로젝트 맥락을 영속 저장한다:
- 선호도 (예: "Tailwind CSS 사용, Bootstrap 금지")
- 아키텍처 결정 기록
- 반복 실수 교정

일반 Gemini가 매 세션 리셋되는 것과 달리, Antigravity는 프로젝트가 진행될수록 에이전트가 더 정확해진다.

### 3. Agent Skills — Progressive Disclosure

가장 정교한 차별화 메커니즘이다:

1. 모든 Skills의 경량 메타데이터만 인덱싱
2. 사용자 프롬프트와 시맨틱 매칭
3. 관련 Skill만 컨텍스트에 주입
4. 작업 완료 후 즉시 해제

40~50K 토큰의 불필요한 도구를 일괄 로딩하면 "Context Rot"이 발생한다. Skills는 이를 방지하여 모델이 관련 정보에 집중할 수 있게 한다.

### 4. Plan-Review-Execute

**Planning Mode:**
분석 → 계획 생성 → 인간 리뷰 → 실행 → 검증 (워크스루 문서 + 스크린샷)

**Fast Mode:**
계획 단계 생략, 즉시 실행. UI 미세 조정 등 단순 작업에 최적.

### 5. Multi-Agent Manager

여러 에이전트를 병렬 디스패치. Agent A: 다크모드, Agent B: 인증 리팩토링 — 동시 실행. 상태 시각화 제공.

---

## 일반 Gemini 대비 차별점

| 차원 | 일반 Gemini | Antigravity Gemini |
|------|-----------|-------------------|
| 컨텍스트 | 세션별 리셋 | Brain으로 영속 |
| 도구 접근 | 제한적 | 에디터+터미널+브라우저 풀 접근 |
| 시스템 프롬프트 | 범용 | 모드별 특화 + Skills 동적 주입 |
| 검증 | 사용자 수동 확인 | 에이전트 자체 실행/테스트/스크린샷 |
| 맥락 관리 | 모놀리식 | Progressive Disclosure |
| 멀티태스킹 | 단일 스레드 | 멀티 에이전트 병렬 |

---

## 왜 더 똑똑하게 느껴지는가?

### 1. 자기 수정 사이클
일반 Gemini: 한 번에 출력 → 사용자가 확인
Antigravity: 코드 작성 → 실행 → 에러 시 자동 수정 → 브라우저 확인 → 반복

### 2. 영속적 학습
일반 Gemini: 매 세션 리셋
Antigravity: Brain에 학습 기록 누적 → 같은 실수 반복 안 함

### 3. Context Rot 방지
일반 Gemini: 모든 맥락을 한꺼번에 넣으면 혼란
Antigravity: 관련 Skill만 로딩 → 추론 정확도 향상

### 4. 환각 감소
일반 Gemini: "이 코드가 작동할 것입니다" (확인 불가)
Antigravity: 실제 실행 → 에러 확인 → 수정 → 렌더링 확인

### 5. 모드별 최적화
일반 Gemini: 범용 시스템 프롬프트
Antigravity: 작업 유형별 최적 행동 패턴 유도

---

## Gemini 3 모델 자체 성능

| 벤치마크 | Gemini 3 Pro | 비고 |
|---------|-------------|------|
| LMArena Elo | 1501 | 1위 |
| SWE-bench Verified | 76.2% | 코딩 에이전트 |
| Terminal-Bench 2.0 | 54.2% | GPT-5.1 상회 |
| WebDev Arena | 1487 Elo | 프론트엔드 1위 |

특히 Terminal-Bench 점수가 높다는 것은 Antigravity의 Terminal Surface가 효과적으로 작동할 수 있는 기반이 됨을 의미한다.

---

## 커뮤니티 반응

**긍정:**
- "Gemini 3 Flash가 Claude Opus보다 아키텍처 결정에서 더 강건"
- "명확한 프로젝트 목표를 주고 디테일은 맡기면 잘 작동"

**부정/혼합:**
- "AI Studio에서 같은 모델을 쓰면 오히려 더 좋을 때도 있다"
- "Planning 모드가 단순 작업을 과도하게 복잡하게 만들 때 있음"
- "레이턴시 이슈, 메모리 누수"

---

## 결론

**"Antigravity의 Gemini가 더 똑똑한 것이 아니라, Antigravity의 에이전트 아키텍처가 Gemini를 더 똑똑하게 만드는 것이다."**

이것은 **모델 지능(Model Intelligence)**과 **시스템 지능(System Intelligence)**의 구분이다. 모델 자체의 벤치마크 점수보다, 모델을 감싸는 에이전트 시스템의 설계가 최종 사용자 경험에 더 큰 영향을 미친다.

영속적 컨텍스트 + 동적 Skills 로딩 + 자체 검증 루프 + 구조화된 워크플로우 — 이 조합이 핵심이다.

---

*참조: Google Developers Blog, Wikipedia, Baytech Consulting, LogRocket, Fortune, Reddit r/google_antigravity*
