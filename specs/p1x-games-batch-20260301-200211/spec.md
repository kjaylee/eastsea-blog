# P1x Games Batch Spec — 20260301-200211

## 목표
신규 HTML5 게임 3종을 `games/{slug}/index.html` + `games/{slug}/manifest.webmanifest` 형태로 제작하고,
`games/manifest.json`에 3개 항목을 **배열 맨 앞 prepend** 후 `count: 152`로 갱신한다.

## 신규 게임 라인업 (장르 다양화)
1. **plasma-net-defender** (action)
   - 콘셉트: 회전 플라즈마 실드로 입자 탄막을 흡수/반사하며 코어 생존.
   - 코어 루프: 입력(좌/우 회전, 펄스) → 충돌 처리/점수 획득 → 난이도 상승.

2. **lunar-terrace-irrigator** (puzzle)
   - 콘셉트: 달 테라스 배수로 타일을 회전해 물 흐름을 목표 지점까지 연결.
   - 코어 루프: 입력(타일 선택/회전) → 유량 시뮬레이션 → 스테이지 클리어.

3. **market-echo-arbitrage** (strategy)
   - 콘셉트: 3개 시장의 가격 스프레드를 활용해 제한 시간 내 자산 극대화.
   - 코어 루프: 입력(시장 선택/매수·매도) → 변동 가격 반영 → 라운드 종료 정산.

## 공통 기술/품질 제약
- 단일 파일: 각 게임 로직/CSS/HTML를 `index.html` 1개에 내장 (외부 의존성 없음)
- 입력: 키보드 + 터치 동시 지원
- 사운드: Web Audio API로 SFX 재생
- 저장: localStorage 최고기록/최고단계/최고자산 저장
- UI: 모바일 반응형 + 네온 다크 테마 (`#0a0a1a` 기반)
- 용량: 각 `index.html` 500KB 미만
- PWA: 각 폴더 `manifest.webmanifest` 작성

## 산출물
- `games/plasma-net-defender/index.html`
- `games/plasma-net-defender/manifest.webmanifest`
- `games/lunar-terrace-irrigator/index.html`
- `games/lunar-terrace-irrigator/manifest.webmanifest`
- `games/market-echo-arbitrage/index.html`
- `games/market-echo-arbitrage/manifest.webmanifest`
- `games/manifest.json` (prepend + count + updatedAt)

## 완료 정의
- 3개 게임 실행 가능, 필수 체크리스트 충족, manifest 반영 완료
- 검증 로그 및 갭 분석 점수 90% 이상
- 커밋/푸시: `feat: +3 games (plasma-net-defender, lunar-terrace-irrigator, market-echo-arbitrage) — total 152`
