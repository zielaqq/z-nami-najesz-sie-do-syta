"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

import { NoticeBanner, fieldClass, type PanelNotice } from "@/components/panel/NoticeBanner";
import { buttonClasses } from "@/components/ui/Button";
import { CloseIcon } from "@/components/ui/icons";
import { cx } from "@/lib/cx";
import { describeError } from "@/lib/panel-data";
import { saveOffer, type OfferRecord } from "@/lib/panel-offers";

type Mode = "always" | "dates" | "hidden";

const modeOptions: Array<{ id: Mode; label: string; hint: string }> = [
  { id: "always", label: "Cały czas", hint: "Oferta jest na stronie, dopóki jej nie ukryjesz." },
  {
    id: "dates",
    label: "Tylko w wybranych dniach",
    hint: "Pojawi się i zniknie sama, np. oferta świąteczna od 1 listopada do 24 grudnia.",
  },
  { id: "hidden", label: "Ukryta", hint: "Nie ma jej na stronie – możesz ją spokojnie przygotować i pokazać później." },
];

function initialMode(offer: OfferRecord | null): Mode {
  if (!offer) return "always";
  if (!offer.visible) return "hidden";
  return offer.show_from || offer.show_until ? "dates" : "always";
}

interface OfferFormProps {
  /** null = nowa oferta */
  offer: OfferRecord | null;
  /** Miejsce nowej oferty w kolejności (na końcu listy) */
  sortOrder: number;
  onClose: () => void;
  onSaved: (offer: OfferRecord) => void;
}

