# P1 Games Batch Spec (2026-03-01 21:31 KST)

## Scope
신규 HTML5 게임 3종을 `games/{slug}/` 경로에 제작하고, `games/manifest.json`에 최신 3개를 **맨 앞 prepend** 방식으로 등록한다.

## New Games (Genre-diverse)
1. **ion-sail-trench-run** (action)
   - 컨셉: 3레인 해구에서 이온 세일러를 조작해 에너지 코어를 수집하고 균열 파편을 회피하는 반응형 러너.
2. **cipher-garden-weaver** (puzzle)
   - 컨셉: 5x5 바이오 코드 정원에서 타일 토글로 목표 패턴(0/1)을 복원하는 논리 퍼즐.
3. **tempo-smelter-director** (rhythm/strategy)
   - 컨셉: 좌/중/우 용광로 라인에 들어오는 비트 잉곳을 타이밍 맞춰 분배해 과열을 막고 출력 점수를 올리는 리듬 운영 게임.

## Mandatory Constraints
- 단일 파일: 각 게임 로직/스타일은 `index.html` 한 파일에 모두 포함 (외부 JS/CSS 의존성 없음)
- 모바일 반응형 UI (`meta viewport`, 390x844 기준 사용 가능)
- 키보드 + 터치 입력 동시 지원
- Web Audio API 기반 효과음 재생
- localStorage에 최고 기록 저장/복원
- 네온 다크 테마 기본 배경 `#0a0a1a`
- 각 `index.html` 파일 크기 500KB 미만
- 각 게임 폴더에 `manifest.webmanifest` 제공

## Deliverables
- `games/ion-sail-trench-run/index.html`
- `games/ion-sail-trench-run/manifest.webmanifest`
- `games/cipher-garden-weaver/index.html`
- `games/cipher-garden-weaver/manifest.webmanifest`
- `games/tempo-smelter-director/index.html`
- `games/tempo-smelter-director/manifest.webmanifest`
- `games/manifest.json` 갱신
  - 신규 3개 prepend
  - `count: 167`
  - `updatedAt`: 최신 UTC ISO 문자열
