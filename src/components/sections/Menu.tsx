import { MenuBrowser } from "@/components/sections/MenuBrowser";
import { ButtonLink } from "@/components/ui/Button";
import { Phone } from "@/components/ui/icons";
import { Section, SectionHeading } from "@/components/ui/Section";
import { siteConfig } from "@/data/site";
import { getMenu } from "@/lib/content";

export async function Menu() {
  const { groups, isSample } = await getMenu();

  return (
    <Section id="menu" labelledBy="menu-title" tone="cream">
      <SectionHeading
        id="menu-title"
        eyebrow="Kuchnia polska"
        title="Menu restauracji"
        lead="Sprawdź, co u nas zjesz. Wybierz kategorię, aby szybciej znaleźć swoje ulubione danie."
      />

      <MenuBrowser groups={groups} isSample={isSample} />

      <div className="mt-16 flex flex-col items-start gap-6 border-t border-ink/15 pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-lead max-w-[38ch] text-ink">
          Masz pytanie o danie albo chcesz zamówić? Zadzwoń – chętnie doradzimy.
        </p>
        <ButtonLink
          href={siteConfig.contact.phoneHref}
          icon={<Phone />}
          aria-label={`Zadzwoń i umów: ${siteConfig.contact.phoneDisplay}`}
        >
          Zadzwoń i umów
        </ButtonLink>
      </div>
    </Section>
  );
}
