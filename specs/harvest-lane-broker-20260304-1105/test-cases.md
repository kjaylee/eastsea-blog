# Test Cases — harvest-lane-broker

## Unit logic
1. `tc_hlb_01_initial_state_defaults`
   - 초기 phase/day/currency/inventory 기본값 확인
2. `tc_hlb_02_start_run_initializes_runtime_fields`
   - run phase, timer, hull, lane 초기화
3. `tc_hlb_03_lane_movement_clamps_bounds`
   - 레인 경계 클램프 확인
4. `tc_hlb_04_collecting_crate_updates_run_value_and_cargo`
   - 수집 충돌 시 runValue/runCargo 반영
5. `tc_hlb_05_three_crow_hits_force_crash_settlement`
   - 3회 피해 시 강제 정산
6. `tc_hlb_06_merge_promotes_highest_available_pair`
   - 최상위 가능한 페어 병합 우선
7. `tc_hlb_07_contract_cost_and_multiplier_affect_payout`
   - 계약 비용 차감 및 수익 증가 검증
8. `tc_hlb_08_variety_dividend_and_oversupply_penalty_applied`
   - Diversity 보너스/쏠림 패널티 동작 검증

## Static / smoke
- `node --check games/harvest-lane-broker/logic.mjs`
- `node --check games/harvest-lane-broker/app.mjs`
- `node --test tests/unit/harvest-lane-broker.test.mjs`
- manifest 엔트리 확인
- local `http.server` + `curl` title 확인
