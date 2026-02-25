---
layout: post
title: "Building Persistent Memory for AI Agents — How We Solved Context Loss"
date: 2026-02-15
categories: [tech, ai]
tags: [openclaw, ai-agents, memory, llm, developer-tools]
author: Jay Lee
---

*Subtitle: A practical guide to making AI agents remember across sessions, tasks, and reboots*

If you’ve worked with AI agents for more than a week, you know this pain.

They can reason brilliantly for 30 minutes, then act like they woke up from a nap with no idea who they are, what they were doing, or why they made yesterday’s decisions.

That was exactly our situation.

Our stack (led by indie developer Jay Lee) runs one main orchestrator agent, dozens of sub-agents, and 28 cron jobs coordinating production workflows across 101 live game projects and tools. It sounds powerful — and it is — but only if continuity exists.

Without continuity, every session starts with the same awkward questions:

- “What were we working on?”
- “Why did we choose this approach?”
- “Did we already decide this?”

At scale, memory bugs become product bugs.

This post explains how we fixed that with a local-first memory system called **openclaw-mem**, and why a simple file-first architecture beat “fancy” alternatives.

---

## The Problem Nobody Talks About

Most discussions about AI agents focus on reasoning quality, tool use, or model size. Very few teams talk about memory continuity.

But in practice, continuity is where many agent systems fail.

### Symptom 1: repeated questions and rework

Our AI orchestrator could produce high-quality plans in-session, but after restart or context compaction, it would ask for the same policy decisions again. Humans had already answered, but the memory path was weak.

### Symptom 2: lost decisions

A decision made on Monday could disappear by Wednesday. Not because it was never written — because it was buried in long transcripts or mixed with low-priority notes.

### Symptom 3: conflicting actions

One sub-agent might follow an old assumption while another follows a newer direction. Without a canonical decision log, “parallel execution” becomes “parallel confusion.”

### Symptom 4: slow warm-up at session start

Even with RAG available, startup was not instant. The agent had to search, infer relevance, and reconstruct intent from scattered sources. That costs time and tokens.

In short: our agents had goldfish memory in a system that required long-term operational memory.

---

## What We Tried First (and Why It Failed)

Before landing on the current architecture, we tested three common approaches.

### 1) A giant MEMORY.md file (monolith)

We kept everything in one “hot cache” file. At first, this felt efficient. Then it grew.

When one file becomes a dump of priorities, logs, decisions, and temporary notes, curation collapses. Important facts lose visibility. Old entries stay forever. New sessions load too much, but understand too little.

### 2) RAG-only memory

RAG is excellent for retrieval, but it is not always ideal for “wake-up context.”

RAG answers: “Find relevant historical text.”
Warm startup asks: “What matters right now?”

Those are related but not identical.

With RAG-only startup, the first few interactions still felt cold. It worked technically, but the orchestrator’s initial context was not warm enough for immediate execution.

### 3) Raw session transcripts

Transcripts are complete, but completeness is not usability.

When you need one critical decision from 30,000 lines of mixed conversation and tool traces, transcripts become a needle-in-haystack problem.

We needed structured memory, not just stored text.

---

## The Architecture That Worked

The breakthrough came from a layered approach:

1. **Hot Cache** (`MEMORY.md`) → tiny, curated, always-loaded
2. **Warm Layer** (Brain files under `memory/`) → structured operational memory
3. **Cold Layer** (RAG index + archive) → searchable historical depth

Think of it like computer storage hierarchy:

- CPU cache = hot context
- RAM = active structured memory
- disk index/archive = long-term retrieval

### Layer 1: Hot Cache

A short file with only high-value context:

- current continuity snapshot
- recent decisions
- active priorities
- hard constraints
- latest developer preferences

This is designed for immediate startup recall.

### Layer 2: Warm Memory files

Dedicated files answer specific questions:

- `handoff.md`: What happened last session? What comes next?
- `working-memory.md`: What is in focus now?
- `decisions.md`: What has already been decided?
- project brain files: domain-specific persistent context

This separation prevents one-file sprawl.

### Layer 3: Cold archive + semantic search

Older files move to archive but remain searchable through LanceDB-based semantic retrieval. That keeps hot/warm lean while preserving long-tail recall.

### The three CLI workflows that changed behavior

