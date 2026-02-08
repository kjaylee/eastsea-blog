---
title: "심층 리서치: claude-mem 도입 검토 — AI 에이전트의 기억은 어떻게 설계되어야 하는가"
date: 2026-02-09 08:30:00 +0900
categories: [research, deep-dive]
tags: [AI, memory, OpenClaw, claude-mem, context-engineering, RAG, progressive-disclosure, LLM-memory]
---

## Executive Summary

GitHub 25.5K 스타를 기록한 **claude-mem**(thedotmack/claude-mem)은 Claude Code 플러그인 형태로 동작하는 **크로스 세션 메모리 압축 시스템**이다. 세션 간 컨텍스트를 자동으로 캡처하고, AI로 압축하며, 다음 세션에 관련 컨텍스트를 주입하는 것이 핵심이다. 현재 OpenClaw가 운영하는 MEMORY.md + memory/*.md + LanceDB RAG(713 chunks) 시스템과 비교 분석하여, 도입 가치와 흡수 가능한 패턴을 평가한다.

**결론: 전면 도입보다는 핵심 패턴 3가지(Progressive Disclosure, 3-Layer Workflow, Semantic Compression)를 흡수하는 것을 추천한다.**

---

## 1. claude-mem이란 무엇인가

### 1.1 프로젝트 개요

claude-mem은 Alex Newman(@thedotmack)이 개발한 **Claude Code 전용 플러그인**으로, 코딩 세션에서 Claude가 수행하는 모든 도구 사용을 자동으로 캡처하고, Claude Agent SDK를 통해 AI 압축을 수행한 뒤, 구조화된 관찰(Observation)로 저장한다. 다음 세션이 시작될 때 이전 세션의 맥락을 자동으로 주입하여, Claude가 프로젝트에 대한 **지식의 연속성**을 유지할 수 있게 한다.

- **버전:** 6.5.0 (2026년 2월 기준)
- **라이선스:** AGPL-3.0 (ragtime/ 디렉터리는 PolyForm Noncommercial)
- **스타:** 25.5K (GitHub)
- **언어:** TypeScript (ES2022, ESNext modules)
- **런타임:** Node.js 18+, Bun (프로세스 관리), SQLite 3

### 1.2 핵심 기능

| 기능 | 설명 |
|------|------|
| 🧠 Persistent Memory | 세션 간 컨텍스트 자동 보존 |
| 📊 Progressive Disclosure | 계층적 메모리 검색 (인덱스 → 타임라인 → 상세) |
| 🔍 MCP Search Tools | 4개의 MCP 도구를 통한 자연어 메모리 검색 |
| 🖥️ Web Viewer UI | localhost:37777에서 실시간 메모리 스트림 시각화 |
| 🔒 Privacy Control | `<private>` 태그로 민감 정보 저장 제외 |
| ⚙️ Context Configuration | 주입되는 컨텍스트의 세밀한 제어 |
| 🤖 Automatic Operation | 수동 개입 불필요, 완전 자동 |
| 🧪 Beta: Endless Mode | 바이오미메틱 메모리 아키텍처 (장시간 세션용) |

---

## 2. 아키텍처 심층 분석

### 2.1 시스템 구성 요소

claude-mem은 5개의 핵심 컴포넌트로 구성된다:

```
┌─────────────────────────────────────────────────┐
│ 1. Plugin Hooks (6개)                            │
│    SessionStart → UserPromptSubmit → PostToolUse │
│    → Stop → SessionEnd + Smart Install           │
├─────────────────────────────────────────────────┤
│ 2. Worker Service (Express.js, port 37777)       │
│    HTTP API + SSE 실시간 업데이트                  │
├─────────────────────────────────────────────────┤
│ 3. SQLite Database + FTS5                        │
│    세션, 관찰, 요약, 사용자 프롬프트 저장           │
├─────────────────────────────────────────────────┤
│ 4. ChromaDB (선택적)                              │
│    시맨틱 벡터 검색 (하이브리드 검색)               │
├─────────────────────────────────────────────────┤
│ 5. MCP Search Tools (4개 도구)                    │
│    search → timeline → get_observations          │
└─────────────────────────────────────────────────┘
```

### 2.2 데이터 플로우: 메모리 파이프라인

```
Hook (stdin) → Database → Worker Service → SDK Processor → Database → Next Session Hook
```

1. **입력:** Claude Code가 도구 실행 데이터를 stdin을 통해 Hook에 전달
2. **저장:** Hook이 관찰(Observation)을 SQLite 데이터베이스에 기록
3. **처리:** Worker Service가 관찰을 읽고, Claude Agent SDK를 통해 AI 압축 수행
4. **출력:** 처리된 요약이 데이터베이스에 다시 기록
5. **검색:** 다음 세션의 Context Hook이 데이터베이스에서 요약을 읽어 주입

### 2.3 세션 생명주기 (6단계)

| 단계 | Hook | 역할 |
|------|------|------|
| 0 | Smart Install | 의존성 캐시 검사 (버전 변경 시에만 실행) |
| 1 | SessionStart | Bun 워커 시작, 이전 세션 컨텍스트 주입 |
| 2 | UserPromptSubmit | 세션 레코드 생성, 사용자 프롬프트 FTS5용 저장 |
| 3 | PostToolUse | 도구 실행 캡처 (세션당 100회 이상), 워커에 전송 |
| 4 | Stop | 최종 요약 생성 (request, completions, learnings) |
| 5 | SessionEnd | 세션 완료 마킹 (graceful, DELETE 아님) |

### 2.4 데이터베이스 스키마

claude-mem은 4개의 핵심 테이블을 사용한다:

**sdk_sessions** — 세션 추적
```sql
CREATE TABLE sdk_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sdk_session_id TEXT UNIQUE NOT NULL,
  claude_session_id TEXT,
  project TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at_epoch INTEGER NOT NULL,
  ...
);
```

**observations** — 개별 도구 실행 (구조화된 관찰)
```sql
CREATE TABLE observations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  project TEXT NOT NULL,
  title TEXT,          -- 시맨틱 압축된 제목
  narrative TEXT,      -- AI가 생성한 서사
  facts TEXT,          -- JSON 배열
  concepts TEXT,       -- 태그 배열
  type TEXT,           -- decision, bugfix, feature, refactor, discovery, change
  files_read TEXT,
  files_modified TEXT,
  ...
);
```

**session_summaries** — AI 생성 세션 요약
**user_prompts** — 사용자 원본 프롬프트 (FTS5 검색용)

각 테이블에는 **FTS5 가상 테이블**이 매핑되어 전문 검색을 지원한다:

```sql
CREATE VIRTUAL TABLE observations_fts USING fts5(
  title, subtitle, narrative, text, facts, concepts,
  content='observations', content_rowid='id'
);
```

### 2.5 검색 아키텍처: 하이브리드 접근

claude-mem은 **SQLite FTS5 + ChromaDB** 하이브리드 검색을 사용한다:

- **FTS5:** 키워드 매칭, 의존성 없음, sub-10ms 쿼리
- **ChromaDB:** 시맨틱 유사도 검색, Python 의존성 필요
- **Graceful Degradation:** ChromaDB 없이도 FTS5만으로 동작

---

## 3. 핵심 철학: Progressive Disclosure (점진적 공개)

claude-mem의 가장 중요한 설계 철학은 **Progressive Disclosure**이다. 이것은 단순한 기술적 결정이 아니라, AI 에이전트의 컨텍스트 엔지니어링에 대한 근본적인 사고방식의 전환이다.

### 3.1 문제: 컨텍스트 오염 (Context Pollution)

전통적인 RAG 시스템은 세션 시작 시 모든 것을 로드한다:

```
❌ 전통적 접근:
  세션 시작 → 35,000 토큰의 과거 컨텍스트 로드
  실제 관련 있는 토큰: ~2,000 (6%)
  낭비: 94%
```

### 3.2 해결: 3-Layer Workflow

claude-mem은 **3계층 워크플로우**로 이 문제를 해결한다:

| 계층 | 도구 | 토큰 비용 | 역할 |
|------|------|-----------|------|
| Layer 1: Index | `search` | ~50-100/결과 | "무엇이 있는가?" 가벼운 탐색 |
| Layer 2: Context | `timeline` | 가변 | "무슨 일이 있었나?" 맥락 파악 |
| Layer 3: Details | `get_observations` | ~500-1,000/결과 | "자세히 알려줘" 필요한 것만 |

**토큰 효율성 비교:**

```
전통적 RAG:
  20개 관찰 전체 로드: 10,000-20,000 토큰
  관련 있는 것: 2개 (10%)
  낭비: 18,000 토큰

3-Layer Workflow:
  Step 1 - search (20 결과): ~1,000-2,000 토큰
  Step 2 - 인덱스 검토, 3개 관련 ID 식별
  Step 3 - get_observations (3개): ~1,500-3,000 토큰
  총계: 2,500-5,000 토큰 (50-75% 절감)
```

### 3.3 핵심 통찰: 도구 설계로 워크플로우를 강제

이전 v5에서는 9개의 MCP 도구가 있었고, 에이전트가 Progressive Disclosure 패턴을 "기억"해야 했다. v6에서는 **4개의 도구로 줄이고, 도구 구조 자체가 워크플로우를 강제**하도록 바꿨다:

- `__IMPORTANT` — 워크플로우 문서 (항상 Claude에게 노출)
- `search` — Step 1: 인덱스 획득
- `timeline` — Step 2: 맥락 파악
- `get_observations` — Step 3: 상세 조회

**코드 크기 변화:** 2,718줄 → 312줄 (88% 감소)

> "Before: Progressive disclosure was something Claude had to remember.
> After: Progressive disclosure is enforced by tool design itself."

---

## 4. OpenClaw 메모리 시스템과의 비교

### 4.1 현재 OpenClaw 메모리 아키텍처

OpenClaw는 다음과 같은 메모리 시스템을 운영 중이다:

```
┌─────────────────────────────────────┐
│ 1. MEMORY.md (즉시 로드)             │
│    시스템 정체성, 핵심 규칙            │
├─────────────────────────────────────┤
│ 2. memory/core.md (2KB 제한)         │
│    실행 규칙, 인프라, 표준             │
├─────────────────────────────────────┤
│ 3. memory/*.md (일일 로그)           │
│    today.md → 2026-02-09.md (심링크) │
│    archive/ (과거 로그)               │
├─────────────────────────────────────┤
│ 4. RAG (LanceDB + SentenceTransformers) │
│    713 chunks, paraphrase-multilingual    │
│    ./rag/search "query"              │
├─────────────────────────────────────┤
│ 5. AGENTS.md, TOOLS.md (정적 문서)    │
│    워크스페이스 규칙, 도구 가이드       │
└─────────────────────────────────────┘
```

### 4.2 장단점 비교표

| 항목 | claude-mem | OpenClaw 현재 시스템 |
|------|-----------|---------------------|
| **자동화 수준** | ✅ 완전 자동 (후크 기반) | ⚠️ 반자동 (수동 문서 작성 + cron) |
| **데이터 캡처** | ✅ 모든 도구 사용 자동 캡처 | ❌ 선택적 수동 기록 |
| **AI 압축** | ✅ Claude SDK로 자동 압축 | ❌ 사람이 직접 요약 작성 |
| **검색 방식** | ✅ FTS5 + ChromaDB 하이브리드 | ✅ LanceDB 벡터 검색 |
| **Progressive Disclosure** | ✅ 3-Layer Workflow | ❌ 전체 로드 |
| **토큰 효율성** | ✅ 50-75% 절감 | ⚠️ core.md 2KB 제한으로 간접 달성 |
| **크로스 세션 연속성** | ✅ 자동 컨텍스트 주입 | ⚠️ today.md 수동 참조 |
| **시각화** | ✅ Web UI (localhost:37777) | ❌ 없음 |
| **범용성** | ❌ Claude Code 전용 | ✅ OpenClaw 모든 채널 (Discord, Telegram 등) |
| **멀티 에이전트** | ❌ 단일 Claude 세션 | ✅ Main + Subagent + Node 아키텍처 |
| **플랫폼 독립성** | ❌ Claude Code 플러그인 시스템 의존 | ✅ 독립적 파일 기반 |
| **커스터마이징** | ⚠️ 설정 파일 기반 | ✅ 자유로운 구조 설계 |
| **의존성** | ⚠️ Node.js, Bun, Python(ChromaDB) | ✅ Python만 (LanceDB) |
| **라이선스** | ⚠️ AGPL-3.0 (제약 많음) | ✅ 제약 없음 |
| **비용** | ⚠️ AI 압축에 API 크레딧 소모 | ✅ 임베딩만 (로컬 모델) |

### 4.3 claude-mem이 제공하는 추가 가치

1. **자동 관찰 캡처:** 모든 도구 사용이 자동으로 구조화된 관찰로 변환된다. OpenClaw에서는 에이전트가 직접 memory 파일에 기록해야 한다.

2. **AI 기반 압축:** Claude Agent SDK를 사용해 관찰을 자동 압축하고, 제목/서사/팩트/개념으로 구조화한다. 100:1 압축률을 달성한다.

3. **Progressive Disclosure 검색:** 인덱스 → 타임라인 → 상세의 3계층 구조는 토큰 효율성에서 확실한 우위가 있다.

4. **타임라인 기능:** 특정 관찰 전후에 무슨 일이 있었는지 시간순으로 파악할 수 있다. OpenClaw의 일일 로그는 날짜 단위 분할만 제공한다.

5. **프로젝트별 격리:** project 필드를 통해 여러 프로젝트의 메모리를 자동으로 분리 관리한다.

---

## 5. 통합 가능성 분석

### 5.1 직접 도입: 불가능

claude-mem은 **Claude Code 플러그인 시스템에 강하게 결합**되어 있다:

- `/plugin marketplace add` 명령으로만 설치 가능
- 5개의 Claude Code 라이프사이클 훅에 의존
- Bun 프로세스 매니저로 워커 서비스 관리
- Claude Agent SDK를 AI 압축에 사용

OpenClaw는 Claude Code와 별도의 에이전트 프레임워크이며, OpenClaw 내부에서 claude-mem의 훅 시스템을 직접 사용할 수 없다.

### 5.2 래핑 가능성: 제한적

claude-mem의 Worker Service HTTP API(port 37777)를 OpenClaw 스킬로 래핑하는 것은 이론적으로 가능하다:

```
OpenClaw Skill → HTTP GET localhost:37777/api/search → claude-mem 검색 결과
```

그러나 이 접근의 문제점:
- claude-mem의 워커가 별도로 실행 중이어야 함
- 데이터 캡처는 여전히 Claude Code 훅에 의존
- OpenClaw 세션의 작업은 캡처되지 않음
- 두 시스템의 메모리가 분리되어 일관성 없음

### 5.3 최적 접근: 패턴 흡수

claude-mem에서 **설계 패턴만 추출하여 OpenClaw 시스템에 적용**하는 것이 가장 합리적이다.

---

## 6. 흡수 추천 패턴 3가지

### 6.1 패턴 1: Progressive Disclosure 검색

**현재 OpenClaw RAG 문제:**
```python
# 현재: ./rag/search "query" → 상위 5개 전체 chunk 반환
# 각 chunk 500자 → 총 2,500자가 한번에 로드
```

**개선안:**
```python
# Phase 1: 인덱스 반환 (제목 + 점수 + chunk ID)
./rag/search --index "authentication bug"
# → [#12 score:0.89 "API 인증 토큰 만료 처리" 120자]
# → [#45 score:0.76 "OAuth 흐름 버그픽스" 340자]

# Phase 2: 선택적 상세 조회
./rag/get 12 45
# → 선택된 chunk만 전체 내용 반환
```

**구현 방법:** `rag/rag_search.py`에 `--index` 모드를 추가하고, `get` 서브커맨드를 만든다. 에이전트가 인덱스를 먼저 보고 필요한 것만 가져오도록 AGENTS.md에 워크플로우를 명시한다.

### 6.2 패턴 2: 구조화된 관찰 로깅

**현재 OpenClaw 일일 로그:**
```markdown
## 2026-02-09
- 블로그 포스트 작성 완료
- 디스코드 봇 수정
```

**개선안 (claude-mem의 Observation 구조 차용):**
```markdown
## 2026-02-09

### 🟢 블로그 자동화 파이프라인 구축
- **Type:** feature
- **Files:** eastsea-blog/update-posts.sh
- **Facts:** Jekyll front matter 자동 생성, Git push 자동화
- **Concepts:** blog, automation, CI/CD
- **Tokens:** ~85

### 🟡 Discord 메시지 포맷 버그 수정
- **Type:** bugfix
- **Files:** misskim-skills/discord-formatter.py
- **Facts:** 2000자 초과 메시지가 잘리는 문제, split 로직 추가
- **Concepts:** discord, message, truncation
```

**효과:** 검색 가능성 향상 (FTS5 또는 LanceDB에서 구조화된 필드로 검색), 타입별 필터링, 토큰 비용 예측.

### 6.3 패턴 3: 3-Layer Workflow를 AGENTS.md에 명시

**현재:** "Always `./rag/search` before acting"
**개선안:**

```markdown
## RAG 3-Layer Workflow (ALWAYS FOLLOW)
1. `./rag/search --index "query"` → 인덱스 확인 (~50 tokens/결과)
2. 관련 ID 식별 → 정말 필요한 것만 선택
3. `./rag/get [IDs]` → 상세 내용 조회 (~200 tokens/결과)
❌ 절대 전체 chunk를 한번에 로드하지 마라.
```

이것만으로도 RAG 검색의 **토큰 효율성이 50% 이상** 개선될 수 있다.

---

## 7. claude-mem의 Context Engineering 철학에서 배울 것

claude-mem의 공식 문서에서 특히 주목할 철학적 원칙들:

### 7.1 "Context as Currency" (컨텍스트는 화폐다)

> "컨텍스트 윈도우를 은행 계좌로 생각하라. 모든 것을 한번에 쓰는 것은 월급 전부를 식료품에 쓰는 것과 같다."

LLM의 어텐션은 **n² 관계**이다. 100K 토큰 윈도우 ≠ 100K 토큰의 유용한 주의력. 컨텍스트가 길어질수록 모델 정확도는 떨어진다. 이것을 **"Context Rot"**이라 부른다.

OpenClaw가 core.md를 2KB로 제한한 것은 이미 이 원칙을 직관적으로 실천하고 있는 것이다. 그러나 RAG 결과 로드에는 이 원칙이 적용되지 않고 있다.

### 7.2 "Design for Autonomy" (자율성을 위한 설계)

> "모델이 개선될수록, 모델이 지능적으로 행동하게 두어라."

**전통 RAG:** 시스템이 관련성을 판단 → 에이전트에게 전달
**Progressive Disclosure:** 시스템이 인덱스를 보여줌 → 에이전트가 관련성을 판단 → 필요한 것만 가져옴

에이전트는 현재 작업의 맥락을 알고 있다. 우리는 모른다. 따라서 에이전트에게 **선택권**을 주는 것이 항상 더 나은 결과를 만든다.

### 7.3 "Semantic Compression" (시맨틱 압축)

나쁜 제목: `"관찰 내용에 대해"`
좋은 제목: `"🔴 Hook timeout: 60s 기본값이 npm install에 부족"`

좋은 제목의 조건:
- **구체적:** 정확한 이슈 식별
- **실행 가능:** 무엇을 해야 하는지 명확
- **자기 완결적:** 본문을 읽지 않아도 의미 파악 가능
- **검색 가능:** 핵심 키워드 포함
- **분류됨:** 아이콘으로 유형 표시

---

## 8. 주의해야 할 점: claude-mem의 한계

### 8.1 Solana 토큰 ($CMEM)과 상업화

README 최상단에 Solana 토큰 $CMEM의 거래 링크(Bags.fm, Jupiter, DEXScreener)가 포함되어 있다. 오픈소스 프로젝트에 암호화폐 토큰을 결합한 것은 **프로젝트의 장기적 신뢰성과 방향성에 의문**을 제기한다. 기술적 가치와 별개로, 이 부분은 도입 결정 시 고려해야 한다.

### 8.2 AGPL-3.0 라이선스의 제약

AGPL-3.0은 가장 강력한 카피레프트 라이선스 중 하나로, 네트워크 서버에 수정 배포 시 소스 코드 공개 의무가 있다. OpenClaw에 코드를 직접 통합할 경우 라이선스 전파 위험이 있다.

### 8.3 API 비용

AI 압축에 Claude Agent SDK를 사용하므로, 세션당 추가 API 크레딧이 소모된다. 매 도구 사용마다 별도의 AI 호출이 발생하면 비용이 빠르게 누적될 수 있다.

### 8.4 Claude Code 종속성

Claude Code의 플러그인 시스템, 라이프사이클 훅, MCP 프로토콜에 강하게 결합되어 있다. Claude Code가 아닌 환경(OpenClaw, 다른 에이전트 프레임워크)에서는 사용할 수 없다.

---

## 9. 최종 비교 매트릭스

| 평가 기준 | 가중치 | claude-mem | OpenClaw 현재 | 흡수 후 OpenClaw |
|-----------|--------|-----------|--------------|-----------------|
| 자동화 수준 | 20% | ★★★★★ | ★★★☆☆ | ★★★★☆ |
| 토큰 효율성 | 25% | ★★★★★ | ★★★☆☆ | ★★★★★ |
| 범용성 | 20% | ★★☆☆☆ | ★★★★★ | ★★★★★ |
| 검색 품질 | 15% | ★★★★★ | ★★★★☆ | ★★★★★ |
| 유지보수성 | 10% | ★★★☆☆ | ★★★★★ | ★★★★☆ |
| 비용 효율 | 10% | ★★★☆☆ | ★★★★★ | ★★★★★ |
| **가중 합계** | | **3.95** | **3.75** | **4.60** |

---

## 10. 결론 및 액션 아이템

### 판정: **일부 패턴 흡수 추천** (전면 도입 불필요)

claude-mem은 기술적으로 인상적인 프로젝트이며, 특히 **Progressive Disclosure, 3-Layer Workflow, Semantic Compression** 세 가지 설계 패턴은 범용적으로 적용 가능한 탁월한 아이디어다. 그러나 Claude Code 전용이라는 플랫폼 종속성, AGPL 라이선스, 암호화폐 토큰 결합 등의 이유로 **직접 도입은 부적절**하다.

### 추천 액션 아이템

| 우선순위 | 작업 | 예상 효과 |
|----------|------|-----------|
| 🔴 P0 | RAG에 `--index` 모드 추가 (인덱스 → 상세 2단계) | 토큰 50% 절감 |
| 🟡 P1 | memory/*.md 관찰 로그 구조화 (제목/타입/팩트/개념) | 검색 정확도 향상 |
| 🟡 P1 | AGENTS.md에 3-Layer Workflow 명시 | 에이전트 행동 개선 |
| 🔵 P2 | RAG 결과에 토큰 비용 표시 | 에이전트 자율적 예산 관리 |
| 🔵 P2 | 일일 로그 자동 구조화 스크립트 | 수동 작업 감소 |

### 핵심 메시지

> claude-mem의 진짜 가치는 코드가 아니라 **철학**에 있다. "에이전트에게 모든 것을 쏟아붓지 말고, 인덱스를 보여주고 선택하게 하라." 이 원칙은 claude-mem 없이도 우리 시스템에 즉시 적용할 수 있다.

---

## 부록: 기술 사양 요약

| 항목 | claude-mem | OpenClaw Memory |
|------|-----------|----------------|
| 저장소 | SQLite + ChromaDB | LanceDB + Markdown |
| 검색 | FTS5 + 벡터 하이브리드 | 벡터 검색 (cosine similarity) |
| 임베딩 | ChromaDB 내장 | paraphrase-multilingual-MiniLM-L12-v2 |
| 언어 | TypeScript | Python |
| 런타임 | Node.js 18+, Bun | Python 3.x |
| 포트 | 37777 | N/A (CLI) |
| 청크 크기 | AI 자동 결정 | 500자 (50자 오버랩) |
| 인덱스 크기 | 무제한 (세션 누적) | 713 chunks |
| 프로토콜 | MCP (JSON-RPC over stdio) | CLI (shell exec) |
| 비용 | API 크레딧 (AI 압축) | 무료 (로컬 임베딩) |

---

*이 리서치는 2026년 2월 9일 기준 claude-mem v6.5.0, OpenClaw 메모리 시스템 현행 상태를 기반으로 작성되었습니다. GitHub: [thedotmack/claude-mem](https://github.com/thedotmack/claude-mem)*
