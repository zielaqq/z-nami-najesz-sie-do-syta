"use client";

import { useEffect, useState } from "react";

import { NoticeBanner, fieldClass, type PanelNotice } from "@/components/panel/NoticeBanner";
import { buttonClasses } from "@/components/ui/Button";
import { cx } from "@/lib/cx";
import { DAY_LABELS, WEEKDAY_ORDER, type OpeningHoursRow } from "@/lib/opening-hours-live";
import { describeError } from "@/lib/panel-data";
import { listOpeningHours, saveOpeningHours } from "@/lib/panel-opening-hours";

/**
 * Godziny otwarcia (7 dni tygodnia): odznaczenie dnia pokazuje go jako nieczynny (np. święto, dzień wolny),
 * bez usuwania wiersza – każdy dzień zawsze ma swoje godziny zapisane, gotowe do włączenia z powrotem.
 */
export function OpeningHoursManager() {
  const [rows, setRows] = useState<OpeningHoursRow[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<PanelNotice | null>(null);

  useEffect(() => {
    let active = true;
    listOpeningHours()
      .then((list) => {
        if (active) setRows(list);
      })
      .catch((error) => {
        if (active) setLoadError(describeError(error));
      });
    return () => {
      active = false;
    };
  }, []);

  const update = (weekday: number, changes: Partial<OpeningHoursRow>) => {
    setRows((current) => (current ?? []).map((row) => (row.weekday === weekday ? { ...row, ...changes } : row)));
    setNotice(null);
  };

  const submit = async () => {
    if (!rows) return;
    for (const row of rows) {
      if (row.is_open && row.opens >= row.closes) {
        setNotice({
          tone: "error",
          text: `${DAY_LABELS[row.weekday]}: godzina otwarcia musi być wcześniejsza niż zamknięcia.`,
        });
        return;
      }
    }
    setBusy(true);
    setNotice(null);
    try {
      await saveOpeningHours(rows);
      setNotice({ tone: "ok", text: "Zapisano godziny otwarcia." });
    } catch (error) {
      setNotice({ tone: "error", text: describeError(error) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section aria-labelledby="hours-manager-title">
      <div>
        <h2 id="hours-manager-title" className="font-serif text-2xl leading-tight sm:text-3xl">
          Godziny otwarcia
        </h2>
        <p className="max-w-[52ch] text-sm text-mute">
          Te godziny widać na stronie: status „otwarte teraz”, sekcja Kontakt, stopka i menu mobilne. Odznacz dzień,
          żeby pokazać go jako nieczynny (np. święto) – godziny zostają zapamiętane do ponownego włączenia.
        </p>
      </div>

      <NoticeBanner notice={notice} className="mt-4" />

      {loadError ? (
        <p role="alert" className="mt-8 text-accent-deep">
          Nie udało się wczytać godzin. {loadError}
        </p>
      ) : !rows ? (
        <p role="status" className="mt-8 text-mute">
          Wczytuję godziny…
        </p>
      ) : (
        <>
          <ul className="mt-8 divide-y divide-ink/10">
            {WEEKDAY_ORDER.map((weekday) => {
              const row = rows.find((item) => item.weekday === weekday);
              if (!row) return null;
              return (
                <li key={weekday} className="flex flex-wrap items-center gap-4 py-4">
                  <label className="flex min-h-11 w-44 shrink-0 cursor-pointer items-center gap-2.5 font-semibold">
                    <input
                      type="checkbox"
                      checked={row.is_open}
                      onChange={(e) => update(weekday, { is_open: e.target.checked })}
                      className="size-5 accent-[var(--color-accent)]"
                    />
                    {DAY_LABELS[weekday]}
                  </label>
                  {row.is_open ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        required
                        value={row.opens}
                        onChange={(e) => update(weekday, { opens: e.target.value })}
                        className={cx(fieldClass, "mt-0 w-auto min-w-[7rem]")}
                      />
                      <span aria-hidden="true" className="text-mute">
                        –
                      </span>
                      <input
                        type="time"
                        required
                        value={row.closes}
                        onChange={(e) => update(weekday, { closes: e.target.value })}
                        className={cx(fieldClass, "mt-0 w-auto min-w-[7rem]")}
                      />
                    </div>
                  ) : (
                    <p className="text-mute">Nieczynne</p>
                  )}
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            onClick={() => void submit()}
            disabled={busy}
            className={buttonClasses("primary", "md", "mt-8 disabled:opacity-60")}
          >
            {busy ? "Zapisuję…" : "Zapisz zmiany"}
          </button>
        </>
      )}
    </section>
  );
}
