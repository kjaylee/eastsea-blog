# Game Spec — p1k-games-batch-20260301-1541

## 목표
`eastsea-blog/games/`에 신규 HTML5 게임 3종을 제작하고 `games/manifest.json`에 prepend 반영한다.

## 사전 검증
- 기존 slug 목록(`ls games/*/index.html`) 점검 완료.
- 신규 slug 3개는 기존 107종과 중복 없음.
  - `prime-orbit-academy`
  - `holo-thread-untangler`
  - `aether-farm-command`

## 신규 게임 정의

### 1) Prime Orbit Academy (Education)
- **slug**: `prime-orbit-academy`
- **cat**: `education`
- **코어 루프**: 숫자 포드 낙하 → PRIME/COMPOSITE 타깃 규칙 판별 → 수집기 이동(키보드/터치) → 정답 캐치로 점수 누적
- **진행 구조**: 무한 라운드 + 속도 점진 상승
- **차별점**: 소수 판별 기반 학습형 반사 게임

### 2) Holo Thread Untangler (Puzzle)
- **slug**: `holo-thread-untangler`
- **cat**: `puzzle`
- **코어 루프**: 노드 선택/드래그(터치/마우스) 또는 키보드 이동 → 선 교차 수 감소 → 교차 0 달성 시 레벨 클리어
- **진행 구조**: 6레벨 고정 퍼즐
- **차별점**: 교차 감지(line intersection) 기반 네트워크 정리 퍼즐

### 3) Aether Farm Command (Strategy/Simulation)
- **slug**: `aether-farm-command`
- **cat**: `strategy`
- **코어 루프**: 농장 구역 선택(1~4/터치) → 급수·충전·방제·수확 액션 배분 → 자원 붕괴 방지 + 수확 최적화
- **진행 구조**: 무한 Day 사이클 + 리스크 누적
- **차별점**: 4구역 멀티 리소스 밸런싱 운영 시뮬

## 공통 제약
1. 산출물: 게임별 `index.html` + `manifest.webmanifest`만 생성
2. 필수 체크리스트 준수
   - 터치 + 키보드 입력
   - Web Audio API 효과음
   - localStorage 최고 기록
   - 모바일 반응형
   - PWA manifest 연결
   - 네온 다크 `#0a0a1a`
   - 에러 없음
   - 파일 크기 < 500KB
3. 정적 검증: 각 HTML 내 JS 문법 검증 수행
4. `games/manifest.json`: 신규 3개 prepend + `count=110` + `updatedAt` 갱신

## 완료 기준
- 3개 게임 구현 및 체크리스트 90% 이상(목표 100%)
- 검증 증적(문법/용량/기능 점검) 확보
- `specs/p1k-games-batch-20260301-1541/gap-analysis.md` 작성 완료
