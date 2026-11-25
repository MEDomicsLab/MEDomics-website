'use client';
/**
 * Loaded on demand (dynamic import) by the desktop pinned scene only, so mobile and
 * reduced-motion visitors never download GSAP.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(ScrollTrigger, CustomEase);
CustomEase.create('roll', '0.32,0,0.16,1');
CustomEase.create('trace', '0.65,0,0.35,1');
CustomEase.create('settle', '0.22,1,0.36,1');

export { gsap, ScrollTrigger };
