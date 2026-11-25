'use client';
import { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import type { Dict } from '@/content/types';
import { installers, mb, formatDate, type Release } from '@/lib/release-utils';
import { Button } from '@/components/ui/Button';
import { PixelIcon } from '@/components/illustrations/pixel/PixelIcon';

type OS = 'windows' | 'linux' | 'mac';

/** Version picker + per-OS download cells (data from releases.json, generated at build time). */
export function DownloadCells({ dict, locale, releases }: { dict: Dict; locale: string; releases: Release[] }) {
  const t = dict.download;
  const [tag, setTag] = useState(releases[0]?.tag ?? '');
  const rel = releases.find((r) => r.tag === tag) ?? releases[0];
  if (!rel) return null;
  const ins = installers(rel);

  const cell = (os: OS) => {
    const meta = t.os[os];
    const files = os === 'windows' ? [ins.windows] : os === 'linux' ? [ins.linux] : [ins.macPkg, ins.macDmg];
    const labels = os === 'mac' ? [t.os.mac.button, t.os.mac.button2] : [meta.button];
    return (
      <div key={os} className="flex flex-col bg-bg p-6">
        <h2 className="text-h3">{meta.name}</h2>
        <p className="mt-2 text-[0.8125rem] text-muted">{meta.note}</p>
        <div className="mt-auto flex flex-col gap-2 pt-8">
          {files.map((f, i) =>
            f ? (
              <div key={f.name} className="flex flex-col gap-1">
                <Button
                  href={f.url}
                  locale={locale}
                  variant={i === 0 ? 'primary' : 'secondary'}
                  icon={<PixelIcon name="download" size={12} />}
                  className="w-full"
                  download
                >
                  {labels[i]}
                </Button>
                <span className="font-pixel text-[0.75rem] text-muted">
                  {f.name} · {mb(f.size)}
                </span>
              </div>
            ) : (
              <p key={i} className="border border-dashed border-guide p-3 text-[0.8125rem] text-muted">
                {t.unavailable}
              </p>
            ),
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4">
        <label htmlFor="version" className="font-pixel text-[0.8125rem] uppercase tracking-wider">
          {t.versionLabel}
        </label>
        <div className="relative">
          <select
            id="version"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="h-10 appearance-none border border-fg bg-bg pl-3 pr-9 font-pixel text-[0.875rem] text-fg"
          >
            {releases.map((r, i) => (
              <option key={r.tag} value={r.tag}>
                {r.tag}
                {i === 0 ? ` (${t.latestTag})` : ''} · {formatDate(r.date, locale)}
              </option>
            ))}
          </select>
          <svg
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
            width="10"
            height="10"
            viewBox="0 0 10 10"
            aria-hidden
          >
            <path d="M1.5 3.5 5 7l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </div>
      </div>
      <div className="mt-6 grid gap-px border border-fg bg-fg md:grid-cols-3" aria-live="polite">
        {(['windows', 'linux', 'mac'] as OS[]).map(cell)}
      </div>
    </div>
  );
}

export function InstallTabs({ dict }: { dict: Dict }) {
  const t = dict.download;
  const oses: OS[] = ['windows', 'linux', 'mac'];
  return (
    <Tabs.Root defaultValue="windows">
      <Tabs.List className="flex border-b border-fg" aria-label={t.stepsTitle}>
        {oses.map((os) => (
          <Tabs.Trigger
            key={os}
            value={os}
            className="-mb-px border border-transparent px-5 py-3 text-[0.8125rem] data-[state=active]:border-fg data-[state=active]:border-b-[var(--background)] data-[state=active]:bg-bg"
          >
            {t.os[os].name}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {oses.map((os) => (
        <Tabs.Content key={os} value={os} className="grid gap-px border border-t-0 border-fg bg-fg md:grid-cols-2">
          {(['install', 'uninstall'] as const).map((k) => (
            <div key={k} className="bg-bg p-6">
              <h3 className="text-h4">{k === 'install' ? t.installLabel : t.uninstallLabel}</h3>
              <ol className="mt-4 flex flex-col gap-3">
                {t.steps[os][k].map((s, i) => (
                  <li key={i} className="grid grid-cols-[1.75rem_1fr] gap-2 text-[0.9375rem] leading-6">
                    <span className="font-pixel text-[0.8125rem] leading-6 text-muted">0{i + 1}</span>
                    <span>{s.includes(': sudo') || s.includes('with: sudo') ? renderCode(s) : s}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}

function renderCode(s: string) {
  const [before, cmd] = s.split(/: (?=sudo)/);
  return (
    <>
      {before}: <code className="mt-1 block overflow-x-auto border border-guide px-2 py-1 font-code text-[0.8125rem]">{cmd}</code>
    </>
  );
}
