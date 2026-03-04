# Plan — mobile-ad-frequency-cap-roi-calculator

1. 신규 디렉터리 생성 및 HTML/CSS/JS 구현
2. 입력 검증 + KPI 계산 + 요약복사 동작 구현
3. `tools/index.md`에 한 줄 추가
4. `tools/index.html`에 카드 추가
5. `bash scripts/build-manifests.sh`로 manifest 갱신
6. 검증 수행
   - `node --check tools/mobile-ad-frequency-cap-roi-calculator/script.js`
   - (테스트 파일 추가 시) `node --test ...`
   - `python3 -m http.server` + `curl` HTTP 200 확인
7. 선택 파일만 stage 후 커밋
