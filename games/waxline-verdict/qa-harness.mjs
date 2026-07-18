import { readFileSync } from 'node:fs';
import vm from 'node:vm';

class ClassList {
  constructor() { this.values = new Set(); }
  add(...names) { names.forEach((name) => this.values.add(name)); }
  remove(...names) { names.forEach((name) => this.values.delete(name)); }
  contains(name) { return this.values.has(name); }
}

class Element {
  constructor(id = '') {
    this.id = id;
    this.classList = new ClassList();
    this.children = [];
    this.disabled = false;
    this.textContent = '';
    this.innerHTML = '';
  }
  addEventListener(type, callback) { this[`on${type}`] = callback; }
  appendChild(child) { this.children.push(child); return child; }
  setPointerCapture() {}
  requestFullscreen() { document.fullscreenElement = this; }
  getBoundingClientRect() { return { left: 0, top: 0, width: 390, height: 844 }; }
}

const gradient = { addColorStop() {} };
const drawContext = new Proxy({}, {
  get(target, property) {
    if (property === 'createLinearGradient') return () => gradient;
    if (!(property in target)) target[property] = () => {};
    return target[property];
  },
  set(target, property, value) { target[property] = value; return true; },
});
const elements = new Map();
const getElement = (id) => {
  if (!elements.has(id)) {
    const element = new Element(id);
    if (id === 'game') element.getContext = () => drawContext;
    elements.set(id, element);
  }
  return elements.get(id);
};
const document = {
  fullscreenElement: null,
  documentElement: new Element('html'),
  getElementById: getElement,
  createElement: () => new Element(),
  exitFullscreen() { this.fullscreenElement = null; },
};
const storage = new Map();
const localStorage = {
  getItem: (key) => storage.has(key) ? storage.get(key) : null,
  setItem: (key, value) => storage.set(key, String(value)),
};
const context = {
  console,
  document,
  localStorage,
  location: { search: '?qa=1' },
  performance: { now: () => 0 },
  requestAnimationFrame: () => 1,
  setTimeout: (callback) => { callback(); return 1; },
  addEventListener: () => {},
  URLSearchParams,
  Math,
  Date,
  JSON,
};
context.window = context;
context.globalThis = context;

const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
if (scripts.length !== 1) throw new Error(`Expected one inline script, found ${scripts.length}`);
vm.runInNewContext(scripts[0][1], context, { filename: 'index.html' });
const result = context.window.__qaResult;
if (!result?.pass) {
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}
const api = context.window.__waxlineTest;
api.start();
const contour = api.validContour();
const gameCanvas = getElement('game');
const pointerEvent = (point) => ({
  clientX: point.x,
  clientY: point.y,
  pointerId: 1,
});
gameCanvas.onpointerdown(pointerEvent(contour[0]));
for (const point of contour.slice(1, -1)) gameCanvas.onpointermove(pointerEvent(point));
gameCanvas.onpointerup(pointerEvent(contour.at(-1)));
const pointerSnapshot = api.snapshot();
if (pointerSnapshot.mode !== 'feedback' || pointerSnapshot.line.points.length < 9) {
  console.error(JSON.stringify({
    pass: false,
    pointerSnapshot,
    error: 'actual-pointer-chain',
  }, null, 2));
  process.exit(1);
}
console.log(`WAXLINE_QA_PASS ${result.checks.length} checks`);
for (const check of result.checks) console.log(`PASS ${check.name}`);
console.log(`PASS actual-pointer-chain points=${pointerSnapshot.line.points.length} verdict=${pointerSnapshot.stateMessage}`);
