import type { Dict } from '@/content/types';
import { links } from '@/content/links';
import { fill } from '@/lib/i18n';
import { Section } from '@/components/layout/Section';
import { RollingText } from '@/components/motion/RollingText';
import { Button } from '@/components/ui/Button';
import { WindowFrame } from '@/components/ui/Shot';
import { GitHubMark } from '@/components/illustrations/GitHubMark';
import { PixelIcon } from '@/components/illustrations/pixel/PixelIcon';
import { PixelBoardStrip } from '@/components/illustrations/PixelBoardStrip';
import { PipelineScene } from './PipelineScene';

export function FinalCta({ dict, locale, version }: { dict: Dict; locale: string; version: string }) {
  const f = dict.finalCta;
  const social = [
    { label: f.social.github, href: links.github, icon: 'github' as const },
    { label: f.social.discord, href: links.discord, icon: 'discord' as const },
    { label: f.social.youtube, href: links.youtube, icon: 'youtube' as const },
  ];
  return (
    <Section tone="blue" id="get-started" flush className="pt-[var(--space-section)]" label={f.title.join(' ')}>
      {/* the scene takes the wider column so its app-sized text stays legible */}
      <div className="container-x grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16 [&>*]:min-w-0">
        <div>
          <RollingText lines={f.title} as="h2" trigger="view" className="text-display" />
          <div className="mt-8 flex flex-col gap-2 sm:flex-row">
            <Button href="download" locale={locale} icon={<PixelIcon name="download" size={12} />}>
              {fill(f.primary, { version })}
            </Button>
            <Button href={links.docs} locale={locale} variant="secondary">
              {f.secondary}
            </Button>
          </div>
        </div>
        <WindowFrame title={f.sceneTitle} rounded={false} className="reveal self-start">
          <PipelineScene label={f.sceneLabel} />
        </WindowFrame>
      </div>

      <div className="relative mt-16 lg:mt-24">
        <PixelBoardStrip accents className="h-[7.5rem] w-full text-fg sm:h-[10rem]" />
        <ul className="container-x relative -mt-px grid grid-cols-3 border-t border-guide">
          {social.map((s, i) => (
            <li key={s.label} className={i > 0 ? 'border-l border-guide' : ''}>
              <a href={s.href} target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-4 py-8 sm:py-10">
                <span className="flex size-16 items-center justify-center rounded-full border border-fg transition-transform duration-300 group-hover:-translate-y-1 sm:size-20">
                  {s.icon === 'github' ? <GitHubMark size={30} /> : <PixelIcon name={s.icon} size={30} />}
                </span>
                <span className="lines text-[0.8125rem]">{s.label}</span>
                <span className="sr-only"> {dict.common.external}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
