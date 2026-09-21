import type { CSSProperties } from "react";

import { ButtonLink } from "@/components/ui/Button";
import { Phone } from "@/components/ui/icons";
import { Section, SectionHeading } from "@/components/ui/Section";
import { cateringContent } from "@/data/about";
import { siteConfig } from "@/data/site";

/**
 * Catering i dowóz – wyłącznie kontakt telefoniczny.
 * Celowo brak koszyka, płatności, stref dowozu, minimalnych kwot i cen dostawy
 * (nie są znane) – wszystko ustala się telefonicznie.
 */
export function CateringDelivery() {
  const { eyebrow, title, lead, cards, steps } = cateringContent;

  return (
    <Section id="catering" labelledBy="catering-title" tone="ink">
      <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
        <SectionHeading
          id="catering-title"
          eyebrow={eyebrow}
          title={title}
          lead={lead}
          tone="ink"
          titleWidth="max-w-[15ch]"
          className="lg:col-span-5"
        />

        <div className="grid gap-12 sm:grid-cols-2 sm:gap-0 lg:col-span-7">
          {cards.map((card, index) => (
            <article
              key={card.id}
              className="flex flex-col sm:border-l sm:border-cream/20 sm:px-8 lg:px-10"
              data-reveal
              style={{ "--reveal-delay": `${index * 140}ms` } as CSSProperties}
            >
              <h3 className="text-h3 text-cream">{card.title}</h3>
              <p className="mt-4 flex-1 text-on-dark-mute">{card.text}</p>
              <ButtonLink
                href={siteConfig.contact.phoneHref}
                variant="inverse"
                icon={<Phone />}
                aria-label={card.ariaLabel}
                className="mt-8 w-full sm:min-h-16"
              >
                {card.cta}
              </ButtonLink>
            </article>
          ))}
        </div>
      </div>

      <ol
        className="mt-20 grid gap-8 border-t border-cream/20 pt-10 sm:grid-cols-3 lg:mt-24"
        aria-label="Jak zamówić catering lub dowóz"
      >
        {steps.map((step, index) => (
          <li
            key={step.title}
            className="flex gap-5"
            data-reveal
            style={{ "--reveal-delay": `${index * 110}ms` } as CSSProperties}
          >
            <span aria-hidden="true" className="w-7 shrink-0 font-serif text-4xl leading-none text-accent-on-dark">
              {index + 1}
            </span>
            <div>
              <p className="font-semibold text-cream">{step.title}</p>
              <p className="tabular mt-1 text-on-dark-mute">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
