import type { en } from './en';

/** The shape every locale must satisfy: a missing French key fails the build. */
export type Dict = typeof en;
