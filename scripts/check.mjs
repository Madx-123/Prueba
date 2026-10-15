import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
const root = new URL('../', import.meta.url).pathname;
function list(folder) { return readdirSync(folder, { withFileTypes:true }).flatMap(e => e.isDirectory() ? list(join(folder,e.name)) : e.name.endsWith('.js') ? [join(folder,e.name)] : []); }
const files = list(join(root,'js'));
let ok = true;
for (const file of files) { const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(result.status) { ok=false;process.stderr.write(`${file}: ${result.stderr}\n`); } }
console.log(ok ? `✓ Sintaxis válida en ${files.length} archivos JavaScript.` : '✗ Se encontraron errores de sintaxis.');
if(!ok) process.exit(1);
