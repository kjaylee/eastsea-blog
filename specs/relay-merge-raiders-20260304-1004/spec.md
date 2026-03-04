# Spec — relay-merge-raiders

## Product intent
Ship a monetizable hybrid game slice that combines reflex gameplay with persistent economy progression.

## Core loop
1. Launch wave and control a 3-lane raider ship.
2. Dodge mines, collect salvage chips (T1~T4).
3. End wave → salvage converts to inventory and coin revenue.
4. In dock phase, merge chip pairs to higher tiers.
5. Spend gems/coins on sponsor boost or premium pass, then launch next wave.

## Mechanics (2+ required)
- **Mechanic A: Lane survival**
  - Real-time lane switching with collision outcomes.
  - Hazard hits reduce shield and can force early settlement.
- **Mechanic B: Merge progression**
  - Inventory pair merge (`Tn + Tn -> Tn+1`) increases deck multiplier.
- **Mechanic C: Monetization decisions**
  - Sponsor boost (gem sink, wave x1.5 revenue).
  - Premium route pass (coin sink, permanent multiplier bonus).

## Economy model
- `runValue += salvageTier * baseValue`
- `deckMultiplier = (1 + tierPoints(inventory)) * premiumBonus`
- `waveRevenue = runValue * deckMultiplier * sponsorMultiplier * crashMultiplier`
- `coins += waveRevenue`
- `gems += floor(runScrapCount / 6) + clearBonus`

## Persistence
- Save key: `relay_merge_raiders_save_v1`
- Saved: wave, coins, gems, totalRevenue, bestWaveRevenue, premiumPass, inventory.

## Non-functional constraints
- Mobile-first layout (`390x844` target baseline).
- Deterministic pure logic in `logic.mjs` for unit testability.
- No external API/backend dependency.
