import { ReviewsLive } from "@/components/sections/ReviewsLive";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowUpRight } from "@/components/ui/icons";
import { Section, SectionHeading } from "@/components/ui/Section";
import { siteConfig } from "@/data/site";
import { isGooglePlacesConfigured } from "@/lib/google-places";

/**
 * Opinie z Google.
 *  • Integracja skonfigurowana (GOOGLE_PLACES_API_KEY + GOOGLE_PLACE_ID) → opinie na żywo.
 *  • Niekonfigurowana → wyraźnie oznaczone placeholdery. ŻADNYCH wymyślonych opinii.
 * Instrukcja: docs/GOOGLE-OPINIE.md
 */
export function Reviews() {
  const configured = isGooglePlacesConfigured();
  const googleUrl = siteConfig.links.googleMaps;

  return (
    <Section id="opinie" labelledBy="reviews-title" tone="paper">
      <SectionHeading
        id="reviews-title"
        eyebrow="Opinie"
        title="Goście o nas"
        lead={
          configured
            ? "Prawdziwe opinie naszych gości z Google Maps."
            : "Sprawdź, co o nas piszą goście w Google."
        }
        titleWidth="max-w-[14ch]"
      />

      {configured ? <ReviewsLive googleUrl={googleUrl} /> : <ReviewsPlaceholder googleUrl={googleUrl} />}
    </Section>
  );
}

function ReviewsPlaceholder({ googleUrl }: { googleUrl: string }) {
  return (
    <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-12 lg:gap-14">
      <div className="lg:col-span-4">
        <p className="text-ink-soft">
          Ocena i najnowsze opinie pojawią się tutaj automatycznie – bezpośrednio z wizytówki Google.
        </p>
        <ButtonLink href={googleUrl} external variant="secondary" icon={<ArrowUpRight />} className="mt-8 w-full sm:w-auto">
          Zobacz opinie w Google
        </ButtonLink>
        {process.env.NODE_ENV !== "production" ? (
          <p className="mt-6 border-l-2 border-accent pl-3 text-sm text-mute">
            Tryb deweloperski: integracja z Google nie jest skonfigurowana. Ustaw GOOGLE_PLACES_API_KEY i
            GOOGLE_PLACE_ID – patrz docs/GOOGLE-OPINIE.md.
          </p>
        ) : null}
      </div>

      <ul className="grid gap-5 md:grid-cols-3 lg:col-span-8">
        {[0, 1, 2].map((key) => (
          <li key={key} className="border border-dashed border-ink/35 p-6">
            <p className="eyebrow !text-mute">Dane do podłączenia</p>
            <p className="mt-3 text-sm text-mute">Tu pojawi się opinia z Google.</p>
            <div aria-hidden="true" className="mt-6 space-y-2.5">
              <span className="block h-2.5 w-full bg-sand" />
              <span className="block h-2.5 w-11/12 bg-sand" />
              <span className="block h-2.5 w-2/3 bg-sand" />
            </div>
            <div aria-hidden="true" className="mt-7 flex items-center gap-3">
              <span className="size-9 rounded-full bg-sand" />
              <span className="block h-2.5 w-24 bg-sand" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
