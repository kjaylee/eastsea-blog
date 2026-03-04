# Test Cases — terrace-seed-graft

## Logic unit tests
1. `tc_tsg_01_initial_state_defaults`
   - initial state가 dock/day1/자원 0/기본 route+plan으로 생성된다.
2. `tc_tsg_02_start_run_initializes_runtime_fields`
   - run 시작 시 lane/mode/hull/timer/tokens/runtime 필드가 초기화된다.
3. `tc_tsg_03_lane_movement_clamps_bounds`
   - 레인 이동이 0~2 범위로 clamp된다.
4. `tc_tsg_04_toggle_stance_switches_clip_bind`
   - stance 토글이 Clip(1)/Bind(-1)로 왕복한다.
5. `tc_tsg_05_matching_pod_collects_value_species_log`
   - 일치 pod 충돌 시 runValue/runCargo/speciesLog가 증가한다.
6. `tc_tsg_06_mismatch_or_hazard_causes_damage`
   - stance 불일치 pod 및 hazard 충돌 시 hull 감소.
7. `tc_tsg_07_merge_promotes_highest_available_pair`
   - 병합 시 가장 높은 tier pair가 우선 승급된다.
8. `tc_tsg_08_route_cost_and_multiplier_affect_payout`
   - route 구매 비용 차감 및 payout 배율이 적용된다.
9. `tc_tsg_09_graft_exact_reverse_and_wilt_penalty`
   - graft pair 정순 보너스/역순 보너스/wilt 패널티가 의도대로 계산된다.

## Manual QA checklist
- 모바일 뷰포트에서 버튼 입력과 캔버스 터치 입력이 모두 동작.
- neon dark 스타일 없음(밝은 배경 + 자연색).
- Dock↔Run 전환 시 HUD 값 일관성.
- LocalStorage 저장/재접속 복원 확인.
