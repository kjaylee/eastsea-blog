export const STORAGE_KEY = 'relay_merge_raiders_save_v1';

export const CONFIG = {
  laneCount: 3,
  waveMsBase: 32000,
  waveMsStep: 1500,
  waveMsCapBonus: 15000,
  spawnIntervalMs: 620,
  tokenSpeedPerMs: 0.00058,
  collisionY: 0.88,
  maxTokenY: 1.14,
  maxTier: 5,
  salvageValueBase: 10,
  sponsorBoostMult: 1.5,
  premiumPassMult: 1.22,
  premiumPassCostCoins: 180,
  sponsorBoostCostGems: 3,
};

const TIER_KEYS = [1, 2, 3, 4, 5];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function emptyInventory() {
  return {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };
}

function clampLane(lane) {
  return Math.max(0, Math.min(CONFIG.laneCount - 1, lane));
}

function normalizeInventory(input) {
  const inventory = emptyInventory();
  if (!input || typeof input !== 'object') return inventory;
  for (const key of TIER_KEYS) {
    const value = Number(input[key]);
    inventory[key] = Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
  }
  return inventory;
}

function deckTierPoints(inventory) {
  return (
    inventory[1] * 0.05 +
    inventory[2] * 0.1 +
    inventory[3] * 0.18 +
    inventory[4] * 0.3 +
    inventory[5] * 0.45
  );
}

export function getDeckMultiplier(state) {
  const points = deckTierPoints(state.inventory);
  const premiumBoost = state.premiumPass ? CONFIG.premiumPassMult : 1;
  return Number((1 + points).toFixed(2)) * premiumBoost;
}

export function createInitialState(saved = {}) {
  const inventory = normalizeInventory(saved.inventory);

  return {
    phase: 'dock',
    wave: Number.isFinite(Number(saved.wave)) ? Math.max(1, Math.floor(Number(saved.wave))) : 1,
    lane: 1,
    shield: 3,
    remainingMs: 0,
    spawnBankMs: 0,
    tokens: [],
    streak: 0,

    runValue: 0,
    runScrapCount: 0,
    runCargo: emptyInventory(),

    coins: Number.isFinite(Number(saved.coins)) ? Math.max(0, Math.floor(Number(saved.coins))) : 0,
    gems: Number.isFinite(Number(saved.gems)) ? Math.max(0, Math.floor(Number(saved.gems))) : 0,
    totalRevenue: Number.isFinite(Number(saved.totalRevenue)) ? Math.max(0, Math.floor(Number(saved.totalRevenue))) : 0,
    bestWaveRevenue: Number.isFinite(Number(saved.bestWaveRevenue)) ? Math.max(0, Math.floor(Number(saved.bestWaveRevenue))) : 0,
    lastWaveRevenue: 0,
    inventory,

    sponsorReady: true,
    sponsorActive: false,
    premiumPass: Boolean(saved.premiumPass),

    outcome: 'Docked. Merge salvage chips, then launch next wave.',
  };
}

export function serializeProgress(state) {
  return {
    wave: state.wave,
    coins: state.coins,
    gems: state.gems,
    totalRevenue: state.totalRevenue,
    bestWaveRevenue: state.bestWaveRevenue,
    premiumPass: state.premiumPass,
    inventory: state.inventory,
  };
}

export function startWave(state) {
  if (state.phase === 'wave') return state;

  const next = clone(state);
  const waveBonus = Math.min((next.wave - 1) * CONFIG.waveMsStep, CONFIG.waveMsCapBonus);

  next.phase = 'wave';
  next.remainingMs = CONFIG.waveMsBase + waveBonus;
  next.spawnBankMs = 0;
  next.tokens = [];
  next.lane = 1;
  next.shield = 3;
  next.streak = 0;
  next.runValue = 0;
  next.runScrapCount = 0;
  next.runCargo = emptyInventory();
  next.outcome = 'Wave live. Dodge mines, collect salvage, and stack value.';

  return next;
}

export function moveLane(state, direction) {
  if (state.phase !== 'wave') return state;

  const next = clone(state);
  const delta = Number(direction) < 0 ? -1 : 1;
  next.lane = clampLane(next.lane + delta);
  return next;
}

function randomSalvageTier(rng) {
  const roll = rng();
  if (roll < 0.62) return 1;
  if (roll < 0.89) return 2;
  if (roll < 0.98) return 3;
  return 4;
}

function spawnToken(state, rng) {
  const lane = Math.floor(rng() * CONFIG.laneCount);
  const hazardRoll = rng();

  if (hazardRoll < 0.28) {
    state.tokens.push({ lane, y: -0.08, kind: 'mine', tier: 0 });
    return;
  }

  const tier = randomSalvageTier(rng);
  state.tokens.push({ lane, y: -0.08, kind: 'salvage', tier });
}

export function withInjectedTokens(state, tokens) {
  const next = clone(state);
  for (const token of tokens || []) {
    next.tokens.push({
      lane: clampLane(Number(token.lane) || 0),
      y: Number.isFinite(Number(token.y)) ? Number(token.y) : -0.08,
      kind: token.kind === 'mine' ? 'mine' : 'salvage',
      tier: Math.max(0, Math.min(CONFIG.maxTier, Math.floor(Number(token.tier) || 1))),
    });
  }
  return next;
}

