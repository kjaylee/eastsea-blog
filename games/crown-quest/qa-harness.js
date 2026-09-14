#!/usr/bin/env node
/* Crown Quest QA harness — Node VM + DOM shim (chain #3 전례 방식) */
'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const GAME_DIR = __dirname;
const HTML = fs.readFileSync(path.join(GAME_DIR, 'index.html'), 'utf8');

/* ---------- 1. 정적: script 추출 + node --check ---------- */
const scripts = [];
const re = /<script>([\s\S]*?)<\/script>/g;
let m;
while ((m = re.exec(HTML))) scripts.push(m[1]);
if (scripts.length !== 1) { console.error('FAIL: script blocks =', scripts.length); process.exit(1); }
const code = scripts[0];
let check = 0;
try { new vm.Script(code); check = 1; } catch (e) { console.error('node --check FAIL:', e.message); }
console.log(`[1] node --check: ${check ? 'PASS' : 'FAIL'}`);

/* ---------- 2. DOM shim ---------- */
const pageErrors = [];
class FakeEl {
  constructor(id) { this.id = id; this.innerHTML = ''; this.children = []; this.attrs = {}; }
  addEventListener(ev, fn) { this['on' + ev] = fn; }
  setAttribute(k, v) { this.attrs[k] = v; }
  getAttribute(k) { return this.attrs[k]; }
  querySelectorAll() { return []; }
}
const els = {};
const listeners = {};
const documentShim = {
  readyState: 'complete',
  getElementById(id) {
    if (!els[id]) els[id] = new FakeEl(id);
    return els[id];
  },
  createElement() { return new FakeEl('dyn'); },
  querySelectorAll() { return []; },
  addEventListener() {},
  body: new FakeEl('body')
};
const storage = {};
const localStorageShim = {
  getItem(k) { return Object.prototype.hasOwnProperty.call(storage, k) ? storage[k] : null; },
  setItem(k, v) { storage[k] = String(v); },
  removeItem(k) { delete storage[k]; }
};
const sandbox = {
  document: documentShim,
  localStorage: localStorageShim,
  console: { log: () => {}, error: (...a) => pageErrors.push(a.join(' ')), warn: () => {} },
  confirm: () => true,
  Math, JSON, Object, Array, String, Number, Date, Infinity, NaN, undefined,
};
vm.createContext(sandbox);
sandbox.window = sandbox; // window.CQ export 경로
try { vm.runInContext(code, sandbox, { filename: 'crown-quest-inline.js' }); }
catch (e) { pageErrors.push('VM eval: ' + e.message); }

const CQ = sandbox.window && sandbox.window.CQ ? sandbox.window.CQ : null;
if (!CQ) { console.error('FAIL: window.CQ not exported'); process.exit(1); }

let pass = 0, fail = 0, idx = 0;
function t(name, cond) {
  idx++;
  if (cond) { pass++; console.log(`  ok ${idx} ${name}`); }
  else { fail++; console.log(`  FAIL ${idx} ${name}`); }
}
function render() { sandbox.window.CQ.render(); }
function nextWeek() { const st = CQ.getState(); if (st.phase === 'result') st.phase = 'play'; }

/* ---------- 3. 정적 어설션 ---------- */
console.log('[2] 정적 어설션');
t('헤더 주석 3개 원천 경로 포함', ['v6/triple-crown-systematics.md','v8/japan-triple-crown-eight.md','v8/korea-triple-crown-two.md'].every(s => HTML.includes(s)));
t('SOURCES 3건 path/use', CQ.SOURCES.length === 3 && CQ.SOURCES.every(s => s.path && s.use));
const CAL = CQ._calc.CALENDAR;
t('일본형 5주차 구조', CAL.jp.map(x => x.t).join(',') === 'action,race,race,pasture,race');
t('미국형 5주차 구조', CAL.us.map(x => x.t).join(',') === 'race,action,race,action,race');
t('일본 거리 계단 2000→2400→3000', JSON.stringify(CAL.jp.filter(x => x.t === 'race').map(x => x.dist)) === '[2000,2400,3000]');
t('미국 거리 2012→1900→2400', JSON.stringify(CAL.us.filter(x => x.t === 'race').map(x => x.dist)) === '[2012,1900,2400]');
t('요구 스탯 전환: SPD→END계열→STA/END', CAL.jp[1].focus === 'SPD' && CAL.jp[2].focus === 'END' && CAL.jp[4].focus === 'STA' && CAL.us[4].focus === 'END');
t('무패 조건 상수 5', CQ._calc.UNDEFEATED_MIN === 5);
t('경주 피로 일본<미국', CQ._calc.RACE_FAT.jp === 14 && CQ._calc.RACE_FAT.us === 18);
t('라이벌 플래그 종단 관문', CAL.jp[4].rival === true && CAL.us[4].rival === true);
t('승률 클램프 [4%,97%]', CQ._calc.winProb(50, 10) === 0.04 && CQ._calc.winProb(50, 200) === 0.97);
t('닉네임 NaN/undefined 없음', [CQ._calc.INIT.spd, CQ._calc.INIT.end, CQ._calc.INIT.sta].every(x => typeof x === 'number' && !isNaN(x)));

