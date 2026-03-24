const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadStripeCompute() {
  const toolRoot = path.resolve(__dirname, '..');
  const html = fs.readFileSync(path.join(toolRoot, 'index.html'), 'utf8');
  const startMarker = '<!-- TESTABLE_COMPUTE_START -->';
  const endMarker = '// TESTABLE_COMPUTE_END';
  const start = html.indexOf(startMarker);
  const end = html.indexOf(endMarker);

  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Unable to locate TESTABLE_COMPUTE markers in stripe-fee-calculator/index.html');
  }

  let source = html.slice(start + startMarker.length, end + endMarker.length);
  source = source.replace(/<script>/, '').trim();

  const context = {
    module: { exports: {} },
    exports: {},
    console,
    Math,
  };

  vm.createContext(context);
  vm.runInContext(`${source}\nmodule.exports = { RATES, computeForward, computeReverse };`, context);
  return context.module.exports;
}

module.exports = { loadStripeCompute };
