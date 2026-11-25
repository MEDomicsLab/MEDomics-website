import { Section } from '@/components/layout/Section';

/** Full-width split: title and status note on the left (4 of 12 columns), text on the right. */
export function LegalPage({ title, body, note }: { title: string; body: string[]; note: string }) {
  return (
    <Section>
      <div className="container-x grid gap-10 lg:grid-cols-12 lg:gap-0">
        <div className="lg:col-span-4 lg:pr-10">
          <h1 className="text-h1">{title}</h1>
          <p className="mt-6 inline-block border border-dashed border-guide px-3 py-2 font-pixel text-[0.75rem] text-muted">{note}</p>
        </div>
        <div className="flex max-w-[var(--container-reading)] flex-col gap-5 text-[1.0625rem] leading-[1.7] lg:col-span-8 lg:pt-[0.5em]">
          {body.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </div>
    </Section>
  );
}
