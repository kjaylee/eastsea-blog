# Test Cases — citrus-shade-caravan

## Unit logic
1. `tc_csc_01_initial_state_defaults`
   - 기본 phase/day/currency/inventory/contract 확인
2. `tc_csc_02_start_run_initializes_runtime_fields`
   - run phase/lane/hull/timer/shade charge 초기화 확인
3. `tc_csc_03_lane_movement_clamps_bounds`
   - 레인 경계 클램프 확인(0~2)
4. `tc_csc_04_alternating_tones_charge_and_double_next_pickup`
   - sun/shade 교차 4회로 charge 획득 + 다음 수확 2배 적용 확인
5. `tc_csc_05_three_cart_hits_force_crash_settlement`
   - 3회 충돌 시 강제 종료/정산 확인
6. `tc_csc_06_merge_promotes_highest_available_pair`
   - 병합 우선순위와 결과 확인
7. `tc_csc_07_contract_cost_and_multiplier_affect_payout`
   - 계약 선결제와 정산 배율 반영 확인
8. `tc_csc_08_shade_bonus_and_crowd_penalty_applied`
   - Shade bonus / crowd penalty 배율 반영 확인

## Static / smoke
- `node --check games/citrus-shade-caravan/logic.mjs`
- `node --check games/citrus-shade-caravan/app.mjs`
- `node --test tests/unit/citrus-shade-caravan.test.mjs`
- `bash scripts/build-manifests.sh`
- 로컬 `http.server` + `curl` title 확인
