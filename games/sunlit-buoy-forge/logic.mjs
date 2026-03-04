export const STORAGE_KEY = 'sunlit_buoy_forge_save_v1';

export const CONFIG = {
  laneCount: 4,
  runMsBase: 32000,
  runMsStep: 1200,
  runMsCapBonus: 14000,
  spawnIntervalMs: 560,
  tokenSpeedPerMs: 0.00062,
  collisionY: 0.88,
  maxTokenY: 1.14,
  maxTier: 5,
  coreValueBase: 12,

  charters: {
    local: { mult: 1, costCoins: 0, costGems: 0, label: 'Local Pier' },
    coast: { mult: 1.32, costCoins: 70, costGems: 0, label: 'Coast Guild' },
    grand: { mult: 1.58, costCoins: 0, costGems: 3, label: 'Grand Convoy' },
  },

  wakeEchoMult: 1.26,
  dragTaxMult: 0.82,
  crashMult: 0.57,
};

const TIER_KEYS = [1, 2, 3, 4, 5];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function emptyInventory() {
  return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
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
    inventory[1] * 0.04 +
    inventory[2] * 0.09 +
    inventory[3] * 0.16 +
    inventory[4] * 0.27 +
    inventory[5] * 0.41
  );
}

export function getDeckMultiplier(state) {
  return Number((1 + deckTierPoints(state.inventory)).toFixed(2));
}

function getCharter(state) {
  return CONFIG.charters[state.charter] || CONFIG.charters.local;
}

function evaluateWake(state) {
  const wakeEcho = state.wakeEchoConsumed > 0;
  const dragTax = hasThreeLaneStreak(state.runLaneCollectHistory);

  const wakeMultiplier = wakeEcho ? CONFIG.wakeEchoMult : 1;
  const dragMultiplier = dragTax ? CONFIG.dragTaxMult : 1;

  return {
    wakeEcho,
    dragTax,
    wakeMultiplier,
    dragMultiplier,
    chainMultiplier: Number((wakeMultiplier * dragMultiplier).toFixed(4)),
  };
}

function hasAlternatingLast4(moveHistory) {
  if (!Array.isArray(moveHistory) || moveHistory.length < 4) return false;
  const seq = moveHistory.slice(-4);
  return seq[0] !== seq[1] && seq[1] !== seq[2] && seq[2] !== seq[3] && seq[0] === seq[2] && seq[1] === seq[3];
}

function hasThreeLaneStreak(laneHistory) {
  if (!Array.isArray(laneHistory) || laneHistory.length < 3) return false;
  let streak = 1;
  for (let i = 1; i < laneHistory.length; i += 1) {
    if (laneHistory[i] === laneHistory[i - 1]) {
      streak += 1;
      if (streak >= 3) return true;
    } else {
      streak = 1;
    }
  }
  return false;
}

export function createInitialState(saved = {}) {
  return {
    phase: 'dock',
    day: Number.isFinite(Number(saved.day)) ? Math.max(1, Math.floor(Number(saved.day))) : 1,

    lane: 1,
    hull: 3,
    remainingMs: 0,
    spawnBankMs: 0,
    tokens: [],

    runValue: 0,
    runCargo: emptyInventory(),
    runHarvestCount: 0,
    runHits: 0,
    runLaneCollectHistory: [],
    moveHistory: [],
    wakeEchoCharges: 0,
    wakeEchoConsumed: 0,

    coins: Number.isFinite(Number(saved.coins)) ? Math.max(0, Math.floor(Number(saved.coins))) : 0,
    gems: Number.isFinite(Number(saved.gems)) ? Math.max(0, Math.floor(Number(saved.gems))) : 0,
    totalRevenue: Number.isFinite(Number(saved.totalRevenue)) ? Math.max(0, Math.floor(Number(saved.totalRevenue))) : 0,
    bestPayout: Number.isFinite(Number(saved.bestPayout)) ? Math.max(0, Math.floor(Number(saved.bestPayout))) : 0,
    lastPayout: 0,

    inventory: normalizeInventory(saved.inventory),
    charter: 'local',

    lastBreakdown: {
      deckMultiplier: 1,
      charterMultiplier: 1,
      wakeMultiplier: 1,
      dragMultiplier: 1,
      chainMultiplier: 1,
      crashMultiplier: 1,
      wakeEcho: false,
      dragTax: false,
    },

    outcome: 'Dock ready. Merge buoy cores, pick charter, and launch.',
  };
}

