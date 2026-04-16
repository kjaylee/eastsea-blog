# 자동 수집 루프

## 전체 실행

```bash
npm run research
```

기본 동작:

1. `search/search-index.json` 재생성
2. `analysis/coverage-report.md` 생성
3. 부족한 핵심 도메인 탐지
4. 웹 검색 및 자료 수집
5. `research/auto/*.md` 리서치 노트 저장
6. 전체 인덱스 재생성

## 분석만 실행

```bash
npm run research -- --analyze-only
```

## 수집량 조절

```bash
npm run research -- --max-gaps 5 --results-per-query 5 --fetch-per-gap 4
```

## 주요 출력물

- `analysis/coverage-report.md`
- `analysis/gap-queue.json`
- `research/manifest.json`
- `research/raw/*.json`
- `research/auto/*.md`
