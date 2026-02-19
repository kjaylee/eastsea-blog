# Spec — p1-monetization-tools-trio-20260220-0200

## 1) Objective
기존 slug와 중복되지 않는 신규 **비즈니스 수익 계산기 3종**을 추가한다.

- Usage-based Pricing Migration ROI Calculator
- Self-serve Upgrade Conversion ROI Calculator
- B2B Discount Approval ROI Calculator

각 도구는 단일 `index.html`로 제공하며, **반응형 + KO/EN 토글 + copy-summary + 포털 링크(`href="/"`)**를 충족한다.

## 2) Scope
### In Scope
1. `tools/usage-based-pricing-migration-roi-calculator/index.html`
2. `tools/self-serve-upgrade-conversion-roi-calculator/index.html`
3. `tools/b2b-discount-approval-roi-calculator/index.html`
4. 카탈로그 동기화
   - `tools/index.html` 카드 추가
   - `_data/tools-list.json` 엔트리 추가
   - `tools/manifest.json` 재생성 (count 갱신)
5. 로컬 HTTP 200 확인
6. Git push 및 GitHub Pages 라이브 200 확인
7. 체크포인트 기록
   - `.state/p1-monetization-tools-trio/20260220-0200/`

### Out of Scope
- 백엔드/API 연동
- 기존 도구 리팩토링
- 외부 라이브러리 도입

## 3) Functional Requirements

### FR-1 Usage-based Pricing Migration ROI Calculator
**목적:** 좌석 기반에서 사용량 기반 과금으로 전환할 때 순증 매출/비용/ROI를 계산한다.

**Inputs**
- 월 활성 계정 수
- 현재 계정당 월 매출 (KRW)
- 현재 평균 사용량 (units/account)
- 목표 usage 단가 (KRW/unit)
- 목표 평균 사용량 (units/account)
- 매출총이익률 (%)
- 과금/인프라 단위비용 (KRW/unit)
- 월 운영비 (KRW)
- 초기 전환비 (KRW)
- 분석 기간 (개월)

**Outputs**
- 현재 월 매출
- 전환 후 월 매출
- 월 순효과
- 분석기간 순효과
- ROI
- 회수기간
- 손익분기 목표 usage 단가

### FR-2 Self-serve Upgrade Conversion ROI Calculator
**목적:** 셀프서브 업그레이드 퍼널 전환 개선의 수익성을 계산한다.

**Inputs**
- 월 업그레이드 노출 사용자 수
- 현재 업그레이드 전환율 (%)
- 목표 업그레이드 전환율 (%)
- 업그레이드 월 ARPU 증분 (KRW)
- 공헌마진율 (%)
- 업그레이드 사용자당 월 추가 지원비 (KRW)
- 월 운영비 (KRW)
- 초기 실험비 (KRW)
- 분석 기간 (개월)

**Outputs**
- 순증 업그레이드 수 (월)
- 월 증분 공헌이익
- 월 순효과
- 분석기간 순효과
- ROI
- 회수기간
- 손익분기 목표 전환율

### FR-3 B2B Discount Approval ROI Calculator
**목적:** 할인 승인 체계 고도화가 할인율 방어와 딜사이클 단축을 통해 만드는 순이익 개선을 계산한다.

**Inputs**
- 월 딜 건수
- 평균 리스트 가격 (KRW)
- 현재 평균 할인율 (%)
- 목표 평균 할인율 (%)
- 현재 수주율 (%)
- 목표 수주율 (%)
- 매출총이익률 (%)
- 딜당 추가 운영비 (KRW)
- 월 운영비 (KRW)
- 초기 도입비 (KRW)
- 분석 기간 (개월)

**Outputs**
- 현재 월 총이익
- 개선 후 월 총이익
- 월 순효과
- 분석기간 순효과
- ROI
- 회수기간
- 손익분기 목표 할인율

## 4) UX/UI Requirements
- 각 도구는 단일 HTML 파일로 구현
- 데스크톱 2열 / 모바일 1열 반응형
- KO/EN 토글 버튼
- Copy Summary 버튼 + 요약 textarea
- 포털 링크 `href="/"`
- 입력 유효성 오류 메시지 표시 및 계산 차단

## 5) Non-functional Requirements
- 외부 의존성 없이 브라우저 단독 실행
- `Intl.NumberFormat` 기반 숫자/통화 포맷
- NaN/Infinity 안전 처리

## 6) Acceptance Criteria
1. 신규 3개 slug가 기존 `_data/tools-list.json`/`tools/`와 중복되지 않는다.
2. 신규 3개 도구가 반응형 + KO/EN 토글 + copy-summary + `href="/"`를 충족한다.
3. `tools/index.html`, `_data/tools-list.json`, `tools/manifest.json`에 3개 도구가 반영된다.
4. 로컬 HTTP 서버에서 신규 3개 URL이 200이다.
5. 지정 커밋 메시지로 commit/push 성공한다.
6. GitHub Pages 라이브 URL 3개가 200이다(최대 2분, 1회 재시도).
7. 체크포인트 파일이 `.state/p1-monetization-tools-trio/20260220-0200/`에 기록된다.
