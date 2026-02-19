# Test Cases — P1 Monetization Tools Trio

## 1. Common UI/Behavior (All 3 tools)
- [ ] 페이지 로드 시 오류 없이 KPI/요약 초기 렌더
- [ ] KO/EN 토글 클릭 시 제목/라벨/버튼/상태 문구 전환
- [ ] 포탈 링크가 정확히 `href="/"`
- [ ] `Copy Summary` 클릭 시 클립보드 복사 시도 및 fallback alert
- [ ] Reset 클릭 시 기본값 복원 + 재계산
- [ ] 음수/범위초과 입력 시 에러 메시지 노출 및 결과 초기화
- [ ] 모바일 폭(<=900px)에서 1열 레이아웃

## 2. Lifetime Deal vs Subscription
- [ ] 기준값에서 LTD/Subscription 총이익 값이 유한값으로 계산
- [ ] 유지개월 증가 시 Subscription 누적매출 증가
- [ ] 환불률 증가 시 LTD 순매출 감소
- [ ] break-even month가 계산 불가 조건(월 공헌<=0)에서 N/A

## 3. Subscription Winback Campaign ROI
- [ ] 접촉률/응답률/재활성화율 모두 0이면 재활성화 고객 0
- [ ] 할인율 증가 시 고객당 회수매출 감소
- [ ] 캠페인비 증가 시 ROI 하락
- [ ] 손익분기 재활성화율이 유한값으로 표시 또는 N/A

## 4. Marketplace Seller Subscription Uplift
- [ ] 전환율 0이면 유료 셀러수 0
- [ ] take rate 또는 GMV uplift 증가 시 수익 증가
- [ ] 운영 고정비 증가 시 순이익 감소
- [ ] 손익분기 전환율 정상 계산 또는 N/A 처리

## 5. Integration
- [ ] `tools/index.html`에 3개 신규 카드 노출
- [ ] `tools/manifest.json`에 3개 slug/url/size 반영
- [ ] `_data/tools-list.json`에 3개 신규 엔트리 반영
- [ ] 로컬 HTTP + curl로 페이지별 200 확인
