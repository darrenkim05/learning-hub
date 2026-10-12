// npm run check [slug]: runs checks/<slug>.py (SymPy) for every lesson, or one. Needs: pip install sympy
import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const only = process.argv[2];
const files = readdirSync('checks').filter((f) => f.endsWith('.py') && (!only || f === `${only}.py`));
if (!files.length) { console.log('No checks found.'); process.exit(0); }
let failed = 0;
for (const f of files) {
  console.log(`\n== checks/${f}`);
  const r = spawnSync('python3', [`checks/${f}`], { stdio: 'inherit' });
  if (r.status !== 0) failed++;
}
console.log(failed ? `\n${failed} check file(s) FAILED` : '\nAll checks passed');
process.exit(failed ? 1 : 0);
