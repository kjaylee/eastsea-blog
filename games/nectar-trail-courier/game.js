'use strict';
// Nectar Trail Courier - game.js
// Pure Canvas2D implementation (no external dependencies)

// ============================================================
// CONSTANTS
// ============================================================
var BOARD_COLS = 4;
var BOARD_ROWS = 4;
var WILT_TURNS = 2;
var MAX_SPOILS = 3;
var MAX_TURNS = 18;
var ORDER_FRESHNESS = 3;
var ORDERS_COUNT = 2;
var ROUTE_LENGTH = 3;
var SUNFLOWER_UNLOCK_JARS = 3;

var CANVAS_W = 390;
var CANVAS_H = 844;

// Layout zones (y positions)
var HUD_Y = 0;
var HUD_H = 62;
var ORDER_Y = HUD_H + 4;
var ORDER_H = 128;
var BOARD_TOP_MARGIN = 10;
var TILE_SIZE = 82;
var TILE_GAP = 5;
var BOARD_W = BOARD_COLS * TILE_SIZE + (BOARD_COLS - 1) * TILE_GAP;
var BOARD_X = Math.floor((CANVAS_W - BOARD_W) / 2);
var BOARD_Y = ORDER_Y + ORDER_H + BOARD_TOP_MARGIN;
var BOARD_H = BOARD_ROWS * TILE_SIZE + (BOARD_ROWS - 1) * TILE_GAP;
var SEED_Y = BOARD_Y + BOARD_H + 12;
var SEED_H = 108;
var PASS_BTN_Y = SEED_Y + SEED_H + 8;

// Flower types
var FLOWER_TYPES = ['clover', 'poppy', 'lavender'];
var ALL_FLOWER_TYPES = ['clover', 'poppy', 'lavender', 'sunflower'];

// Color palette — cream/meadow/daylight
var C = {
  bg:           '#F7F2E7',
  boardBg:      '#D8E8C0',
  boardBorder:  '#A8C090',
  tileEmpty:    '#EDE5CE',
  tileEmptyBd:  '#C8B898',
  tileBloom:    '#F0EDE0',
  tileBloomBd:  '#A8C080',
  tileBloomSel: '#D0E8B8',
  tileBloomSelBd:'#6AAA50',
  tileWilt:     '#C0AA88',
  tileWiltBd:   '#988070',
  clover:       '#4E8C42',
  poppy:        '#CC4030',
  lavender:     '#7855A8',
  sunflower:    '#D8A818',
  hudBg:        '#EDE4CC',
  hudBd:        '#C0A880',
  orderCard:    '#FFF8ED',
  orderCardBd:  '#C8B890',
  fresh3:       '#4E8C42',
  fresh2:       '#C8A020',
  fresh1:       '#CC4030',
  textDark:     '#2A1A0A',
  textMed:      '#5A3E26',
  textLight:    '#8A6E50',
  routeLine:    'rgba(220,170,30,0.75)',
  routeDot:     'rgba(200,150,20,0.90)',
  seedBtn:      '#EDE5CE',
  seedBtnBd:    '#A89070',
  seedBtnSel:   '#C8E0B0',
  seedBtnSelBd: '#5A9A40',
  seedBtnDis:   '#D8D0C0',
  seedBtnDisBd: '#B0A890',
  btnGreen:     '#5A9A50',
  btnGreenBd:   '#3A7A30',
  btnGreenTxt:  '#FFFFFF',
  btnGrey:      '#A8A090',
  btnGreyBd:    '#888070',
  btnGreyTxt:   '#FFFFFF',
  gold:         '#B88018',
  goldLight:    '#E8B830',
  overlay:      'rgba(30,15,5,0.82)',
};

var FLOWER_COLORS = {
  clover:    C.clover,
  poppy:     C.poppy,
  lavender:  C.lavender,
  sunflower: C.sunflower,
};

// ============================================================
// DATA STRUCTURES
// ============================================================
function makeTile() {
  return { state: 'empty', flowerType: null, recoverTurns: 0 };
}

function makeOrder(recipe, freshness, reward) {
  return { recipe: recipe, freshness: freshness, reward: reward };
}

// ============================================================
// GAME STATE
// ============================================================
var G = {
  scene: 'title',   // 'title' | 'play' | 'results'
  phase: 'plant',   // 'plant' | 'route'
  board: [],
  orders: [],
  score: 0,
  turn: 1,
  spoils: 0,
  jarsCompleted: 0,
  sunflowerUnlocked: false,
  seedOptions: [],
  selectedSeed: null,
  dragPath: [],
  isDragging: false,
  // UI
  msg: null,
  msgTimer: 0,
  jarAnim: null,
  jarAnimTimer: 0,
  spoilFlash: 0,
  // Persistence
  bestScore: 0,
  bestJars: 0,
  lastRunSummary: null,
  // Button rects (computed during draw, used for hit-testing)
  _startBtn: null,
  _restartBtn: null,
  _seedBtns: [],
  _passBtn: null,
};

