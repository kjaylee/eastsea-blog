# Test Cases — sunlit-buoy-forge

## Unit logic
1. `tc_sbf_01_initial_state_defaults`
   - 기본 phase/day/currency/inventory 확인
2. `tc_sbf_02_start_run_initializes_runtime_fields`
   - run phase, lane, hull, timer 초기화 확인
3. `tc_sbf_03_lane_movement_clamps_and_wake_echo_charge`
   - 레인 경계 클램프 + 교차 패턴 이동 시 Wake Echo 충전 확인
4. `tc_sbf_04_wake_echo_doubles_next_core_pickup`
   - 충전 상태 수집 시 수집량/가치 2배 반영 확인
5. `tc_sbf_05_three_reef_hits_force_crash_settlement`
   - 3회 암초 피격 강제 종료 확인
6. `tc_sbf_06_merge_promotes_highest_available_pair`
   - 병합 우선순위와 결과 확인
7. `tc_sbf_07_charter_cost_and_multiplier_affect_payout`
   - 차터 선결제와 정산 증가 확인
8. `tc_sbf_08_wake_bonus_and_drag_tax_applied`
   - Wake 보너스/Drag 페널티 배율 반영 확인

## Static / smoke
- `node --check games/sunlit-buoy-forge/logic.mjs`
- `node --check games/sunlit-buoy-forge/app.mjs`
- `node --test tests/unit/sunlit-buoy-forge.test.mjs`
- `bash scripts/build-manifests.sh`
- 로컬 `http.server` + `curl` title 확인
