#!/usr/bin/env node
/**
 * Renders the pixel icons used by the README and the .github documents to docs/assets/icons/*.svg.
 * Site icons come from src/components/illustrations/pixel/icons.ts (Node 24 strips the types);
 * README-only icons are defined below so they never add weight to the site bundle.
 *
 * Usage: node scripts/make-readme-icons.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { icons } from '../src/components/illustrations/pixel/icons.ts';

const OUT = fileURLToPath(new URL('../docs/assets/icons/', import.meta.url));
const INK = '#0755B5'; // the site's blue; readable on GitHub's light and dark themes

/** 12×12 bitmaps ('#' = ink), drawn for the README. */
const extra = {
  terminal: [
    '############',
    '#..........#',
    '############',
    '#..........#',
    '#.#........#',
    '#..#.......#',
    '#...#......#',
    '#..#.......#',
    '#.#..####..#',
    '#..........#',
    '#..........#',
    '############',
  ],
  rocket: [
    '.....##.....',
    '....#..#....',
    '...#....#...',
    '...#.##.#...',
    '...#.##.#...',
    '...#....#...',
    '...#....#...',
    '..##....##..',
    '.#.#....#.#.',
    '.#..####..#.',
    '....#..#....',
    '.....##.....',
  ],
  pr: [
    '.##.....#...',
    '#..#...##...',
    '#..#..#####.',
    '.##....##.#.',
    '.#......#.#.',
    '.#........#.',
    '.#........#.',
    '.#........#.',
    '.##......##.',
    '#..#....#..#',
    '#..#....#..#',
    '.##......##.',
  ],
  scale: [
    '.....##.....',
    '############',
    '.#...##...#.',
    '.#...##...#.',
    '#.#..##..#.#',
    '#.#..##..#.#',
    '###..##..###',
    '.....##.....',
    '.....##.....',
    '.....##.....',
    '...######...',
    '..########..',
  ],
  folder: [
    '............',
    '####........',
    '#..#####....',
    '#......#####',
    '#..........#',
    '############',
    '#..........#',
    '#..........#',
    '#..........#',
    '#..........#',
    '############',
    '............',
  ],
};

/** Same run-merging as <PixelIcon>: one path, crisp at any scale. */
function svg(rows) {
  const w = rows[0].length;
  const h = rows.length;
  let d = '';
  rows.forEach((row, y) => {
    for (let x = 0; x < w; ) {
      if (row[x] !== '#') {
        x++;
        continue;
      }
      let e = x;
      while (e < w && row[e] === '#') e++;
      d += `M${x} ${y}h${e - x}v1h-${e - x}z`;
      x = e;
    }
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w * 2}" height="${h * 2}" shape-rendering="crispEdges"><path fill="${INK}" d="${d}"/></svg>\n`;
}

const wanted = {
  ...extra,
  book: icons.book,
  flask: icons.flask,
  shield: icons.shield,
  download: icons.download,
  nodes: icons.nodes,
  table: icons.table,

  network: icons.network,
};
await mkdir(OUT, { recursive: true });
for (const [name, rows] of Object.entries(wanted)) await writeFile(`${OUT}${name}.svg`, svg(rows));
console.log(`[readme-icons] ${Object.keys(wanted).length} icons written to docs/assets/icons/`);