// ============================================================
// STORAGE
// ============================================================
function loadStorage() {
  try {
    G.bestScore = parseInt(localStorage.getItem('ntc_bestScore') || '0', 10) || 0;
    G.bestJars  = parseInt(localStorage.getItem('ntc_bestJars')  || '0', 10) || 0;
    G.lastRunSummary = JSON.parse(localStorage.getItem('ntc_lastRunSummary') || 'null');
  } catch (e) { /* ignore */ }
}

function saveStorage() {
  try {
    localStorage.setItem('ntc_bestScore', String(G.bestScore));
    localStorage.setItem('ntc_bestJars',  String(G.bestJars));
    localStorage.setItem('ntc_lastRunSummary', JSON.stringify(G.lastRunSummary));
  } catch (e) { /* ignore */ }
}

// ============================================================
// UTILITY
// ============================================================
function rnd(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function availableTypes() {
  return G.sunflowerUnlocked ? ALL_FLOWER_TYPES.slice() : FLOWER_TYPES.slice();
}

function countEmptyTiles() {
  var n = 0;
  for (var r = 0; r < BOARD_ROWS; r++)
    for (var c = 0; c < BOARD_COLS; c++)
      if (G.board[r][c].state === 'empty') n++;
  return n;
}

function countBloomTiles() {
  var n = 0;
  for (var r = 0; r < BOARD_ROWS; r++)
    for (var c = 0; c < BOARD_COLS; c++)
      if (G.board[r][c].state === 'bloom') n++;
  return n;
}

function isAdj(r1, c1, r2, c2) {
  return Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
}

function tilePos(row, col) {
  return {
    x: BOARD_X + col * (TILE_SIZE + TILE_GAP),
    y: BOARD_Y + row * (TILE_SIZE + TILE_GAP),
  };
}

function hitTile(px, py) {
  for (var r = 0; r < BOARD_ROWS; r++) {
    for (var c = 0; c < BOARD_COLS; c++) {
      var p = tilePos(r, c);
      if (px >= p.x && px < p.x + TILE_SIZE && py >= p.y && py < p.y + TILE_SIZE)
        return { row: r, col: c };
    }
  }
  return null;
}

function hitRect(px, py, rect) {
  return rect && px >= rect.x && px < rect.x + rect.w && py >= rect.y && py < rect.y + rect.h;
}

function pathHas(r, c) {
  for (var i = 0; i < G.dragPath.length; i++)
    if (G.dragPath[i].row === r && G.dragPath[i].col === c) return true;
  return false;
}

function pathIdx(r, c) {
  for (var i = 0; i < G.dragPath.length; i++)
    if (G.dragPath[i].row === r && G.dragPath[i].col === c) return i;
  return -1;
}

function freshColor(f) {
  if (f >= 3) return C.fresh3;
  if (f === 2) return C.fresh2;
  return C.fresh1;
}

// ============================================================
// GAME LOGIC
// ============================================================
function initBoard() {
  G.board = [];
  for (var r = 0; r < BOARD_ROWS; r++) {
    G.board[r] = [];
    for (var c = 0; c < BOARD_COLS; c++)
      G.board[r][c] = makeTile();
  }
}

function genSeedOptions() {
  var types = availableTypes();
  var a = rnd(types);
  var b = rnd(types);
  // Prefer distinct options
  for (var i = 0; i < 8 && b === a && types.length > 1; i++) b = rnd(types);
  G.seedOptions = [a, b];
  G.selectedSeed = null;
}

function genOrder() {
  var types = availableTypes();
  var recipe = [rnd(types), rnd(types), rnd(types)];
  var reward = 10 + recipe.filter(function(t){ return t === 'sunflower'; }).length * 5;
  return makeOrder(recipe, ORDER_FRESHNESS, reward);
}

function fillOrders() {
  while (G.orders.length < ORDERS_COUNT) G.orders.push(genOrder());
}

function startGame() {
  initBoard();
  G.score = 0;
  G.turn  = 1;
  G.spoils = 0;
  G.jarsCompleted = 0;
  G.sunflowerUnlocked = false;
  G.orders = [];
  G.dragPath = [];
  G.isDragging = false;
  G.msg = null;
  G.msgTimer = 0;
  G.jarAnim = null;
  G.jarAnimTimer = 0;
  G.spoilFlash = 0;
  G.phase = 'plant';
  fillOrders();
  genSeedOptions();
  G.scene = 'play';
}

function plantFlower(row, col) {
  if (!G.selectedSeed) return false;
  var tile = G.board[row][col];
  if (tile.state !== 'empty') return false;
  tile.state = 'bloom';
  tile.flowerType = G.selectedSeed;
  tile.recoverTurns = 0;
  G.selectedSeed = null;
  G.phase = 'route';
  return true;
}

function tryCompleteRoute() {
  if (G.dragPath.length !== ROUTE_LENGTH) return false;
  var types = G.dragPath.map(function(p){ return G.board[p.row][p.col].flowerType; });
  for (var i = 0; i < G.orders.length; i++) {
    var ord = G.orders[i];
    if (types[0] === ord.recipe[0] && types[1] === ord.recipe[1] && types[2] === ord.recipe[2]) {
      // Match!
      G.score += ord.reward;
      G.jarsCompleted++;
      G.jarAnim = { recipe: types.slice(), reward: ord.reward };
      G.jarAnimTimer = 100;
      // Clear tiles
      G.dragPath.forEach(function(p){ G.board[p.row][p.col] = makeTile(); });
      G.orders.splice(i, 1);
      if (!G.sunflowerUnlocked && G.jarsCompleted >= SUNFLOWER_UNLOCK_JARS) {
        G.sunflowerUnlocked = true;
        showMsg('🌻 Sunflower unlocked!');
      }
      G.dragPath = [];
      G.isDragging = false;
      endTurn();
      return true;
    }
  }
  // No match — wilt the 3 tiles
  G.dragPath.forEach(function(p){
    var t = G.board[p.row][p.col];
    t.state = 'wilt';
    t.recoverTurns = WILT_TURNS;
  });
  showMsg('No match — flowers wilted!');
  G.dragPath = [];
  G.isDragging = false;
  endTurn();
  return false;
}

function passRoute() {
  G.dragPath = [];
  G.isDragging = false;
  endTurn();
}

function endTurn() {
  G.turn++;
  // Decay freshness
  var spoiledThisTurn = 0;
  G.orders.forEach(function(o){ o.freshness--; if (o.freshness <= 0) spoiledThisTurn++; });
  if (spoiledThisTurn > 0) {
    G.spoils += spoiledThisTurn;
    G.spoilFlash = 60;
  }
  G.orders = G.orders.filter(function(o){ return o.freshness > 0; });
  // Recover wilted tiles
  for (var r = 0; r < BOARD_ROWS; r++) {
    for (var c = 0; c < BOARD_COLS; c++) {
      var tile = G.board[r][c];
      if (tile.state === 'wilt') {
        tile.recoverTurns--;
        if (tile.recoverTurns <= 0) { tile.state = 'empty'; tile.flowerType = null; }
      }
    }
  }
  // Check end conditions
  if (G.spoils >= MAX_SPOILS || G.turn > MAX_TURNS) {
    endGame();
    return;
  }
  fillOrders();
  genSeedOptions();
  G.phase = 'plant';
}

function endGame() {
  var newBest = false;
  if (G.score > G.bestScore) { G.bestScore = G.score; newBest = true; }
  if (G.jarsCompleted > G.bestJars) G.bestJars = G.jarsCompleted;
  G.lastRunSummary = {
    score: G.score,
    jars: G.jarsCompleted,
    turns: G.turn - 1,
    spoils: G.spoils,
    newBest: newBest,
  };
  saveStorage();
  G.scene = 'results';
}

function showMsg(m) { G.msg = m; G.msgTimer = 100; }

// ============================================================
// CANVAS & DRAW HELPERS
// ============================================================
var canvas, ctx;

function rr(x, y, w, h, r, fill, stroke, sw) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  if (fill)   { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = sw || 1.5; ctx.stroke(); }
}

