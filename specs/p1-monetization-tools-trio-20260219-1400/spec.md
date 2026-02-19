# Spec — p1-monetization-tools-trio-20260219-1400

## 1) Objective
신규 비즈니스/수익화 계산기 3종을 배포 가능한 단일 HTML 도구로 추가한다.

## 2) Scope
### In Scope
1. `tools/app-store-net-revenue-calculator/index.html`
2. `tools/podcast-sponsorship-revenue-calculator/index.html`
3. `tools/subscription-downgrade-prevention-roi-calculator/index.html`
4. 카탈로그 반영
   - `tools/index.html`
   - `tools/manifest.json`
   - `_data/tools-list.json`

### Out of Scope
- 기존 도구 리팩터링
- 서버/API 연동
- 사용자 계정/DB 저장

## 3) Functional Requirements

### FR-A: App Store Net Revenue Calculator
**Purpose:** 앱스토어 결제 구조(세금/수수료/환불/UA비용)를 반영해 설치 코호트 기준 실수익성을 계산한다.

**Inputs**
- 월 설치 수 (건)
- 설치→유료 전환율 (%)
- 월 구독 가격 (KRW, VAT 포함 가격)
- 평균 유료 유지 개월 수
- 앱스토어 수수료율 (%)
- VAT/GST율 (%)
- 환불률 (%)
- 유료 사용자 월 인프라/지원비 (KRW)
- 설치당 UA 비용 CPI (KRW)
- 원타임 도입비 (KRW)

**Outputs**
- 유료 사용자 수
- 코호트 총 청구액 (VAT 포함)
- VAT 제외 매출
- 환불/스토어 수수료 차감 후 정산매출
- 코호트 변동비(서비스+UA)
- 코호트 순이익
- ROI
- 손익분기 전환율

---

### FR-B: Podcast Sponsorship Revenue Calculator
**Purpose:** 다운로드·광고 슬롯·CPM·네트워크 수수료 구조에서 팟캐스트 스폰서십 수익성을 계산한다.

**Inputs**
- 월 에피소드 수
- 에피소드당 평균 다운로드
- 광고 슬롯 수 (에피소드당)
- 슬롯 판매율(Fill rate, %)
- 기준 CPM (KRW)
- 호스트리드 프리미엄 배수
- 네트워크/대행 수수료율 (%)
- 에피소드당 제작비 (KRW)
- 월 고정 운영비 (KRW)
- 분석 기간 (개월)
- 원타임 세일즈킷 비용 (KRW)

**Outputs**
- 월 총 스폰서십 매출
- 월 수수료 차감 후 매출
- 월 총 비용
- 월 순이익
- 분석기간 누적 순효과
- ROI
- 손익분기 CPM
- 손익분기 Fill rate

---

### FR-C: Subscription Downgrade Prevention ROI Calculator
**Purpose:** 다운그레이드 방지 캠페인의 매출 보존 효과와 ROI를 계산한다.

**Inputs**
- 월 위험군 프리미엄 구독자 수
- 기준 다운그레이드율 (%)
- 다운그레이드율 개선률 (%)
- 프리미엄 ARPU (KRW)
- 다운그레이드 후 ARPU (KRW)
- 매출총이익률 (%)
- 보존 효과 지속 개월 수
- 위험군 1인당 캠페인 비용 (KRW)
- 월 고정 운영비 (KRW)
- 원타임 구축비 (KRW)
- 분석 기간 (개월)

**Outputs**
- 월 방지 건수
- 월 보존 MRR
- 월 보존 총이익
- 월 캠페인 총비용
- 월 순효과
- 분석기간 누적 순효과
- ROI
- 회수기간
- 손익분기 개선률

## 4) UX / UI Requirements
- 도구별 single `index.html`
- 반응형(Desktop 2-column, Mobile 1-column)
- KO/EN 토글
- `Copy Summary` 버튼으로 요약 텍스트 복사
- 포탈 링크 `href="/"` 고정
- 입력 오류 시 에러 박스 표시 및 출력 리셋

## 5) Non-Functional Requirements
- 순수 클라이언트 계산(외부 API 호출 없음)
- NaN/Infinity/0분모 방어
- 실시간 재계산(`input`, `change`)

## 6) Acceptance Criteria
1. 신규 slug 3개가 기존 manifest에 없고 실제 생성됨.
2. 3개 도구 모두 모바일에서 입력/출력 레이아웃이 깨지지 않음.
3. `tools/index.html`, `tools/manifest.json`, `_data/tools-list.json`에 3개 반영됨.
4. 로컬 HTTP 서버 기준 3개 URL + 카탈로그 URL `200` 확인.
5. push 후 GitHub Pages 라이브 URL `200` 확인(최대 2분 재시도).
6. 체크포인트 파일이 `.state/p1-monetization-tools-trio/20260219-1400/`에 저장됨.
