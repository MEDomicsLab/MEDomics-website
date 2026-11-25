#!/usr/bin/env node
/**
 * Validates src/content/releases.json (written by scripts/fetch-releases.mjs) against
 * src/content/_schemas/releases.schema.json, and checks what the pages rely on:
 * at least one stable desktop release with a download for each operating system.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const read = (p) => JSON.parse(readFileSync(fileURLToPath(new URL(p, import.meta.url)), 'utf8'));
const schema = read('../../src/content/_schemas/releases.schema.json');
const data = read('../../src/content/releases.json');

const ajv = new Ajv({ allErrors: true, strict: true });
addFormats(ajv);
const validate = ajv.compile(schema);
const problems = [];
if (!validate(data)) {
  for (const e of validate.errors) problems.push(`${e.instancePath || '(root)'} ${e.message}`);
} else {
  // same rule as src/lib/releases.ts → latest: newest stable app release that ships installers
  const stable = data.releases.filter((r) => r.channel === 'app' && r.assets.length > 0 && !r.prerelease);
  if (!stable.length) problems.push('no stable desktop release: the download page and release card would be empty');
  else {
    const latest = stable[0];
    for (const os of ['windows', 'mac', 'linux']) {
      if (!latest.assets.some((a) => a.os === os)) problems.push(`latest release ${latest.tag} has no ${os} download`);
    }
  }
}

if (problems.length) {
  console.error(`[releases] releases.json is not usable:\n  ${problems.join('\n  ')}`);
  process.exit(1);
}
console.log(`[releases] ${data.releases.length} releases valid`);