function drawFlower(cx, cy, radius, type, alpha) {
  if (!type) return;
  var col = FLOWER_COLORS[type] || '#999';
  ctx.save();
  if (alpha !== undefined && alpha < 1) ctx.globalAlpha = alpha;

  var petals, petalR, centerR, centerCol;
  switch (type) {
    case 'clover':
      petals = 4; petalR = radius * 0.42; centerR = radius * 0.28;
      centerCol = '#FFFFFF';
      break;
    case 'poppy':
      petals = 6; petalR = radius * 0.38; centerR = radius * 0.25;
      centerCol = '#1A0A00';
      break;
    case 'lavender':
      petals = 5; petalR = radius * 0.36; centerR = radius * 0.22;
      centerCol = '#E0D0F8';
      break;
    case 'sunflower':
      petals = 10; petalR = radius * 0.30; centerR = radius * 0.38;
      centerCol = '#5A3010';
      break;
    default:
      petals = 5; petalR = radius * 0.35; centerR = radius * 0.25;
      centerCol = '#FFFFFF';
  }

  var orbitR = radius * 0.55;
  ctx.fillStyle = col;
  for (var i = 0; i < petals; i++) {
    var angle = (i / petals) * Math.PI * 2 - Math.PI / 2;
    var px = cx + Math.cos(angle) * orbitR;
    var py = cy + Math.sin(angle) * orbitR;
    ctx.beginPath();
    ctx.arc(px, py, petalR, 0, Math.PI * 2);
    ctx.fill();
  }
  // Center
  ctx.fillStyle = centerCol;
  ctx.beginPath();
  ctx.arc(cx, cy, centerR, 0, Math.PI * 2);
  ctx.fill();
  // Stem
  ctx.strokeStyle = '#4A7830';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy + radius * 0.5);
  ctx.lineTo(cx, cy + radius * 0.9);
  ctx.stroke();

  ctx.restore();
}

