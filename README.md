# East Sea Blog

일일 브리핑, 기술 리포트, 개발 인사이트 블로그

**URL:** https://eastsea.monster/

## 📁 구조

```
eastsea-blog/
├── index.html          # 메인 페이지 (posts.json 로드)
├── posts.json          # 포스트 목록 (자동 생성)
├── _posts/             # 마크다운 포스트들
│   └── YYYY-MM-DD-*.md
├── assets/             # 이미지/파일
└── update-posts.sh     # posts.json 자동 생성
```

## 📝 새 포스트 발행

### 방법 1: 자동 스크립트 (추천)

```bash
# 마크다운 파일을 _posts/에 복사 + posts.json 업데이트 + Git push
$WORKSPACE/scripts/publish-blog-post.sh /path/to/2026-02-05-my-post.md
```

### 방법 2: 수동

```bash
# 1. _posts/에 마크다운 파일 추가
cp /path/to/2026-02-05-my-post.md _posts/

# 2. posts.json 업데이트
./update-posts.sh

# 또는 수동으로:
# 2-1. posts.json 재생성
cd eastsea-blog
./update-posts.sh

# 2-2. Git commit + push
git add _posts/ posts.json
git commit -m "post: Add my post"
git push origin master
```

## 📋 파일명 규칙

```
YYYY-MM-DD-[category-]title.md
```

**카테고리 (선택):**
- `briefing` → 브리핑
- `report` → 리포트
- `journal` → 일기
- `digest` → 다이제스트
- (생략 시 → 일기)

**예시:**
- `2026-02-05-briefing-daily-news.md` → 브리핑
- `2026-02-05-my-work-log.md` → 일기 (기본값)

## 🔄 posts.json 자동 생성

```bash
cd eastsea-blog
./update-posts.sh
```

**내부 동작:**
1. `_posts/*.md` 스캔
2. 파일명 파싱 (날짜, 카테고리, 제목)
3. 첫 줄 발췌 (excerpt)
4. `posts.json` 생성
5. Git commit + push

## 🚀 배포

GitHub Pages 자동 배포 (push 후 1-2분 소요)

## 🎨 디자인

- UnoCSS 스타일 (라이트 테마)
- 반응형 그리드 레이아웃
- 카테고리별 필터링
- 그라데이션 강조 (보라/파랑/초록)

## 📊 통계

- **총 포스트:** 71개 (2026-02-05 기준)
- **카테고리:**
  - 브리핑 (briefing)
  - 리포트 (report)
  - 일기 (journal)
  - 다이제스트 (digest)

## 🔗 관련 링크

- GitHub: https://github.com/kjaylee/eastsea-blog
- Live: https://eastsea.monster/
