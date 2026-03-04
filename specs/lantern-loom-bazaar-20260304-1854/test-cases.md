# Test Cases — lantern-loom-bazaar

## Logic unit tests
1. `tc_llb_01_initial_state_defaults`
   - initial state가 dock/day1/자원 0/기본 route+contract로 생성된다.
2. `tc_llb_02_start_run_initializes_runtime_fields`
   - run 시작 시 lane/mode/hull/timer/tokens/runtime 필드가 초기화된다.
3. `tc_llb_03_lane_movement_clamps_bounds`
   - 레인 이동이 0~2 범위로 clamp된다.
4. `tc_llb_04_toggle_phase_switches_dawn_dusk`
   - phase 토글이 Dawn(1)/Dusk(-1)로 왕복한다.
5. `tc_llb_05_matching_crate_collects_value_symbol_log`
   - 일치 crate 충돌 시 runValue/runCargo/symbolLog가 증가한다.
6. `tc_llb_06_mismatch_or_hazard_causes_damage`
   - phase 불일치 crate 및 hazard 충돌 시 hull 감소.
7. `tc_llb_07_merge_promotes_highest_available_pair`
   - 병합 시 가장 높은 tier pair가 우선 승급된다.
8. `tc_llb_08_route_cost_and_multiplier_affect_payout`
   - route 구매 비용 차감 및 payout 배율이 적용된다.
9. `tc_llb_09_contract_exact_reverse_and_tangle_penalty`
   - 계약 정순 보너스/역순 보너스/동일문양 3연속 패널티가 의도대로 계산된다.

## Manual QA checklist
- 모바일 뷰포트에서 버튼 입력과 캔버스 터치 입력이 모두 동작.
- neon dark 스타일 없음(밝은 배경 + 자연색).
- Dock↔Run 전환 시 HUD 값 일관성.
- LocalStorage 저장/재접속 복원 확인.
