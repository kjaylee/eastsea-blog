# Test Cases — amber-harbor-ledger

## Unit logic
1. `tc_ahl_01_initial_state_defaults`
   - phase/day/currency/route/inventory 기본값 확인
2. `tc_ahl_02_start_run_initializes_runtime_fields`
   - run 시작 시 lane/hull/mode/timer 초기화
3. `tc_ahl_03_lane_movement_clamps_bounds`
   - 좌우 이동 경계 클램프
4. `tc_ahl_04_toggle_mode_switches_breeze_anchor`
   - Breeze/Anchor 모드 토글 검증
5. `tc_ahl_05_matching_parcel_collects_value_and_lane_history`
   - 모드 일치 화물 수집 시 가치/화물/history 증가
6. `tc_ahl_06_mismatch_parcel_causes_damage`
   - 모드 불일치 화물 충돌 시 내구도 감소
7. `tc_ahl_07_merge_promotes_highest_available_pair`
   - 상위 티어 우선 병합
8. `tc_ahl_08_route_cost_and_multiplier_affect_payout`
   - 계약 비용 차감 + 정산 배율 효과
9. `tc_ahl_09_wake_weave_dividend_and_congestion_toll_applied`
   - 고유 메카닉 배당/패널티 검증

## Static / smoke
- `node --check games/amber-harbor-ledger/logic.mjs`
- `node --check games/amber-harbor-ledger/app.mjs`
- `node --test tests/unit/amber-harbor-ledger.test.mjs`
- `bash scripts/build-manifests.sh`
- `node -e "manifest entry check"`
- `python3 -m http.server + curl` title 확인
