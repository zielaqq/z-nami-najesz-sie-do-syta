"use client";

import { useSyncExternalStore } from "react";

import { cx } from "@/lib/cx";
import { getOpenStatus } from "@/lib/hours";

function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, 60_000);
  return () => window.clearInterval(id);
}

/** Migawka jako tekst – React porównuje wartość, więc nie renderuje bez potrzeby. */
function getSnapshot(): string {
  const status = getOpenStatus();
  return `${status.isOpen ? "1" : "0"}|${status.label}`;
}

const getServerSnapshot = (): string | null => null;

/**
 * „Otwarte teraz · do 20:00” – liczone w przeglądarce, wg czasu w Polsce.
 * Na serwerze i przy pierwszym renderze zajmuje tylko miejsce (bez skoków układu).
 * Bazuje na regularnych godzinach – nie zna świąt (stąd wskazówka o telefonie w sekcji kontakt).
 */
export function OpenStatus({ className }: { className?: string }) {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!snapshot) {
    return <span aria-hidden="true" className={cx("inline-block h-6 w-56 max-w-full", className)} />;
  }

  const [flag, label] = snapshot.split("|");
  const isOpen = flag === "1";

  return (
    <span className={cx("inline-flex items-center gap-2.5", className)}>
      <span
        aria-hidden="true"
        className={cx("size-2.5 shrink-0 rounded-full", isOpen ? "bg-[#3d7a4b]" : "bg-mute")}
      />
      <span>{label}</span>
    </span>
  );
}
