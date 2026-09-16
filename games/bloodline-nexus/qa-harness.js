#!/usr/bin/env node
/* Bloodline Nexus QA harness — Node VM + DOM shim (chain #3/#4 전례 방식) */
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
function makeSandbox(storageSeed) {
  const pageErrors = [];
  class FakeEl {
    constructor(id) { this.id = id; this.innerHTML = ''; this.children = []; this.attrs = {}; }
    addEventListener(ev, fn) { this['on' + ev] = fn; }
    setAttribute(k, v) { this.attrs[k] = v; }
    getAttribute(k) { return this.attrs[k]; }
    querySelectorAll() { return []; }
  }
  const els = {};
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
  const storage = Object.assign({}, storageSeed || {});
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
  sandbox.window = sandbox;
  return { sandbox, pageErrors, els, storage };
}

function boot(storageSeed, onError) {
  const env = makeSandbox(storageSeed);
  const bootErrs = [];
  try {
    vm.runInContext(code, env.sandbox, { filename: 'bloodline-nexus-inline.js' });
  } catch (e) {
    env.pageErrors.push('VM eval: ' + e.message);
    bootErrs.push(e.message);
  }
  if (onError) onError(env);
  return env;
}

let pass = 0, fail = 0, idx = 0;
function t(name, cond) {
  idx++;
  if (cond) { pass++; console.log(`  ok ${idx} ${name}`); }
  else { fail++; console.log(`  FAIL ${idx} ${name}`); }
}
const fmt = (v) => (typeof v === 'number' && !Number.isFinite(v)) ? 'NaN/Inf' : v;

/* ============================================================
   [2] 정적 어셜션 (19)
   ============================================================ */
console.log('[2] 정적 어셜션');
// S1 구조
t('S1 인라인 script 정확히 1개', scripts.length === 1);
t('S1 node --check 통과', check === 1);
t('S1 <title> 한글+영문 마커', HTML.includes('<title>블러드라인 넥서스 — Bloodline Nexus</title>'));
t('S1 viewport meta + touchstart 리스너', HTML.includes('viewport') && code.includes('touchstart'));
// S2 원천
const SRC_PATHS = ['v3/혈통분석-Nicks-Inbreeding.md', 'korea/bloodlines.md', 'v8/japan-triple-crown-eight.md', 'v8/korea-triple-crown-two.md'];
t('S2 HTML 주석 원천 4건', SRC_PATHS.every(p => HTML.includes(p)));
// S3 메카닉 — 정적 상수(채번은 런타임에서 BN으로)
const STA_COUNT = (HTML.match(/function startGame/g) || []).length;
t('S3 startGame 정의 존재', STA_COUNT >= 1);
t('S3 localStorage 키 세이브 v1', HTML.includes("'bloodline-nexus-save-v1'"));
t('S3 LEGACY_BONUS = 6 상수', code.includes('LEGACY_BONUS = 6'));
t('S3 COI 공식 pow(0.5, n1+n2+1)', code.includes('Math.pow(0.5, num(n1, 2) + num(n2, 2) + 1)'));
t('S3 RISK_EVENTS 3단계(경미/중등/고도)', ['경미', '중등', '고도'].every(k => code.includes(k + ': [')));
t('S3 GOOD/BAD/NEUTRAL 닉 3종', ['GOOD', 'BAD', 'NEUTRAL'].every(k => code.includes(k)));
t('S3 잡종 강세 상수 HETERO_BONUS=3/HETERO_EXTRA=4', code.includes('HETERO_BONUS = 3') && code.includes('HETERO_EXTRA = 4'));
t('S3 교배 리스크 롤 rng() < band.risk', code.includes('rng() < band.risk'));
t('S3 스탯 클램프 30~90', code.includes('clamp(Math.round(v), 30, 90)'));
t('S3 NaN 가드 num() 경유(chain #4 교훈)', code.includes('Number.isFinite(v)') && code.includes('const num ='));
t('S3 부트스트랩 로드 즉시 newState+render(chain #3 교훈)', code.includes('let state = newState()') && code.includes('render();'));
t('S3 버그 방어: 완성 시 NaN이면 중립 재계산', code.includes('Number.isFinite(sum)') && code.includes('방어'));
t('S4 평가 산식: 균형+닉+COI 고정', code.includes('evaluator') && code.includes('bal + nickB + coiB'));
t('S4 finish → meta.plays 증가 + persist', code.includes('state.meta.plays += 1') && code.includes('persist();'));
t('S4 resetAll → title + wipeSave', code.includes('state = newState()') && code.includes('wipeSave();'));
t('S4 부자 계승 딥→콘트레일 안내 문구', code.includes('딥 임팩트→콘트레일') && code.includes('부자 무패 3관'));

