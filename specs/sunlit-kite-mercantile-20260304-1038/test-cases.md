# Test Cases — sunlit-kite-mercantile

## Unit logic
1. `tc_skm_01_initial_state_defaults`
   - 초기 phase/days/currency/inventory 기본값 확인
2. `tc_skm_02_start_run_initializes_runtime_fields`
   - run phase, timer, hull, lane 초기화
3. `tc_skm_03_lane_movement_clamps_bounds_and_counts_moves`
   - 레인 경계 클램프 + moveCount 증가
4. `tc_skm_04_collecting_basket_updates_run_value_and_cargo`
   - 수집 충돌 시 runValue/runCargo 반영
5. `tc_skm_05_three_crow_hits_force_crash_settlement`
   - 3회 피해 시 강제 정산
6. `tc_skm_06_merge_promotes_highest_available_pair`
   - 최상위 가능한 페어 병합 우선
7. `tc_skm_07_contract_cost_and_multiplier_affect_payout`
   - 계약 비용 차감 및 수익 증가 검증
8. `tc_skm_08_tailwind_tax_reduces_payout_after_excessive_swaps`
   - moveCount>=8 시 감세 적용

## Static / smoke
- `node --check games/sunlit-kite-mercantile/logic.mjs`
- `node --check games/sunlit-kite-mercantile/app.mjs`
- `node --test tests/unit/sunlit-kite-mercantile.test.mjs`
- manifest 엔트리 확인
- local `http.server` + `curl` title 확인
