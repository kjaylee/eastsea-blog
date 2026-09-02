# Odds Rush — 오즈 러시

## Candidate Decision

- 선택일: 2026-09-02 (일일 Plan-Do-See 크론 내 실행)
- 선정안: `odds-rush` — `research/horse-racing/GAME_CONNECTION.md` chain #3 (2026-09-01 등록)
- 비교안: 없음 (chain #3 단독 후보)
- 선정 이유: v6 사례 3건(압승·역전·복병)의 배당률·전개·주로 판별 포인트가 배당률 퍼즐 메카닉으로 직역되고, 8/31 전제 대조 불필요(v6 사례는 공개 사실 기반).

## Research Sources (활용 증证据)

- **v6/2012-arc-solemia-orfevre.md** — GAME_CONNECTION chain #3 원천
  - 헤비 주로에서 오르페브르의 조기 스퍼트 역전 → "주로 상태" 힌트 카드
  - 33배 외진마 솔레미아 우승 → 배당 시장과 결과의 괴리 → "배당 흐름" 힌트 카드
- **v6/2022-breeders-cup-classic-flightline.md** — GAME_CONNECTION chain #3 원천
  - 6전 6승, Beyer 126, 8¼마신 압승 → 저배당이라도 정당한 승리 → "전개 페이스" 힌트 카드
- **v6/2024-korean-derby-analysis.md** — GAME_CONNECTION chain #3 원천
  - 은파사랑 1:56.6 기록, 한국 생산마 독점 기간 → 배당 왜곡 가능 → "배당 흐름" 힌트 카드
- `index.html` 최상단 HTML 주석에 세 원천이 명시됨 (활용 증거 규약, chain #1/#2와 동일)

## One-line Definition

30초 안에 필러(인기마)를 걸러내고 고배당 복병을 찾는 스피드 퍼즐. v6 사례의 판별 포인트(전개 페이스·주로 상태·배당 흐름)를 힌트 카드로 노출.

## Core Mechanic

- **5라운드 × 30초**: 각 라운드마다 6마리의 출주표가 나타남
- **필터링**: 탭으로 복병 선택 ⭐, 길게 누르기(또는 두 번 탭)로 필러 제거 🚫
- **힌트 카드 3종**: 전개 페이스(Flightline 사례), 주로 상태(Arc 사례), 배당 흐름(한국 더비 사례)
- **점수**: 정답 시 `odds×10 + streak×5 + timeLeft×2` — 고배당·빠른 판단·연속 보너스 보상
- **최고 기록**: localStorage에 점수·최대 연속 저장

## Game Loop

타이틀 → 5라운드 진행(출주표 → 힌트 열기 → 복병 선택 → 결과) → 최종 요약 → 재시작.

## Wow Factors

1. **Research-Powered Hints** — 힌트 카드가 실제 경주 사례의 판별 포인트를 전달, 단순 퍼즐이 아닌 "지식 기반 추론"
2. **Time Pressure × Knowledge** — 30초 타이머 + 힌트 가중치 선택 (시간 vs 정보 트레이드오프)
3. **Streak Economy** — 연속 적중 보너스가 고위험·고수익 메타를 유도
4. **Race Card Aesthetics** — 경마 출주표 UI + 배당색(초록/노랑/빨강) 직관적 시각화

## Visuals

- 430px 모바일 세로, 다크 테마(bg:#1a1e2c, card:#252a3a). 기존 게임의 종이 아케이드 톤과 대비되는 야간 경마장 분위기.
- 배당 시각화: 저배당(초록), 중배당(노랑), 고배당(빨강).