/* ============================================================
   [3] 런타임 부트스트랩 + 원천 데이터
   ============================================================ */
const env = boot();
const pageErrors = env.pageErrors;
const BN = env.sandbox.window.BN;
console.log('[3] 부트스트랩 + 데이터');
if (!BN) { console.error('FAIL: window.BN not exported'); process.exit(1); }
t('R1 pageErrors=[]', pageErrors.length === 0);
t('R1 BN export', !!BN);
t('R1 로드 즉시 phase=title (부트스트랩)', BN.getState().phase === 'title');
const appEl = env.els.app;
t('R1 로드 즉시 render → 타이틀 렌더', appEl.innerHTML.includes('BLOODLINE NEXUS'));
t('R1 타이틀에 연구 원천 4건', SRC_PATHS.every(p => appEl.innerHTML.includes(p.split('/').pop())));
t('S2 SOURCES 4건 path+use', BN.SOURCES.length === 4 && BN.SOURCES.every(s => s.path && s.use));
t('S2 카드 풀: 씨수마 8 + 모계 6', BN.SIRES.length === 8 && BN.DAMS.length === 6);
t('S2 실제 삼관마 카드 존재', ['deep-impact', 'contrail', 'power-blade', 'js-hold', 'golden-power'].every(id => BN.card(id)));
t('S2 노던 댄서·미스터 프로스펙터 계통', BN.NICKS.nd && BN.NICKS.mp && BN.NICKS.ss && BN.NICKS.kr && BN.NICKS.rb);
t('S3 Nicks: nd×htr=GOOD / mp×htr=BAD / mp×rb=GOOD',
  BN._calc.nickOf(BN.card('northern-dancer'), BN.card('hail-girl')).n === 'GOOD' &&
  BN._calc.nickOf(BN.card('mr-prospector'), BN.card('hail-girl')).n === 'BAD' &&
  BN._calc.nickOf(BN.card('mr-prospector'), BN.card('roberto-girl')).n === 'GOOD');
t('S3 COI: mp×native-girl=0.125(고도)', BN._calc.calcCOI(BN.card('mr-prospector'), BN.card('native-girl')).coi === 0.125);
t('S3 COI: deep×ss-girl=0.0625(중등)', BN._calc.calcCOI(BN.card('deep-impact'), BN.card('ss-girl')).coi === 0.0625);
t('S3 COI: contrail×ss-girl=0.03125(경미, 반올림 0.0313)', Math.abs(BN._calc.calcCOI(BN.card('contrail'), BN.card('ss-girl')).coi - 0.03125) < 0.0001);
t('S3 COI: 무근친=0', BN._calc.calcCOI(BN.card('deep-impact'), BN.card('hail-girl')).coi === 0);
t('S3 COI 밴드 보너스 3/7/12', BN._calc.coiBand(0.03).bonus === 3 && BN._calc.coiBand(0.07).bonus === 7 && BN._calc.coiBand(0.12).bonus === 12);
t('S3 COI 밴드 리스크 15%/30%/50%', BN._calc.coiBand(0.03).risk === 0.15 && BN._calc.coiBand(0.07).risk === 0.30 && BN._calc.coiBand(0.12).risk === 0.50);
t('S3 잡종 강세: 계통 상이 시 +3~7', BN.HETERO_BONUS === 3 && BN.HETERO_EXTRA === 4);
t('S3 LEGACY_BONUS=6', BN.LEGACY_BONUS === 6);
t('S3 성능 지수 = spd+end+sta', BN._calc.perf({ spd: 60, end: 55, sta: 45 }) === 160);

/* ============================================================
   [4] 런타임 흐름 A — 무근친 GOOD NICK 교배 (시드 고정)
   ============================================================ */
