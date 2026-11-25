'use client';
import * as Accordion from '@radix-ui/react-accordion';
import type { Dict } from '@/content/types';
import { DrawBox } from '@/components/motion/DrawBox';

/** Numbered category boxes; each box's border draws itself in, questions expand inline. */
export function FaqList({ categories }: { categories: Dict['faq']['categories'] }) {
  return (
    <div className="flex flex-col gap-6">
      {categories.map((cat, ci) => (
        <DrawBox key={cat.name} contentClassName="grid lg:grid-cols-[13.75rem_1fr]">
          <div className="border-b border-dotted border-fg p-6 lg:border-b-0 lg:border-r">
            <p className="font-pixel text-[clamp(2.25rem,3.4vw,2.875rem)] leading-none">{String(ci + 1).padStart(2, '0')}</p>
            <h3 className="mt-4 text-h4">{cat.name}</h3>
          </div>
          <Accordion.Root type="multiple" className="px-6">
            {cat.items.map((it, i) => (
              <Accordion.Item key={it.q} value={it.q} className={i < cat.items.length - 1 ? 'border-b border-dotted border-fg' : ''}>
                <Accordion.Header>
                  <Accordion.Trigger className="flex w-full items-center justify-between gap-6 py-5 text-left text-[0.8125rem] sm:text-[0.875rem]">
                    {it.q}
                    <span className="plus" aria-hidden />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="acc-content">
                  <p className="max-w-[var(--container-reading)] pb-5 text-body text-muted">{it.a}</p>
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </DrawBox>
      ))}
    </div>
  );
}
