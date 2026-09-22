"use client";

import { useOpeningHoursGroups } from "@/lib/opening-hours-live";

interface OpeningHoursListProps {
  /** "contact" = tabela z liniami (sekcja Kontakt), "footer" = luźna lista na ciemnym tle (stopka). */
  variant: "contact" | "footer";
}

/** Godziny otwarcia z panelu (a do czasu wczytania – z kodu), w dwóch wariantach wizualnych. */
export function OpeningHoursList({ variant }: OpeningHoursListProps) {
  const groups = useOpeningHoursGroups();

  if (variant === "footer") {
    return (
      <dl className="mt-5 space-y-4 text-cream/90">
        {groups.map((group) => (
          <div key={group.id}>
            <dt className="text-sm text-on-dark-mute">{group.label}</dt>
            <dd className="tabular">{group.closed ? "Nieczynne" : `${group.opens}–${group.closes}`}</dd>
          </div>
        ))}
      </dl>
    );
  }

  return (
    <dl className="mt-4 divide-y divide-ink/15 border-y border-ink/15">
      {groups.map((group) => (
        <div key={group.id} className="flex items-baseline justify-between gap-4 py-3.5">
          <dt className="text-ink-soft">{group.label}</dt>
          <dd className="tabular font-semibold text-ink">
            {group.closed ? "Nieczynne" : `${group.opens}–${group.closes}`}
          </dd>
        </div>
      ))}
    </dl>
  );
}
