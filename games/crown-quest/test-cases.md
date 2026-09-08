# Test Cases — Crown Quest

QA 2계층: (1) 정적 — `node --check` + 순수 로직 IIFE (13 어설션 + node --check = 45 카운트) / (2) 런타임 — Node VM + DOM shim 전체 흐름 실구동 (44 어설션). **실측: 정적 45/45 + 런타임 44/44, pageErrors = []** (2026-09-08 실행).

## 계층 1 — 정적 (node --check + IIFE)

- [x] 1. `<script>` 추출본 `node --check` 구문 통과
- [x] 2. HTML 헤더 주석에 연구 원천 3건 명시 (v6 triple-crown / v8 japan / v8 korea)
- [x] 3. `SOURCES` 배열 3건, 각 path/use 존재
- [x] 4. 일본형 일정 5주차 구조 (action·race·race·pasture·race)
- [x] 5. 미국형 일정 5주차 구조 (race·action·race·action·race)
- [x] 6. 일본 거리 계단 2000→2400→3000m
- [x] 7. 미국 거리 2012→1900→2400m
- [x] 8. 요구 스탯 전환 — 제1관문 SPD / 제2관문 END 계열 / 제3관문 STA·END
- [x] 9. 무패 조건 — 3연승 && 마진 합 ≥ 5 (UNDEFEATED_MIN)
- [x] 10. 무패 업적 확률 ~3.5% (시뮬레이션 10,000회, 2.5%~4.5% 구간)
- [x] 11. 훈련 +12/피로 +4, 휴양 피로 -16, 방목 전 스탯 +9/피로 -22
- [x] 12. 경주 피로: 일본 +14 / 미국 +18 (압축 모드가 더 큼)
- [x] 13. 라이벌 역전 — 최종 관문 rival 플래그 존재 (일본: 라이스 샤워 / 미국: 알리다 이벤트)
- [x] 14. 계승 보너스 — legacyStart 후 meta.legacy 기록 → 다음 newState에서 전 스탯 +6
- [x] 15. 승률 함수 범위 클램프 [4%, 97%]
- [x] 16. localStorage 키 `crown-quest-v1` 라운드트립
- [x] 17. seeded RNG 결정성 (seed 20260908 재현)
- [x] 18. 모든 숫자 필드 NaN/undefined 없음
- [x] 19. 초기 스탯 45/45/45, 부트스트랩 존재 (DOMContentLoaded/즉시 실행 → phase='title')

## 계층 2 — 런타임 흐름 (DOM shim 하니스)

### 흐름 A — 일본형 무패 클리어 (스탯 전환 + 계승 보너스) — seed 27 결정적

1. 부트스트랩 → phase='title', 타이틀 렌더 (크라운 퀘스트 문구)
2. 타이틀에 일본형/미국형 모드 카드 + 연구 원천 3건 노출
3. `_seed(27)` → startGame('jp') → phase='play', week=0, cal=일본형
4. 1주차 action → train_spd → spd +12·fatigue +4·week=1
5. 2주차 race(皐月賞 2000m SPD 요구) → 승리, 마진 ≥ 1, fatigue += 14
6. 3주차 race(더비 2400m END 요구) → 승리 (요구 스탯 전환 확인)
7. 4주차 pasture → 전 스탯 +9·fatigue -22
8. 5주차 race(菊花賞 3000m STA 요구, rival) → 승리, 이벤트 텍스트 출력
9. finish → 3관 클리어 + 무패 업적 (마진 합 = 5 ≥ 5)
10. legacyStart → meta.legacy 기록 → newState → phase='title'
11. startGame 다시 → S.legacyBonus=true, horse.spd/end/sta = 51 (45+6) — 부자 계승 보너스

### 흐름 B — 미국형 실패 + 라이벌 역전

1. startGame('us') → week=0 (제1관문 더비 SPD)
2. 2주차 action → train_end → end +12
3. 3주차 race(프리크니스) → 승리
4. 4주차 action → rest → fatigue 감소
5. 5주차 race(벨몬트 rival) → 패배 유도 (fatigue 높임) → 역전 이벤트 텍스트 존재
6. finish → cleared=false → 실패 결산 (다시 도전 버튼)
7. resetAll → localStorage 초기화 → phase='title'

### 흐름 C — 경계·저장

1. localStorage 복원 → meta.plays/clears/undefeated 이어짐
2. 잘못된 주차에 action/race 호출 → {ok:false}
3. 비DH(confirm 없음) 환경에서 resetAll 오류 없음 → {ok:true}
4. 마진 계산 1 + floor((perf-req)/6) ≥ 1

**합격 기준**: pageErrors = [] (console.error/예외 0), 전체 어설션 PASS.