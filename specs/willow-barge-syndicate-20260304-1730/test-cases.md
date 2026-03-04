# Test Cases — willow-barge-syndicate

## Unit logic
1. `tc_wbs_01_initial_state_defaults`
   - phase/day/currency/route/inventory 기본값 확인
2. `tc_wbs_02_start_run_initializes_runtime_fields`
   - run 시작 시 lane/hull/mode/timer 초기화
3. `tc_wbs_03_lane_movement_clamps_bounds`
   - 좌우 이동 경계 클램프
4. `tc_wbs_04_toggle_mode_switches_sun_shadow`
   - Sun/Shadow 모드 토글 검증
5. `tc_wbs_05_matching_crate_collects_value_and_pattern_log`
   - mode 일치 crate 수집 시 가치/재고/log 증가
6. `tc_wbs_06_mismatch_or_debris_causes_damage`
   - mode 불일치 또는 debris 충돌 시 hull 감소
7. `tc_wbs_07_merge_promotes_highest_available_pair`
   - 상위 tier 우선 병합
8. `tc_wbs_08_route_cost_and_multiplier_affect_payout`
   - 계약 비용 차감 + 정산 배율 효과
9. `tc_wbs_09_canal_relay_bonus_and_silt_lock_penalty_applied`
   - 고유 메카닉 보너스/패널티 배율 검증

## Static / smoke
- `node --check games/willow-barge-syndicate/logic.mjs`
- `node --check games/willow-barge-syndicate/app.mjs`
- `node --test tests/unit/willow-barge-syndicate.test.mjs`
- `bash scripts/build-manifests.sh`
- `node -e "manifest entry check"`
- `python3 -m http.server + curl` title 확인
