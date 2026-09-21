"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { NoticeBanner, fieldClass, type PanelNotice } from "@/components/panel/NoticeBanner";
import { buttonClasses } from "@/components/ui/Button";
import { Check, ChevronLeft, ChevronRight, Copy, Search, Utensils } from "@/components/ui/icons";
import { isTextOnlyCategory } from "@/data/menu";
import { cx } from "@/lib/cx";
import { compareByOrder, dishCountLabel, dishPhotoUrl, groupDishes, type Dish } from "@/lib/daily-menu";
import { formatDayLabel, formatPrice, shiftDay, todayInWarsaw } from "@/lib/format";
import {
  clearDay,
  copyFromPreviousDay,
  describeError,
  listDishes,
  listSelected,
  saveOrder,
  setSelected,
  type SelectedDish,
} from "@/lib/panel-data";

interface TodayEditorProps {
  /** Przejście do zakładki „Baza dań” (gdy baza jest pusta) */
  onOpenLibrary: () => void;
}

type Mode = "select" | "order";

/**
 * Menu na dany dzień. Dwa widoki:
 *  • „Wybór dań” – kafelki ze zdjęciami, dotknięcie = „jest dziś” / „nie ma”,
 *  • „Kolejność na stronie” – strzałki w lewo / w prawo przesuwają danie w obrębie kategorii.
 * Każda zmiana zapisuje się od razu (bez przycisku „Zapisz”); przy błędzie widok wraca do stanu z bazy.
 */
