import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const walk = folder => readdirSync(folder, { withFileTypes: true }).flatMap(entry => {
  const file = join(folder, entry.name);
  return entry.isDirectory() ? walk(file) : [file];
});
const scripts = walk(join(root, 'frontend/js')).filter(file => file.endsWith('.js'));
let failed = 0;
for (const file of scripts) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) {
    failed++;
    console.error(`ERROR ${file}\n${result.stderr}`);
  }
}
if (failed) process.exit(1);
console.log(`OK: ${scripts.length} archivos JavaScript con sintaxis válida.`);
