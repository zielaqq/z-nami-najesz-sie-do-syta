import { Star } from "lucide-react";

import { cx } from "@/lib/cx";

interface StarsProps {
  /** Ocena 0–5 (może być ułamkowa, np. 4.7) */
  value: number;
  className?: string;
  /** Klasa rozmiaru pojedynczej gwiazdki */
  size?: string;
}

/** Gwiazdki z częściowym wypełnieniem. Dla czytników ekranu: „Ocena 4,7 na 5”. */
export function Stars({ value, className, size = "size-5" }: StarsProps) {
  const clamped = Math.max(0, Math.min(5, value));
  const label = `Ocena ${clamped.toLocaleString("pl-PL", { maximumFractionDigits: 1 })} na 5`;

  const row = (
    <span className="flex">
      {Array.from({ length: 5 }, (_, index) => (
        <Star key={index} className={cx(size, "shrink-0 fill-current stroke-0")} aria-hidden="true" />
      ))}
    </span>
  );

  return (
    <span role="img" aria-label={label} className={cx("relative inline-flex", className)}>
      <span className="text-ink/20" aria-hidden="true">
        {row}
      </span>
      <span
        className="absolute inset-y-0 left-0 overflow-hidden text-accent"
        style={{ width: `${(clamped / 5) * 100}%` }}
        aria-hidden="true"
      >
        {row}
      </span>
    </span>
  );
}
