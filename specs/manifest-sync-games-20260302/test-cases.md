# Test Cases — manifest-sync-games-20260302

## Shared
- TC-F001: title/HUD renders without blank screen
- TC-F002: start -> active gameplay transition works
- TC-F003: keyboard controls respond within one frame
- TC-F004: touch controls respond on mobile viewport
- TC-F005: Web Audio API creates SFX after user gesture
- TC-F006: game over/restart cycle works
- TC-U001: layout usable at 390x844
- TC-P001: file size under 500KB
- TC-P002: no blocking external assets required
- TC-D001: localStorage best score persists after reload
- TC-D002: PWA manifest link exists in document head

## pulse-lantern-orbit
- TC-PL-01: player orbit direction changes via left/right
- TC-PL-02: matching pulse increases combo and score
- TC-PL-03: mismatch reduces health and ends game at zero

## echo-drift-harvester
- TC-ED-01: lane switching works via keyboard and touch buttons
- TC-ED-02: shard collection increments score
- TC-ED-03: collision with static hazard ends run

## void-garden-sentinel
- TC-VG-01: shield angle rotates smoothly
- TC-VG-02: shield intercept destroys spore and plays block SFX
- TC-VG-03: unblocked spore decreases integrity and can end game
