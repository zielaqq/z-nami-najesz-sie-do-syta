import type { CSSProperties } from "react";

import { Photo } from "@/components/ui/Photo";
import { Section, SectionHeading } from "@/components/ui/Section";
import { aboutContent } from "@/data/about";

export function About() {
  const { eyebrow, title, lead, body, values, photoAlt, photoAlt2 } = aboutContent;

  return (
    <Section id="o-nas" labelledBy="about-title" tone="paper">
      <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-6 xl:col-span-5">
          <SectionHeading id="about-title" eyebrow={eyebrow} title={title} lead={lead} titleWidth="max-w-[16ch]" />
          <p className="mt-6 max-w-[54ch] text-ink-soft" data-reveal style={{ "--reveal-delay": "120ms" } as CSSProperties}>
            {body}
          </p>
        </div>

        <div className="relative pb-12 lg:col-span-6 xl:col-span-7" data-reveal>
          <div className="ml-auto w-[80%] lg:w-[72%]">
            <div className="zoom-on-hover">
              <Photo
                src="/images/about/about-1.jpg"
                alt={photoAlt}
                sizes="(min-width: 1280px) 40vw, (min-width: 1024px) 45vw, 80vw"
                ratio="aspect-[4/5]"
              />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-[52%] border-[6px] border-paper lg:w-[46%]">
            <div className="zoom-on-hover">
              <Photo
                src="/images/about/about-2.jpg"
                alt={photoAlt2}
                sizes="(min-width: 1024px) 24vw, 50vw"
                ratio="aspect-[4/3]"
              />
            </div>
          </div>
        </div>
      </div>

      <ul className="mt-14 grid gap-x-10 gap-y-10 sm:mt-20 sm:grid-cols-2 lg:mt-24 lg:grid-cols-3" aria-label="Za co nas cenią goście">
        {values.map((value, index) => (
          <li
            key={value.title}
            className="border-t border-ink/25 pt-5"
            data-reveal
            style={{ "--reveal-delay": `${(index % 3) * 100}ms` } as CSSProperties}
          >
            <span aria-hidden="true" className="tabular text-sm font-semibold text-accent">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="text-h3 mt-3">{value.title}</h3>
            <p className="mt-2 max-w-[34ch] text-ink-soft">{value.text}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
