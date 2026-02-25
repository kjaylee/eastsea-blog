import { spawnSync } from 'node:child_process';

export function runAllTests() {
  return spawnSync(
    'node',
    ['--test', 'tests/unit/*.mjs', 'tests/usecase/*.mjs', 'tests/integration/*.mjs'],
    {
      stdio: 'inherit',
      shell: true,
    },
  );
}

const isDirectRun = process.argv[1]?.endsWith('tests/run-all.mjs') || process.argv[1]?.endsWith('tests\\run-all.mjs');
const isNodeTestRunner = process.argv.includes('--test');

if (isDirectRun && !isNodeTestRunner) {
  const result = runAllTests();
  process.exit(result.status ?? 1);
}
