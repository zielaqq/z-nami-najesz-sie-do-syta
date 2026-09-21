"use client";

import { useEffect, useState, type ReactNode } from "react";

import { MenuBrowser, type MenuBrowserGroup } from "@/components/sections/MenuBrowser";
import { ButtonLink } from "@/components/ui/Button";
import { FacebookIcon, Phone } from "@/components/ui/icons";
import { siteConfig } from "@/data/site";
import { dishPhotoUrl, fetchDailyMenu, groupDishes, type Dish } from "@/lib/daily-menu";
import { formatDayLabel, todayInWarsaw } from "@/lib/format";

type State =
  | { status: "loading" }
  | { status: "ready"; day: string; dishes: Dish[] }
  | { status: "error" };

/**
 * „Menu na dziś” – dania wybrane przez klientkę w panelu (/panel), pobierane z bazy przy każdym wejściu
 * na stronę, więc zmiana jest widoczna od razu (bez ponownego budowania strony). Gdy menu na dziś nie jest
 * ustawione albo baza nie odpowiada, nie pokazujemy nieaktualnych dań – tylko uczciwy komunikat i telefon.
 */
export function LiveMenu() {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    const day = todayInWarsaw();
    fetchDailyMenu(day, controller.signal)
      .then((dishes) => setState({ status: "ready", day, dishes }))
      .catch(() => {
        if (!controller.signal.aborted) setState({ status: "error" });
      });
    return () => controller.abort();
  }, []);

  if (state.status === "loading") {
    return (
      <div className="mt-10 lg:mt-14" aria-busy="true">
        <p className="sr-only" role="status">
          Wczytuję dzisiejsze menu…
        </p>
        <ul aria-hidden="true" className="grid gap-4 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((n) => (
            <li key={n} className="h-24 bg-sand/60 motion-safe:animate-pulse sm:h-64" />
          ))}
        </ul>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <Notice title="Nie udało się wczytać dzisiejszego menu">
        Spróbuj odświeżyć stronę. Możesz też zadzwonić – powiemy, co dziś przygotowaliśmy.
      </Notice>
    );
  }

  if (state.dishes.length === 0) {
    return (
      <Notice title="Dzisiejsze menu pojawi się wkrótce">
        Jeszcze go nie ustawiliśmy. Zadzwoń, a powiemy, co dziś przygotowaliśmy, albo zajrzyj na nasz profil.
      </Notice>
    );
  }

  const groups: MenuBrowserGroup[] = groupDishes(state.dishes, "keep").map((group) => ({
    id: group.id,
    label: group.label,
    items: group.dishes.map((dish) => ({
      key: dish.id,
      name: dish.name,
      price: dish.price,
      image: dishPhotoUrl(dish.photo_path),
      remoteImage: true,
      description: dish.description,
    })),
  }));

  return (
    <>
      <p className="mt-8 inline-flex items-center gap-2 border-l-2 border-accent pl-3 text-[0.9375rem] font-medium text-ink">
        <span className="text-mute">Menu na dziś</span>
        <span aria-hidden="true">·</span>
        <span className="first-letter:uppercase">{formatDayLabel(state.day)}</span>
      </p>
      <MenuBrowser groups={groups} isSample={false} />
    </>
  );
}

function Notice({ title, children }: { title: string; children: ReactNode }) {
  const { contact, links } = siteConfig;
  return (
    <div className="mt-10 border border-ink/15 bg-white p-6 sm:p-8 lg:mt-14" role="status">
      <p className="font-serif text-2xl leading-snug text-ink">{title}</p>
      <p className="mt-3 max-w-[52ch] text-ink-soft">{children}</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <ButtonLink
          href={contact.phoneHref}
          icon={<Phone />}
          aria-label={`Zadzwoń: ${contact.phoneDisplay}`}
        >
          Zadzwoń
        </ButtonLink>
        <ButtonLink href={links.facebook} external variant="secondary" icon={<FacebookIcon />}>
          Nasz Facebook
        </ButtonLink>
      </div>
    </div>
  );
}
