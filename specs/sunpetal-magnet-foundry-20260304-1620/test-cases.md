# Test Cases — sunpetal-magnet-foundry

## Unit logic
1. `tc_smf_01_initial_state_defaults`
   - 기본 phase/day/currency/route/inventory 확인
2. `tc_smf_02_start_run_initializes_runtime_fields`
   - run 시작 시 타이머/체력/레인/극성 초기화
3. `tc_smf_03_lane_movement_clamps_bounds`
   - 좌우 경계 클램프 확인
4. `tc_smf_04_toggle_polarity_switches_n_and_s`
   - 극성 토글 동작 확인
5. `tc_smf_05_matching_core_collects_value_and_history`
   - 극성 일치 코어 수집 시 runValue/runCargo/history 증가
6. `tc_smf_06_mismatch_core_causes_shock_damage`
   - 극성 불일치 코어 충돌 시 체력 감소, 화물 미증가
7. `tc_smf_07_merge_promotes_highest_available_pair`
   - 최상위 페어 우선 병합 검증
8. `tc_smf_08_route_cost_and_multiplier_affect_payout`
   - 계약 비용 차감 + payout 증가 검증
9. `tc_smf_09_prism_flip_dividend_and_static_drag_applied`
   - 교차 보너스/동일극성 패널티 동작 검증

## Static / smoke
- `node --check games/sunpetal-magnet-foundry/logic.mjs`
- `node --check games/sunpetal-magnet-foundry/app.mjs`
- `node --test tests/unit/sunpetal-magnet-foundry.test.mjs`
- `bash scripts/build-manifests.sh`
- `node -e "manifest entry check"`
- `python3 -m http.server + curl` title 확인
