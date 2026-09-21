import { MapEmbed } from "@/components/sections/MapEmbed";
import { ButtonLink } from "@/components/ui/Button";
import { MapPin, Navigation, Phone } from "@/components/ui/icons";
import { OpenStatus } from "@/components/ui/OpenStatus";
import { Section, SectionHeading, type SectionTone } from "@/components/ui/Section";
import { openingHours, siteConfig } from "@/data/site";
import { directionsUrl, getMapEmbedUrl } from "@/lib/maps";

export function Contact({ tone = "cream" }: { tone?: SectionTone }) {
  const { contact, address, name } = siteConfig;

  return (
    <Section id="kontakt" labelledBy="contact-title" tone={tone}>
      <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <SectionHeading
            id="contact-title"
            eyebrow="Kontakt"
            title="Zadzwoń i ustal szczegóły"
            lead="Wszystko ustalamy telefonicznie. Zadzwoń, jeśli chcesz umówić wizytę, zamówić catering albo zapytać o dowóz."
            titleWidth="max-w-[13ch]"
          />

          <address className="mt-10 not-italic" data-reveal>
            <p className="font-semibold text-ink">{name}</p>
            <p className="mt-3 flex items-start gap-3 text-ink-soft">
              <MapPin className="mt-1 size-5 shrink-0 text-accent" aria-hidden="true" />
              <span>
                {address.street}
                <br />
                {address.postalCode} {address.city}
              </span>
            </p>
            <p className="mt-5 flex items-center gap-3">
              <Phone className="size-5 shrink-0 text-accent" aria-hidden="true" />
              <a
                href={contact.phoneHref}
                className="tabular link-underline font-serif text-[2.25rem] leading-none tracking-tight text-ink sm:text-[2.5rem]"
              >
                {contact.phoneDisplay}
              </a>
            </p>
          </address>

          <div className="mt-10" data-reveal>
            <h3 className="eyebrow">Godziny otwarcia</h3>
            <dl className="mt-4 divide-y divide-ink/15 border-y border-ink/15">
              {openingHours.map((rule) => (
                <div key={rule.id} className="flex items-baseline justify-between gap-4 py-3.5">
                  <dt className="text-ink-soft">{rule.label}</dt>
                  <dd className="tabular font-semibold text-ink">
                    {rule.opens}–{rule.closes}
                  </dd>
                </div>
              ))}
            </dl>
            <OpenStatus className="mt-4 text-[0.9375rem] font-medium text-ink" />
            <p className="mt-3 text-sm text-mute">
              Przed wizytą w święta lub z większą grupą zadzwoń i potwierdź szczegóły.
            </p>
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row" data-reveal>
            <ButtonLink
              href={contact.phoneHref}
              size="lg"
              icon={<Phone />}
              aria-label={`Zadzwoń i umów: ${contact.phoneDisplay}`}
            >
              Zadzwoń i umów
            </ButtonLink>
            <ButtonLink href={directionsUrl} external variant="secondary" size="lg" icon={<Navigation />}>
              Wyznacz trasę
            </ButtonLink>
          </div>
        </div>

        <div className="lg:col-span-7">
          <MapEmbed
            src={getMapEmbedUrl()}
            street={address.street}
            locality={`${address.postalCode} ${address.city}`}
            title={`Mapa dojazdu do restauracji ${name}`}
            loadOnClick={siteConfig.embeds.loadOnClick}
          />
        </div>
      </div>
    </Section>
  );
}
