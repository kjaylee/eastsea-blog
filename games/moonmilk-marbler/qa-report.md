# Moonmilk Marbler 큐에이 보고서

- 실행 시각: 2026-07-22 02:00 KST 사이클
- 대상: `games/moonmilk-marbler/`
- 기준 뷰포트: 390×844
- 최종 판정: 출시 게이트 통과(결정론적 스모크 + 정적 계약)

## 자동 흐름 결과

```json
{
  "ok": true,
  "viewport": "390x844",
  "pageErrors": 0,
  "consoleErrors": 0,
  "wowFactors": 5,
  "state": "result",
  "storageRuns": 1,
  "gallery": 1,
  "particles": 600,
  "engine": "linkedom-fallback"
}
```

검증 경로는 `title → play → stir → choice → choose → result → localStorage`다. 실제 공개 큐에이 API와 게임 상태 변경 함수를 호출했으며 별도 가짜 결과 객체를 사용하지 않았다.

## 정적 계약 결과

- 인라인 자바스크립트 구문: 통과
- 스키마 제이슨 파싱: 통과
- `games-list.json`: 399개 항목, `moonmilk-marbler` 1회
- 파일 크기: 30,846바이트
- LittleJS/Telegram 런타임 태그: 존재
- `#0a0a1a`, 금지 접두사, 화면용 `undefined`/`NaN`: 0건
- `git diff --check`: 통과
- 입자 상한: 600/650

## 수정 루프

첫 스모크에서 상단 통계 라벨 갱신이 자식 `<b>` 요소를 제거해 두 번째 화면 갱신에서 실패하는 실제 결함을 발견했다. 라벨을 독립 `<span>`으로 분리한 뒤 동일 경로를 재실행해 통과했다.

## 브라우저/시각 검증 상태

- 미니피시 브라우저 노드: 연결된 브라우저 가능 노드 없음.
- 로컬 플레이wright: 패키지는 있으나 Chromium 실행 파일 없음.
- 워크스페이스 정책상 맥 스튜디오 브라우저를 대신 실행하지 않았다.
- 따라서 실제 픽셀 스크린샷 기반 `visual-verdict`는 생성하지 않았고, 모바일 레이아웃은 문서 객체 모델의 390픽셀 가로 폭·스크롤 폭·상태 전환과 출시 후 원격 HTML 응답으로 보완 검증한다.

## 남은 위험

실기기에서 600개 입자의 프레임 속도와 시각적 겹침은 이번 사이클의 자동 브라우저 인프라가 복구될 때 추가 확인해야 한다. 입자 상한과 33밀리초 델타 제한으로 실패 반경은 제한했다.
