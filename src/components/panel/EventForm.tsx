"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

import { NoticeBanner, fieldClass, type PanelNotice } from "@/components/panel/NoticeBanner";
import { buttonClasses } from "@/components/ui/Button";
import { CloseIcon } from "@/components/ui/icons";
import { todayInWarsaw } from "@/lib/format";
import { describeError } from "@/lib/panel-data";
import { saveEvent, type EventRecord } from "@/lib/panel-events";

interface EventFormProps {
  /** null = nowe wydarzenie */
  event: EventRecord | null;
  onClose: () => void;
  onSaved: (event: EventRecord) => void;
}

/** Formularz wydarzenia w oknie dialogowym: tytuł, data (albo zakres dat), godzina i opis. */
export function EventForm({ event, onClose, onSaved }: EventFormProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [title, setTitle] = useState(event?.title ?? "");
  const [date, setDate] = useState(event?.date ?? todayInWarsaw());
  const [endDate, setEndDate] = useState(event?.end_date ?? "");
  const [time, setTime] = useState(event?.time_label ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<PanelNotice | null>(null);

  // Okno otwiera się razem z formularzem (bez close() w sprzątaniu – React w trybie deweloperskim montuje dwa razy).
  useEffect(() => {
    const element = dialogRef.current;
    if (element && !element.open) element.showModal();
  }, []);

  const submit = async (submitEvent: FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setNotice({ tone: "error", text: "Wpisz tytuł wydarzenia." });
      return;
    }
    if (!date) {
      setNotice({ tone: "error", text: "Wybierz datę wydarzenia." });
      return;
    }
    if (endDate && endDate < date) {
      setNotice({ tone: "error", text: "Data zakończenia nie może być wcześniejsza niż data rozpoczęcia." });
      return;
    }
    setBusy(true);
    setNotice(null);
    try {
      const saved = await saveEvent(
        {
          title: trimmed,
          date,
          end_date: endDate || null,
          time_label: time.trim() || null,
          description: description.trim(),
        },
        event?.id ?? null,
      );
      onSaved(saved);
    } catch (error) {
      setNotice({ tone: "error", text: describeError(error) });
      setBusy(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="event-form-title"
      onClose={onClose}
      className="m-auto w-[calc(100%-1.5rem)] max-w-lg overflow-hidden rounded-[3px] bg-cream p-0 text-ink backdrop:bg-ink/60"
    >
      <form onSubmit={submit} className="flex max-h-[92dvh] flex-col">
        <div className="flex items-center justify-between border-b border-ink/15 px-5 py-3">
          <h2 id="event-form-title" className="font-serif text-xl">
            {event ? "Edytuj wydarzenie" : "Nowe wydarzenie"}
          </h2>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Zamknij"
            className="-mr-2 inline-flex size-11 items-center justify-center rounded-[3px] hover:bg-ink/5"
          >
            <CloseIcon className="size-6" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto px-5 py-5">
          <label className="block text-sm font-semibold">
            Tytuł
            <input
              type="text"
              required
              maxLength={120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={fieldClass}
              placeholder="np. Muzyka na żywo"
            />
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-semibold">
              Data
              <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className={fieldClass} />
            </label>
            <label className="block text-sm font-semibold">
              Do dnia <span className="font-normal text-mute">(gdy trwa kilka dni)</span>
              <input
                type="date"
                min={date}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={fieldClass}
              />
            </label>
          </div>

          <label className="block text-sm font-semibold">
            Godzina <span className="font-normal text-mute">(nieobowiązkowa)</span>
            <input
              type="text"
              maxLength={40}
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className={fieldClass}
              placeholder="np. 17:00 albo 12:00–15:00"
            />
          </label>

          <label className="block text-sm font-semibold">
            Opis <span className="font-normal text-mute">(nieobowiązkowy)</span>
            <textarea
              rows={4}
              maxLength={600}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={fieldClass}
            />
          </label>

          <NoticeBanner notice={notice} />
        </div>

        <div className="flex gap-3 border-t border-ink/15 bg-cream px-5 py-4">
          <button type="submit" disabled={busy} className={buttonClasses("primary", "md", "flex-1 disabled:opacity-60")}>
            {busy ? "Zapisuję…" : "Zapisz"}
          </button>
          <button type="button" onClick={() => dialogRef.current?.close()} className={buttonClasses("secondary", "md")}>
            Anuluj
          </button>
        </div>
      </form>
    </dialog>
  );
}
