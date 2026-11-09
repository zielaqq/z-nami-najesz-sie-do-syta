"use client";

import { useState } from "react";

import { LiveMenu } from "@/components/sections/LiveMenu";
import { LiveMenuWeek } from "@/components/sections/LiveMenuWeek";
import { FilterChip } from "@/components/ui/FilterChip";
import type { Dish } from "@/lib/daily-menu";
import { useWeeklyMenuVisible } from "@/lib/site-settings-live";

type Tab = "today" | "week";

interface LiveMenuTabsProps {
  initialDay?: string;
  initialDishes?: Dish[];
}

/**
 * Nad „Menu na dziś” pojawia się przełącznik „Dziś” / „Cały tydzień” tylko wtedy, gdy klientka włączy go w
 * panelu (zakładka „Menu na dziś” → „Pokaż na stronie przycisk «Cały tydzień»”) – bez tego widać tylko dziś,
 * tak jak dotychczas. Widok tygodnia: poniedziałek–niedziela, dni po jutrze są jeszcze zakryte (`LiveMenuWeek`).
 */
export function LiveMenuTabs({ initialDay, initialDishes }: LiveMenuTabsProps) {
  const [tab, setTab] = useState<Tab>("today");
  const weekEnabled = useWeeklyMenuVisible();

  return (
    <div>
      {weekEnabled ? (
        <div role="group" aria-label="Widok menu" className="mt-8 flex gap-2">
          <FilterChip pressed={tab === "today"} onClick={() => setTab("today")}>
            Dziś
          </FilterChip>
          <FilterChip pressed={tab === "week"} onClick={() => setTab("week")}>
            Cały tydzień
          </FilterChip>
        </div>
      ) : null}

      {weekEnabled && tab === "week" ? (
        <LiveMenuWeek />
      ) : (
        <LiveMenu initialDay={initialDay} initialDishes={initialDishes} />
      )}
    </div>
  );
}
