import type { ReactNode } from "react";

import { cx } from "@/lib/cx";

/** Przycisk-filtr (kategorie menu i galerii, „Dziś / Cały tydzień”). */
export function FilterChip({
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
