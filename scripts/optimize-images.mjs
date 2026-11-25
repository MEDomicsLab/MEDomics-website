// Processes ../media into public/images (AVIF + WebP at 1x/2x) and writes a manifest.
// Originals are never modified. Personal details are masked; legacy title bars are cropped.
import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const MEDIA = fileURLToPath(new URL('../../media/', import.meta.url));
const OUT = fileURLToPath(new URL('../public/images/', import.meta.url));
const MANIFEST = fileURLToPath(new URL('../src/content/images.json', import.meta.url));
mkdirSync(OUT, { recursive: true });

/** The home screenshot shows a personal workspace path: replace it with a neutral one. */
async function maskHome(input) {
  const { width, height } = await sharp(input).metadata();
  const overlay = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <rect x="1395" y="1240" width="560" height="70" fill="#ffffff"/>
    <text x="1404" y="1291" font-family="Arial, Helvetica, sans-serif" font-size="43" fill="#222222">~/MEDomics/workspace</text>
  </svg>`);
  return sharp(input)
    .composite([{ input: overlay }])
    .png()
    .toBuffer();
}

const jobs = [
  {
    name: 'home',
    file: 'MEDomicsHomePage.png',
    prep: maskHome,
    widths: [960, 1920],
    alt: 'MEDomics home screen with the workspace panel and module sidebar',
  },
  {
    name: 'data-table',
    file: 'DataTable.PNG',
    crop: { top: 22 },
    widths: [960, 1920],
    alt: 'Input module data table with coloured column tags',
  },
  {
    name: 'exploratory',
    file: 'ExploratoryModule.png',
    crop: { top: 22 },
    widths: [960, 1918],
    alt: 'Exploratory module with SweetViz, ydata-profiling and D-Tale panels',
  },
  {
    name: 'canvas',
    file: 'InitBox.PNG',
    widths: [548],
    alt: 'Learning module canvas: Dataset, Clean, Split and Model nodes in the Initialization box',
  },
  {
    name: 'guardrail',
    file: 'MisplaceClean.PNG',
    scale: 2,
    widths: [722],
    alt: 'A Clean node misplaced in the Training box turns the box red',
  },
  {
    name: 'results-analysis',
    file: 'ResultsAnalysis.PNG',
    widths: [1099],
    alt: 'Analysis panel with ROC curves and the Finalize & Save Model and Generate buttons',
  },
  { name: 'notebook', file: 'OpenNotebookIn.png', widths: [700, 1399], alt: 'Opening a generated pipeline notebook in Jupyter or VS Code' },
  { name: 'lab-logo', file: 'lab_logo.png', widths: [320, 640], alt: 'The former MEDomicsLab logo' },
  { name: 'logo', file: 'logo.png', widths: [320, 640], alt: 'MEDomics logo' },
];

const manifest = {};
for (const j of jobs) {
  let img = j.prep ? sharp(await j.prep(MEDIA + j.file)) : sharp(MEDIA + j.file);
  let meta = await img.metadata();
  if (j.crop) {
    img = sharp(
      await img
        .extract({ left: 0, top: j.crop.top, width: meta.width, height: meta.height - j.crop.top })
        .png()
        .toBuffer(),
    );
    meta = await img.metadata();
  }
  if (j.scale) {
    img = sharp(
      await img
        .resize(meta.width * j.scale, meta.height * j.scale, { kernel: 'lanczos3' })
        .png()
        .toBuffer(),
    );
    meta = await img.metadata();
  }
  const buf = await img.png().toBuffer();
  const sources = { avif: [], webp: [] };
  for (const w of j.widths) {
    const width = Math.min(w, meta.width);
    const base = `${j.name}-${width}`;
    await sharp(buf).resize({ width }).avif({ quality: 62, effort: 6 }).toFile(`${OUT}${base}.avif`);
    await sharp(buf).resize({ width }).webp({ quality: 82 }).toFile(`${OUT}${base}.webp`);
    sources.avif.push({ src: `/images/${base}.avif`, w: width });
    sources.webp.push({ src: `/images/${base}.webp`, w: width });
  }
  manifest[j.name] = { width: meta.width, height: meta.height, alt: j.alt, ...sources };
  console.log(`[images] ${j.name} ${meta.width}×${meta.height}`);
}
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));

// Favicon + touch icon from the flat mark.
const mark = (bg) =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-6 -6 112 106">
  ${bg ? `<rect x="-6" y="-6" width="112" height="106" fill="${bg}"/>` : ''}
  <g stroke="#0755B5" stroke-width="4">
    <line x1="49.2" y1="59.2" x2="46.2" y2="12.8"/><line x1="49.2" y1="59.2" x2="12.5" y2="32.2"/>
    <line x1="49.2" y1="59.2" x2="76.3" y2="35.8"/><line x1="49.2" y1="59.2" x2="13.7" y2="78.3"/><line x1="49.2" y1="59.2" x2="87" y2="81.2"/>
  </g>
  <circle cx="46.2" cy="12.8" r="12.2" fill="#2e9e44"/><circle cx="12.5" cy="32.2" r="9.5" fill="#d0383a"/>
  <circle cx="76.3" cy="35.8" r="7.5" fill="#c9a40a"/><circle cx="13.7" cy="78.3" r="12.5" fill="#1f74d1"/>
  <circle cx="87" cy="81.2" r="8.7" fill="#e0581f"/>
  <circle cx="49.2" cy="59.2" r="9.7" fill="#F4F2E8" stroke="#0755B5" stroke-width="4"/>
</svg>`);
const PUB = fileURLToPath(new URL('../public/', import.meta.url));
writeFileSync(`${PUB}favicon.svg`, mark(null));
await sharp(mark('#F4F2E8')).resize(32, 32).png().toFile(`${PUB}favicon-32.png`);
await sharp(mark('#F4F2E8')).resize(180, 180).png().toFile(`${PUB}apple-touch-icon.png`);
console.log('[images] favicon done');
