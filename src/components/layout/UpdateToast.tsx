'use client';
import { useEffect, useState } from 'react';
import type { Dict } from '@/content/types';
import { fill } from '@/lib/i18n';
import { Button } from '@/components/ui/Button';

const FRESH_DAYS = 90;

/**
 * "New release" card (the reference's cookie-banner pattern, reused because the site sets
 * no cookies). Appears only while the latest release is under 90 days old, once per version.
 */
export function UpdateToast({ dict, locale, version, date }: { dict: Dict; locale: string; version: string; date: string }) {
  const [show, setShow] = useState(false);
  const key = `md-toast-${version}`;

  useEffect(() => {
    const age = (Date.now() - new Date(date).getTime()) / 86400000;
    if (age > FRESH_DAYS) return;
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(key) === '1';
    } catch {}
    if (dismissed) return;
    const t = window.setTimeout(() => setShow(true), 2500);
    return () => clearTimeout(t);
  }, [date, key]);

  if (!show) return null;
  const close = () => {
    try {
      localStorage.setItem(key, '1');
    } catch {}
    setShow(false);
  };
  const t = dict.toast;
  return (
    <div
      role="dialog"
      aria-labelledby="toast-title"
      className="toast-in fixed inset-x-4 bottom-4 z-40 border border-fg bg-bg text-fg sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[27.5rem]"
    >
      <div className="p-5">
        <p id="toast-title" className="font-heading text-h4">
          {fill(t.title, { version })}
        </p>
        <p className="mt-2 text-[0.9375rem] leading-6">{t.text}</p>
      </div>
      <div className="flex gap-2 border-t border-fg bg-ivory-2 p-4">
        <Button href="download" locale={locale}>
          {t.primary}
        </Button>
        <button type="button" onClick={close} className="btn btn-secondary">
          <span className="btn-label">{t.secondary}</span>
        </button>
      </div>
    </div>
  );
}
