import localFont from 'next/font/local';

export const heading = localFont({
  src: '../fonts/GeneralSans-Regular.woff2',
  variable: '--font-heading-face',
  weight: '400',
  display: 'swap',
  fallback: ['Manrope', 'Arial', 'sans-serif'],
});

export const body = localFont({
  src: '../fonts/Inter-latin.woff2',
  variable: '--font-body-face',
  weight: '100 900',
  display: 'swap',
  fallback: ['Arial', 'sans-serif'],
});

export const pixel = localFont({
  src: '../fonts/GeistPixel-Square.woff2',
  variable: '--font-pixel-face',
  weight: '500',
  display: 'swap',
  preload: false,
  fallback: ['ui-monospace', 'monospace'],
});

export const code = localFont({
  src: '../fonts/GeistMono-Regular.woff2',
  variable: '--font-code-face',
  weight: '400',
  display: 'swap',
  preload: false,
  fallback: ['ui-monospace', 'monospace'],
});

export const fontVars = [heading.variable, body.variable, pixel.variable, code.variable].join(' ');