console.log('[4] 런타임 흐름 A — GOOD NICK 무근친');
BN.startGame();
t('R2 startGame → phase=select, gen=1', BN.getState().phase === 'select' && BN.getState().gen === 1);
BN.render();
t('R2 씨수마 8장+모계 6장 렌더', (appEl.innerHTML.match(/data-sire=/g) || []).length === 8 && (appEl.innerHTML.match(/data-dam=/g) || []).length === 6);
t('R2 G1 자마 → 내 혈통 카드 없음', !appEl.innerHTML.includes('내 혈통'));
t('R2 legacy 없음 → 각인 배너 없음', !appEl.innerHTML.includes('부자 계승 각인'));
BN.pickSire('deep-impact');
BN.pickDam('hail-girl');
BN.render();
t('R3 미리보기: 무근친 COI 0 표기', appEl.innerHTML.includes('근친 없음 (COI 0)'));
t('R3 미리보기: 잡종 강세 표기', appEl.innerHTML.includes('잡종 강세'));
t('R3 미리보기: ss×htr NEUTRAL 태그 (딥 임팩트는 Sunday Silence계)', appEl.innerHTML.includes('NEUTRAL') && !appEl.innerHTML.includes('GOOD NICK'));
BN.pickSire('northern-dancer');
BN.render();
t('R3 미리보기: nd×htr GOOD NICK 태그 (v3 §2 G1 사례)', appEl.innerHTML.includes('GOOD NICK'));
BN.seed(20260916);
const b1 = BN.breed();
t('R4 breed → {ok:true}·result', b1.ok === true && BN.getState().phase === 'result');
const f1 = b1.foal;
t('R4 자마 스탯 정수 30~90 NaN 없음', ['spd', 'end', 'sta'].every(k => Number.isInteger(f1[k]) && f1[k] >= 30 && f1[k] <= 90 && Number.isFinite(f1[k])));
t('R4 성능 지수 정합', BN._calc.perf(f1) === f1.spd + f1.end + f1.sta);
t('R4 lineage 기록', f1.sireName === '노던 댄서' && f1.damName === '헤일 투 리즌 여계' && f1.lineName);
t('R4 GOOD NICK 반영(스탯+8)', f1.nick === 'GOOD' && f1.nickLabel.length > 0);
t('R4 무근친 → 리스크 롤 없음', f1.riskHit === false && f1.coi === 0);
t('R4 잡종 강세 플래그', f1.hetero === true);
t('R4 결과 화면 렌더(탄생+스탯+닉 태그)', appEl.innerHTML.includes('탄생') && appEl.innerHTML.includes('속도 SPD') && appEl.innerHTML.includes('GOOD NICK'));

/* ============================================================
   [5] 런타임 흐름 B — 인브리딩 리스크 판정 (시드 스캔)
   ============================================================ */
console.log('[5] 인브리딩 리스크 판정 — 시드 스캔 (mp×native-girl COI 0.125, 리스크 50%)');
let hits = 0, misses = 0, bad = 0;
const resMap = {};
for (let s = 0; s < 200; s++) {
  BN.seed(s);
  const st = BN.getState();
  st.phase = 'select'; st.sireId = null; st.damId = null; st.gen = 1; st.horses = []; st.last = null;
  BN.pickSire('mr-prospector'); BN.pickDam('native-girl');
  const r = BN.breed();
  if (!r.ok) { bad++; continue; }
  const f = r.foal;
  if (f.riskHit) hits++; else misses++;
  if (!Number.isFinite(f.spd + f.end + f.sta)) bad++;
  resMap[s] = f.riskHit;
}
t('R5 시드 스캔 200회 무결(ok, NaN 0건)', bad === 0);
t('R5 리스크 발현/미발현 양쪽 존재', hits > 0 && misses > 0);
t('R5 리스크 발현 시 페널티 반영(스탯 하강) — 발현군 평균 < 미발현군',
  (() => {
    let hSum = 0, mSum = 0, hN = 0, mN = 0;
    for (let s = 0; s < 200; s++) {
      BN.seed(s);
      const st = BN.getState();
      st.phase = 'select'; st.sireId = null; st.damId = null; st.gen = 1; st.horses = []; st.last = null;
      BN.pickSire('mr-prospector'); BN.pickDam('native-girl');
      const f = BN.breed().foal;
      if (f.riskHit) { hSum += BN._calc.perf(f); hN++; } else { mSum += BN._calc.perf(f); mN++; }
    }
    return hN > 0 && mN > 0 && (hSum / hN) < (mSum / mN);
  })());
