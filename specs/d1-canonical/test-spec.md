# D1 단일 원장 전환 테스트 명세

## 홈페이지

- `MAX_POSTS` 제한이 없어야 한다.
- API 응답의 `total`을 추적해 전체 로드 후 종료해야 한다.
- 카테고리 필터가 API 요청 파라미터로 전달돼야 한다.

## 투영 생성기

- 여러 API 페이지를 끝까지 수집한다.
- 중복 slug와 총계 불일치를 거부한다.
- 기존 사이트맵의 비게시물 URL을 보존한다.
- D1 게시물 URL을 전부 포함하고 오래된 게시물 URL을 제거한다.
- `posts.json` 형식과 최신순 정렬을 유지한다.
- RSS/Atom/Feed XML이 파싱 가능하고 최신 50건을 포함한다.

## 검증 명령

```bash
python3 -m unittest tests/test_generate_d1_projections.py
node --test tests/integration/d1-canonical-source.test.mjs
node tests/run-all.mjs
bash -n scripts/cf-pages-auto-deploy.sh
node --check blog-api/src/index.js
```

## 라이브 검증

```bash
curl -fsS 'https://blog-api.k-jaylee.workers.dev/api/posts?page=1&limit=1'
curl -fsS 'https://eastsea.monster/posts.json'
curl -fsS 'https://eastsea.monster/sitemap.xml'
curl -fsS 'https://eastsea.monster/rss.xml'
```

