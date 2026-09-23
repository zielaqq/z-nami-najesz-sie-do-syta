"use client";

import { useEffect, useState } from "react";

import type { MenuCategoryId } from "@/data/menu";
import { fetchWeekMenu, groupDishes, type Dish } from "@/lib/daily-menu";
import { formatEventDate, formatPrice, mondayOfWeek, shiftDay, todayInWarsaw } from "@/lib/format";
import { useMenuCategoryOrder } from "@/lib/menu-category-order-live";

interface DayEntry {
  day: string;
  dishes: Dish[];
  /** Dziś albo jutro – reszta tygodnia jest jeszcze zakryta (niespodzianka, nie cały plan z góry). */
  revealed: boolean;
  isToday: boolean;
}

type State = { status: "loading" } | { status: "ready"; days: DayEntry[] } | { status: "error" };

/**
 * Podgląd całego tygodnia (poniedziałek–niedziela): widać dni od poniedziałku do jutra włącznie, kolejne dni
 * tego samego tygodnia są jeszcze zakryte, nawet jeśli klientka ustawiła już dla nich menu w panelu –
 * ma to być miła niespodzianka „co będzie dalej”, a nie ujawnienie całego planu z góry.
 */
export function LiveMenuWeek() {
  const categoryOrder = useMenuCategoryOrder();
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    const today = todayInWarsaw();
    const tomorrow = shiftDay(today, 1);
    const monday = mondayOfWeek(today);

    fetchWeekMenu(monday, shiftDay(monday, 6), controller.signal)
      .then((weekDays) => {
        const byDay = new Map(weekDays.map((entry) => [entry.day, entry.dishes]));
        const days: DayEntry[] = Array.from({ length: 7 }, (_, index) => {
          const day = shiftDay(monday, index);
          return { day, dishes: byDay.get(day) ?? [], revealed: day <= tomorrow, isToday: day === today };
        });
        setState({ status: "ready", days });
      })
      .catch(() => {
        if (!controller.signal.aborted) setState({ status: "error" });
      });
    return () => controller.abort();
  }, []);

  if (state.status === "loading") {
    return (
      <ul aria-hidden="true" className="mt-8 grid gap-2">
        {[0, 1, 2, 3, 4, 5, 6].map((n) => (
          <li key={n} className="h-14 bg-sand/60 motion-safe:animate-pulse" />
        ))}
      </ul>
    );
  }

  if (state.status === "error") {
    return <p className="mt-8 text-ink-soft">Nie udało się wczytać planu tygodnia. Spróbuj odświeżyć stronę.</p>;
  }

  return (
    <ul className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
      {state.days.map((entry) => (
        <WeekDayRow key={entry.day} entry={entry} categoryOrder={categoryOrder} />
      ))}
    </ul>
  );
}

function WeekDayRow({ entry, categoryOrder }: { entry: DayEntry; categoryOrder: MenuCategoryId[] }) {
  const date = formatEventDate(entry.day);
  const groups = groupDishes(entry.dishes, "keep", categoryOrder);

  return (
    <li className={`py-6 ${entry.isToday ? "bg-accent/5" : ""}`}>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="font-serif text-xl capitalize text-ink">{date.weekday}</p>
        <p className="tabular text-sm text-mute">
          {date.day} {date.monthShort}
        </p>
        {entry.isToday ? (
          <span className="rounded-[3px] bg-accent px-2 py-0.5 text-[0.6875rem] font-semibold tracking-[0.08em] text-white">
            DZIŚ
          </span>
        ) : null}
      </div>

      <div className="mt-3">
        {!entry.revealed ? (
          <p className="text-sm text-mute">Zobaczysz tutaj jutro.</p>
        ) : groups.length === 0 ? (
          <p className="text-sm text-mute">Menu jeszcze nieustawione.</p>
        ) : (
          <ul className="space-y-1.5">
            {groups.map((group) => (
              <li key={group.id} className="text-sm leading-relaxed">
                <span className="font-semibold text-ink">{group.label}: </span>
                <span className="text-ink-soft">
                  {group.dishes.map((dish, index) => (
                    <span key={dish.id}>
                      {dish.name}
                      {dish.price != null ? <span className="text-mute"> ({formatPrice(dish.price)})</span> : null}
                      {index < group.dishes.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}
