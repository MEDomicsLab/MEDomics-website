// Next 16 static export writes segment-prefetch payloads as nested folders
// (en/about/__next.$d$locale/about/__PAGE__.txt) while the client router requests the
// flattened name (en/about/__next.$d$locale.about.__PAGE__.txt). Static hosts have no
// rewrites, so we write the flattened aliases next to the nested originals.
import { readdirSync, statSync, copyFileSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = fileURLToPath(new URL('../out', import.meta.url));
let n = 0;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (!statSync(p).isDirectory()) continue;
    if (name.startsWith('__next.')) flatten(dir, p);
    else if (name !== '_next') walk(p);
  }
}

function flatten(routeDir, segDir) {
  const stack = [segDir];
  while (stack.length) {
    const d = stack.pop();
    for (const name of readdirSync(d)) {
      const p = join(d, name);
      if (statSync(p).isDirectory()) {
        stack.push(p);
        continue;
      }
      const alias = join(routeDir, relative(routeDir, p).split(sep).join('.'));
      if (!existsSync(alias)) {
        copyFileSync(p, alias);
        n++;
      }
    }
  }
}

walk(OUT);
console.log(`[postexport] ${n} prefetch aliases written`);
