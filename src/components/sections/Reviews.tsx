import { ButtonLink } from "@/components/ui/Button";
import { ArrowUpRight } from "@/components/ui/icons";
import { Section, SectionHeading } from "@/components/ui/Section";
import { siteConfig } from "@/data/site";

/**
 * Opinie. Na razie bez pobierania opinii z Google (Places API wymaga płatnych rozliczeń w Google Cloud), więc sekcja
 * pokazuje wyraźnie oznaczone placeholdery i przycisk do wizytówki Google. ŻADNYCH wymyślonych opinii.
 * Plan: własne „Opinie naszych gości” dodawane w panelu (patrz docs/GOOGLE-OPINIE.md).
 */
export function Reviews() {
  const googleUrl = siteConfig.links.googleMaps;

  return (
    <Section id="opinie" labelledBy="reviews-title" tone="paper">
      <SectionHeading
        id="reviews-title"
        eyebrow="Opinie"
        title="Goście o nas"
        lead="Sprawdź, co o nas piszą goście w Google."
        titleWidth="max-w-[14ch]"
      />

      <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-4">
          <p className="text-ink-soft">
            Ocena i najnowsze opinie pojawią się tutaj – tymczasem przeczytasz je w wizytówce Google.
          </p>
          <ButtonLink href={googleUrl} external variant="secondary" icon={<ArrowUpRight />} className="mt-8 w-full sm:w-auto">
            Zobacz opinie w Google
          </ButtonLink>
        </div>

        <ul className="grid gap-5 md:grid-cols-3 lg:col-span-8">
          {[0, 1, 2].map((key) => (
            <li key={key} className="border border-dashed border-ink/35 p-6">
              <p className="eyebrow !text-mute">Dane do podłączenia</p>
              <p className="mt-3 text-sm text-mute">Tu pojawi się opinia gościa.</p>
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
    </Section>
  );
}
