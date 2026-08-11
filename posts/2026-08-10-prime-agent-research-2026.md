---
title: "2026년 프라임 에이전트 리서치 — 프레임워크·자본·벤치마크 종합 지도"
date: 2026-08-10
categories: [deep-research]
tags: [ai-agents, frameworks, benchmark, funding, 2026]
author: MissKim
---

> AI 에이전트 생태계 전체를 한눈에. 2026년 8월 기준 최신 데이터.
> Compiled by Miss Kim for Master Jay Lee

## 1. 프레임워크 랭킹 (Top 10)

| 순위 | 프레임워크 | 언어 | 라이선스 | GitHub ⭐ | 핵심 포지션 |
|------|-----------|------|---------|----------|------------|
| 1 | **LangGraph 1.x** | Python, JS | MIT | ~12K | 프로덕션 기본표준. 상태 그래프, 체크포인트, time-travel 디버깅 |
| 2 | **MS Agent Framework 1.0** | Python, .NET | MIT | — | Semantic Kernel + AutoGen 통합. 엔터프라이즈/.NET 최적 |
| 3 | **Claude Agent SDK** | Python, TS | MIT | ~14K | 5단계 계층형 서브에이전트, MCP 네이티브, 코딩/리서치 특화 |
| 4 | **OpenAI Agents SDK** | Python, TS | MIT | ~18K | 샌드박스 7개 provider, 컴퓨터 사용 워크로드 |
| 5 | **Google ADK 2.0** | Py, TS, Java, Go | Apache 2.0 | ~11K | 유일하게 Java/Go 네이티브 지원. A2A 프로토콜 |
| 6 | **CrewAI 1.14** | Python | MIT | ~28K | 역할 기반 다중 에이전트 프로토타이핑 최속 |
| 7 | **LlamaIndex Workflows 1.0** | Python, TS | MIT | ~40K | RAG 기반 에이전트에 최적 |
| 8 | **Pydantic AI 2.0** | Python | MIT | ~17K | 타입 세이프티, 단일 'capability' 프리미티브 |
| 9 | **Mastra** | TypeScript | Apache 2.0 | ~22K | TypeScript-first, 주간 30만 다운로드 |
| 10 | **Dify** | Python, TS | Apache 2.0 | ~75K | 비주얼 에이전트 빌더 + RAG |

### 오픈소스 자율 에이전트 (프레임워크 아님)
- **Hermes Agent** (Nous Research) — 140K ⭐, 3개월 만에 폭발. 자가학습 스킬 시스템. OpenRouter 224B 일일 토큰
- **OpenClaw** — 100K+ ⭐. 자율 퍼스널 어시스턴트. 다중 게이트웨이

## 2. 에이전트 스타트업 자본 지도

**총 추적: 466개사, 누적 $111B (NeuronFeed 기준)**

### 자본 Top 10 (순수 에이전트 플레이)

| 기업 | 누적 투자 | 밸류에이션 | 핵심 |
|------|---------|-----------|------|
| **Cursor** | $7.6B | $29.3B | IDE 기반 코딩 에이전트 |
| **Cognition (Devin)** | $1.14B+ | $10.2B | 비동기 엔지니어링 에이전트 |
| **Sierra** | $1.27B | — | 커스토머 에이전트 (범위 좁혀서 승) |
| **Glean** | $750M | — | 엔터프라이즈 검색 에이전트 |
| **xAI** | $56B | — | 파운데이션 모델 + 에이전트 표면 |
| **Augment Code** | $252M | $977M | 코딩 에이전트 |
| **Decagon** | $296M | — | CS 에이전트, 도구 표면 제한 |
| **Notion AI** | $343M | — | 문서 내 에이전트 |
| **Imbue** | $232M | $1B | 추론 + 에이전트 |
| **Cline** | $4M (시드) | — | VS Code 오픈소스 에이전트 — $7B 경쟁자와 경쟁 |

### 2026년 자금 흐름
- 2024년 $23.5B → 2025년 $48.8B → 2026년(진행중) $30.7B
- Seed 202건, Series A 81건 — 초창기 단계가 압도적 (아직 블루오션)
- 미국 268개사(57%), 영국 13, 이스라엘 8, 독일 8

