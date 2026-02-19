# Plan — P1 Monetization Tools Trio

## Architecture
- 각 툴은 독립 static page (`index.html`)로 제공
- 공통 패턴:
  - 상단: 제목/설명 + KO/EN 토글 + `/` 포털 링크
  - 좌측: 입력/액션(copy/reset)/summary
  - 우측: KPI + 상세 테이블 + status pill
  - JS: `I18N`, `validate`, `compute`, `render`, `copy`, `reset`

## Tool-by-tool Calculation Plan

### A. Lifetime Deal vs Subscription Revenue Calculator
- 입력: 신규고객수, LTD 가격, 월 구독가, 평균 유지개월, 변동원가율, 환불률, 즉시획득 CAC
- 계산:
  - LTD 순매출, LTD 총이익
  - Subscription 누적매출/총이익
  - 총이익 차이, LTD 역전 유지개월(Break-even months)

### B. Subscription Winback Campaign ROI Calculator
- 입력: 해지고객 풀, 접촉률, 응답률, 재활성화율, 윈백 할인율, 평균 ARPU, 유지개월, 캠페인비
- 계산:
  - 재활성화 고객수
  - 할인 반영 누적매출
  - 공헌이익, 순이익, ROI, 손익분기 재활성화율

### C. Marketplace Seller Subscription Uplift Calculator
- 입력: 활성 셀러수, 유료플랜 전환율, 월 플랜 가격, 전환 셀러당 GMV 증가, Take rate, 지원비, 운영 고정비
- 계산:
  - 유료 전환 셀러수
  - 구독 매출 + 테이크레이트 증가매출
  - 증분비용 반영 순이익, ROI, 손익분기 전환율

## Integration Plan
1. 신규 디렉토리/파일 3개 생성
2. `tools/index.html` monetization 카드 상단 구역에 3개 카드 삽입
3. `tools/manifest.json`에 slug/title/url/size 추가
4. `_data/tools-list.json`에 title/description/url 엔트리 추가

## Verification Plan
- `python3 -m http.server 8017` 실행
- `curl -I`로 세 페이지 + tools 목록 페이지 + 루트 응답 확인
- 문구/링크(`/`) 및 lang toggle 동작은 코드 점검으로 검증

## Release Plan
- `git add -A`
- `git commit -m "feat(tools): add 3 monetization calculators (1617 wave)"`
- `git push origin master`
- GitHub Pages URL 200 확인 (최대 2분 대기, 폴링)
