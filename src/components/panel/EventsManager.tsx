"use client";

import { useEffect, useState } from "react";

import { EventForm } from "@/components/panel/EventForm";
import { NoticeBanner, type PanelNotice } from "@/components/panel/NoticeBanner";
import { buttonClasses } from "@/components/ui/Button";
import { Pencil, Plus, Trash2 } from "@/components/ui/icons";
import { cx } from "@/lib/cx";
import { formatEventDate, todayInWarsaw } from "@/lib/format";
import { describeError } from "@/lib/panel-data";
import { deleteEvent, listEvents, type EventRecord } from "@/lib/panel-events";

/**
 * Wydarzenia widoczne na stronie: dodawanie, zmiana i usuwanie. Wydarzenie pokazuje się na stronie do dnia
 * wydarzenia (albo do dnia zakończenia) i znika samo – minione widać tu po włączeniu „Pokaż minione”.
 */
export function EventsManager() {
  const [events, setEvents] = useState<EventRecord[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showPast, setShowPast] = useState(false);
  const [editing, setEditing] = useState<EventRecord | "new" | null>(null);
  const [notice, setNotice] = useState<PanelNotice | null>(null);

  useEffect(() => {
    let active = true;
    listEvents()
      .then((list) => {
        if (active) setEvents(list);
      })
      .catch((error) => {
        if (active) setLoadError(describeError(error));
      });
    return () => {
      active = false;
    };
  }, []);

  const today = todayInWarsaw();
  const isPast = (event: EventRecord) => (event.end_date ?? event.date) < today;
  const upcoming = (events ?? []).filter((event) => !isPast(event)).sort((a, b) => a.date.localeCompare(b.date));
  const past = (events ?? []).filter(isPast).sort((a, b) => b.date.localeCompare(a.date));

  const onSaved = (saved: EventRecord) => {
    setEvents((current) => {
      const list = current ?? [];
      return list.some((event) => event.id === saved.id)
        ? list.map((event) => (event.id === saved.id ? saved : event))
        : [...list, saved];
    });
    setEditing(null);
    setNotice({ tone: "ok", text: `Zapisano: ${saved.title}.` });
  };

  const remove = async (event: EventRecord) => {
    if (!window.confirm(`Usunąć wydarzenie „${event.title}”?`)) return;
    setNotice(null);
    try {
      await deleteEvent(event.id);
      setEvents((current) => (current ?? []).filter((item) => item.id !== event.id));
      setNotice({ tone: "ok", text: `Usunięto: ${event.title}.` });
    } catch (error) {
      setNotice({ tone: "error", text: describeError(error) });
    }
  };

  return (
    <section aria-labelledby="events-manager-title">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 id="events-manager-title" className="font-serif text-2xl leading-tight sm:text-3xl">
            Wydarzenia
          </h2>
          <p className="max-w-[46ch] text-sm text-mute">
            Wydarzenie widać na stronie do jego dnia i znika samo. Gdy nie ma żadnego, sekcja jest ukryta.
          </p>
        </div>
        <button type="button" onClick={() => setEditing("new")} className={buttonClasses("primary", "md")}>
          <Plus className="size-4" aria-hidden="true" />
          Dodaj wydarzenie
        </button>
      </div>

      <NoticeBanner notice={notice} className="mt-4" />

      {loadError ? (
        <p role="alert" className="mt-8 text-accent-deep">
          Nie udało się wczytać wydarzeń. {loadError}
        </p>
      ) : !events ? (
        <p role="status" className="mt-8 text-mute">
          Wczytuję wydarzenia…
        </p>
      ) : (
        <>
          <h3 className="mt-10 border-b border-ink/25 pb-2 font-serif text-xl">Nadchodzące</h3>
          {upcoming.length === 0 ? (
            <p className="mt-4 text-mute">Brak nadchodzących wydarzeń – na stronie sekcja „Wydarzenia” jest ukryta.</p>
          ) : (
            <ul className="divide-y divide-ink/10">
              {upcoming.map((event) => (
                <EventRow key={event.id} event={event} onEdit={() => setEditing(event)} onDelete={() => void remove(event)} />
              ))}
            </ul>
          )}

          {past.length > 0 ? (
            <div className="mt-10">
              <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-sm">
                <input
                  type="checkbox"
                  checked={showPast}
                  onChange={(e) => setShowPast(e.target.checked)}
                  className="size-5 accent-[var(--color-accent)]"
                />
                Pokaż minione ({past.length})
              </label>
              {showPast ? (
                <ul className="mt-2 divide-y divide-ink/10">
                  {past.map((event) => (
                    <EventRow
                      key={event.id}
                      event={event}
                      past
                      onEdit={() => setEditing(event)}
                      onDelete={() => void remove(event)}
                    />
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </>
      )}

      {editing ? (
        <EventForm
          key={editing === "new" ? "new" : editing.id}
          event={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={onSaved}
        />
      ) : null}
    </section>
  );
}

function EventRow({
  event,
  past = false,
  onEdit,
  onDelete,
}: {
  event: EventRecord;
  past?: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const date = formatEventDate(event.date);
  const end = event.end_date && event.end_date !== event.date ? formatEventDate(event.end_date) : null;
  return (
    <li className={cx("flex items-start gap-4 py-4", past && "opacity-60")}>
      <div className="w-14 shrink-0 text-center" aria-hidden="true">
        <p className="tabular font-serif text-3xl leading-none">{date.day}</p>
        <p className="eyebrow mt-1">{date.monthShort}</p>
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-serif text-lg leading-snug">{event.title}</p>
        <p className="text-sm text-mute">
          {date.weekday}, {date.long}
          {end ? ` – ${end.long}` : ""}
          {event.time_label ? ` · ${event.time_label}` : ""}
        </p>
        {event.description ? <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{event.description}</p> : null}
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Edytuj: ${event.title}`}
          className="inline-flex size-11 items-center justify-center rounded-[3px] border border-ink/25 hover:border-ink hover:bg-ink/5"
        >
          <Pencil className="size-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Usuń: ${event.title}`}
          className="inline-flex size-11 items-center justify-center rounded-[3px] border border-ink/25 hover:border-ink hover:bg-ink/5"
        >
          <Trash2 className="size-5" aria-hidden="true" />
        </button>
      </div>
    </li>
  );
}
