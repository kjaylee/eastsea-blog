# Test Cases — orchard-signal-caravan

## Unit logic
1. `tc_osc_01_initial_state_defaults`
   - 초기 phase/day/currency/inventory 기본값 확인
2. `tc_osc_02_start_run_initializes_runtime_fields`
   - run phase, timer, hull, lane, history 초기화
3. `tc_osc_03_lane_movement_clamps_bounds`
   - 좌/우 경계 클램프 확인
4. `tc_osc_04_collecting_crate_updates_run_value_and_history`
   - 수집 충돌 시 runValue/runCargo/history 반영
5. `tc_osc_05_three_wolf_hits_force_crash_settlement`
   - 3회 피해 시 강제 정산
6. `tc_osc_06_merge_promotes_highest_available_pair`
   - 최상위 가능한 페어 병합 우선
7. `tc_osc_07_contract_cost_and_multiplier_affect_payout`
   - 계약 비용 차감 및 수익 증가 검증
8. `tc_osc_08_signal_chain_bonus_and_monotony_penalty_applied`
   - 1→2→3 보너스 / 동일티어 3연속 패널티 검증

## Static / smoke
- `node --check games/orchard-signal-caravan/logic.mjs`
- `node --check games/orchard-signal-caravan/app.mjs`
- `node --test tests/unit/orchard-signal-caravan.test.mjs`
- manifest 엔트리 확인
- local `http.server` + `curl` title 확인