function applyCollision(state, token) {
  if (token.kind === 'mine') {
    state.shield = Math.max(0, state.shield - 1);
    state.streak = 0;
    state.outcome = 'Mine hit. Shield integrity dropped.';
    return;
  }

  const tier = Math.max(1, Math.min(CONFIG.maxTier, token.tier || 1));
  const value = CONFIG.salvageValueBase * tier;

  state.runValue += value;
  state.runScrapCount += 1;
  state.runCargo[tier] += 1;
  state.streak += 1;

  if (state.streak > 0 && state.streak % 6 === 0) {
    state.gems += 1;
    state.outcome = 'Hot streak bonus: +1 gem.';
  } else {
    state.outcome = `Collected T${tier} salvage.`;
  }
}

export function settleWave(state, crashed = false) {
  if (state.phase !== 'wave') return state;

  const next = clone(state);

  for (const tier of TIER_KEYS) {
    next.inventory[tier] += next.runCargo[tier];
  }

  const deckMult = getDeckMultiplier(next);
  const sponsorMult = next.sponsorActive ? CONFIG.sponsorBoostMult : 1;
  const crashMult = crashed ? 0.55 : 1;
  const waveRevenue = Math.round(next.runValue * deckMult * sponsorMult * crashMult);

  const gemBonus = Math.floor(next.runScrapCount / 6) + (crashed ? 0 : 1);

  next.coins += waveRevenue;
  next.gems += gemBonus;
  next.totalRevenue += waveRevenue;
  next.lastWaveRevenue = waveRevenue;
  next.bestWaveRevenue = Math.max(next.bestWaveRevenue, waveRevenue);

  next.phase = 'dock';
  next.tokens = [];
  next.spawnBankMs = 0;
  next.remainingMs = 0;
  next.sponsorActive = false;
  next.sponsorReady = true;
  next.wave += 1;

  if (crashed) {
    next.outcome = `Wave failed. Emergency payout ${waveRevenue} coins.`;
  } else {
    next.outcome = `Wave cleared. Revenue +${waveRevenue} coins, gems +${gemBonus}.`;
  }

  return next;
}

export function stepWave(state, dtMs, rng = Math.random) {
  if (state.phase !== 'wave') return state;

  const next = clone(state);
  const deltaMs = Math.max(0, Number(dtMs) || 0);

  next.remainingMs -= deltaMs;
  next.spawnBankMs += deltaMs;

  while (next.spawnBankMs >= CONFIG.spawnIntervalMs) {
    next.spawnBankMs -= CONFIG.spawnIntervalMs;
    spawnToken(next, rng);
  }

  const kept = [];
  for (const token of next.tokens) {
    token.y += CONFIG.tokenSpeedPerMs * deltaMs;

    if (token.y >= CONFIG.collisionY && token.lane === next.lane) {
      applyCollision(next, token);
      continue;
    }

    if (token.y <= CONFIG.maxTokenY) {
      kept.push(token);
    }
  }

  next.tokens = kept;

  if (next.shield <= 0) {
    return settleWave(next, true);
  }

  if (next.remainingMs <= 0) {
    return settleWave(next, false);
  }

  return next;
}

export function mergeBestPair(state) {
  if (state.phase !== 'dock') return state;

  const next = clone(state);

  for (let tier = CONFIG.maxTier - 1; tier >= 1; tier -= 1) {
    if (next.inventory[tier] >= 2) {
      next.inventory[tier] -= 2;
      next.inventory[tier + 1] += 1;
      next.outcome = `Merged tier ${tier} + ${tier} -> tier ${tier + 1}.`;
      return next;
    }
  }

  next.outcome = 'No merge pair available. Gather more salvage this wave.';
  return next;
}

export function activateSponsorBoost(state) {
  if (state.phase !== 'dock') return state;

  const next = clone(state);
  if (!next.sponsorReady || next.sponsorActive) {
    next.outcome = 'Sponsor boost already allocated for this wave.';
    return next;
  }

  if (next.gems < CONFIG.sponsorBoostCostGems) {
    next.outcome = `Need ${CONFIG.sponsorBoostCostGems} gems for sponsor boost.`;
    return next;
  }

  next.gems -= CONFIG.sponsorBoostCostGems;
  next.sponsorActive = true;
  next.sponsorReady = false;
  next.outcome = 'Sponsor ad slot armed: next wave revenue x1.5.';
  return next;
}

export function buyPremiumPass(state) {
  if (state.phase !== 'dock') return state;

  const next = clone(state);

  if (next.premiumPass) {
    next.outcome = 'Premium route pass already active.';
    return next;
  }

  if (next.coins < CONFIG.premiumPassCostCoins) {
    next.outcome = `Need ${CONFIG.premiumPassCostCoins} coins for premium route pass.`;
    return next;
  }

  next.coins -= CONFIG.premiumPassCostCoins;
  next.premiumPass = true;
  next.outcome = 'Premium route pass unlocked (+22% deck multiplier).';
  return next;
}

export function getEconomySnapshot(state) {
  return {
    deckMultiplier: Number(getDeckMultiplier(state).toFixed(2)),
    sponsorMultiplier: state.sponsorActive ? CONFIG.sponsorBoostMult : 1,
    premiumPass: state.premiumPass,
    coins: state.coins,
    gems: state.gems,
    inventory: clone(state.inventory),
  };
}
