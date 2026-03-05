# Research — geeknews-digest-20260305-1142

## 요구사항 요약
- GeekNews(news.hada.io) 상위 10개 항목 기반 데일리 다이제스트 작성.
- front matter: layout, title, date, categories: [digest], tags: [geeknews, tech, dev], author: MissKim.
- 항목 포맷: `### N. [제목] (포인트수pts)` + 핵심 3문장 + 원문 링크 + 💡 시사점 1~2문장.
- 발행 전 검증: `python3 scripts/resolve-canonical.py --file <파일>`, `bash scripts/briefing-validator.sh <파일>`.
- 발행 절차: `bash scripts/publish-post.sh YYYY-MM-DD-slug` → git add/commit/push.

## 포맷 참고
- 기존 GeekNews 다이제스트 포스트는 서두 요약 + 구분선 + 10개 항목 + “오늘의 핵심 트렌드” 섹션 구성.

## GeekNews 상위 10개 (2026-03-05 11:42 KST 기준)
1) 클로드 코드 가이드 (전자책) 공개합니다. — 38pts
   - Topic: https://news.hada.io/topic?id=27194
   - Source: https://wikidocs.net/book/19104
   - 요약: 클로드 코드 가이드 전자책 공개, 퀵 레퍼런스·노하우 포함, Claude가 최신 내용을 자동 업데이트.
2) Show GN: 전세계 AI 소식 실시간 한국어 요약 서비스 — 6pts
   - Topic: https://news.hada.io/topic?id=27202
   - Source: https://aitrends.kr (본문 언급)
   - 요약: 300+ 소스 자동 수집, 한국어 요약, 엔티티 태그 분류, 트렌딩 GH/HF 탭, 개인화 피드.
3) OpenAI Symphony - 에이전트 기반 프로젝트 관리 자동화 도구 — 6pts
   - Topic: https://news.hada.io/topic?id=27201
   - Source: https://github.com/openai/symphony
   - 요약: Linear 보드 감시 → 작업 생성 시 에이전트 할당, proof-of-work 제출, PR 자동 병합, Elixir 레퍼런스.
4) Show GN: 이제 공부도 클로드 코드로 해보세요! — 108pts
   - Topic: https://news.hada.io/topic?id=27156
   - Source: https://github.com/RoundTable02/tutor-skills
   - 요약: Claude Code Skill로 PDF/코드베이스를 노트·퀴즈로 전환, 약점 추적 드릴, 2주 학습 루틴 공개.
5) 단순함으로는 승진하지 못한다 — 4pts
   - Topic: https://news.hada.io/topic?id=27204
   - Source: https://terriblesoftware.org/2026/03/03/nobody-gets-promoted-for-simplicity/
   - 요약: 복잡성 보상 구조, 단순한 해법이 가시화되지 않는 문제, 단순함을 문서화·평가에 반영해야 함.
6) 모든 신규 창업자가 추적해야 할 세 가지 핵심 지표 — 29pts
   - Topic: https://news.hada.io/topic?id=27185
   - Source: https://www.dearstage2.com/p/three-metrics-every-new-founder-should
   - 요약: LIR, Time-to-Value, Customer Health Rollup에 집중, 허영 지표 배제, 성장 전 학습 속도 우선.
7) 도널드 커누스, Claude Opus 4.6이 미해결 조합론 문제를 해결한 과정을 논문으로 공개 — 33pts
   - Topic: https://news.hada.io/topic?id=27176
   - Source: https://www-cs-faculty.stanford.edu/~knuth/papers/claude-cycles.pdf
   - 요약: 31회 탐색 루프, 일반화 알고리즘 도출, 에이전트형 실험 루프 가치 강조.
8) OpenAI, Codex 앱 Window용 공개 — 4pts
   - Topic: https://news.hada.io/topic?id=27198
   - Source: https://developers.openai.com/codex/app/windows/
   - 요약: 멀티 프로젝트 병렬 에이전트, PowerShell/WSL 전환, 통합 터미널 설정, 스토어 배포.
9) gogcli - 터미널에서 Google Workspace를 제어하는 고속 CLI — 23pts
   - Topic: https://news.hada.io/topic?id=27179
   - Source: https://github.com/steipete/gogcli
   - 요약: Gmail/Calendar/Drive 등 Workspace 전반 제어, JSON 우선 출력, 다중 계정 지원.
10) AI가 주니어 개발자를 쓸모없게 만들고 있다 — 46pts
   - Topic: https://news.hada.io/topic?id=27162
   - Source: https://beabetterdev.com/2026/03/01/ai-is-making-junior-devs-useless/
   - 요약: AI가 얕은 역량을 증폭, 시니어 가치는 실패 패턴 인식, AI는 튜터로 사용해야 함.