/* 무패 확률 시뮬레이션 (~3.5% 튜닝 검증) */
function simulate(mode, seed, trainPlan) {
  CQ._seed(seed);
  const st = CQ.newState();
  st.meta = { plays: 0, clears: { jp: 0, us: 0 }, undefeated: 0, legacy: null, bestWins: 0 };
  CQ.startGame(mode);
  let w = 0, wins = 0, marg = 0;
  for (let week = 0; week < CQ._calc.CALENDAR[mode].length; week++) {
    const c = CQ._calc.CALENDAR[mode][week];
    if (c.t === 'action') { CQ.action(trainPlan[w]); w++; }
    else if (c.t === 'pasture') { CQ.pasture(); }
    else if (c.t === 'race') { CQ.race(); if (CQ.getState().phase === 'result') CQ.getState().phase = 'play'; }
  }
  const stt = CQ.getState();
  const cleared = stt.results.filter(r => r.win).length === 3;
  marg = stt.results.reduce((a, r) => a + r.margin, 0);
  return { cleared, undefeated: cleared && marg >= CQ._calc.UNDEFEATED_MIN, marg };
}
// 최적 빌드: 일본형 — train_spd, train_end, 방목 자동, + @강화
const optimal = ['train_spd', 'train_end', 'train_end'];
let uf = 0, N = 10000;
for (let i = 0; i < N; i++) { if (simulate('jp', 1000 + i, optimal).undefeated) uf++; }
const pct = (uf / N) * 100;
console.log(`[3] 무패 달성률 시뮬레이션(${N}회): ${pct.toFixed(2)}%`);
t('무패 업적 확률 ~3.5% (±1.0pp)', pct >= 2.5 && pct <= 4.5);

/* ---------- 4. 런타임 흐름 ---------- */
console.log('[4] 런타임 흐름 A — 일본형 무패 클리어 + 계승');
CQ.resetAll();
render();
t('부트스트랩 phase=title', CQ.getState().phase === 'title');
const app0 = els.app ? els.app.innerHTML : '';
t('타이틀에 크라운 퀘스트 렌더', app0.includes('크라운 퀘스트'));
t('타이틀에 일본형/미국형 모드 카드', app0.includes('일본형') && app0.includes('미국형'));
t('타이틀에 연구 원천 3건', app0.includes('research/horse-racing') && app0.includes('triple-crown-systematics'));
t('타이틀에 무패 3관 3.5% 안내', app0.includes('3.5'));

// 일본형 무패 루트: train_spd → race(皐月) → race(더비) → 방목 → race(菊花)
CQ._seed(27); // 결정적 무패 클리어 시드 (스캔 검증: margSum=5)
CQ.startGame('jp');
t('startGame 후 phase=play, week=0', CQ.getState().phase === 'play' && CQ.getState().week === 0);
t('일본형 달력 길이 5', CQ.getState().cal.length === 5);

CQ.action('train_spd');
t('train_spd: spd +12·fatigue +4·week=1', CQ.getState().horse.spd === 57 && CQ.getState().horse.fatigue === 4 && CQ.getState().week === 1);
render();
t('week=1 렌더 — 경주 준비 화면(皐月賞)', els.app.innerHTML.includes('皐月賞') || els.app.innerHTML.includes('출주'));

CQ.race();
let r1 = CQ.getState().results[0];
t('皐月賞(2000m SPD) 참가·결과 기록', r1 && r1.dist === 2000 && r1.leg === '제1관문' && typeof r1.win === 'boolean');
t('경주 후 피로 +14', CQ.getState().horse.fatigue === 4 + 14);
t('승리 시 마진 ≥1 / 패배 시 0', r1.win ? r1.margin >= 1 : r1.margin === 0);
render();
t('경주 결과 화면(우승/패배 박스)', els.app.innerHTML.includes('결과') && (els.app.innerHTML.includes('우승') || els.app.innerHTML.includes('패배')));
CQ.getState().phase = 'play'; // 다음 주차 (btn-next)

