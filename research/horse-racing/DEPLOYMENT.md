# Deployment

## Local Preview

프로덕션 번들을 만든 뒤 로컬에서 바로 확인:

```bash
npm run production
npm run preview-production
```

기본 주소는 `http://127.0.0.1:4173` 이다. 포트를 바꾸려면:

```bash
npm run preview-production -- --port 8080
```

## GitHub Pages

`.github/workflows/pages.yml`이 추가되어 있다. 저장소의 기본 브랜치가 `main`이면:

1. GitHub 저장소에서 Pages 소스를 `GitHub Actions`로 설정
2. `main`에 push 하거나 workflow를 수동 실행
3. workflow가 `npm ci -> npm run production -> dist 업로드 -> Pages 배포`를 수행

## Production Gate

배포 전 기준 명령:

```bash
npm run production
```

이 명령은 아래를 모두 포함한다.

1. `npm run typecheck`
2. `npm run test`
3. full-auto 데이터/정보지 재생성
4. `dist/` 번들 생성
5. 내부 링크 검증

링크 검증만 따로 돌리려면:

```bash
npm run verify-production
```
