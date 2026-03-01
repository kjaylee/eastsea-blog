# P1z Games Batch Spec (2026-03-01 21:04 KST)

## Scope
신규 HTML5 게임 3종을 `games/{slug}/`에 추가하고, `games/manifest.json`에 prepend 등록한다.

## New Games
1. **vector-vine-swing** (action)
   - 컨셉: 벡터 덩굴을 좌/우 스윙으로 조종해 씨앗 링을 수집하고 장애물을 회피하는 아케이드.
2. **prism-port-authority** (strategy)
   - 컨셉: 입항 화물의 색-온도-우선순위 규칙을 보고 올바른 도크로 분류하는 실시간 운영 전략.
3. **rune-resonance-smithy** (puzzle)
   - 컨셉: 4x4 룬 그리드에서 행/열 회전으로 목표 공명 패턴을 맞추는 논리 퍼즐.

## Mandatory Constraints
- 단일 파일 게임: `index.html`에 CSS/JS 모두 포함, 외부 의존성 없음
- `manifest.webmanifest` 별도 제공
- 모바일 반응형 UI
- 네온 다크 테마 (기본 배경 `#0a0a1a`)
- 터치 + 키보드 입력 동시 지원
- Web Audio API SFX 사용
- localStorage 저장(최고점수/최고라운드)
- 각 `index.html` 파일 크기 < 500KB

## Deliverables
- `games/vector-vine-swing/index.html`, `games/vector-vine-swing/manifest.webmanifest`
- `games/prism-port-authority/index.html`, `games/prism-port-authority/manifest.webmanifest`
- `games/rune-resonance-smithy/index.html`, `games/rune-resonance-smithy/manifest.webmanifest`
- `games/manifest.json` 업데이트
  - 신규 3개 엔트리 배열 맨 앞 prepend
  - `count: 164`
  - `updatedAt` 최신 UTC