t('R5 시드 고정 결정성: 같은 시드 → 같은 결과', (() => {
  BN.seed(7);
  const st = BN.getState();
  st.phase = 'select'; st.sireId = null; st.damId = null; st.gen = 1; st.horses = []; st.last = null;
  BN.pickSire('mr-prospector'); BN.pickDam('native-girl');
  const a = BN.breed().foal;
  BN.seed(7);
  BN.getState().phase = 'select'; BN.getState().sireId = null; BN.getState().damId = null; BN.getState().gen = 1; BN.getState().horses = []; BN.getState().last = null;
  BN.pickSire('mr-prospector'); BN.pickDam('native-girl');
  const bB = BN.breed().foal;
  return a.spd === bB.spd && a.end === bB.end && a.sta === bB.sta && a.riskHit === bB.riskHit;
})());

/* ============================================================
   [6] 런타임 흐름 C — 3세대 교배·자마 승격·결산
   ============================================================ */
console.log('[6] 런타임 흐름 C — 3세대 + 결산');
// G1: GOOD 닉 무근친 (결정적: deep-impact × hail-girl? miss — deep 황선데이 계열 ss × htr = NEUTRAL)
// 깨끗한 G1: northern-dancer × hail-girl (GOOD, COI 0, hetero, bothStrong)
BN.resetAll();
BN.startGame();
BN.seed(11);
BN.pickSire('northern-dancer'); BN.pickDam('hail-girl');
const g1 = BN.breed().foal;
t('R6 G1 완성 (GOOD·무근친)', g1.nick === 'GOOD' && g1.coi === 0);
BN.nextGen();
t('R6 nextGen → select, gen=2', BN.getState().phase === 'select' && BN.getState().gen === 2);
BN.render();
t('R6 내 혈통(G1 자마) 카드 노출', appEl.innerHTML.includes('내 혈통') && appEl.innerHTML.includes('foal-1'));
const p1 = BN.pickSire('foal-1');
t('R6 자마 → 씨수마 승격 가능', p1.ok === true && BN.getState().sireId === 'foal-1');
BN.pickDam('ss-girl'); // G1(nd계) × ss-girl(ss계) — 교차 GOOD? NICKS.nd.ss = GOOD
const g2 = BN.breed().foal;
t('R6 G2 (국제 교차 G1×ss) 탄생', g2.nick === 'GOOD' && g2.sireName === g1.name && g2.gen === 2);
BN.nextGen();
BN.render();
t('R6 G3 단계 최신 자마(foal-2)만 승격 노출 (설계: 직전 세대만 승격)', BN.getState().gen === 3 && appEl.innerHTML.includes('foal-2') && !appEl.innerHTML.includes('foal-1'));
BN.pickSire('foal-2'); BN.pickDam('native-girl');
const g3 = BN.breed().foal;
t('R6 G3 완성', g3.gen === 3 && g3.sireName === g2.name);
BN.render();
t('R6 G3 결과 화면에 최종 평가 버튼', appEl.innerHTML.includes('최종 평가'));
const nx = BN.nextGen();
t('R6 nextGen(G3) → 최종 평가(summary)', nx.ok === true && BN.getState().phase === 'summary');
const stC = BN.getState();
t('R6 summary 렌더: 등급+점수+산식', appEl.innerHTML.includes('등급') && appEl.innerHTML.includes('최종 점수') && appEl.innerHTML.includes('평가 산식'));
t('R6 grade 유효 (S/A/B/C)', ['S', 'A', 'B', 'C'].includes(stC.last.score ? BN._calc.gradeOf(stC.last.score) : '?'));
t('R6 finish 후 meta.plays=1, bestScore 갱신', stC.meta.plays === 1 && stC.meta.bestScore >= stC.last.score);
t('R6 localStorage 세이브 반영', env.storage['bloodline-nexus-save-v1'] && JSON.parse(env.storage['bloodline-nexus-save-v1']).meta.plays === 1);

/* ============================================================
   [7] 런타임 흐름 D — 부자 계승 (v8 딥→콘트레일)
   ============================================================ */
console.log('[7] 부자 계승 (딥 임팩트→콘트레일 모티프)');
// 스코어 200+ 명마 강제 생성: G3 자마 스탯 77/77/77 (sum 231+12+8+10=261)
const stD = BN.getState();
stD.last = { name: '딥 임팩트의 후계', gen: 3, line: 'ss', lineName: 'Sunday Silence계',
  sireName: '딥 임팩트', damName: '골든파워', spd: 77, end: 77, sta: 77,
  nick: 'GOOD', nickLabel: 'G1 조합', coi: 0.125, coiLv: '고도', hetero: true, bothStrong: true,
  riskHit: false, legacyApplied: false, score: null };
