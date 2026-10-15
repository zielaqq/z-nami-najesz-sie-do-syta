"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";

import { NoticeBanner, fieldClass, type PanelNotice } from "@/components/panel/NoticeBanner";
import { buttonClasses } from "@/components/ui/Button";
import { CloseIcon, ImagePlus } from "@/components/ui/icons";
import { describeError } from "@/lib/panel-data";
import { addOfferPhotos, updateOfferPhoto, type OfferPhotoRecord } from "@/lib/panel-offers";
import { offerPhotoUrl } from "@/lib/special-offers-live";

interface OfferPhotoFormProps {
  offerId: string;
  offerTitle: string;
  /** null = dodawanie nowych zdjęć, inaczej zmiana podpisu istniejącego */
  photo: OfferPhotoRecord | null;
  /** Miejsce w kolejności dla pierwszego dodawanego zdjęcia (na koniec oferty) */
  startOrder: number;
  onClose: () => void;
  onAdded: (photos: OfferPhotoRecord[]) => void;
  onSaved: (photo: OfferPhotoRecord) => void;
}

/** Okno dialogowe zdjęć oferty: wybór zdjęć (np. plakatów z wariantami menu) i podpis widoczny pod zdjęciem. */
export function OfferPhotoForm({
  offerId,
  offerTitle,
  photo,
  startOrder,
  onClose,
  onAdded,
  onSaved,
}: OfferPhotoFormProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [caption, setCaption] = useState(photo?.caption ?? "");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [notice, setNotice] = useState<PanelNotice | null>(null);

  // Okno otwiera się razem z formularzem (bez close() w sprzątaniu – React w trybie deweloperskim montuje dwa razy).
  useEffect(() => {
    const element = dialogRef.current;
    if (element && !element.open) element.showModal();
  }, []);

  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);
  useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews]);

  const onPick = (event: ChangeEvent<HTMLInputElement>) => {
    setFiles(Array.from(event.target.files ?? []));
    setNotice(null);
  };

  const submit = async (submitEvent: FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault();
    const text = caption.trim() || null;
    setBusy(true);
    setNotice(null);
    try {
      if (photo) {
        onSaved(await updateOfferPhoto(photo.id, text));
        return;
      }
      if (files.length === 0) {
        setNotice({ tone: "error", text: "Wybierz przynajmniej jedno zdjęcie." });
        setBusy(false);
        return;
      }
      const { added, error } = await addOfferPhotos(
        offerId,
        files,
        { caption: files.length === 1 ? text : null, startOrder },
        (done, total) => setProgress({ done, total }),
      );
      if (added.length > 0) onAdded(added);
      if (error) {
        setNotice({
          tone: "error",
          text: `${added.length > 0 ? `Dodano ${added.length} z ${files.length} zdjęć. ` : ""}${describeError(error)}`,
        });
        setBusy(false);
        setProgress(null);
        setFiles([]);
      }
    } catch (error) {
      setNotice({ tone: "error", text: describeError(error) });
      setBusy(false);
    }
  };

  const captionLocked = !photo && files.length > 1;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="offer-photo-form-title"
      onClose={onClose}
      className="m-auto w-[calc(100%-1.5rem)] max-w-lg overflow-hidden rounded-[3px] bg-cream p-0 text-ink backdrop:bg-ink/60"
    >
      <form onSubmit={submit} className="flex max-h-[92dvh] flex-col">
        <div className="flex items-center justify-between border-b border-ink/15 px-5 py-3">
          <h2 id="offer-photo-form-title" className="font-serif text-xl">
            {photo ? "Podpis zdjęcia" : `Dodaj zdjęcia – ${offerTitle}`}
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
          {photo ? (
            <div className="relative mx-auto aspect-[3/4] w-full max-w-[14rem] overflow-hidden bg-sand">
              <Image
                src={offerPhotoUrl(photo.photo_path)}
                alt=""
                fill
                unoptimized
                sizes="224px"
                className="object-contain"
              />
            </div>
          ) : (
            <div>
              <span className="text-sm font-semibold">Zdjęcia</span>
              <label
                className={buttonClasses(
                  "secondary",
                  "md",
                  "mt-1.5 w-full cursor-pointer has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent",
                )}
              >
                <ImagePlus className="size-4" aria-hidden="true" />
                {files.length > 0 ? "Zmień wybór" : "Wybierz zdjęcia"}
                <input type="file" accept="image/*" multiple onChange={onPick} className="sr-only" />
              </label>
              {files.length > 0 ? (
                <>
                  <p className="mt-2 text-sm text-ink-soft">Wybrano: {files.length}</p>
                  <ul className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-5">
                    {previews.slice(0, 15).map((url) => (
                      <li key={url} className="relative aspect-[3/4] overflow-hidden bg-sand">
                        {/* eslint-disable-next-line @next/next/no-img-element -- lokalny podgląd wybranego pliku (adres blob:) */}
                        <img src={url} alt="" className="size-full object-contain" />
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
              <p className="mt-2 text-xs text-mute">
                Zdjęcia albo gotowe plakaty (np. warianty menu). Możesz wybrać kilka naraz – pokażą się w całości, bez
                przycinania, w kolejności wyboru.
              </p>
            </div>
          )}

          <div>
            <label htmlFor="offer-photo-caption" className="block text-sm font-semibold">
              Podpis <span className="font-normal text-mute">(nieobowiązkowy)</span>
            </label>
            <input
              id="offer-photo-caption"
              type="text"
              value={captionLocked ? "" : caption}
              disabled={captionLocked}
              maxLength={120}
              onChange={(event) => setCaption(event.target.value)}
              aria-describedby="offer-photo-caption-hint"
              placeholder={captionLocked ? "Podpisy dodasz potem przy każdym zdjęciu" : "np. Wariant I – 150 zł / osoba"}
              className={`${fieldClass} disabled:bg-sand/50`}
            />
            <p id="offer-photo-caption-hint" className="mt-1.5 text-xs text-mute">
              Widać go pod zdjęciem na stronie. Przy plakacie warto wpisać najważniejsze – nazwę wariantu i cenę.
            </p>
          </div>

          {progress ? (
            <p role="status" className="text-sm text-ink-soft">
              Dodaję zdjęcia… {Math.min(progress.done + 1, progress.total)} z {progress.total}
            </p>
          ) : null}
          <NoticeBanner notice={notice} />
        </div>

        <div className="flex gap-3 border-t border-ink/15 bg-cream px-5 py-4">
          <button type="submit" disabled={busy} className={buttonClasses("primary", "md", "flex-1 disabled:opacity-60")}>
            {busy ? "Zapisuję…" : photo ? "Zapisz" : "Dodaj zdjęcia"}
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
