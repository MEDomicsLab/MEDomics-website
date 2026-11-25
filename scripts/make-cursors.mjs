// Generates the pixel-art cursors (drawn for this site). B = ivory outline, W = blue fill.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const art = {
  default: [
    'B...........',
    'BB..........',
    'BWB.........',
    'BWWB........',
    'BWWWB.......',
    'BWWWWB......',
    'BWWWWWB.....',
    'BWWWWWWB....',
    'BWWWWWWWB...',
    'BWWWWWWWWB..',
    'BWWWWWWWWWB.',
    'BWWWWWWBBBBB',
    'BWWWBWWB....',
    'BWWBBWWB....',
    'BWB..BWWB...',
    'BB...BWWB...',
    'B.....BWWB..',
    '......BWWB..',
    '.......BB...',
  ],
  pointer: [
    '.....BB.........',
    '....BWWB........',
    '....BWWB........',
    '....BWWB........',
    '....BWWBBB......',
    '....BWWBWWBBB...',
    '.BB.BWWBWWBWWBB.',
    'BWWBBWWWWWWWWWWB',
    'BWWWBWWWWWWWWWWB',
    '.BWWWWWWWWWWWWWB',
    '..BWWWWWWWWWWWWB',
    '..BWWWWWWWWWWWB.',
    '...BWWWWWWWWWWB.',
    '....BWWWWWWWWB..',
    '....BWWWWWWWWB..',
    '....BBBBBBBBBB..',
  ],
};
const color = { B: '#F4F2E8', W: '#0755B5' };
for (const [name, rows] of Object.entries(art)) {
  const w = rows[0].length,
    h = rows.length,
    s = 2;
  let rects = '';
  rows.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      if (color[ch]) rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${color[ch]}"/>`;
    }),
  );
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w * s}" height="${h * s}" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">${rects}</svg>`;
  writeFileSync(fileURLToPath(new URL(`../public/cursors/${name}.svg`, import.meta.url)), svg);
}
console.log('cursors written');
