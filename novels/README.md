# Novels 동적 리스팅 시스템

## 개요
GitHub Pages 환경에서 서버사이드 코드 없이 소설 에피소드를 동적으로 표시하는 시스템입니다.

## 아키텍처

### 1. 빌드 스크립트
**파일**: `scripts/build-novels-manifest.sh`

`_data/` 디렉토리의 모든 `.md` 파일을 스캔하여 `manifest.json`을 생성합니다.

**실행**:
```bash
cd eastsea-blog
./scripts/build-novels-manifest.sh
```

**출력**: `novels/manifest.json`

### 2. Manifest 구조
```json
{
  "novels": [
    {
      "slug": "내성좌가전여친이다",
      "title": "내 성좌가 전여친이다",
      "author": "박도윤",
      "genre": ["헌터", "코미디"],
      "episodes": [
        {"num": "001", "date": "2026-02-05"},
        {"num": "002", "date": "2026-02-06"},
        {"num": "003", "date": "2026-02-07"}
      ],
      "totalEpisodes": 3,
      "latestDate": "2026-02-07"
    }
  ]
}
```

### 3. 페이지 구성

#### index.html
- manifest.json을 fetch하여 소설 목록 렌더링
- 각 소설별 전체 에피소드 목록 표시
- 24시간 이내 에피소드에 "NEW" 뱃지 표시
- 모바일 반응형 디자인

#### view.html
- `_data/{slug}-{episode}.md` 파일을 fetch
- Markdown 렌더링 (marked.js 사용)
- 이전화/다음화 네비게이션
- manifest.json에서 시리즈 정보 로드

#### series.html
- 특정 시리즈의 전체 에피소드 목록
- manifest.json 기반 동적 렌더링
- 장르, 작가, 통계 정보 표시

## 워크플로우

### 새 에피소드 추가
1. `novels/_data/` 디렉토리에 `.md` 파일 추가
   - 파일명 형식: `{slug}-{num}.md`
   - 예: `내성좌가전여친이다-004.md`

2. manifest.json 재생성
   ```bash
   ./scripts/build-novels-manifest.sh
   ```

3. Git 커밋 및 푸시
   ```bash
   git add novels/
   git commit -m "novel: 소설 에피소드 추가"
   git push origin master
   ```

**자동화**: `~/workspace/scripts/update-novels.sh` 실행

### 새 소설 추가
1. `scripts/build-novels-manifest.sh`의 `get_novel_metadata()` 함수에 메타데이터 추가:
   ```bash
   "새소설슬러그")
       case "$field" in
           "title") echo "새 소설 제목" ;;
           "author") echo "작가명" ;;
           "genre") echo '["장르1","장르2"]' ;;
       esac
       ;;
   ```

2. 첫 에피소드 추가: `novels/_data/새소설슬러그-001.md`

3. manifest.json 재생성 후 커밋

## 에피소드 Frontmatter 형식
```markdown
---
layout: post
title: "[웹소설] 소설 제목 - 1화"
date: 2026-02-07 10:00:00 +0900
series: "시리즈슬러그"
episode: 1
author: "작가명"
categories: [Webnovel, Series]
tags: [tag1, tag2]
---

## 1화. 에피소드 제목

본문 내용...
```

## 특징
- ✅ **서버사이드 불필요**: 순수 클라이언트 JavaScript
- ✅ **NEW 뱃지**: 24시간 이내 에피소드 자동 표시
- ✅ **모바일 반응형**: 768px 이하 레이아웃 최적화
- ✅ **네비게이션**: 이전화/다음화 자동 생성
- ✅ **확장성**: 새 소설 추가 시 메타데이터만 업데이트

## 검증
```bash
# manifest.json 확인
curl -s https://eastsea.monster/novels/manifest.json | python3 -m json.tool | head -20

# 소설 페이지 확인
open https://eastsea.monster/novels/

# 특정 에피소드 확인
open "https://eastsea.monster/novels/view.html?series=내성좌가전여친이다&episode=001"
```

## 트러블슈팅

### manifest.json이 업데이트되지 않음
- GitHub Pages 캐시 (최대 10분)
- `Cache-Control: max-age=600` 확인
- 강제 새로고침: Cmd+Shift+R (macOS)

### "NEW" 뱃지가 표시되지 않음
- 날짜 형식 확인: `YYYY-MM-DD`
- 브라우저 시간대 확인

### 에피소드가 표시되지 않음
- 파일명 형식 확인: `{slug}-{num}.md`
- Frontmatter의 `series:` 필드가 slug와 일치하는지 확인
- manifest.json 재생성 후 푸시 확인

## 유지보수

### manifest.json 재생성 주기
- 에피소드 추가 시마다 (자동화됨)
- `update-novels.sh` 실행 시 자동 재생성

### 백업
- 모든 `.md` 파일은 Git으로 버전관리
- manifest.json도 Git 추적됨

## 라이센스
eastsea.monster 내부 사용
