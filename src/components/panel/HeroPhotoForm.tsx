"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";

import { NoticeBanner, fieldClass, type PanelNotice } from "@/components/panel/NoticeBanner";
import { buttonClasses } from "@/components/ui/Button";
import { CloseIcon, ImagePlus } from "@/components/ui/icons";
import { cx } from "@/lib/cx";
import { heroPhotoUrl, type HeroFit, type HeroPhotoRow } from "@/lib/hero-photo-live";
import { describeError } from "@/lib/panel-data";
import { addHeroPhoto, updateHeroPhoto } from "@/lib/panel-hero";

const fitOptions: Array<{ id: HeroFit; label: string; hint: string }> = [
  {
    id: "contain",
    label: "W całości",
    hint: "Nic nie zostanie ucięte – dla plakatów i grafik z tekstem.",
  },
  {
    id: "cover",
    label: "Na całą ramkę",
    hint: "Zdjęcie wypełni ramkę, brzegi mogą zostać przycięte – dla zwykłych zdjęć.",
  },
];

interface HeroPhotoFormProps {
  /** null = dodawanie nowego zdjęcia, inaczej edycja opisu i sposobu pokazania */
  photo: HeroPhotoRow | null;
  onClose: () => void;
  /** `show` = klientka zaznaczyła „Od razu pokaż na stronie” */
  onAdded: (photo: HeroPhotoRow, show: boolean) => void;
  onSaved: (photo: HeroPhotoRow) => void;
}

/** Okno dialogowe zdjęcia głównego: wybór pliku, opis (dla niewidomych i Google) i sposób pokazania. */
export function HeroPhotoForm({ photo, onClose, onAdded, onSaved }: HeroPhotoFormProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [alt, setAlt] = useState(photo?.alt ?? "");
  const [fit, setFit] = useState<HeroFit>(photo?.fit ?? "contain");
  const [show, setShow] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<PanelNotice | null>(null);

  // Okno otwiera się razem z formularzem (bez close() w sprzątaniu – React w trybie deweloperskim montuje dwa razy).
  useEffect(() => {
    const element = dialogRef.current;
    if (element && !element.open) element.showModal();
  }, []);

  const filePreview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => {
    if (filePreview) URL.revokeObjectURL(filePreview);
  }, [filePreview]);
  const preview = filePreview ?? (photo ? heroPhotoUrl(photo.photo_path) : null);

  const onPick = (event: ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files?.[0] ?? null);
    setNotice(null);
  };

  const submit = async (submitEvent: FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault();
    const text = alt.trim();
    if (!photo && !file) {
      setNotice({ tone: "error", text: "Wybierz zdjęcie." });
      return;
    }
    if (!text) {
      setNotice({ tone: "error", text: "Wpisz opis zdjęcia." });
      return;
    }
    setBusy(true);
    setNotice(null);
    try {
      if (photo) onSaved(await updateHeroPhoto(photo.id, { alt: text, fit }));
      else if (file) onAdded(await addHeroPhoto(file, { alt: text, fit }), show);
    } catch (error) {
      setNotice({ tone: "error", text: describeError(error) });
      setBusy(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="hero-form-title"
      onClose={onClose}
      className="m-auto w-[calc(100%-1.5rem)] max-w-lg overflow-hidden rounded-[3px] bg-cream p-0 text-ink backdrop:bg-ink/60"
    >
      <form onSubmit={submit} className="flex max-h-[92dvh] flex-col">
        <div className="flex items-center justify-between border-b border-ink/15 px-5 py-3">
          <h2 id="hero-form-title" className="font-serif text-xl">
            {photo ? "Edytuj zdjęcie główne" : "Dodaj zdjęcie główne"}
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
          {photo ? null : (
            <div>
              <span className="text-sm font-semibold">Zdjęcie</span>
              <label
                className={buttonClasses(
                  "secondary",
                  "md",
                  "mt-1.5 w-full cursor-pointer has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent",
                )}
              >
                <ImagePlus className="size-4" aria-hidden="true" />
                {file ? "Zmień zdjęcie" : "Wybierz zdjęcie"}
                <input type="file" accept="image/*" onChange={onPick} className="sr-only" />
              </label>
              <p className="mt-2 text-xs text-mute">
                Zdjęcie z telefonu albo gotowy plakat (JPG, PNG). Zmniejszymy je automatycznie.
              </p>
            </div>
          )}

          {preview ? (
            <div className="relative mx-auto aspect-[4/5] w-full max-w-[16rem] overflow-hidden bg-sand">
              <Image
                src={preview}
                alt=""
                fill
                unoptimized
                sizes="256px"
                className={fit === "contain" ? "object-contain" : "object-cover"}
              />
            </div>
          ) : null}

          <fieldset>
            <legend className="text-sm font-semibold">Jak pokazać na stronie</legend>
            <div className="mt-1.5 space-y-2">
              {fitOptions.map((option) => (
                <label
                  key={option.id}
                  className={cx(
                    "flex cursor-pointer gap-3 rounded-[3px] border bg-white px-3.5 py-3",
                    fit === option.id ? "border-ink" : "border-ink/20",
                  )}
                >
                  <input
                    type="radio"
                    name="hero-fit"
                    value={option.id}
                    checked={fit === option.id}
                    onChange={() => setFit(option.id)}
                    className="mt-0.5 size-5 shrink-0 accent-[var(--color-accent)]"
                  />
                  <span>
                    <span className="block font-semibold">{option.label}</span>
                    <span className="block text-sm text-mute">{option.hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="hero-alt" className="block text-sm font-semibold">
              Opis zdjęcia
            </label>
            <textarea
              id="hero-alt"
              value={alt}
              required
              maxLength={300}
              rows={3}
              aria-describedby="hero-alt-hint"
              onChange={(event) => setAlt(event.target.value)}
              placeholder="np. Plakat: Wigilia firmowa – 170 zł za osobę, kontakt: 531 980 401"
              className={fieldClass}
            />
            <p id="hero-alt-hint" className="mt-1.5 text-xs text-mute">
              Co widać na zdjęciu albo najważniejsze informacje z plakatu. Na stronie go nie widać – czytają go osoby
              niewidome i Google.
            </p>
          </div>

          {photo ? null : (
            <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-sm">
              <input
                type="checkbox"
                checked={show}
                onChange={(event) => setShow(event.target.checked)}
                className="size-5 accent-[var(--color-accent)]"
              />
              Od razu pokaż na stronie
            </label>
          )}

          {busy && !photo ? (
            <p role="status" className="text-sm text-ink-soft">
              Wysyłam zdjęcie…
            </p>
          ) : null}
          <NoticeBanner notice={notice} />
        </div>

        <div className="flex gap-3 border-t border-ink/15 bg-cream px-5 py-4">
          <button type="submit" disabled={busy} className={buttonClasses("primary", "md", "flex-1 disabled:opacity-60")}>
            {busy ? "Zapisuję…" : photo ? "Zapisz" : "Dodaj zdjęcie"}
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