openclaw-mem v0.2.0 added continuity primitives that made daily operations stable:

- `handoff read/write` for session-to-session continuity
- `working-memory show/set/update/clear` for focus tracking
- `decision list/log` as an append-only governance trail (log = add)

Instead of asking humans repeatedly, the agent checks the decision log first.

### Session Observer + Memory Reflector

Beyond manual updates, we also automated memory capture:

- **Session Observer** parses `.jsonl` transcripts into structured observation files under `memory/observations/`
- **Memory Reflector** runs weekly (heartbeat rule), detects patterns, and extracts high-signal learnings into hot memory

This gives us a feedback loop:

**session data → structured observations → periodic reflection → hot cache updates**

---

## Implementation Details

The implementation is intentionally boring — and that’s why it works.

### Stack choices

- **Language**: Python
- **Storage model**: file-based memory + local LanceDB vectors
- **Embeddings**: pluggable backend (`local` default, `openai`, `ollama`)
- **Default model**: `intfloat/multilingual-e5-small` (Korean + English)
- **External DB requirement**: none
- **Cloud dependency**: optional, not required

### Code size reality

The full package is larger than a tiny script (roughly ~2k lines in the core package), but the continuity-focused additions in v0.2.0 (handoff, working memory, decision log + CLI wiring) are in the “few hundred lines” range and deliberately straightforward.

That simplicity matters for maintenance and trust.

### Example: actual CLI usage (sanitized)

```bash
$ openclaw-mem version
openclaw-mem 0.2.0
```

```bash
$ openclaw-mem handoff write "Release checklist done. Next: run regression on payment flow."
Handoff written (61 chars)

$ openclaw-mem handoff read
# Session Handoff
Updated: 2026-02-15 22:20

Release checklist done. Next: run regression on payment flow.
```

```bash
$ openclaw-mem working-memory set "Current focus: stabilize deployment pipeline."
Working memory set (45 chars)

$ openclaw-mem working-memory update "Regression tests passed for 3 critical paths."
Working memory updated (45 chars)

$ openclaw-mem working-memory show
# Working Memory
Updated: 2026-02-15 22:20

Current focus: stabilize deployment pipeline.

## [2026-02-15 22:20]
Regression tests passed for 3 critical paths.
```

```bash
$ openclaw-mem decision log "Use append-only decision log for governance." --tag architecture
Logged: - [2026-02-15 22:20] [architecture] Use append-only decision log for governance.

$ openclaw-mem decision list --last 5
- [2026-02-15 22:20] [architecture] Use append-only decision log for governance.
```

### Progressive disclosure in search

We use a two-step retrieval flow to save tokens:

1) `search --index` to see short candidates
2) `search --detail <id>` only for selected chunks

```bash
$ openclaw-mem search "rollback path" --index --raw
1. [0.8884] memory/2026-02-15.md
   id: 2026-02-15.md:1:dbe3defb
   ## Learning
```

```bash
$ openclaw-mem search --detail "2026-02-15.md:1:dbe3defb" --raw
Source: memory/2026-02-15.md
ID: 2026-02-15.md:1:dbe3defb

## Learning
The fastest rollback path is feature flags plus append-only audit logs.
```

### Auto-capture from transcripts

```bash
$ openclaw-mem auto-capture --since 24h --dry-run
Scanning 1 session file(s) (last 24h)...
Found 3 total, 3 new
(dry run) Would record:
  [decision] Use append-only logs for compliance.
  [error] deployment failed due to timeout in payment API
  [insight] add retry with exponential backoff
```

### Archive keeps memory lean

```bash
$ openclaw-mem archive
Found 1 files older than 30 days:
  2025-12-01.md

Dry run. Use --execute to actually move files.
```

### Cron integration

The memory pipeline fits operational automation:

- auto-capture can run periodically over recent sessions
- observer/reflection can run in heartbeat cycles
- archive can run scheduled maintenance windows

No external service orchestration required.

### Security: memory injection defense

Persistent memory introduces a non-obvious risk: if malicious text enters memory, it can poison future sessions.

openclaw-mem addresses this with a built-in sanitizer layer:

- observation text is checked before storage
- suspicious patterns are replaced with `[FILTERED]`
- indexing scans chunk content and emits warnings for risky patterns