export function TodayEditor({ onOpenLibrary }: TodayEditorProps) {
  const [day, setDay] = useState(todayInWarsaw);
  const [mode, setMode] = useState<Mode>("select");
  const [dishes, setDishes] = useState<Dish[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  // Wybór jest przypisany do dnia, dla którego go pobrano – zmiana dnia od razu „unieważnia” starą listę.
  const [selection, setSelection] = useState<{ day: string; items: SelectedDish[] } | null>(null);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<PanelNotice | null>(null);
  const [announcement, setAnnouncement] = useState("");
  // Zapisy kolejności idą jeden po drugim, żeby wolniejsza odpowiedź nie nadpisała nowszej zmiany.
  const writeQueue = useRef<Promise<unknown>>(Promise.resolve());
  const pendingFocus = useRef<{ dishId: string; direction: -1 | 1 } | null>(null);

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
      .then((items) => {
        if (active) setSelection({ day, items });
      })
      .catch((error) => {
        if (active) setNotice({ tone: "error", text: describeError(error) });
      });
    return () => {
      active = false;
    };
  }, [day]);

  const items = selection?.day === day ? selection.items : null;
  const ids = useMemo(() => (items ? new Set(items.map((item) => item.id)) : null), [items]);
  const today = todayInWarsaw();
  const dayHint = day === today ? "Dziś" : day === shiftDay(today, 1) ? "Jutro" : day === shiftDay(today, -1) ? "Wczoraj" : "";

  const dishById = useMemo(() => new Map((dishes ?? []).map((dish) => [dish.id, dish])), [dishes]);

  // Dania dnia w kolejności ustawionej przez klientkę, pogrupowane w kategorie.
  const orderGroups = useMemo(() => {
    if (!items) return [];
    const ordered = items
      .flatMap((item) => {
        const dish = dishById.get(item.id);
        return dish ? [{ dish, name: dish.name, sortOrder: item.sortOrder }] : [];
      })
      .sort(compareByOrder)
      .map((entry) => entry.dish);
    return groupDishes(ordered, "keep");
  }, [items, dishById]);

  // Po przesunięciu przeglądarka potrafi zgubić fokus (element zmienia miejsce w drzewie) – przywracamy go.
  useLayoutEffect(() => {
    const target = pendingFocus.current;
    if (!target) return;
    pendingFocus.current = null;
    const wanted = document.getElementById(`order-${target.dishId}-${target.direction}`) as HTMLButtonElement | null;
    const other = document.getElementById(`order-${target.dishId}-${-target.direction}`) as HTMLButtonElement | null;
    (wanted && !wanted.disabled ? wanted : other)?.focus();
  }, [orderGroups]);

  const patchItems = (patch: (current: SelectedDish[]) => SelectedDish[]) =>
    setSelection((current) =>
      current && current.day === day ? { day: current.day, items: patch(current.items) } : current,
    );

  const toggle = async (dish: Dish) => {
    if (!items || !ids) return;
    const wasOn = ids.has(dish.id);
    // Nowe danie ląduje na końcu swojej kategorii.
    const sortOrder = items.reduce((max, item) => Math.max(max, item.sortOrder + 1), 0);
    const apply = (on: boolean) =>
      patchItems((current) =>
        on
          ? current.some((item) => item.id === dish.id)
            ? current
            : [...current, { id: dish.id, sortOrder }]
          : current.filter((item) => item.id !== dish.id),
      );
    apply(!wasOn);
    setNotice(null);
    try {
      await setSelected(day, dish.id, !wasOn, sortOrder);
    } catch (error) {
      apply(wasOn);
      setNotice({ tone: "error", text: describeError(error) });
    }
  };

  const move = (dish: Dish, direction: -1 | 1) => {
    if (!items) return;
    const group = orderGroups.find((candidate) => candidate.id === dish.category);
    if (!group) return;
    const list = group.dishes.map((item) => item.id);
    const from = list.indexOf(dish.id);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= list.length) return;
    [list[from], list[to]] = [list[to], list[from]];

    // Cała lista dnia w nowej kolejności (ukryte dania, których panel nie pokazuje, zostają na końcu).
    const full = [
      ...orderGroups.flatMap((candidate) => (candidate.id === dish.category ? list : candidate.dishes.map((item) => item.id))),
      ...items.map((item) => item.id).filter((id) => !dishById.has(id)),
    ];
    setNotice(null);
    setAnnouncement(`${dish.name}: pozycja ${to + 1} z ${list.length}`);
    pendingFocus.current = { dishId: dish.id, direction };
    setSelection({ day, items: full.map((id, sortOrder) => ({ id, sortOrder })) });

    writeQueue.current = writeQueue.current
      .then(() => saveOrder(day, full))
      .catch(async (error) => {
        setNotice({ tone: "error", text: describeError(error) });
        try {
          const fresh = await listSelected(day);
          setSelection((current) => (current && current.day === day ? { day, items: fresh } : current));
        } catch {
          /* zostaje widok lokalny; komunikat o błędzie już jest */
        }
      });
  };

  const copyPrevious = async () => {
    if (!dishes || !items) return;
    setBusy(true);
    setNotice(null);
    try {
      const result = await copyFromPreviousDay(day, new Set(dishes.map((dish) => dish.id)), items);
      if (!result) {
        setNotice({ tone: "error", text: "Nie znaleziono wcześniejszego menu do skopiowania." });
      } else if (result.added.length === 0) {
        setNotice({ tone: "ok", text: `Wszystkie dania z dnia ${formatDayLabel(result.from)} już tu są.` });
      } else {
        patchItems((current) => [...current, ...result.added]);
        setNotice({
          tone: "ok",
          text: `Skopiowano ${dishCountLabel(result.added.length)} z dnia: ${formatDayLabel(result.from)}.`,
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
      patchItems(() => []);
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

      <div role="group" aria-label="Widok menu" className="mt-6 inline-flex rounded-[3px] border border-ink/25 p-1">
        <ModeButton pressed={mode === "select"} onClick={() => setMode("select")}>
          Wybór dań
        </ModeButton>
        <ModeButton pressed={mode === "order"} onClick={() => setMode("order")}>
          Kolejność na stronie
        </ModeButton>
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

      {mode === "select" ? (
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
      ) : null}

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
      ) : mode === "order" ? (
        orderGroups.length === 0 ? (
          <div className="mt-8 border border-ink/15 bg-white p-6">
            <p className="font-serif text-xl">Nie ma jeszcze wybranych dań</p>
            <p className="mt-2 text-ink-soft">Najpierw wybierz dania na ten dzień, potem ułożysz je w kolejności.</p>
            <button type="button" onClick={() => setMode("select")} className={buttonClasses("primary", "md", "mt-5")}>
              Wybierz dania
            </button>
          </div>
        ) : (
          <>
            <p className="mt-6 max-w-[60ch] text-ink-soft">
              Strzałkami przesuń danie w lewo albo w prawo. Na stronie dania układają się od lewej do prawej, rząd po rzędzie
              (na telefonie od góry do dołu). Kolejność dotyczy jednej kategorii – kategorie zawsze idą jedna po drugiej.
            </p>
            <p role="status" aria-live="polite" className="sr-only">
              {announcement}
            </p>
            {orderGroups.map((group) => (
              <section key={group.id} className="mt-10" aria-labelledby={`order-cat-${group.id}`}>
                <h3 id={`order-cat-${group.id}`} className="border-b border-ink/25 pb-2 font-serif text-xl">
                  {group.label}
                </h3>
                <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                  {group.dishes.map((dish, index) => (
                    <li key={dish.id}>
                      <OrderTile
                        dish={dish}
                        position={index + 1}
                        total={group.dishes.length}
                        onMove={(direction) => move(dish, direction)}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </>
        )
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

function ModeButton({ pressed, onClick, children }: { pressed: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cx(
        "min-h-11 rounded-[2px] px-4 text-sm font-semibold transition-colors",
        pressed ? "bg-ink text-cream" : "text-ink hover:bg-ink/5",
      )}
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

/** Kafelek w widoku kolejności: zdjęcie (poza napojami i piwem), numer miejsca i dwie strzałki. */
function OrderTile({
  dish,
  position,
  total,
  onMove,
}: {
  dish: Dish;
  position: number;
  total: number;
  onMove: (direction: -1 | 1) => void;
}) {
  const showsPhoto = !isTextOnlyCategory(dish.category);
  const photo = showsPhoto ? dishPhotoUrl(dish.photo_path) : null;
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[3px] border-2 border-ink/15 bg-white">
      {showsPhoto ? (
        <div className="relative aspect-[4/3] bg-sand">
          {photo ? (
            <Image src={photo} alt="" fill unoptimized sizes="(min-width: 1024px) 240px, (min-width: 640px) 30vw, 45vw" className="object-cover" />
          ) : (
            <span className="absolute inset-0 grid place-items-center text-mute" aria-hidden="true">
              <Utensils className="size-8 opacity-50" />
            </span>
          )}
        </div>
      ) : null}
      <div className="relative px-3 pb-2 pt-2.5">
        <span
          aria-hidden="true"
          className="tabular mb-1.5 inline-grid size-6 place-items-center rounded-full bg-ink text-xs font-semibold text-cream"
        >
          {position}
        </span>
        <p className="font-serif text-[1.0625rem] leading-snug">{dish.name}</p>
        {dish.price != null ? <p className="tabular mt-0.5 text-sm font-semibold text-accent">{formatPrice(dish.price)}</p> : null}
      </div>
      <div className="mt-auto grid grid-cols-2 gap-2 p-3 pt-1">
        <ArrowButton
          id={`order-${dish.id}--1`}
          label={`Przesuń „${dish.name}” w lewo`}
          disabled={position === 1}
          onClick={() => onMove(-1)}
        >
          <ChevronLeft className="size-6" aria-hidden="true" />
        </ArrowButton>
        <ArrowButton
          id={`order-${dish.id}-1`}
          label={`Przesuń „${dish.name}” w prawo`}
          disabled={position === total}
          onClick={() => onMove(1)}
        >
          <ChevronRight className="size-6" aria-hidden="true" />
        </ArrowButton>
      </div>
    </div>
  );
}

function ArrowButton({
  id,
  label,
  disabled,
  onClick,
  children,
}: {
  id: string;
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      id={id}
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-11 items-center justify-center rounded-[3px] border border-ink/25 text-ink transition-colors hover:border-ink hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-ink/25 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}
