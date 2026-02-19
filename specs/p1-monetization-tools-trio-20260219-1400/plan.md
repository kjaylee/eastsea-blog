# Plan — p1-monetization-tools-trio-20260219-1400

1. **Discovery & Uniqueness**
   - `tools/manifest.json`에서 기존 slug 목록 확인
   - 신규 3개 slug 확정
     - `app-store-net-revenue-calculator`
     - `podcast-sponsorship-revenue-calculator`
     - `subscription-downgrade-prevention-roi-calculator`

2. **SDD/TDD 문서화 (고정 순서)**
   1) `spec.md`
   2) `plan.md`
   3) `test-cases.md`
   4) `tasks.md`

3. **Implementation**
   - 각 도구 디렉터리 생성 후 single `index.html` 구현
   - 공통 구현: 반응형, KO/EN 토글, copy-summary, `href="/"`
   - 계산 코어 구조: `validate -> compute -> render`

4. **Catalog Update**
   - `tools/index.html` 상단 카드 3개 추가
   - `scripts/build-manifests.sh` 실행으로 `tools/manifest.json` 갱신
   - `_data/tools-list.json`에 3개 엔트리 추가

5. **Validation**
   - 정적 검증: 파일 존재/slug 반영 확인
   - 로컬 서버 검증: `python3 -m http.server` + `curl -I` 200

6. **Release**
   - `cd $WORKSPACE/eastsea-blog`
   - `git add -A`
   - `git commit -m "feat(tools): add 3 monetization calculators (1400 wave)"`
   - `git push origin master`

7. **Live Check**
   - GitHub Pages 3개 URL HTTP 200 확인
   - 최대 2분(재시도) 대기

8. **Checkpoint**
   - 단계별 결과를 `.state/p1-monetization-tools-trio/20260219-1400/step*.json`로 저장