export function serializeProgress(state) {
  return {
    day: state.day,
    coins: state.coins,
    gems: state.gems,
    totalRevenue: state.totalRevenue,
    bestPayout: state.bestPayout,
    inventory: state.inventory,
  };
}

export function startRun(state) {
  if (state.phase === 'run') return state;

  const next = clone(state);
  const bonus = Math.min((next.day - 1) * CONFIG.runMsStep, CONFIG.runMsCapBonus);

  next.phase = 'run';
  next.remainingMs = CONFIG.runMsBase + bonus;
  next.spawnBankMs = 0;
  next.tokens = [];

  next.lane = 1;
  next.hull = 3;
  next.runValue = 0;
  next.runCargo = emptyInventory();
  next.runHarvestCount = 0;
  next.runHits = 0;
  next.runLaneCollectHistory = [];
  next.moveHistory = [];
  next.wakeEchoCharges = 0;
  next.wakeEchoConsumed = 0;

  next.outcome = `Run active (${getCharter(next).label}). Build Wake Echo, dodge reefs.`;
  return next;
}

export function moveLane(state, direction) {
  if (state.phase !== 'run') return state;

  const next = clone(state);
  const delta = Number(direction) < 0 ? -1 : 1;
  const target = clampLane(next.lane + delta);

  if (target !== next.lane) {
    next.moveHistory.push(delta < 0 ? 'L' : 'R');
    next.lane = target;

    if (hasAlternatingLast4(next.moveHistory)) {
      next.wakeEchoCharges = Math.min(1, next.wakeEchoCharges + 1);
      next.outcome = 'Wake Echo charged. Next core pickup is amplified.';
    }
  }

  return next;
}

function randomCoreTier(rng) {
  const roll = rng();
  if (roll < 0.54) return 1;
  if (roll < 0.8) return 2;
  if (roll < 0.94) return 3;
  return 4;
}

function spawnToken(state, rng) {
  const lane = Math.floor(rng() * CONFIG.laneCount);
  const hazardRoll = rng();

  if (hazardRoll < 0.31) {
    state.tokens.push({ lane, y: -0.08, kind: 'reef', tier: 0 });
    return;
  }

  const tier = randomCoreTier(rng);
  state.tokens.push({ lane, y: -0.08, kind: 'core', tier });
}

export function withInjectedTokens(state, tokens) {
  const next = clone(state);

  for (const token of tokens || []) {
    next.tokens.push({
      lane: clampLane(Number(token.lane) || 0),
      y: Number.isFinite(Number(token.y)) ? Number(token.y) : -0.08,
      kind: token.kind === 'reef' ? 'reef' : 'core',
      tier: Math.max(0, Math.min(CONFIG.maxTier, Math.floor(Number(token.tier) || 1))),
    });
  }

  return next;
}

function applyCollision(state, token) {
  if (token.kind === 'reef') {
    state.hull = Math.max(0, state.hull - 1);
    state.runHits += 1;
    state.outcome = 'Reef collision. Hull integrity dropped.';
    return;
  }

  const tier = Math.max(1, Math.min(CONFIG.maxTier, token.tier || 1));
  const amplified = state.wakeEchoCharges > 0;
  const units = amplified ? 2 : 1;
  const gain = tier * CONFIG.coreValueBase * units;

  state.runValue += gain;
  state.runCargo[tier] += units;
  state.runHarvestCount += units;
  state.runLaneCollectHistory.push(token.lane);

  if (amplified) {
    state.wakeEchoCharges = Math.max(0, state.wakeEchoCharges - 1);
    state.wakeEchoConsumed += 1;
    state.outcome = `Wake Echo surge: T${tier} core doubled.`;
    return;
  }

  state.outcome = `Collected buoy core T${tier}.`;
}

