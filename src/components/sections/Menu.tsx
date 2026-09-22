import { LiveMenuTabs } from "@/components/sections/LiveMenuTabs";
import { MenuBrowser, type MenuBrowserGroup } from "@/components/sections/MenuBrowser";
import { ButtonLink } from "@/components/ui/Button";
import { Phone } from "@/components/ui/icons";
import { Section, SectionHeading } from "@/components/ui/Section";
import { siteConfig } from "@/data/site";
import { fetchDailyMenu, type Dish } from "@/lib/daily-menu";
import { getMenu } from "@/lib/content";
import { todayInWarsaw } from "@/lib/format";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * Menu. Gdy skonfigurowana jest baza (Supabase) – „Menu na dziś” wybrane w panelu klientki (/panel);
 * w przeciwnym razie menu z pliku `src/data/menu.ts` (przykładowe, dopóki nie zostanie zastąpione).
 */
export async function Menu() {
  const live = isSupabaseConfigured;

  let groups: MenuBrowserGroup[] = [];
  let isSample = false;
  let initialDay: string | undefined;
  let initialDishes: Dish[] | undefined;

  if (live) {
    // Wstępne pobranie na serwerze – żeby dzisiejsze menu było widoczne w wygenerowanym HTML od razu (m.in. dla
    // Google), zanim `LiveMenu` doładuje najświeższą wersję w przeglądarce. Błąd tutaj nie psuje strony –
    // bez tego `LiveMenu` i tak pobiera dane sam, tak jak dotychczas.
    initialDay = todayInWarsaw();
    try {
      initialDishes = await fetchDailyMenu(initialDay);
    } catch {
      initialDishes = undefined;
    }
  } else {
    const menu = await getMenu();
    isSample = menu.isSample;
    groups = menu.groups.map((group) => ({
      id: group.id,
      label: group.label,
      items: group.items.map((item) => ({
        key: `${group.id}-${item.name}`,
        name: item.name,
        price: item.price,
        image: item.image,
        alt: item.alt,
        description: item.description,
      })),
    }));
  }

  return (
    <Section id="menu" labelledBy="menu-title" tone="cream">
      <SectionHeading
        id="menu-title"
        eyebrow="Kuchnia polska"
        title={live ? "Menu na dziś" : "Menu restauracji"}
        lead={
          live
            ? "Codziennie przygotowujemy coś innego. Zobacz, co dziś u nas zjesz."
            : "Sprawdź, co u nas zjesz. Wybierz kategorię, aby szybciej znaleźć swoje ulubione danie."
        }
      />

      {live ? (
        <LiveMenuTabs initialDay={initialDay} initialDishes={initialDishes} />
      ) : (
        <MenuBrowser groups={groups} isSample={isSample} />
      )}

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
