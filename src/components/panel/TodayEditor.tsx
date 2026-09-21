"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

import { NoticeBanner, fieldClass, type PanelNotice } from "@/components/panel/NoticeBanner";
import { buttonClasses } from "@/components/ui/Button";
import { Check, ChevronLeft, ChevronRight, Copy, Search, Utensils } from "@/components/ui/icons";
import { cx } from "@/lib/cx";
import { dishCountLabel, dishPhotoUrl, groupDishes, type Dish } from "@/lib/daily-menu";
import { formatDayLabel, formatPrice, shiftDay, todayInWarsaw } from "@/lib/format";
import {
  clearDay,
  copyFromPreviousDay,
  describeError,
  listDishes,
  listSelected,
  setSelected,
} from "@/lib/panel-data";

interface TodayEditorProps {
  /** Przejście do zakładki „Baza dań” (gdy baza jest pusta) */
  onOpenLibrary: () => void;
}

/**
 * Wybór dań na dany dzień: kafelki ze zdjęciami, dotknięcie = „jest dziś” / „nie ma”.
 * Każde dotknięcie zapisuje się od razu (bez przycisku „Zapisz”); przy błędzie kafelek wraca do poprzedniego stanu.
 */
export function TodayEditor({ onOpenLibrary }: TodayEditorProps) {
  const [day, setDay] = useState(todayInWarsaw);
  const [dishes, setDishes] = useState<Dish[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  // Wybór jest przypisany do dnia, dla którego go pobrano – zmiana dnia od razu „unieważnia” starą listę.
  const [selection, setSelection] = useState<{ day: string; ids: Set<string> } | null>(null);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<PanelNotice | null>(null);

  useEffect(() => {
    let active = true;
    listDishes(false)
      .then((list) => {
        if (active) setDishes(list);
      })
      .catch(() => {
        if (active) setLoadError(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    listSelected(day)
      .then((ids) => {
        if (active) setSelection({ day, ids: new Set(ids) });
      })
      .catch((error) => {
        if (active) setNotice({ tone: "error", text: describeError(error) });
      });
    return () => {
      active = false;
    };
  }, [day]);

  const ids = selection?.day === day ? selection.ids : null;
  const today = todayInWarsaw();
  const dayHint = day === today ? "Dziś" : day === shiftDay(today, 1) ? "Jutro" : day === shiftDay(today, -1) ? "Wczoraj" : "";

  const patchSelection = (patch: (current: Set<string>) => Set<string>) =>
    setSelection((current) =>
      current && current.day === day ? { day: current.day, ids: patch(current.ids) } : current,
    );

  const toggle = async (dish: Dish) => {
    if (!ids) return;
    const wasOn = ids.has(dish.id);
    const apply = (on: boolean) =>
      patchSelection((current) => {
        const next = new Set(current);
        if (on) next.add(dish.id);
        else next.delete(dish.id);
        return next;
      });
    apply(!wasOn);
    setNotice(null);
    try {
      await setSelected(day, dish.id, !wasOn);
    } catch (error) {
      apply(wasOn);
      setNotice({ tone: "error", text: describeError(error) });
    }
  };

  const copyPrevious = async () => {
    if (!dishes) return;
    setBusy(true);
    setNotice(null);
    try {
      const result = await copyFromPreviousDay(day, new Set(dishes.map((dish) => dish.id)));
      if (!result) {
        setNotice({ tone: "error", text: "Nie znaleziono wcześniejszego menu do skopiowania." });
      } else {
        patchSelection((current) => new Set([...current, ...result.ids]));
        setNotice({
          tone: "ok",
          text: `Skopiowano ${dishCountLabel(result.ids.length)} z dnia: ${formatDayLabel(result.from)}.`,
        });
      }
    } catch (error) {
      setNotice({ tone: "error", text: describeError(error) });
    } finally {
      setBusy(false);
    }
  };

  const clear = async () => {
    if (!window.confirm("Wyczyścić wybór dań na ten dzień?")) return;
    setBusy(true);
    setNotice(null);
    try {
      await clearDay(day);
      patchSelection(() => new Set());
    } catch (error) {
      setNotice({ tone: "error", text: describeError(error) });
    } finally {
      setBusy(false);
    }
  };

  const needle = query.trim().toLocaleLowerCase("pl");
  const groups = groupDishes((dishes ?? []).filter((dish) => !needle || dish.name.toLocaleLowerCase("pl").includes(needle)));
  const count = ids?.size ?? 0;

  return (
    <section aria-labelledby="today-title">
      <h2 id="today-title" className="sr-only">
        Menu na wybrany dzień
      </h2>

      <div className="flex items-center gap-2 sm:gap-4">
        <DayButton label="Poprzedni dzień" onClick={() => setDay(shiftDay(day, -1))}>
          <ChevronLeft className="size-6" aria-hidden="true" />
        </DayButton>
        <div className="min-w-0 flex-1 text-center sm:flex-none sm:text-left">
          <p className="font-serif text-2xl leading-tight first-letter:uppercase sm:text-3xl">{formatDayLabel(day)}</p>
          <p className="min-h-5 text-sm text-mute">{dayHint}</p>
        </div>
        <DayButton label="Następny dzień" onClick={() => setDay(shiftDay(day, 1))}>
          <ChevronRight className="size-6" aria-hidden="true" />
        </DayButton>
        {day !== today ? (
          <button type="button" onClick={() => setDay(today)} className={buttonClasses("secondary", "sm", "sm:ml-2")}>
            Dziś
          </button>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void copyPrevious()}
          disabled={!ids || busy}
          className={buttonClasses("secondary", "md", "disabled:opacity-50")}
        >
          <Copy className="size-4" aria-hidden="true" />
          Skopiuj z poprzedniego dnia
        </button>
        <button
          type="button"
          onClick={() => void clear()}
          disabled={!ids || busy || ids.size === 0}
          className={buttonClasses("secondary", "md", "disabled:opacity-50")}
        >
          Wyczyść wybór
        </button>
      </div>

      <NoticeBanner notice={notice} className="mt-4" />

      <label className="relative mt-6 block">
        <span className="sr-only">Szukaj dania</span>
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-mute" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Szukaj dania…"
          className={cx(fieldClass, "mt-0 pl-11")}
        />
      </label>

      {loadError ? (
        <p role="alert" className="mt-8 text-accent-deep">
          Nie udało się wczytać listy dań. Odśwież stronę.
        </p>
      ) : !dishes || !ids ? (
        <p role="status" className="mt-8 text-mute">
          Wczytuję dania…
        </p>
      ) : dishes.length === 0 ? (
        <div className="mt-8 border border-ink/15 bg-white p-6">
          <p className="font-serif text-xl">Baza dań jest jeszcze pusta</p>
          <p className="mt-2 text-ink-soft">Dodaj pierwsze danie ze zdjęciem, a potem wybieraj je tutaj na każdy dzień.</p>
          <button type="button" onClick={onOpenLibrary} className={buttonClasses("primary", "md", "mt-5")}>
            Dodaj pierwsze danie
          </button>
        </div>
      ) : groups.length === 0 ? (
        <p className="mt-8 text-mute">Brak dań pasujących do „{query.trim()}”.</p>
      ) : (
        groups.map((group) => (
          <section key={group.id} className="mt-10" aria-labelledby={`cat-${group.id}`}>
            <h3 id={`cat-${group.id}`} className="border-b border-ink/25 pb-2 font-serif text-xl">
              {group.label}
            </h3>
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {group.dishes.map((dish) => (
                <li key={dish.id}>
                  <DishTile dish={dish} on={ids.has(dish.id)} onToggle={() => void toggle(dish)} />
                </li>
              ))}
            </ul>
          </section>
        ))
      )}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink/15 bg-cream/95 backdrop-blur-md">
        <div className="container-page flex h-16 items-center justify-between gap-3">
          <p aria-live="polite" className="text-sm leading-tight">
            <strong className="tabular text-lg">{ids ? dishCountLabel(count) : "…"}</strong>
            <span className="block text-mute">na ten dzień · zapisuje się samo</span>
          </p>
          <Link href="/#menu" className={buttonClasses("primary", "sm")}>
            Zobacz na stronie
          </Link>
        </div>
      </div>
    </section>
  );
}

function DayButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-flex size-12 shrink-0 items-center justify-center rounded-[3px] border border-ink/25 text-ink transition-colors hover:border-ink hover:bg-ink/5"
    >
      {children}
    </button>
  );
}

function DishTile({ dish, on, onToggle }: { dish: Dish; on: boolean; onToggle: () => void }) {
  const photo = dishPhotoUrl(dish.photo_path);
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onToggle}
      className={cx(
        "group relative block w-full overflow-hidden rounded-[3px] border-2 bg-white text-left transition-colors",
        on ? "border-accent" : "border-ink/15 hover:border-ink/40",
      )}
    >
      <span className="relative block aspect-[4/3] bg-sand">
        {photo ? (
          <Image src={photo} alt="" fill unoptimized sizes="(min-width: 1024px) 240px, (min-width: 640px) 30vw, 45vw" className="object-cover" />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-mute" aria-hidden="true">
            <Utensils className="size-8 opacity-50" />
          </span>
        )}
        <span
          aria-hidden="true"
          className={cx(
            "absolute right-2 top-2 grid size-8 place-items-center rounded-full border-2 transition-colors",
            on ? "border-accent bg-accent text-white" : "border-white/90 bg-ink/35 text-transparent",
          )}
        >
          <Check className="size-5" />
        </span>
      </span>
      <span className="block px-3 pb-3 pt-2.5">
        <span className="block font-serif text-[1.0625rem] leading-snug">{dish.name}</span>
        {dish.price != null ? <span className="tabular mt-0.5 block text-sm font-semibold text-accent">{formatPrice(dish.price)}</span> : null}
        <span className="sr-only">{on ? " – jest w menu na ten dzień" : " – nie ma w menu na ten dzień"}</span>
      </span>
    </button>
  );
}
