import data from '@/content/releases.json';
import type { Release } from './release-utils';

export * from './release-utils';

const all = (data as { releases: Release[] }).releases;

/** App releases that actually ship installers, newest first. */
export const appReleases = all.filter((r) => r.channel === 'app' && r.assets.length > 0);
export const serverRelease = all.find((r) => r.channel === 'server');
export const clientRelease = all.find((r) => r.channel === 'client');
export const latest = appReleases.find((r) => !r.prerelease) ?? appReleases[0];
