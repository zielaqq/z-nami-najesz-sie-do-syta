"use client";

import { useEffect, useState } from "react";

import { describeError } from "@/lib/panel-data";
import { getSiteSettings, setWeeklyMenuVisible } from "@/lib/panel-settings";

/** Włącza/wyłącza przycisk „Cały tydzień” przy menu na stronie publicznej. */
export function WeeklyMenuToggle() {
  const [visible, setVisible] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getSiteSettings()
      .then((settings) => {
        if (active) setVisible(settings.weeklyMenuVisible);
      })
      .catch((err) => {
        if (active) setError(describeError(err));
      });
    return () => {
      active = false;
    };
  }, []);

  const toggle = async (next: boolean) => {
    setVisible(next);
    setBusy(true);
    setError(null);
    try {
      await setWeeklyMenuVisible(next);
    } catch (err) {
      setVisible(!next);
      setError(describeError(err));
    } finally {
      setBusy(false);
    }
  };

  if (visible === null) return null;

  return (
    <div className="mt-6">
      <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-sm">
        <input
          type="checkbox"
          checked={visible}
          disabled={busy}
          onChange={(event) => void toggle(event.target.checked)}
          className="size-5 accent-[var(--color-accent)]"
        />
        Pokaż na stronie przycisk „Cały tydzień” (podgląd pon.–niedz., z jutrem włącznie)
      </label>
      {error ? <p className="mt-1 text-sm text-accent-deep">{error}</p> : null}
    </div>
  );
}