/** Formularz oferty specjalnej w oknie dialogowym: nazwa, dopisek, opis, kiedy pokazywać i link w menu. */
export function OfferForm({ offer, sortOrder, onClose, onSaved }: OfferFormProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [title, setTitle] = useState(offer?.title ?? "");
  const [eyebrow, setEyebrow] = useState(offer?.eyebrow ?? "");
  const [description, setDescription] = useState(offer?.description ?? "");
  const [mode, setMode] = useState<Mode>(initialMode(offer));
  const [showFrom, setShowFrom] = useState(offer?.show_from ?? "");
  const [showUntil, setShowUntil] = useState(offer?.show_until ?? "");
  const [inNav, setInNav] = useState(offer?.in_nav ?? true);
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
      setNotice({ tone: "error", text: "Wpisz nazwę oferty." });
      return;
    }
    if (mode === "dates" && !showFrom && !showUntil) {
      setNotice({ tone: "error", text: "Wybierz, od kiedy albo do kiedy pokazywać ofertę." });
      return;
    }
    if (mode === "dates" && showFrom && showUntil && showUntil < showFrom) {
      setNotice({ tone: "error", text: "Data „do” nie może być wcześniejsza niż data „od”." });
      return;
    }
    setBusy(true);
    setNotice(null);
    try {
      const saved = await saveOffer(
        {
          title: trimmed,
          eyebrow: eyebrow.trim() || null,
          description: description.trim(),
          visible: mode !== "hidden",
          // „Cały czas” czyści daty; ukryta oferta je zachowuje, żeby po ponownym włączeniu nie trzeba ich wpisywać.
          show_from: mode === "always" ? null : showFrom || null,
          show_until: mode === "always" ? null : showUntil || null,
          in_nav: inNav,
        },
        offer?.id ?? null,
        sortOrder,
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
      aria-labelledby="offer-form-title"
      onClose={onClose}
      className="m-auto w-[calc(100%-1.5rem)] max-w-lg overflow-hidden rounded-[3px] bg-cream p-0 text-ink backdrop:bg-ink/60"
    >
      <form onSubmit={submit} className="flex max-h-[92dvh] flex-col">
        <div className="flex items-center justify-between border-b border-ink/15 px-5 py-3">
          <h2 id="offer-form-title" className="font-serif text-xl">
            {offer ? "Edytuj ofertę" : "Nowa oferta specjalna"}
          </h2>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            disabled={busy}
            aria-label="Zamknij"
            className="-mr-2 inline-flex size-11 items-center justify-center rounded-[3px] hover:bg-ink/5 disabled:opacity-40"
          >
            <CloseIcon className="size-6" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto px-5 py-5">
          <div>
            <label htmlFor="offer-title" className="block text-sm font-semibold">
              Nazwa
            </label>
            <input
              id="offer-title"
              type="text"
              required
              maxLength={40}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              aria-describedby="offer-title-hint"
              className={fieldClass}
              placeholder="np. Komunia"
            />
            <p id="offer-title-hint" className="mt-1.5 text-xs text-mute">
              Krótko – tak będzie podpisana sekcja na stronie i link w menu na górze strony.
            </p>
          </div>

          <div>
            <label htmlFor="offer-eyebrow" className="block text-sm font-semibold">
              Dopisek nad nazwą <span className="font-normal text-mute">(nieobowiązkowy)</span>
            </label>
            <input
              id="offer-eyebrow"
              type="text"
              maxLength={60}
              value={eyebrow}
              onChange={(event) => setEyebrow(event.target.value)}
              aria-describedby="offer-eyebrow-hint"
              className={fieldClass}
              placeholder="np. Przez cały rok"
            />
            <p id="offer-eyebrow-hint" className="mt-1.5 text-xs text-mute">
              Mały napis nad nazwą. Gdy zostawisz puste, pojawi się „Oferta specjalna”.
            </p>
          </div>

          <div>
            <label htmlFor="offer-description" className="block text-sm font-semibold">
              Opis <span className="font-normal text-mute">(nieobowiązkowy)</span>
            </label>
            <textarea
              id="offer-description"
              rows={6}
              maxLength={2000}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              aria-describedby="offer-description-hint"
              className={fieldClass}
              placeholder="np. Organizujemy przyjęcia komunijne na miejscu i z cateringiem. Wybierz jeden z trzech wariantów menu."
            />
            <p id="offer-description-hint" className="mt-1.5 text-xs text-mute">
              Pusta linia zaczyna nowy akapit.
            </p>
          </div>

          <fieldset>
            <legend className="text-sm font-semibold">Kiedy pokazywać na stronie</legend>
            <div className="mt-1.5 space-y-2">
              {modeOptions.map((option) => (
                <label
                  key={option.id}
                  className={cx(
                    "flex cursor-pointer gap-3 rounded-[3px] border bg-white px-3.5 py-3",
                    mode === option.id ? "border-ink" : "border-ink/20",
                  )}
                >
                  <input
                    type="radio"
                    name="offer-mode"
                    value={option.id}
                    checked={mode === option.id}
                    onChange={() => setMode(option.id)}
                    className="mt-0.5 size-5 shrink-0 accent-[var(--color-accent)]"
                  />
                  <span>
                    <span className="block font-semibold">{option.label}</span>
                    <span className="block text-sm text-mute">{option.hint}</span>
                  </span>
                </label>
              ))}
            </div>
            {mode === "dates" ? (
              <div className="mt-3 grid gap-5 sm:grid-cols-2">
                <label className="block text-sm font-semibold">
                  Od dnia
                  <input
                    type="date"
                    value={showFrom}
                    max={showUntil || undefined}
                    onChange={(event) => setShowFrom(event.target.value)}
                    className={fieldClass}
                  />
                </label>
                <label className="block text-sm font-semibold">
                  Do dnia <span className="font-normal text-mute">(włącznie)</span>
                  <input
                    type="date"
                    value={showUntil}
                    min={showFrom || undefined}
                    onChange={(event) => setShowUntil(event.target.value)}
                    className={fieldClass}
                  />
                </label>
              </div>
            ) : null}
          </fieldset>

          <div>
            <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-sm">
              <input
                type="checkbox"
                checked={inNav}
                onChange={(event) => setInNav(event.target.checked)}
                aria-describedby="offer-nav-hint"
                className="size-5 accent-[var(--color-accent)]"
              />
              Pokaż link do oferty w menu na górze strony
            </label>
            <p id="offer-nav-hint" className="text-xs text-mute">
              Na komputerze w górnym menu mieszczą się 2 takie oferty (pierwsze z listy) – kolejne są w menu na telefonie i
              w stopce strony.
            </p>
          </div>

          <NoticeBanner notice={notice} />
        </div>

        <div className="flex gap-3 border-t border-ink/15 bg-cream px-5 py-4">
          <button type="submit" disabled={busy} className={buttonClasses("primary", "md", "flex-1 disabled:opacity-60")}>
            {busy ? "Zapisuję…" : "Zapisz"}
          </button>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            disabled={busy}
            className={buttonClasses("secondary", "md", "disabled:opacity-60")}
          >
            Anuluj
          </button>
        </div>
      </form>
    </dialog>
  );
}
