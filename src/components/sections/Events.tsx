import type { CSSProperties } from "react";

import { Photo } from "@/components/ui/Photo";
import { Phone } from "@/components/ui/icons";
import { Section, SectionHeading, type SectionTone } from "@/components/ui/Section";
import type { RestaurantEvent } from "@/data/events";
import { siteConfig } from "@/data/site";
import { formatEventDate } from "@/lib/format";

interface EventsProps {
  /** Nadchodzące wydarzenia (z `getUpcomingEvents`). Puste = sekcja się nie wyświetla. */
  events: RestaurantEvent[];
  tone?: SectionTone;
}

/** Sekcja znika całkowicie, gdy nie ma żadnych nadchodzących wydarzeń. */
export function Events({ events, tone = "cream" }: EventsProps) {
  if (events.length === 0) return null;

  return (
    <Section id="wydarzenia" labelledBy="events-title" tone={tone}>
      <SectionHeading
        id="events-title"
        eyebrow="Wydarzenia"
        title="Co u nas się dzieje"
        lead="Muzyka na żywo, degustacje i wydarzenia specjalne – sprawdź najbliższe terminy."
        titleWidth="max-w-[14ch]"
      />

      <ol className="mt-12 divide-y divide-ink/15 border-y border-ink/15 lg:mt-16">
        {events.map((event, index) => {
          const date = formatEventDate(event.date);
          return (
            <li
              key={event.id}
              className="grid gap-5 py-8 sm:grid-cols-[7rem_1fr] sm:gap-10 lg:grid-cols-[8rem_1fr_11rem]"
              data-reveal
              style={{ "--reveal-delay": `${index * 90}ms` } as CSSProperties}
            >
              <div className="flex items-baseline gap-3 sm:block">
                <p aria-hidden="true" className="tabular font-serif text-[3.5rem] leading-none text-ink">
                  {date.day}
                </p>
                <p aria-hidden="true" className="eyebrow sm:mt-2">
                  {date.monthShort}
                </p>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <h3 className="text-h3">{event.title}</h3>
                  {event.demo ? (
                    <span className="rounded-[3px] border border-accent/45 px-2 py-0.5 text-[0.6875rem] font-semibold tracking-[0.14em] text-accent">
                      DEMO
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-mute">
                  <time dateTime={event.date}>
                    {date.weekday}, {date.long}
                  </time>
                  {event.time ? <span> · {event.time}</span> : null}
                </p>
                <p className="mt-3 max-w-[56ch] text-ink-soft">{event.description}</p>
                <a
                  href={siteConfig.contact.phoneHref}
                  aria-label={`Zapytaj o wydarzenie „${event.title}”: ${siteConfig.contact.phoneDisplay}`}
                  className="link-underline mt-4 inline-flex items-center gap-2 py-2 text-sm font-semibold text-ink"
                >
                  <Phone className="size-4 text-accent" aria-hidden="true" />
                  Zapytaj telefonicznie
                </a>
              </div>

              {event.image ? (
                <div className="hidden lg:block">
                  <Photo
                    src={event.image}
                    alt={`Wydarzenie: ${event.title}`}
                    sizes="176px"
                    ratio="aspect-[4/3]"
                  />
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
