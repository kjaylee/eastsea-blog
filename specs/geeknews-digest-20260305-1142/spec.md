# Spec — geeknews-digest-20260305-1142

## Output
- 신규 포스트 파일: `posts/2026-03-05-geeknews-digest.md`
- front matter 필드 및 값:
  - layout: post
  - title: "GeekNews 다이제스트 2026-03-05"
  - date: 2026-03-05
  - categories: [digest]
  - tags: [geeknews, tech, dev]
  - author: MissKim

## Content Requirements
- GeekNews 상위 10개 항목을 1~10번 순서로 구성.
- 각 항목 형식:
  - `### N. [제목] (포인트수pts)`
  - **[핵심 3문장]** 섹션으로 3문장 요약
  - `- 원문: [링크]`
  - `- **💡 시사점:** ...` (Master/개발자 관점 1~2문장)
- 서두 1~2문장 요약 + 구분선(`---`).
- 말미에 `## 오늘의 핵심 트렌드` 섹션 3줄 요약.

## Validation & Publish
- `python3 scripts/resolve-canonical.py --file <파일>`
- `bash scripts/briefing-validator.sh <파일>`
- `bash scripts/publish-post.sh 2026-03-05-geeknews-digest`
- git add/commit/push (publish-post 절차 기준).