export function settleRun(state, crashed = false) {
  if (state.phase !== 'run') return state;

  const next = clone(state);

  for (const tier of TIER_KEYS) {
    next.inventory[tier] += next.runCargo[tier];
  }

  const deckMultiplier = getDeckMultiplier(next);
  const charterMultiplier = getCharter(next).mult;
  const wake = evaluateWake(next);
  const crashMultiplier = crashed ? CONFIG.crashMult : 1;

  const payout = Math.max(
    0,
    Math.round(next.runValue * deckMultiplier * charterMultiplier * wake.chainMultiplier * crashMultiplier),
  );

  const gemBonus = Math.floor(next.runHarvestCount / 6) + (crashed ? 0 : 1);

  next.coins += payout;
  next.gems += gemBonus;
  next.totalRevenue += payout;
  next.lastPayout = payout;
  next.bestPayout = Math.max(next.bestPayout, payout);

  next.lastBreakdown = {
    deckMultiplier: Number(deckMultiplier.toFixed(2)),
    charterMultiplier,
    wakeMultiplier: wake.wakeMultiplier,
    dragMultiplier: wake.dragMultiplier,
    chainMultiplier: wake.chainMultiplier,
    crashMultiplier,
    wakeEcho: wake.wakeEcho,
    dragTax: wake.dragTax,
  };

  next.phase = 'dock';
  next.tokens = [];
  next.remainingMs = 0;
  next.spawnBankMs = 0;
  next.day += 1;
  next.charter = 'local';
  next.wakeEchoCharges = 0;
  next.moveHistory = [];

  if (crashed) {
    next.outcome = `Run crashed. Salvage payout ${payout} coins.`;
  } else if (wake.wakeEcho && wake.dragTax) {
    next.outcome = `Wake Echo landed, but Drag Tax reduced payout to ${payout}.`;
  } else if (wake.wakeEcho) {
    next.outcome = `Wake Echo bonus secured. Payout +${payout}, gems +${gemBonus}.`;
  } else if (wake.dragTax) {
    next.outcome = `Drag Tax applied. Payout +${payout}, gems +${gemBonus}.`;
  } else {
    next.outcome = `Run cleared. Payout +${payout}, gems +${gemBonus}.`;
  }

  return next;
}

export function stepRun(state, dtMs, rng = Math.random) {
  if (state.phase !== 'run') return state;

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

  if (next.hull <= 0) return settleRun(next, true);
  if (next.remainingMs <= 0) return settleRun(next, false);

  return next;
}

export function mergeBestPair(state) {
  if (state.phase !== 'dock') return state;

  const next = clone(state);

  for (let tier = CONFIG.maxTier - 1; tier >= 1; tier -= 1) {
    if (next.inventory[tier] >= 2) {
      next.inventory[tier] -= 2;
      next.inventory[tier + 1] += 1;
      next.outcome = `Merged T${tier}+T${tier} -> T${tier + 1}.`;
      return next;
    }
  }

  next.outcome = 'No merge pair available. Collect more cores first.';
  return next;
}

export function chooseCharter(state, charterKey) {
  if (state.phase !== 'dock') return state;

  const target = CONFIG.charters[charterKey];
  if (!target) {
    const next = clone(state);
    next.outcome = 'Unknown charter.';
    return next;
  }

  if (state.charter === charterKey) {
    const next = clone(state);
    next.outcome = `${target.label} already selected.`;
    return next;
  }

  const next = clone(state);

  if (target.costCoins > 0 && next.coins < target.costCoins) {
    next.outcome = `Need ${target.costCoins} coins for ${target.label}.`;
    return next;
  }

  if (target.costGems > 0 && next.gems < target.costGems) {
    next.outcome = `Need ${target.costGems} gems for ${target.label}.`;
    return next;
  }

  next.coins -= target.costCoins;
  next.gems -= target.costGems;
  next.charter = charterKey;
  next.outcome = `${target.label} charter reserved.`;
  return next;
}

export function getEconomySnapshot(state) {
  const charter = getCharter(state);
  return {
    charter: state.charter,
    charterLabel: charter.label,
    charterMultiplier: charter.mult,
    deckMultiplier: Number(getDeckMultiplier(state).toFixed(2)),
    coins: state.coins,
    gems: state.gems,
    inventory: clone(state.inventory),
  };
}

export function getWakePreview(state) {
  if (state.phase !== 'run') {
    return {
      wakeReady: false,
      dragRisk: false,
      wakeCharges: 0,
    };
  }

  return {
    wakeReady: state.wakeEchoCharges > 0,
    dragRisk: hasThreeLaneStreak(state.runLaneCollectHistory),
    wakeCharges: state.wakeEchoCharges,
  };
}
