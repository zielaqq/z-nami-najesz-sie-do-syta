"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

import { NoticeBanner, fieldClass, type PanelNotice } from "@/components/panel/NoticeBanner";
import { buttonClasses } from "@/components/ui/Button";
import { CloseIcon } from "@/components/ui/icons";
import { cx } from "@/lib/cx";
import { describeError } from "@/lib/panel-data";
import { saveOffer, type OfferRecord } from "@/lib/panel-offers";
import { offerKind, type OfferKind } from "@/lib/special-offers-live";

const kindOptions: Array<{ id: OfferKind; label: string; hint: string }> = [
  { id: "regular", label: "Oferta", hint: "Produkt dostępny stale – jest na stronie cały czas." },
  {
    id: "special",
    label: "Oferta specjalna",
    hint: "Tymczasowa, np. wigilijna – osobny dział na stronie. Pojawi się i zniknie sama.",
  },
];

interface OfferFormProps {
  /** null = nowa oferta */
  offer: OfferRecord | null;
  /** Miejsce nowej oferty w kolejności (na końcu listy) */
  sortOrder: number;
  onClose: () => void;
  onSaved: (offer: OfferRecord) => void;
}

/** Formularz oferty w oknie dialogowym: nazwa, rodzaj (stała albo tymczasowa, z datami), opis i ukrywanie. */
export function OfferForm({ offer, sortOrder, onClose, onSaved }: OfferFormProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [title, setTitle] = useState(offer?.title ?? "");
  const [kind, setKind] = useState<OfferKind>(offer ? offerKind(offer) : "regular");
  const [description, setDescription] = useState(offer?.description ?? "");
  const [showFrom, setShowFrom] = useState(offer?.show_from ?? "");
  const [showUntil, setShowUntil] = useState(offer?.show_until ?? "");
  const [hidden, setHidden] = useState(offer ? !offer.visible : false);
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
    if (!description.trim()) {
      setNotice({ tone: "error", text: "Wpisz opis oferty." });
      return;
    }
    if (kind === "special" && !showUntil) {
      setNotice({ tone: "error", text: "Wybierz, do kiedy pokazywać ofertę specjalną." });
      return;
    }
    if (kind === "special" && showFrom && showUntil < showFrom) {
      setNotice({ tone: "error", text: "Data „do” nie może być wcześniejsza niż data „od”." });
      return;
    }
    setBusy(true);
    setNotice(null);
    try {
      const saved = await saveOffer(
        {
          title: trimmed,
          description: description.trim(),
          visible: !hidden,
          // Rodzaj oferty wynika z dat: oferta stała nie ma ich wcale.
          show_from: kind === "special" ? showFrom || null : null,
          show_until: kind === "special" ? showUntil : null,
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
            {offer ? "Edytuj ofertę" : "Nowa oferta"}
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
              placeholder="np. Śniadania"
            />
            <p id="offer-title-hint" className="mt-1.5 text-xs text-mute">
              Krótko – tak będzie podpisana oferta na stronie.
            </p>
          </div>

          <fieldset>
            <legend className="text-sm font-semibold">Rodzaj</legend>
            <div className="mt-1.5 space-y-2">
              {kindOptions.map((option) => (
                <label
                  key={option.id}
                  className={cx(
                    "flex cursor-pointer gap-3 rounded-[3px] border bg-white px-3.5 py-3",
                    kind === option.id ? "border-ink" : "border-ink/20",
                  )}
                >
                  <input
                    type="radio"
                    name="offer-kind"
                    value={option.id}
                    checked={kind === option.id}
                    onChange={() => setKind(option.id)}
                    className="mt-0.5 size-5 shrink-0 accent-[var(--color-accent)]"
                  />
                  <span>
                    <span className="block font-semibold">{option.label}</span>
                    <span className="block text-sm text-mute">{option.hint}</span>
                  </span>
                </label>
              ))}
            </div>
            {kind === "special" ? (
              <div className="mt-3 grid gap-5 sm:grid-cols-2">
                <label className="block text-sm font-semibold">
                  Od dnia <span className="font-normal text-mute">(puste = od razu)</span>
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
                    required
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
            <label htmlFor="offer-description" className="block text-sm font-semibold">
              Opis
            </label>
            <textarea
              id="offer-description"
              rows={6}
              required
              maxLength={2000}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              aria-describedby="offer-description-hint"
              className={fieldClass}
              placeholder="np. Oferujemy trzy zestawy śniadaniowe do wyboru. Kanapka z szynką i serem, jajecznica na maśle lub zestaw śniadaniowy z jajkami sadzonymi i frankfurterkami. Do każdego zestawu kawa, herbata lub gorąca czekolada do wyboru. Ceny od 15 zł."
            />
            <p id="offer-description-hint" className="mt-1.5 text-xs text-mute">
              Napisz w 2–3 zdaniach, co oferujesz, co wchodzi w skład i ile to kosztuje. Pusta linia zaczyna nowy akapit.
            </p>
          </div>

          <div>
            <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-sm">
              <input
                type="checkbox"
                checked={hidden}
                onChange={(event) => setHidden(event.target.checked)}
                aria-describedby="offer-hidden-hint"
                className="size-5 accent-[var(--color-accent)]"
              />
              Ukryj na stronie
            </label>
            <p id="offer-hidden-hint" className="text-xs text-mute">
              Oferta zostaje w panelu, ale nie ma jej na stronie – możesz ją spokojnie przygotować i pokazać później.
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
