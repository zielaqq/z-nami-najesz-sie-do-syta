"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { DishTileGrid } from "@/components/panel/DishTileGrid";
import { NoticeBanner, fieldClass, type PanelNotice } from "@/components/panel/NoticeBanner";
import { WeeklyMenuToggle } from "@/components/panel/WeeklyMenuToggle";
import { buttonClasses } from "@/components/ui/Button";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Copy, Search } from "@/components/ui/icons";
import { menuCategories, type MenuCategoryId } from "@/data/menu";
import { cx } from "@/lib/cx";
import { compareByOrder, dishCountLabel, groupDishes, type Dish } from "@/lib/daily-menu";
import { formatDayLabel, shiftDay, todayInWarsaw } from "@/lib/format";
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
import { getMenuCategoryOrder, setMenuCategoryOrder } from "@/lib/panel-settings";

interface TodayEditorProps {
  /** Przejście do zakładki „Baza dań” (gdy baza jest pusta) */
  onOpenLibrary: () => void;
}

/**
 * Menu na dany dzień: kafelki dań w kategoriach. Dotknięcie = „jest dziś” / „nie ma”, a zaznaczone kafelki można
 * przeciągać, co ustawia kolejność na stronie (`DishTileGrid`). Strzałki w górę / w dół przy nazwie kategorii zmieniają
 * kolejność kategorii (na stronie i w panelu).
 * Każda zmiana zapisuje się od razu (bez przycisku „Zapisz”); przy błędzie widok wraca do stanu z bazy.
 */
