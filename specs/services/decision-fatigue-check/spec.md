# Service Spec — decision-fatigue-check

## 1) 서비스 개요
- **서비스 ID/Slug:** `decision-fatigue-check`
- **서비스명:** 의사결정 피로도 체크 (Decision Fatigue Check)
- **카테고리:** Psychology / Quiz / Utility
- **목표:** 사용자의 최근 의사결정 에너지 상태를 10문항으로 점검하고, 즉시 실행 가능한 회복 전략을 제시한다.

## 2) 이론/설계 기반
- Decision Fatigue(의사결정 피로) 개념 기반의 자기점검형 진단
- 단순 유형 매칭이 아니라 다음 4개 지표를 가중치 계산
  - `energyDrain` (정신 에너지 소모)
  - `clarityDrop` (판단 선명도 저하)
  - `impulseRisk` (충동 반응 위험)
  - `recoveryHabit` (회복 루틴 유지)

## 3) 질문/결과 설계
- **문항 수:** 10문항 (각 4지선다)
- **결과 유형 수:** 4유형
  - `clearStrategist` (선명한 전략가)
  - `recoveryDesigner` (회복 설계자)
  - `overloadedJuggler` (과부하 저글러)
  - `drainedReactor` (방전 반응형)
- **결과 해석 길이:** 유형별 300자+ 상세 해석

## 4) 채점 로직 (가중치 기반)
- 각 선택지는 4개 축에 점수 부여 (0~4)
- 정규화 후 피로지수 계산:

```text
fatigueIndex =
  energy * 0.34 +
  clarity * 0.28 +
  impulse * 0.23 +
  (100 - recovery) * 0.15
```

- 구간별 결과:
  - `<= 32`: clearStrategist
  - `33~52`: recoveryDesigner
  - `53~72`: overloadedJuggler
  - `>= 73`: drainedReactor

## 5) 화면/UX 구성
1. **인트로 화면**
   - 제목/설명/소요시간/문항 배지
   - 시작하기 버튼
   - 면책 문구
2. **질문 화면**
   - 상단 프로그레스바 + 문항 진행도(예: 3/10)
   - 1문항 4선택지
   - 선택 즉시 다음 문항 전환
3. **분석 화면**
   - 1.5초 로딩 애니메이션 + 퍼센트 진행
4. **결과 화면**
   - 결과 카드(이모지/유형명/요약/피로지수)
   - 300자+ 상세 해석
   - Canvas 바 차트(정신 여유/판단 선명도/충동 통제/회복 루틴)
   - 공유 버튼(카카오/트위터/링크복사)
   - 다시 하기
   - 추천 테스트 링크
   - 면책 문구

## 6) 저장/공유/안정성
- **LocalStorage 저장 키:** `svc:decision-fatigue-check:last`
- 저장 데이터: `type`, `fatigueIndex`, `traits`, `savedAt`
- 공유 기능:
  - 카카오 공유 URL 오픈
  - 트위터 intent URL 오픈
  - 링크복사 (Clipboard API + fallback)
- 안정성 목표:
  - 페이지 런타임 JS 오류 0
  - `undefined` 텍스트 노출 0
  - 모바일 390x844 정상 렌더링

## 7) 배포 아티팩트
- `tools/decision-fatigue-check/index.html` (단일 파일)
- `tools/manifest.json` 신규 엔트리 추가
- `specs/services/decision-fatigue-check/spec.md`
- `specs/services/decision-fatigue-check/test-cases.md`