Pattern coverage includes instruction override phrases (e.g., “ignore previous instructions”), credential exfiltration prompts, script-like execution strings (`eval(` / `exec(`), and role-manipulation jailbreak language.

This matters because long-term memory is part of the attack surface in tool-using agents.

### Data model details that made retrieval practical

Under the hood, retrieval quality came from a few simple choices:

- Markdown is chunked by `##` / `###` sections first
- Oversized sections are split by paragraph
- Long paragraphs are force-split with overlap for context continuity
- Chunk IDs include filename, index, and content hash (`filename:index:hash`)
- Incremental indexing uses file mtime + stored index state

That combination gives reliable chunk identity, fast reindexing, and stable “detail fetch” behavior.

### Why this design handles Korean + English operations

Our environment is bilingual. If embeddings only perform in English, operational memory breaks.

Using multilingual local embeddings (`intfloat/multilingual-e5-small`), the project benchmark reports:

- 10/10 retrieval accuracy on mixed Korean/English test queries
- ~0.38s average response in benchmark runs

Those numbers won’t be identical in every environment, but they confirmed the approach was production-viable for our workload.

---

## The Session Start Protocol

This was a major unlock.

Instead of asking the agent to “figure out context somehow,” we defined a deterministic startup recall chain in BOOTSTRAP:

1. `memory/handoff.md` — last session transfer
2. `memory/working-memory.md` — current focus and verification state
3. `memory/decisions.md` — append-only decision history
4. `memory/developer-preferences.md` — human preference layer

CLI equivalent:

```bash
openclaw-mem handoff read
openclaw-mem working-memory show
openclaw-mem decision list --last 10
```

This means each new session starts like a well-rested engineer reading yesterday’s handoff, not like someone waking up with total amnesia.

In practice, this gives near-instant context hydration because:

- files are small
- order is fixed
- no network call is required for core recall
- RAG is used when needed, not for everything

That “under two seconds to wake up” feeling came from architecture, not model magic.

---

## Results

We are currently validating v0.2.0 in a two-week trial window, but early operational results are already clear.

### 1) Repeated high-level questions dropped sharply

The agent now checks handoff/working-memory/decisions before asking humans. This removes the most frustrating category of repeated prompts.

### 2) Sub-agent handoff quality improved

When a sub-agent finishes, continuity notes can be routed into handoff + decisions + observations instead of disappearing into transcript noise.

### 3) Decision conflicts became traceable

Append-only logs make timeline reconstruction trivial:

- what was decided
- when
- by whom (via tags)

Even when strategies change, we preserve why the previous choice existed.

### 4) Memory operations became auditable

Because memory is file-based and human-readable, debugging memory behavior is easier than debugging hidden prompt-state in opaque systems.

---

## Lessons Learned

### 1) File-based memory beats “smart” database-first designs (for many teams)

For agent continuity, simplicity often wins. Files are inspectable, diffable, scriptable, and easy to recover.

### 2) Hot cache must stay curated

Hot memory is not a dump. It’s a priority filter.

If everything is hot, nothing is hot.

### 3) RAG is necessary, but not sufficient

RAG is great for retrieval depth. It does not replace explicit operational state like handoff, current focus, and decisions.

### 4) Humans forget what they told the AI

Ironically, people forget instructions too. A good memory system protects both sides: the human from repetition fatigue and the agent from context drift.

### 5) Memory is prioritization, not just storage

The key design question is not “Can we store this?”
It’s “Will the right fact be available at the right moment?”

---

## Try It Yourself

If you’re building any agent framework — autonomous dev agents, support agents, research assistants, internal copilots — these principles transfer directly.

### Project

- GitHub: **https://github.com/kjaylee/openclaw-mem**

### Architecture principles you can reuse anywhere

1. Keep a **tiny always-loaded hot cache**
2. Split warm memory by function (handoff, decisions, active focus)
3. Keep cold history searchable, but off the hot path
4. Automate extraction (observer) and consolidation (reflector)
5. Prefer transparent storage that humans can audit

### The 3 questions every agent memory system must answer

1. **What was I doing?**
2. **What did we decide?**
3. **What should I focus on now?**

If your system can answer those reliably, your agent stops acting like a goldfish and starts acting like a teammate.

And that is when AI agents become truly operational.
