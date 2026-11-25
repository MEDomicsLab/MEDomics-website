import type { Dict } from '@/content/types';
import { Section, SplitHeader, Lines } from '@/components/layout/Section';
import { Button } from '@/components/ui/Button';
import { WindowFrame } from '@/components/ui/Shot';
import { GitHubMark } from '@/components/illustrations/GitHubMark';
import { PixelIcon } from '@/components/illustrations/pixel/PixelIcon';
import type { IconName } from '@/components/illustrations/pixel/icons';
import { TreePulses } from '@/components/motion/TreePulses';
import { LogoMark } from '@/components/illustrations/LogoMark';

/** Ecosystem tree inside a browser-window mock, on blue. */
export function OpenSource({ dict, locale }: { dict: Dict; locale: string }) {
  const o = dict.openSource;
  return (
    <Section tone="blue" id="open-source" label={o.title.join(' ')}>
      <SplitHeader title={<Lines lines={o.title} />} intro={o.intro} />
      <div className="container-x mt-12">
        <WindowFrame shadow className="reveal" title="github.com/MEDomicsLab">
          <div className="p-5 sm:p-8 lg:p-10">
            <div className="flex items-center gap-3">
              <LogoMark size={30} />
              <span className="font-pixel text-[clamp(1.25rem,2vw,1.625rem)]">{o.root}</span>
            </div>
            <div className="relative mt-4 ml-[0.875rem]">
              <ul>
                {o.items.map((it, i) => (
                  <li
                    key={it.name}
                    className="relative grid gap-4 overflow-hidden pl-8 pt-6 lg:grid-cols-[16.25rem_1fr] lg:items-center lg:gap-10 lg:pl-12"
                  >
                    {/* trunk: runs the full height of every item but the last, which stops at its branch */}
                    {i < o.items.length - 1 && (
                      <span aria-hidden className="absolute inset-y-0 left-0 border-l border-dashed border-fg lg:border-dotted" />
                    )}
                    <div className="relative flex items-center gap-3">
                      {/* branch, anchored to the icon + title row so it stays on their centre line */}
                      <span
                        aria-hidden
                        data-branch
                        className="absolute right-[calc(100%+0.5rem)] top-1/2 w-6 border-t border-dashed border-fg lg:w-10 lg:border-dotted"
                      />
                      {i === o.items.length - 1 && (
                        <span
                          aria-hidden
                          className="absolute bottom-1/2 left-[-2rem] h-[100vh] border-l border-dashed border-fg lg:left-[-3rem] lg:border-dotted"
                        />
                      )}
                      <PixelIcon name={it.icon as IconName} size={24} />
                      <h3 className="text-h4">{it.name}</h3>
                    </div>
                    <div className="flex flex-col gap-4 border border-fg p-4 sm:flex-row sm:items-center sm:justify-between lg:p-5">
                      <p className="text-body">{it.text}</p>
                      <div className="flex flex-none gap-2">
                        <Button href={it.primary.href} locale={locale} icon={<GitHubMark size={13} />}>
                          {it.primary.label}
                        </Button>
                        {it.secondary && (
                          <Button href={it.secondary.href} locale={locale} variant="secondary">
                            {it.secondary.label}
                          </Button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <TreePulses />
            </div>
          </div>
        </WindowFrame>
      </div>
    </Section>
  );
}
