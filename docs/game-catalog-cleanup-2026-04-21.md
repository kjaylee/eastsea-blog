# Game Catalog Cleanup Report (2026-04-21)

## Summary
- Original games-list entries: **308**
- Cleaned deployable entries kept: **305**
- Duplicate entries removed: **1**
- Ghost entries removed: **2**
- Deployable directories not listed in games-list: **53**
- Non-deployable directories under `games/`: **2**

## Duplicates removed
- `gravity-shift` (2 entries)

## Ghost entries removed from games-list.json
- `canal-weave`
- `quantum-mirror`

## Deployable directories missing from games-list.json
- `accordion-vault`
- `amber-harbor-ledger`
- `asteroid-colony-builder`
- `blade-parkour`
- `cell-synthesis`
- `citrus-shade-caravan`
- `crt-gravity-blitz`
- `deep-angler`
- `fairway-mini-golf`
- `fortress-frontier`
- `harbor-thread-atelier`
- `harvest-lane-broker`
- `idle-mine-city`
- `ink-dungeon`
- `ironveil-chronicle`
- `k-deck-arena`
- `lantern-loom-bazaar`
- `littlejs-test-bounce`
- `magnet-dash`
- `magnet-leap`
- `maze-escape`
- `meadow-parcel-weavers`
- `nectar-trail-courier`
- `neon-forge`
- `neon-ghost`
- `neon-juggler`
- `neon-orbit`
- `neon-pinball`
- `neon-replaced`
- `neon-spiral`
- `orchard-signal-caravan`
- `pebble-golf`
- `pulp-route-allocator`
- `quake-grid`
- `relay-merge-raiders`
- `relay-rampart`
- `retro-lane-defense`
- `runestone-depths`
- `sandcastle-siege`
- `sigil-forge-rogue`
- `social-deduction`
- `sunlit-buoy-forge`
- `sunlit-kite-mercantile`
- `sunpetal-magnet-foundry`
- `sunset-road-blitz`
- `terra-genesis`
- `terrace-seed-graft`
- `tether-shield-ward`
- `tribe-builder`
- `tribe-conquest`
- `typing-speed`
- `universal-design-quest`
- `willow-barge-syndicate`

## Non-deployable directories under games/
- `_engine`
- `horse-racing-derby`

## Decision applied
- `games-list.json` was pruned to **deployable entries only**.
- Existing deployable but unlisted directories were **not auto-added** in this pass, to avoid inventing metadata without review.
- Source directories were **not deleted** in this pass. This was kept non-destructive.
