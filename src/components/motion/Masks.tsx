import { Fragment, type CSSProperties } from 'react';

/**
 * Text split into masks for "rise in" reveals. Renders as plain text visually; the pinned
 * layers scene animates the inner spans (CSS, keyed on data attributes).
 *
 * - `MaskLines`: one mask per explicit line (headlines); `--l` is the line index.
 * - `MaskWords`: one mask per word. The wrapper carries `data-lines`; `indexLines()` measures
 *   the wrapped layout and writes each word's line number to `--l`, so words on the same
 *   line rise together and lines stagger.
 */
export function MaskLines({ lines }: { lines: readonly string[] }) {
  return (
    <>
      {lines.map((l, i) => (
        <span key={i} className="mline-m block">
          <span className="mline block" style={{ '--l': i } as CSSProperties}>
            {l}
          </span>
        </span>
      ))}
    </>
  );
}

export function MaskWords({ text, delay }: { text: string; delay?: number }) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <span data-lines style={delay ? ({ '--d': `${delay}s` } as CSSProperties) : undefined}>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className="mw">
            <span>{w}</span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </span>
  );
}

/** Write each masked word's wrapped-line index to `--l` (call after layout and on resize). */
export function indexLines(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>('[data-lines]').forEach((group) => {
    let line = -1;
    let prev = -Infinity;
    group.querySelectorAll<HTMLElement>('.mw').forEach((w) => {
      const top = w.offsetTop;
      if (top > prev + 2) {
        line++;
        prev = top;
      }
      w.style.setProperty('--l', String(line));
    });
  });
}
