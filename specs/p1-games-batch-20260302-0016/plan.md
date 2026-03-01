# Plan — p1-games-batch-20260302-0016

1. **사전 점검**: `ls games/`로 slug 중복 여부 확인
2. **Spec/Test 고정**: 요구사항/테스트 케이스 확정
3. **구현**:
   - `tidal-choir-router` 퍼즐 구현
   - `ferro-reef-ballast` 생존 액션 구현
   - `zenith-ziplane-rescue` 구조 아케이드 구현
4. **PWA 구성**: 각 게임 `manifest.webmanifest` 생성 + HTML 연결
5. **카탈로그 갱신**: `games/manifest.json`에 3개 prepend, count/updatedAt 갱신
6. **검증**:
   - 파일 크기(<500KB)
   - touch/keyboard, Web Audio, localStorage, 모바일 레이아웃 체크
   - JSON 파싱/개수 검증
7. **Gap Analysis**: 체크리스트 점수화, 90 미만이면 최대 3회 자동 보정
8. **Git**: 변경 파일만 스테이징 후 커밋/푸시 (`feat: +3 games (slugs) — total 197`)