export function TodayEditor({ onOpenLibrary }: TodayEditorProps) {
  const [day, setDay] = useState(todayInWarsaw);
  const [dishes, setDishes] = useState<Dish[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [categoryOrder, setCategoryOrder] = useState<MenuCategoryId[]>(menuCategories.map((c) => c.id));
  // Wybór jest przypisany do dnia, dla którego go pobrano – zmiana dnia od razu „unieważnia” starą listę.
  const [selection, setSelection] = useState<{ day: string; items: SelectedDish[] } | null>(null);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<PanelNotice | null>(null);
  const [announcement, setAnnouncement] = useState("");
  // Zapisy kolejności idą jeden po drugim, żeby wolniejsza odpowiedź nie nadpisała nowszej zmiany.
  const writeQueue = useRef<Promise<unknown>>(Promise.resolve());
  const pendingFocus = useRef<{ prefix: string; direction: -1 | 1 } | null>(null);
  const pendingTileFocus = useRef<string | null>(null);

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
    getMenuCategoryOrder()
      .then((order) => {
        if (active) setCategoryOrder(order);
      })
      .catch(() => {
        /* zostaje domyślna kolejność z kodu */
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
    return groupDishes(ordered, "keep", categoryOrder);
  }, [items, dishById, categoryOrder]);

  // Po przesunięciu przeglądarka potrafi zgubić fokus (element zmienia miejsce w drzewie) – przywracamy go.
  useLayoutEffect(() => {
    const target = pendingFocus.current;
    if (!target) return;
    pendingFocus.current = null;
    const wanted = document.getElementById(`${target.prefix}-${target.direction}`) as HTMLButtonElement | null;
    const other = document.getElementById(`${target.prefix}-${-target.direction}`) as HTMLButtonElement | null;
    (wanted && !wanted.disabled ? wanted : other)?.focus();
  }, [orderGroups]);

  // Zaznaczony kafelek przechodzi na początek kategorii – bez tego klawiatura traciłaby swoje miejsce.
  useLayoutEffect(() => {
    const id = pendingTileFocus.current;
    if (!id) return;
    pendingTileFocus.current = null;
    document.getElementById(`tile-${id}`)?.focus({ preventScroll: true });
  }, [items]);

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
    if (document.activeElement?.id === `tile-${dish.id}`) pendingTileFocus.current = dish.id;
    apply(!wasOn);
    setNotice(null);
    try {
      await setSelected(day, dish.id, !wasOn, sortOrder);
    } catch (error) {
      apply(wasOn);
      setNotice({ tone: "error", text: describeError(error) });
    }
  };

  /** Zapisuje nową kolejność zaznaczonych dań jednej kategorii (po przeciągnięciu kafelka). */
  const reorderCategory = (categoryId: MenuCategoryId, orderedIds: string[]) => {
    if (!items) return;
    // Cała lista dnia w nowej kolejności (ukryte dania, których panel nie pokazuje, zostają na końcu).
    const full = [
      ...orderGroups.flatMap((candidate) => (candidate.id === categoryId ? orderedIds : candidate.dishes.map((item) => item.id))),
      ...items.map((item) => item.id).filter((id) => !dishById.has(id)),
    ];
    setNotice(null);
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

  /**
   * Przesuwa kategorię o jedno miejsce wśród kategorii widocznych na ekranie (`visible`). Zamieniamy ją z widocznym
   * sąsiadem, bo puste kategorie są ukryte – przesunięcie o nie wyglądałoby tak, jakby strzałka nie działała.
   */
  const moveCategory = (id: MenuCategoryId, direction: -1 | 1, visible: MenuCategoryId[]) => {
    const to = visible.indexOf(id) + direction;
    if (to < 0 || to >= visible.length) return;
    const neighbour = visible[to];
    const next = categoryOrder.map((item) => (item === id ? neighbour : item === neighbour ? id : item));
    const label = menuCategories.find((category) => category.id === id)?.label ?? id;
    setNotice(null);
    setAnnouncement(`Kategoria ${label}: miejsce ${to + 1} z ${visible.length}`);
    pendingFocus.current = { prefix: `category-${id}`, direction };
    setCategoryOrder(next);

    writeQueue.current = writeQueue.current
      .then(() => setMenuCategoryOrder(next))
      .catch(async (error) => {
        setNotice({ tone: "error", text: describeError(error) });
        try {
          setCategoryOrder(await getMenuCategoryOrder());
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
  const matches = (dish: Dish) => !needle || dish.name.toLocaleLowerCase("pl").includes(needle);
  const groups = groupDishes((dishes ?? []).filter(matches), "alphabetical", categoryOrder);
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

      <WeeklyMenuToggle />

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
      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>

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
        <>
          <p className="mt-6 max-w-[60ch] text-ink-soft">
            Dotknij kafelka, żeby dodać danie do menu tego dnia albo je usunąć. Zaznaczone dania stoją na początku kategorii,
            w takiej kolejności jak na stronie. Żeby ją zmienić, przeciągnij kafelek (na telefonie najpierw przytrzymaj go
            chwilę).
          </p>
          {groups.map((group, index) => (
            <section key={group.id} className="mt-10" aria-labelledby={`cat-${group.id}`}>
              <CategoryHeading
                headingId={`cat-${group.id}`}
                categoryId={group.id}
                label={group.label}
                isFirst={index === 0}
                isLast={index === groups.length - 1}
                // Podczas wyszukiwania część kategorii jest odfiltrowana, więc kolejności lepiej wtedy nie zmieniać.
                onMove={needle ? undefined : (direction) => moveCategory(group.id, direction, groups.map((item) => item.id))}
              />
              <DishTileGrid
                contextId={`today-${group.id}`}
                selected={(orderGroups.find((candidate) => candidate.id === group.id)?.dishes ?? []).filter(matches)}
                others={group.dishes.filter((dish) => !ids.has(dish.id))}
                canReorder={!needle}
                onToggle={(dish) => void toggle(dish)}
                onReorder={(orderedIds) => reorderCategory(group.id, orderedIds)}
              />
            </section>
          ))}
        </>
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

/** Nazwa kategorii z kreską pod spodem; po prawej strzałki zmieniające kolejność kategorii. */
function CategoryHeading({
  headingId,
  categoryId,
  label,
  isFirst,
  isLast,
  onMove,
}: {
  headingId: string;
  categoryId: MenuCategoryId;
  label: string;
  isFirst: boolean;
  isLast: boolean;
  /** Brak = bez strzałek (np. podczas wyszukiwania). */
  onMove?: (direction: -1 | 1) => void;
}) {
  return (
    <div className="flex min-h-14 items-end justify-between gap-3 border-b border-ink/25 pb-2">
      <h3 id={headingId} className="font-serif text-xl">
        {label}
      </h3>
      {onMove ? (
        <div className="flex shrink-0 gap-2">
          <ArrowButton
            id={`category-${categoryId}--1`}
            label={`Przesuń kategorię „${label}” w górę`}
            disabled={isFirst}
            onClick={() => onMove(-1)}
            className="w-11"
          >
            <ChevronUp className="size-5" aria-hidden="true" />
          </ArrowButton>
          <ArrowButton
            id={`category-${categoryId}-1`}
            label={`Przesuń kategorię „${label}” w dół`}
            disabled={isLast}
            onClick={() => onMove(1)}
            className="w-11"
          >
            <ChevronDown className="size-5" aria-hidden="true" />
          </ArrowButton>
        </div>
      ) : null}
    </div>
  );
}

function ArrowButton({
  id,
  label,
  disabled,
  onClick,
  className,
  children,
}: {
  id: string;
  label: string;
  disabled: boolean;
  onClick: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      id={id}
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cx(
        "inline-flex h-11 items-center justify-center rounded-[3px] border border-ink/25 text-ink transition-colors hover:border-ink hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-ink/25 disabled:hover:bg-transparent",
        className,
      )}
    >
      {children}
    </button>
  );
}
