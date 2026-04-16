# 로컬 검색 사용법

## 1. 인덱스 생성 또는 갱신

```bash
npm run index
```

## 2. 브라우저에서 검색

- `search/index.html` 파일을 직접 연다.
- 또는 현재 폴더에서 `python3 -m http.server` 실행 후 `http://localhost:8000/search/` 접속

## 3. 터미널에서 검색

```bash
npm run search -- "배당률 모델링"
npm run search -- "한국 규제" --limit 5
```