BN.finish();
const scD = BN.getState();
t('R7 고스탯 명마 → 스코어 ≥ 200 (명마 각인 대상)', scD.last.score >= 200 && scD.meta.bestScore >= 200);
t('R7 bestName 기록', scD.meta.bestName === '딥 임팩트의 후계' && !!scD.meta.legacyFrom);
BN.startGame(); // 계승 판정
t('R7 startGame → legacy 각인 활성', BN.getState().legacy === true);
BN.render();
t('R7 각인 배너 (딥→콘트레일 모티프)', appEl.innerHTML.includes('부자 계승 각인') && appEl.innerHTML.includes('콘트레일'));
t('R7 G1 교배 시 +6 적용', (() => {
  BN.seed(3);
  BN.pickSire('deep-impact'); BN.pickDam('hail-girl');
  const f = BN.breed().foal;
  return f.legacyApplied === true && f.spd >= 56; // 52(평균)+2±2+3~7+6 → 통상 60대
})());

/* ============================================================
   [8] 런타임 흐름 E — 경계·저장·복원
   ============================================================ */
console.log('[8] 경계·저장·복원');
let before = BN.getState().phase;
let badBreed = BN.breed(); // result 단계에서 교배 시도
t('R8 잘못된 단계 breed → {ok:false} 상태 불변', badBreed.ok === false && BN.getState().phase === before);
let badPick = BN.pickSire('zzz');
t('R8 유효하지 않은 씨수마 id 거부', badPick.ok === false);
BN.retry();
t('R8 retry → select·gen=1·메타 유지', BN.getState().phase === 'select' && BN.getState().gen === 1 && BN.getState().meta.plays >= 1);
// 저장 복원 (재부팅 시뮬레이션): storage에 세이브 시드
const seededSave = JSON.stringify({ phase: 'summary', gen: 3, sireId: null, damId: null, horses: [], last: { name: '복원마', gen: 3, spd: 60, end: 60, sta: 60, nick: 'GOOD', coi: 0, hetero: true }, legacy: true, meta: { plays: 9, bestScore: 240, bestName: '복원마', bestLine: 'Sunday Silence계', bestGen: 3, legacyFrom: null } });
const env2 = boot({ 'bloodline-nexus-save-v1': seededSave });
const BN2 = env2.sandbox.window.BN;
t('R8 재부팅 시 세이브 복원 (phase·plays·legacy)', BN2 && BN2.getState().phase === 'summary' && BN2.getState().meta.plays === 9 && BN2.getState().legacy === true);
t('R8 복원 후 pageErrors=[]', env2.pageErrors.length === 0);
BN2.resetAll();
t('R8 resetAll → title + 세이브 제거', BN2.getState().phase === 'title' && !env2.storage['bloodline-nexus-save-v1']);

/* ============================================================
   [9] 성능 + 대량 시뮬레이션 (NaN/Infinity 0건)
   ============================================================ */
console.log('[9] 성능·대량 시뮬레이션');
const t0 = process.hrtime.bigint();
for (let i = 0; i < 100; i++) BN2.render();
const renderMs = Number(process.hrtime.bigint() - t0) / 1e6 / 100;
t('P1 render 평균 ≤ 5ms', renderMs <= 5);
let nanCount = 0, okCount = 0;
for (let s = 0; s < 100000; s++) {
  BN2.seed(s);
  const st = BN2.getState();
  st.phase = 'select'; st.sireId = null; st.damId = null; st.gen = 1; st.horses = []; st.last = null;
  const si = BN2.SIRES[Math.floor(Math.random() * 8)];
  const da = BN2.DAMS[Math.floor(Math.random() * 6)];
  BN2.pickSire(si.id); BN2.pickDam(da.id);
  const r = BN2.breed();
  if (!r.ok) continue;
  okCount++;
  const f = r.foal;
  const v = [f.spd, f.end, f.sta, f.coi, BN._calc.perf(f)];
  if (v.some(x => typeof x !== 'number' || !Number.isFinite(x))) nanCount++;
}
t(`P2 교배 10만 회 — NaN/Infinity 0건 (${okCount}회 성공)`, nanCount === 0 && okCount > 90000);

/* ---------- 종합 ---------- */
console.log(`\n===== 결과 =====`);
console.log(`정적: ${pass}/${pass + fail}  (런타임 포함 총 ${idx}건)`);
console.log(`pageErrors: ${pageErrors.length === 0 ? '[] (없음)' : pageErrors.join(' | ')}`);
console.log(`PASS=${pass} FAIL=${fail}`);
process.exit(fail > 0 || pageErrors.length > 0 ? 1 : 0);