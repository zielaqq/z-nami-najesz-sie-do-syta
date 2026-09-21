"use client";

import { useState, type ReactNode } from "react";

import { Photo } from "@/components/ui/Photo";
import { Utensils } from "@/components/ui/icons";
import type { MenuCategoryId } from "@/data/menu";
import { cx } from "@/lib/cx";
import { formatPrice } from "@/lib/format";

/** Pozycja menu w formie potrzebnej do wyświetlenia (z pliku z danymi albo z bazy menu). */
export interface MenuBrowserItem {
  key: string;
  name: string;
  /** Brak ceny = cena nie jest wyświetlana */
  price?: number | null;
  /** Brak zdjęcia = neutralny kafelek */
  image?: string | null;
  /** true = zdjęcie spoza folderu `public` (np. z bazy menu) */
  remoteImage?: boolean;
  alt?: string;
  description?: string | null;
}

export interface MenuBrowserGroup {
  id: MenuCategoryId;
  label: string;
  items: MenuBrowserItem[];
}

interface MenuBrowserProps {
  groups: MenuBrowserGroup[];
  /** Menu przykładowe – pokazuje dyskretną informację pod filtrami */
  isSample: boolean;
}

type Filter = "all" | MenuCategoryId;

function pluralizeItems(count: number): string {
  if (count === 1) return "1 pozycja";
  const lastTwo = count % 100;
  const last = count % 10;
  if (last >= 2 && last <= 4 && !(lastTwo >= 12 && lastTwo <= 14)) return `${count} pozycje`;
  return `${count} pozycji`;
}

/**
 * Menu z filtrowaniem kategorii.
 * Mobile: lista z miniaturą 96 px (szybkie skanowanie), pasek kategorii przewijany palcem.
 * Desktop: siatka „zdjęcie na pierwszym planie”. Bez JS wyświetla się całe menu.
 */
export function MenuBrowser({ groups, isSample }: MenuBrowserProps) {
  const [filter, setFilter] = useState<Filter>("all");

  const visibleGroups = filter === "all" ? groups : groups.filter((group) => group.id === filter);
  const visibleCount = visibleGroups.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <div className="mt-10 lg:mt-14">
      <div className="sticky top-[var(--header-h)] z-30 -mx-5 bg-cream/95 px-5 backdrop-blur-md sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10">
        <div
          role="group"
          aria-label="Filtruj menu według kategorii"
          className="no-scrollbar flex gap-2 overflow-x-auto border-b border-ink/10 py-3"
        >
          <FilterChip pressed={filter === "all"} onClick={() => setFilter("all")}>
            Wszystkie
          </FilterChip>
          {groups.map((group) => (
            <FilterChip key={group.id} pressed={filter === group.id} onClick={() => setFilter(group.id)}>
              {group.label}
            </FilterChip>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <p className="text-sm text-mute" aria-live="polite">
          {pluralizeItems(visibleCount)}
          <span className="sr-only">
            {" "}
            w widoku: {filter === "all" ? "wszystkie kategorie" : groups.find((g) => g.id === filter)?.label}
          </span>
        </p>
        {isSample ? (
          <p className="rounded-[3px] border border-accent/30 bg-accent/5 px-3 py-1.5 text-[0.8125rem] font-medium text-accent-deep">
            Menu poglądowe – dania i ceny są przykładowe
          </p>
        ) : null}
      </div>

      <div key={filter} className="menu-swap mt-8 space-y-14 lg:space-y-20">
        {visibleGroups.map((group) => (
          <div key={group.id}>
            <div className="flex items-baseline justify-between gap-4 border-b border-ink/25 pb-3">
              <h3 className="text-h3">{group.label}</h3>
              <span className="tabular text-sm text-mute">{pluralizeItems(group.items.length)}</span>
            </div>
            <ul className="mt-2 grid sm:mt-8 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-10 lg:grid-cols-3 lg:gap-x-10 lg:gap-y-12">
              {group.items.map((item) => (
                <MenuRow key={item.key} item={item} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function FilterChip({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cx(
        "min-h-11 shrink-0 rounded-[3px] border px-4 text-sm font-semibold tracking-[0.02em] whitespace-nowrap transition-colors duration-200",
        pressed
          ? "border-ink bg-ink text-cream"
          : "border-ink/25 bg-transparent text-ink hover:border-ink hover:bg-ink/5",
      )}
    >
      {children}
    </button>
  );
}

function MenuRow({ item }: { item: MenuBrowserItem }) {
  return (
    <li className="group grid grid-cols-[6rem_1fr] items-center gap-4 border-b border-ink/10 py-4 sm:block sm:border-b-0 sm:py-0">
      <div className="zoom-on-hover">
        {item.image ? (
          <Photo
            src={item.image}
            remote={item.remoteImage}
            alt={item.alt ?? item.name}
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 96px"
            ratio="aspect-square sm:aspect-[4/3]"
          />
        ) : (
          <div
            aria-hidden="true"
            className="grid aspect-square place-items-center bg-sand text-mute sm:aspect-[4/3]"
          >
            <Utensils className="size-8 opacity-50" />
          </div>
        )}
      </div>
      <div className="min-w-0 sm:mt-4 sm:border-b sm:border-ink/15 sm:pb-3">
        <div className="flex items-baseline justify-between gap-4">
          <p className="font-serif text-[1.125rem] leading-snug tracking-[-0.005em] text-ink sm:text-[1.25rem]">
            {item.name}
          </p>
          {item.price != null ? (
            <p className="tabular shrink-0 text-[1rem] font-semibold text-accent sm:text-[1.0625rem]">
              {formatPrice(item.price)}
            </p>
          ) : null}
        </div>
        {item.description ? <p className="mt-1 text-sm text-mute">{item.description}</p> : null}
      </div>
    </li>
  );
}
