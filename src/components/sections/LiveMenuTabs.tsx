"use client";

import { useState, type ReactNode } from "react";

import { LiveMenu } from "@/components/sections/LiveMenu";
import { LiveMenuWeek } from "@/components/sections/LiveMenuWeek";
import { cx } from "@/lib/cx";
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
          <TabButton pressed={tab === "today"} onClick={() => setTab("today")}>
            Dziś
          </TabButton>
          <TabButton pressed={tab === "week"} onClick={() => setTab("week")}>
            Cały tydzień
          </TabButton>
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

function TabButton({ pressed, onClick, children }: { pressed: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cx(
        "min-h-11 rounded-[3px] border px-4 text-sm font-semibold tracking-[0.02em] transition-colors duration-200",
        pressed
          ? "border-ink bg-ink text-cream"
          : "border-ink/25 bg-transparent text-ink hover:border-ink hover:bg-ink/5",
      )}
    >
      {children}
    </button>
  );
}