function drawWiltedFlower(cx, cy, radius, type) {
  if (!type) return;
  var col = FLOWER_COLORS[type] || '#999';
  ctx.save();
  ctx.globalAlpha = 0.40;
  ctx.translate(cx, cy + radius * 0.15);
  ctx.rotate(0.35);
  var petals = 4, petalR = radius * 0.28, orbitR = radius * 0.42;
  ctx.fillStyle = col;
  for (var i = 0; i < petals; i++) {
    var angle = (i / petals) * Math.PI * 2;
    var px = Math.cos(angle) * orbitR;
    var py = Math.sin(angle) * orbitR;
    ctx.beginPath();
    ctx.arc(px, py, petalR, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#8B7050';
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ============================================================
// DRAW SCENES
// ============================================================
function drawHUD() {
  rr(8, 6, CANVAS_W - 16, HUD_H - 10, 8, C.hudBg, C.hudBd, 1.5);

  // Title
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.fillStyle = C.textDark;
  ctx.textAlign = 'left';
  ctx.fillText('🐝 Nectar Trail Courier', 18, 26);

  // Score
  ctx.font = 'bold 16px system-ui, sans-serif';
  ctx.fillStyle = C.gold;
  ctx.textAlign = 'center';
  ctx.fillText('★ ' + G.score, CANVAS_W / 2, 27);

  // Turn / Spoils
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillStyle = G.spoilFlash > 0 ? C.fresh1 : C.textMed;
  ctx.textAlign = 'right';
  ctx.fillText('Turn ' + G.turn + '/' + MAX_TURNS + '   ⚠ ' + G.spoils + '/' + MAX_SPOILS, CANVAS_W - 16, 27);

  // Phase hint
  ctx.font = '11px system-ui, sans-serif';
  ctx.fillStyle = C.textLight;
  ctx.textAlign = 'center';
  var hint = G.phase === 'plant'
    ? '🌱 선택 후 빈 칸 탭 — 씨앗 심기'
    : '✋ 꽃 3개 드래그 — 벌 경로 그리기';
  ctx.fillText(hint, CANVAS_W / 2, 46);
}

function drawOrderCards() {
  var cardW = Math.floor((CANVAS_W - 28) / 2);
  var cardH = ORDER_H - 10;
  var cardY = ORDER_Y + 4;

  for (var i = 0; i < ORDERS_COUNT; i++) {
    var cardX = 10 + i * (cardW + 8);
    var ord = G.orders[i];

    if (!ord) {
      // Empty slot
      rr(cardX, cardY, cardW, cardH, 8, 'rgba(220,210,190,0.5)', C.orderCardBd, 1);
      ctx.font = '12px system-ui, sans-serif';
      ctx.fillStyle = C.textLight;
      ctx.textAlign = 'center';
      ctx.fillText('Order ' + (i + 1), cardX + cardW / 2, cardY + cardH / 2 + 4);
      continue;
    }

    var fc = freshColor(ord.freshness);
    rr(cardX, cardY, cardW, cardH, 8, C.orderCard, fc, 2);

    // Label
    ctx.font = 'bold 10px system-ui, sans-serif';
    ctx.fillStyle = C.textMed;
    ctx.textAlign = 'left';
    ctx.fillText('Order ' + (i + 1), cardX + 8, cardY + 13);

    // Freshness pips
    for (var f = 0; f < ORDER_FRESHNESS; f++) {
      ctx.beginPath();
      ctx.arc(cardX + cardW - 10 - f * 12, cardY + 10, 4, 0, Math.PI * 2);
      ctx.fillStyle = f < ord.freshness ? fc : 'rgba(180,160,140,0.4)';
      ctx.fill();
    }

    // Recipe flowers
    var flSize = 22;
    var flGap  = 8;
    var rowW   = 3 * flSize * 2 + 2 * flGap;
    var startX = cardX + (cardW - rowW) / 2;
    var flY    = cardY + 22;
    for (var j = 0; j < 3; j++) {
      var fType = ord.recipe[j];
      var fx = startX + j * (flSize * 2 + flGap) + flSize;
      drawFlower(fx, flY + flSize, flSize, fType);
      ctx.font = '9px system-ui, sans-serif';
      ctx.fillStyle = FLOWER_COLORS[fType];
      ctx.textAlign = 'center';
      ctx.fillText(fType.charAt(0).toUpperCase() + fType.slice(1, 4), fx, flY + flSize * 2 + 10);
    }

    // Reward
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.fillStyle = C.gold;
    ctx.textAlign = 'center';
    ctx.fillText('+' + ord.reward + ' pts', cardX + cardW / 2, cardY + cardH - 6);
  }
}

function drawBoard() {
  // Board background
  var pad = 10;
  rr(BOARD_X - pad, BOARD_Y - pad, BOARD_W + pad * 2, BOARD_H + pad * 2, 10, C.boardBg, C.boardBorder, 2);

  for (var r = 0; r < BOARD_ROWS; r++) {
    for (var c = 0; c < BOARD_COLS; c++) {
      var tile = G.board[r][c];
      var p = tilePos(r, c);
      var inPath = pathHas(r, c);
      var pathI  = pathIdx(r, c);

      var fill, bd, bdW;
      if (tile.state === 'bloom') {
        fill = inPath ? C.tileBloomSel : C.tileBloom;
        bd   = inPath ? C.tileBloomSelBd : C.tileBloomBd;
        bdW  = inPath ? 2.5 : 1.5;
      } else if (tile.state === 'wilt') {
        fill = C.tileWilt;
        bd   = C.tileWiltBd;
        bdW  = 1.5;
      } else {
        fill = C.tileEmpty;
        bd   = C.tileEmptyBd;
        bdW  = 1;
      }

      rr(p.x, p.y, TILE_SIZE, TILE_SIZE, 7, fill, bd, bdW);

      var tcx = p.x + TILE_SIZE / 2;
      var tcy = p.y + TILE_SIZE / 2;

      if (tile.state === 'bloom') {
        drawFlower(tcx, tcy, TILE_SIZE * 0.32, tile.flowerType);
        if (inPath) {
          // Step number badge
          ctx.font = 'bold 12px system-ui, sans-serif';
          ctx.fillStyle = C.gold;
          ctx.textAlign = 'center';
          ctx.fillText(pathI + 1, p.x + TILE_SIZE - 12, p.y + 16);
        }
      } else if (tile.state === 'wilt') {
        drawWiltedFlower(tcx, tcy, TILE_SIZE * 0.32, tile.flowerType);
        // Recover countdown
        ctx.font = 'bold 16px system-ui, sans-serif';
        ctx.fillStyle = '#7A6050';
        ctx.textAlign = 'center';
        ctx.fillText(tile.recoverTurns, tcx, tcy + 6);
      } else {
        // Empty placeholder
        ctx.fillStyle = 'rgba(100,80,50,0.18)';
        ctx.font = '22px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('+', tcx, tcy + 7);
      }
    }
  }

  // Route preview line
  if (G.dragPath.length > 0) {
    ctx.save();
    ctx.strokeStyle = C.routeLine;
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    G.dragPath.forEach(function(pt, idx) {
      var pp = tilePos(pt.row, pt.col);
      var x = pp.x + TILE_SIZE / 2;
      var y = pp.y + TILE_SIZE / 2;
      if (idx === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Dots
    G.dragPath.forEach(function(pt) {
      var pp = tilePos(pt.row, pt.col);
      ctx.beginPath();
      ctx.arc(pp.x + TILE_SIZE / 2, pp.y + TILE_SIZE / 2, 9, 0, Math.PI * 2);
      ctx.fillStyle = C.routeDot;
      ctx.fill();
    });

    // Mini bee at last point
    var last = G.dragPath[G.dragPath.length - 1];
    var lp = tilePos(last.row, last.col);
    var bx = lp.x + TILE_SIZE / 2;
    var by = lp.y + TILE_SIZE / 2;
    ctx.font = '22px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🐝', bx, by - TILE_SIZE * 0.22);

    ctx.restore();
  }
}

function drawSeedArea() {
  var btnW = 140, btnH = SEED_H - 10;
  var gap  = (CANVAS_W - 2 * btnW) / 3;
  var by   = SEED_Y + 4;

  // Label
  ctx.font = 'bold 12px system-ui, sans-serif';
  ctx.fillStyle = C.textMed;
  ctx.textAlign = 'center';
  var lbl = G.phase === 'plant'
    ? (countEmptyTiles() === 0 ? '빈 칸 없음 — Pass로 넘기기' : '씨앗 선택 (Seed Selection)')
    : '경로 단계 — 꽃 3개를 드래그하세요';
  ctx.fillText(lbl, CANVAS_W / 2, SEED_Y + 1);

  G._seedBtns = [];

  for (var i = 0; i < 2; i++) {
    var type = G.seedOptions[i];
    var bx   = gap + i * (btnW + gap);
    var dis  = G.phase !== 'plant' || countEmptyTiles() === 0;
    var sel  = G.selectedSeed === type;

    var fill = dis ? C.seedBtnDis : (sel ? C.seedBtnSel : C.seedBtn);
    var bd   = dis ? C.seedBtnDisBd : (sel ? C.seedBtnSelBd : C.seedBtnBd);
    rr(bx, by, btnW, btnH, 10, fill, bd, sel ? 2.5 : 1.5);

    var alpha = dis ? 0.45 : 1.0;
    drawFlower(bx + btnW / 2, by + btnH * 0.42, btnH * 0.30, type, alpha);

    var name = type.charAt(0).toUpperCase() + type.slice(1);
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.fillStyle = dis ? C.textLight : FLOWER_COLORS[type];
    ctx.globalAlpha = alpha;
    ctx.textAlign = 'center';
    ctx.fillText(name, bx + btnW / 2, by + btnH - 10);
    ctx.globalAlpha = 1.0;

    G._seedBtns.push({ type: type, x: bx, y: by, w: btnW, h: btnH });
  }

  // Pass button
  var passW = 120, passH = 36;
  var passX = (CANVAS_W - passW) / 2;
  var passY = PASS_BTN_Y;
  var passLabel = G.phase === 'route' ? 'Pass Route' : 'Pass Turn';
  var passCol = G.phase === 'route' ? C.btnGrey : C.btnGrey;
  rr(passX, passY, passW, passH, 8, passCol, C.btnGreyBd, 1.5);
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.fillStyle = C.btnGreyTxt;
  ctx.textAlign = 'center';
  ctx.fillText(passLabel, passX + passW / 2, passY + 23);
  G._passBtn = { x: passX, y: passY, w: passW, h: passH };
}

function drawMsg() {
  if (!G.msg || G.msgTimer <= 0) return;
  var alpha = Math.min(1, G.msgTimer / 20);
  ctx.save();
  ctx.globalAlpha = alpha;
  rr(CANVAS_W / 2 - 120, CANVAS_H / 2 - 28, 240, 56, 12, 'rgba(40,20,5,0.88)', null, 0);
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText(G.msg, CANVAS_W / 2, CANVAS_H / 2 + 7);
  ctx.restore();
}

function drawJarAnim() {
  if (!G.jarAnim || G.jarAnimTimer <= 0) return;
  var alpha = Math.min(1, G.jarAnimTimer / 20);
  ctx.save();
  ctx.globalAlpha = alpha;

  var boxW = 260, boxH = 80;
  var bx = (CANVAS_W - boxW) / 2;
  var by = BOARD_Y + BOARD_H / 2 - boxH / 2;
  rr(bx, by, boxW, boxH, 14, 'rgba(255,248,220,0.95)', C.gold, 2.5);

  ctx.font = 'bold 18px system-ui, sans-serif';
  ctx.fillStyle = C.gold;
  ctx.textAlign = 'center';
  ctx.fillText('🫙 Jar Complete! +' + G.jarAnim.reward, CANVAS_W / 2, by + 30);

  // Show recipe
  var fSize = 20;
  var startX = CANVAS_W / 2 - (3 * fSize * 1.8) / 2;
  G.jarAnim.recipe.forEach(function(t, i) {
    drawFlower(startX + i * fSize * 1.8 + fSize * 0.9, by + 58, fSize * 0.8, t, 1);
  });
  ctx.restore();
}

function drawPlayScene() {
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  drawOrderCards();
  drawBoard();
  drawSeedArea();
  drawHUD();
  drawJarAnim();
  drawMsg();
}

function drawTitleScene() {
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Decorative bg flowers
  var deco = [
    { x: 50,  y: 90,  r: 35, t: 'clover',    a: 0.30 },
    { x: 320, y: 70,  r: 32, t: 'poppy',     a: 0.28 },
    { x: 40,  y: 730, r: 30, t: 'lavender',  a: 0.28 },
    { x: 340, y: 750, r: 38, t: 'sunflower', a: 0.32 },
    { x: 200, y: 780, r: 28, t: 'clover',    a: 0.22 },
    { x: 190, y: 80,  r: 25, t: 'poppy',     a: 0.20 },
  ];
  deco.forEach(function(d) { drawFlower(d.x, d.y, d.r, d.t, d.a); });

  // Title card
  rr(30, 130, CANVAS_W - 60, 210, 16, 'rgba(255,250,238,0.97)', C.orderCardBd, 2);
  ctx.font = 'bold 36px system-ui, sans-serif';
  ctx.fillStyle = '#5A3010';
  ctx.textAlign = 'center';
  ctx.fillText('🐝 Nectar Trail', CANVAS_W / 2, 192);
  ctx.fillText('Courier', CANVAS_W / 2, 238);
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillStyle = C.textMed;
  ctx.fillText('꽃을 심고 벌의 비행 경로를 그려', CANVAS_W / 2, 272);
  ctx.fillText('주문 꿀을 완성하세요', CANVAS_W / 2, 292);

  // Best score box
  if (G.bestScore > 0) {
    rr(CANVAS_W / 2 - 85, 360, 170, 52, 10, C.hudBg, C.hudBd, 1.5);
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillStyle = C.textMed;
    ctx.textAlign = 'center';
    ctx.fillText('Best Score', CANVAS_W / 2, 380);
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.fillStyle = C.gold;
    ctx.fillText('★ ' + G.bestScore, CANVAS_W / 2, 402);
  }

  // How to play
  rr(28, 432, CANVAS_W - 56, 168, 12, 'rgba(255,250,238,0.9)', C.orderCardBd, 1.5);
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.fillStyle = C.textDark;
  ctx.textAlign = 'left';
  ctx.fillText('How to play:', 48, 456);
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillStyle = C.textMed;
  var tips = [
    '1. 씨앗 선택 → 빈 칸 탭 → 꽃 심기',
    '2. 인접한 꽃 3개를 드래그하여 경로 그리기',
    '3. 주문 레시피와 일치하면 꿀 병 완성 & 점수!',
    '4. 주문 3개 실패 시 게임 종료',
  ];
  tips.forEach(function(t, i) { ctx.fillText(t, 48, 478 + i * 20); });

  // Start button (≥44px touch target)
  var btnW = 200, btnH = 56;
  var btnX = (CANVAS_W - btnW) / 2, btnY = 628;
  rr(btnX, btnY, btnW, btnH, 14, C.btnGreen, C.btnGreenBd, 2);
  ctx.font = 'bold 18px system-ui, sans-serif';
  ctx.fillStyle = C.btnGreenTxt;
  ctx.textAlign = 'center';
  ctx.fillText('🌸 Start Game', CANVAS_W / 2, btnY + 36);
  G._startBtn = { x: btnX, y: btnY, w: btnW, h: btnH };
}

function drawResultsScene() {
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Decorative flowers
  drawFlower(45,  80,  30, 'clover',   0.28);
  drawFlower(325, 70,  28, 'poppy',    0.28);
  drawFlower(50,  740, 28, 'lavender', 0.25);
  drawFlower(330, 755, 32, 'sunflower',0.28);

  // Results card
  rr(25, 140, CANVAS_W - 50, 380, 16, 'rgba(255,250,238,0.97)', C.orderCardBd, 2);

  ctx.font = 'bold 26px system-ui, sans-serif';
  ctx.fillStyle = '#5A3010';
  ctx.textAlign = 'center';
  ctx.fillText('Run Complete! 🍯', CANVAS_W / 2, 185);

  var reason = G.spoils >= MAX_SPOILS ? '🥀 Orders spoiled (×3)' : '⏰ 18 turns complete';
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillStyle = C.textMed;
  ctx.fillText(reason, CANVAS_W / 2, 210);

  // Score display
  ctx.font = 'bold 52px system-ui, sans-serif';
  ctx.fillStyle = C.gold;
  ctx.fillText('★ ' + G.score, CANVAS_W / 2, 275);
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillStyle = C.textMed;
  ctx.fillText('Score', CANVAS_W / 2, 297);

  // Stats
  var stats = [
    { val: '🫙 ' + G.jarsCompleted, lbl: 'Jars' },
    { val: '🔄 ' + (G.turn - 1),    lbl: 'Turns' },
    { val: '⚠ '  + G.spoils,        lbl: 'Spoils' },
  ];
  var sw = Math.floor((CANVAS_W - 60) / 3);
  stats.forEach(function(s, i) {
    var sx = 30 + i * sw;
    rr(sx, 315, sw - 8, 64, 8, C.hudBg, C.hudBd, 1);
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.fillStyle = C.textDark;
    ctx.textAlign = 'center';
    ctx.fillText(s.val, sx + (sw - 8) / 2, 344);
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillStyle = C.textMed;
    ctx.fillText(s.lbl, sx + (sw - 8) / 2, 362);
  });

  // Best score
  var isBest = G.lastRunSummary && G.lastRunSummary.newBest;
  rr(CANVAS_W / 2 - 95, 396, 190, 58, 10,
    isBest ? '#FFF4C0' : C.hudBg,
    isBest ? '#C09020' : C.hudBd,
    isBest ? 2.5 : 1.5);
  ctx.font = '11px system-ui, sans-serif';
  ctx.fillStyle = isBest ? '#7A5010' : C.textMed;
  ctx.textAlign = 'center';
  ctx.fillText(isBest ? '🏆 New Best Score!' : 'Best Score', CANVAS_W / 2, 418);
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.fillStyle = C.gold;
  ctx.fillText('★ ' + G.bestScore, CANVAS_W / 2, 443);

  // Restart button
  var btnW = 200, btnH = 56;
  var btnX = (CANVAS_W - btnW) / 2, btnY = 570;
  rr(btnX, btnY, btnW, btnH, 14, C.btnGreen, C.btnGreenBd, 2);
  ctx.font = 'bold 18px system-ui, sans-serif';
  ctx.fillStyle = C.btnGreenTxt;
  ctx.textAlign = 'center';
  ctx.fillText('🌱 Play Again', CANVAS_W / 2, btnY + 36);
  G._restartBtn = { x: btnX, y: btnY, w: btnW, h: btnH };
}

// ============================================================
// GAME LOOP
// ============================================================
function gameLoop() {
  // Update timers
  if (G.msgTimer    > 0) G.msgTimer--;
  if (G.jarAnimTimer > 0) G.jarAnimTimer--;
  if (G.spoilFlash  > 0) G.spoilFlash--;

  // Render
  if (G.scene === 'title')   drawTitleScene();
  else if (G.scene === 'play')    drawPlayScene();
  else if (G.scene === 'results') drawResultsScene();

  requestAnimationFrame(gameLoop);
}

// ============================================================
// INPUT
// ============================================================
function canvasXY(e) {
  var rect = canvas.getBoundingClientRect();
  var sx = CANVAS_W / rect.width;
  var sy = CANVAS_H / rect.height;
  var src;
  if (e.touches && e.touches.length > 0)               src = e.touches[0];
  else if (e.changedTouches && e.changedTouches.length > 0) src = e.changedTouches[0];
  else                                                       src = e;
  return { x: (src.clientX - rect.left) * sx, y: (src.clientY - rect.top) * sy };
}

function onDown(e) {
  e.preventDefault();
  var pos = canvasXY(e);
  var x = pos.x, y = pos.y;

  if (G.scene === 'title') {
    if (hitRect(x, y, G._startBtn)) startGame();
    return;
  }
  if (G.scene === 'results') {
    if (hitRect(x, y, G._restartBtn)) startGame();
    return;
  }
  // play
  if (G.phase === 'plant') {
    // Seed buttons
    var clicked = false;
    G._seedBtns.forEach(function(btn) {
      if (hitRect(x, y, btn) && countEmptyTiles() > 0) {
        G.selectedSeed = (G.selectedSeed === btn.type) ? null : btn.type;
        clicked = true;
      }
    });
    if (clicked) return;
    // Pass button
    if (hitRect(x, y, G._passBtn)) {
      G.selectedSeed = null;
      endTurn();
      return;
    }
    // Board tile
    if (G.selectedSeed) {
      var t = hitTile(x, y);
      if (t) plantFlower(t.row, t.col);
    }
  } else {
    // route phase
    if (hitRect(x, y, G._passBtn)) { passRoute(); return; }
    // Start drag
    var t = hitTile(x, y);
    if (t && G.board[t.row][t.col].state === 'bloom') {
      G.isDragging = true;
      G.dragPath   = [{ row: t.row, col: t.col }];
    }
  }
}

function onMove(e) {
  e.preventDefault();
  if (G.scene !== 'play' || G.phase !== 'route' || !G.isDragging) return;
  var pos = canvasXY(e);
  var t = hitTile(pos.x, pos.y);
  if (!t) return;

  var idx = pathIdx(t.row, t.col);
  if (idx >= 0) {
    // Backtrack
    G.dragPath = G.dragPath.slice(0, idx + 1);
    return;
  }
  if (G.dragPath.length >= ROUTE_LENGTH) return;
  var last = G.dragPath[G.dragPath.length - 1];
  if (!isAdj(last.row, last.col, t.row, t.col)) return;
  if (G.board[t.row][t.col].state !== 'bloom') return;
  G.dragPath.push({ row: t.row, col: t.col });
}

function onUp(e) {
  e.preventDefault();
  if (G.scene !== 'play' || !G.isDragging) { G.isDragging = false; return; }
  G.isDragging = false;
  if (G.phase === 'route' && G.dragPath.length === ROUTE_LENGTH) {
    tryCompleteRoute();
  } else {
    G.dragPath = [];
  }
}

// ============================================================
// INIT
// ============================================================
function init() {
  canvas = document.getElementById('gameCanvas');
  ctx    = canvas.getContext('2d');
  canvas.width  = CANVAS_W;
  canvas.height = CANVAS_H;

  canvas.addEventListener('touchstart',  onDown, { passive: false });
  canvas.addEventListener('touchmove',   onMove, { passive: false });
  canvas.addEventListener('touchend',    onUp,   { passive: false });
  canvas.addEventListener('mousedown',   onDown);
  canvas.addEventListener('mousemove',   onMove);
  canvas.addEventListener('mouseup',     onUp);

  loadStorage();
  requestAnimationFrame(gameLoop);
}

// ============================================================
// DEBUG HOOK
// ============================================================
window.__nectarTrailCourier = {
  getState: function() { return G; },
  startGame: startGame,
  endGame:   endGame,
  getScore:  function() { return G.score; },
  getTurn:   function() { return G.turn; },
  getSpoils: function() { return G.spoils; },
  getJars:   function() { return G.jarsCompleted; },
  getScene:  function() { return G.scene; },
  getPhase:  function() { return G.phase; },
  getOrders: function() { return G.orders.slice(); },
  getSeedOptions: function() { return G.seedOptions.slice(); },
  getBestScore: function() { return G.bestScore; },
  plantFlower: plantFlower,
  tryCompleteRoute: tryCompleteRoute,
  passRoute: passRoute,
  endTurn: endTurn,
  MAX_SPOILS: MAX_SPOILS,
  MAX_TURNS:  MAX_TURNS,
  forceJar: function() {
    // Plant 3 flowers and force-match first order for testing
    if (!G.orders.length) return 'no orders';
    var ord = G.orders[0];
    // Find 3 adjacent empty tiles and plant flowers
    var placed = [];
    outer:
    for (var r = 0; r < BOARD_ROWS && placed.length < 3; r++) {
      for (var c = 0; c < BOARD_COLS && placed.length < 3; c++) {
        var tile = G.board[r][c];
        if (tile.state === 'empty' || tile.state === 'bloom') {
          tile.state = 'bloom';
          tile.flowerType = ord.recipe[placed.length];
          placed.push({ row: r, col: c });
        }
      }
    }
    if (placed.length < 3) return 'not enough tiles';
    G.dragPath = placed;
    G.phase    = 'route';
    var result = tryCompleteRoute();
    return result ? 'jar complete' : 'route failed';
  },
};

document.addEventListener('DOMContentLoaded', init);
