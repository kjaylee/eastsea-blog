# Test Cases — geeknews-digest-20260305-1142

1) 파일 존재 및 front matter 확인
   - `ls posts/2026-03-05-geeknews-digest.md`
   - `python3 scripts/resolve-canonical.py --file posts/2026-03-05-geeknews-digest.md`

2) 내용 포맷 검증
   - `bash scripts/briefing-validator.sh posts/2026-03-05-geeknews-digest.md`

3) 발행 및 git 상태 확인
   - `bash scripts/publish-post.sh 2026-03-05-geeknews-digest`
   - `git status --short`
   - `git log -1 --oneline`