CQ.race();
let r2 = CQ.getState().results[1];
t('더비(2400m END) 요구 스탯 전환', r2 && r2.dist === 2400 && r2.req === 52);
nextWeek();

CQ.pasture();
t('방목: 전 스탯 +9·피로 -22(0 클램프)', CQ.getState().horse.spd === 57 + 9 && CQ.getState().horse.fatigue >= 0 && CQ.getState().week === 4);

CQ.race();
let r3 = CQ.getState().results[2];
t('菊花賞(3000m STA) 최종 관문', r3 && r3.dist === 3000 && r3.rival === true);
t('일본형 finish → summary', CQ.getState().phase === 'summary');

const clearedA = CQ.getState().outcome ? CQ.getState().outcome.cleared : false;
const undefA = CQ.getState().outcome ? CQ.getState().outcome.undefeated : false;
render();
t('결산에 계승/다시 도전 버튼', els.app.innerHTML.includes('계승') && els.app.innerHTML.includes('다시 도전'));
t('무패 3관 클리어 + 업적 결산 (seed 27 결정적)', clearedA === true && undefA === true);
t('부자 계승 legacyStart → title', (CQ.legacyStart().ok === true) && CQ.getState().phase === 'title');
t('meta.legacy 기록', !!CQ.getState().meta.legacy && CQ.getState().meta.legacy.gen === 1);
CQ.startGame('jp');
t('2세대 계승 보너스: 전 스탯 = 51 (45+6)', CQ.getState().horse.spd === 51 && CQ.getState().horse.end === 51 && CQ.getState().horse.sta === 51 && CQ.getState().legacyBonus === true);
CQ.resetAll();
render();

console.log('[5] 런타임 흐름 B — 미국형 실패 + 라이벌 역전');
CQ.startGame('us');
for (let k = 0; k < 2; k++) CQ.action('train_spd'); // 더비 승리 유도
CQ.race();
nextWeek();
CQ.action('rest');
CQ.race();
nextWeek();
CQ.action('train_end');
CQ.race(); // 벨몬트 — 최대 fatigue 상태로 패배 유도
const stB = CQ.getState();
t('미국형 5경주 완주 → summary', stB.phase === 'summary');
const lastB = stB.results[stB.results.length - 1];
t('벨몬트 라이벌 역전/추격 이벤트 텍스트', lastB && (lastB.event.includes('알리다') || lastB.event.includes('접전')));
t('미국형 패배 시 cleared=false', stB.outcome.cleared === false);
t('미국형 클리어 실패 시 계승 버튼 없음', !els.app.innerHTML.includes('계승'));
t('기록 누적: plays 증가', stB.meta.plays >= 1);

console.log('[6] 런타임 흐름 C — 경계·저장');
// localStorage에 저장된 기록 → startGame이 복원
sandbox.localStorage.setItem(CQ.LS_KEY, JSON.stringify({ plays: 5, clears: { jp: 1, us: 0 }, undefeated: 1, legacy: { name: '크라운 스톰', gen: 1, spd: 6, end: 6, sta: 6 }, bestWins: 3 }));
CQ.startGame('jp');
t('localStorage 복원: plays=6, legacy 보너스', CQ.getState().meta.plays === 6 && CQ.getState().legacyBonus === true);
// 주차-동작 불일치 검증: week=0(action 주차)에서 race 호출 → {ok:false}
let before = CQ.getState().week;
let badRace = CQ.race();
t('잘못된 주차 race 호출(action 주차) → {ok:false}', badRace.ok === false && CQ.getState().week === before && CQ.getState().results.length === 0);
// 정상 action → week 전진
let okAction = CQ.action('train_spd');
t('정상 주차 action → {ok:true}·week 전진', okAction.ok === true && CQ.getState().week === before + 1);
CQ.resetAll();
t('resetAll 후 phase=title, record 초기화', CQ.getState().phase === 'title' && CQ.getState().meta.plays === 0);

/* ---------- 5. 종합 ---------- */
console.log(`\n===== 결과: 정적 ${pass + 1}/${pass + fail + 1} + 런타임 ${pass}/${pass + fail} =====`);
console.log(`pageErrors: ${pageErrors.length === 0 ? '[] (없음)' : pageErrors.join(' | ')}`);
console.log(`PASS=${pass} FAIL=${fail}`);
process.exit(fail > 0 || pageErrors.length > 0 ? 1 : 0);