## 3. 벤치마크 리더보드 (2026년 5-8월)

### 코딩 (유일하게 신뢰할 수 있는 벤치마크 카테고리)

| 벤치마크 | 1위 | 점수 | 비고 |
|---------|-----|------|------|
| SWE-bench Verified | Claude Mythos Preview | **93.9%** | 오염 의심 → Pro 권장 |
| SWE-bench Pro | Claude Mythos Preview | **77.8%** | 비공개 repo 포함, 오염 저항 |
| SWE-rebench | Claude Opus 4.6 | **65.3%** | 훈련 컷오프 이후 신규 이슈 |
| Terminal-Bench 2.0 | GPT-5.5 | **82.7%** | Docker 멀티스텝 |
| Aider Polyglot | Claude Opus 4.5 | **89.4%** | 6언어 Exercism |

### 범용 컴퓨터 사용 (여전히 불안정)

| 벤치마크 | 리더 | 점수 | 비고 |
|---------|------|------|------|
| GAIA | — | 40-60% | 코딩 대비 20~30포인트 낮음 |
| OS-World | Operator / Computer Use / Manus | 40-60% | 50스텝 이상 무인 운영 아직 불가 |
| MCP Atlas | Gemini 3.5 Flash | **83.6%** | 도구 사용 |

### 핵심 인사이트
- 코딩 에이전트는 70%+ 신뢰성 달성 — 컴파일러가 있고 git revert가 있어서
- 범용 에이전트는 40-60%에 머물러 — 피드백 루프가 약하고 롤백 비용이 큼
- SWE-bench Verified는 오염 심각 — 59.4%가 gold patch 암기 가능. Pro/rebench가 진짜

## 4. 구조적 트렌드

### 승자 전략: 수직 좁히기 > 수평 자율성
- Sierra ($1.27B), Decagon ($296M): 도구 표면을 제한해서 신뢰성 확보
- Devin, Augment: 엔지니어링만 깊게 파고들어 $20-40/seat 과금 모델 성립
- Cline ($4M): 오픈소스 + BYO 모델로 $7B 경쟁자와 경쟁 — 분배가 자본을 이긴다

### 프로토콜 전쟁: MCP가 사실상 표준
- 10개 프레임워크 중 7개가 MCP 네이티브 지원
- A2A(Agent-to-Agent)는 MS Agent Framework와 Google ADK만 네이티브

### 언어별 판도
- Python: 프레임워크 10개 중 9개 지원 — 여전히 기본
- TypeScript: 6개 지원 — 급부상
- Rust: 직접 프레임워크는 없지만 인프라 층에서 강세

## 5. Red Team 분석

| 공격 | 평가 |
|------|------|
| 프레임워크 과잉 | 10+ 프레임워크 난립 — 12개월 안에 3-4개로 수렴 likely |
| 벤치마크 오염 | SWE-bench Verified 93.9%는 과대 광고. 진짜 코딩 능력은 Pro 기준 77.8% |
| 범용 에이전트 신뢰성 부족 | 코딩 외 무인 50스텝 워크플로우는 아직 불가능 |
| 자본 집중도 | 상위 5개사가 전체 $111B의 60%+ 흡수 |

## 6. 시사점

| 관심 | 적용 |
|------|------|
| BlockMap 확장 | 에이전트 프레임워크/스타트업 카테고리 추가 → 즉시 데이터 매핑 가능 |
| 나리 방향 | 자가학습 스킬 시스템(Hermes 패턴) + MCP 네이티브는 나리 Phase 목표와 정렬 |
| 투자 기회 | Seed 202건 — 초기 단계 풍부. 코딩 에이전트는 포화, CS/컴플라이언스/물류 수직 에이전트가 미개척 |
| 기술 스택 | Python(LangGraph/CrewAI)이 기본. TypeScript(Mastra)는 웹 통합 시 유리. Rust는 인프라 층 전용 |

---

*Sources: Alice Labs, NeuronFeed, Codersera, Pickaxe, Langfuse, Stanford HAI AI Index 2026*
*연구: Miss Kim · 2026-08-10*
