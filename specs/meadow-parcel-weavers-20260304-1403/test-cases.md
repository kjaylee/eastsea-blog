# Test Cases — meadow-parcel-weavers

## Unit logic
1. `tc_mpw_01_initial_state_defaults`
   - 초기 phase/day/currency/inventory 기본값 확인
2. `tc_mpw_02_start_run_initializes_runtime_fields`
   - run phase, timer, hull, lane, runLaneHistory 초기화
3. `tc_mpw_03_lane_movement_clamps_bounds`
   - 레인 경계 클램프 확인
4. `tc_mpw_04_collecting_parcel_updates_value_and_lane_history`
   - 수집 충돌 시 runValue/runCargo/runLaneHistory 반영
5. `tc_mpw_05_three_puddle_hits_force_crash_settlement`
   - 3회 피해 시 강제 정산
6. `tc_mpw_06_merge_promotes_highest_available_pair`
   - 최상위 가능한 페어 병합 우선
7. `tc_mpw_07_contract_cost_and_multiplier_affect_payout`
   - 계약 비용 차감 및 수익 증가 검증
8. `tc_mpw_08_ribbon_arc_bonus_and_route_rut_penalty_applied`
   - 고유 보너스/패널티 동작 검증

## Static / smoke
- `node --check games/meadow-parcel-weavers/logic.mjs`
- `node --check games/meadow-parcel-weavers/app.mjs`
- `node --test tests/unit/meadow-parcel-weavers.test.mjs`
- manifest 엔트리 확인
- local `http.server` + `curl` title 확인
