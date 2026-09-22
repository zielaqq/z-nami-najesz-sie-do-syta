"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { NoticeBanner, type PanelNotice } from "@/components/panel/NoticeBanner";
import { CloseIcon } from "@/components/ui/icons";
import { defaultGalleryAlt } from "@/data/gallery";
import { galleryPhotoUrl } from "@/lib/gallery-live";
import { listGallery, type GalleryRecord } from "@/lib/panel-gallery";

interface GalleryPhotoPickerProps {
  onClose: () => void;
  /** Wybrane zdjęcie galerii, już pobrane jako plik – gotowe do wstawienia w `photo`/`preview` formularza dania. */
  onPicked: (file: File, previewUrl: string) => void;
}

/**
 * Okno „Wybierz z galerii restauracji” – pozwala użyć zdjęcia, które już jest w galerii, jako zdjęcia dania,
 * zamiast robić nowe. Zdjęcie jest pobierane i przechodzi przez zwykłe zmniejszanie razem z resztą formularza.
 */
export function GalleryPhotoPicker({ onClose, onPicked }: GalleryPhotoPickerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [photos, setPhotos] = useState<GalleryRecord[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pickingId, setPickingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<PanelNotice | null>(null);

  useEffect(() => {
    const element = dialogRef.current;
    if (element && !element.open) element.showModal();
  }, []);

  useEffect(() => {
    let active = true;
    listGallery()
      .then((list) => {
        if (active) setPhotos(list);
      })
      .catch(() => {
        if (active) setLoadError("Nie udało się wczytać galerii.");
      });
    return () => {
      active = false;
    };
  }, []);

  const pick = async (photo: GalleryRecord) => {
    setPickingId(photo.id);
    setNotice(null);
    try {
      const src = galleryPhotoUrl(photo.photo_path);
      const response = await fetch(src);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      const file = new File([blob], `${photo.id}.jpg`, { type: blob.type || "image/jpeg" });
      onPicked(file, URL.createObjectURL(blob));
      dialogRef.current?.close();
    } catch {
      setNotice({ tone: "error", text: "Nie udało się pobrać tego zdjęcia. Spróbuj ponownie." });
      setPickingId(null);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="gallery-picker-title"
      onClose={onClose}
      className="m-auto w-[calc(100%-1.5rem)] max-w-2xl overflow-hidden rounded-[3px] bg-cream p-0 text-ink backdrop:bg-ink/60"
    >
      <div className="flex max-h-[85dvh] flex-col">
        <div className="flex items-center justify-between border-b border-ink/15 px-5 py-3">
          <h2 id="gallery-picker-title" className="font-serif text-xl">
            Wybierz z galerii restauracji
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

        <div className="overflow-y-auto px-5 py-5">
          <NoticeBanner notice={notice} className="mb-4" />
          {loadError ? (
            <p role="alert" className="text-accent-deep">
              {loadError}
            </p>
          ) : !photos ? (
            <p role="status" className="text-mute">
              Wczytuję galerię…
            </p>
          ) : photos.length === 0 ? (
            <p className="text-mute">Galeria jest jeszcze pusta – dodaj tam najpierw jakieś zdjęcia.</p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {photos.map((photo) => {
                const title = photo.caption ?? defaultGalleryAlt(photo.category);
                const busy = pickingId === photo.id;
                return (
                  <li key={photo.id}>
                    <button
                      type="button"
                      onClick={() => void pick(photo)}
                      disabled={pickingId !== null}
                      aria-label={`Użyj zdjęcia: ${title}`}
                      className="group relative block aspect-[4/3] w-full overflow-hidden rounded-[3px] border-2 border-ink/15 bg-sand text-left transition-colors hover:border-accent disabled:cursor-not-allowed"
                    >
                      <Image
                        src={galleryPhotoUrl(photo.photo_path)}
                        alt=""
                        fill
                        unoptimized
                        sizes="(min-width: 640px) 220px, 45vw"
                        className="object-cover"
                        style={{ objectPosition: photo.focus ?? undefined }}
                      />
                      <span className="absolute inset-x-0 bottom-0 truncate bg-ink/70 px-2 py-1.5 text-xs text-cream">
                        {title}
                      </span>
                      {busy ? (
                        <span className="absolute inset-0 grid place-items-center bg-ink/50 text-sm font-semibold text-cream">
                          Pobieram…
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </dialog>
  );
}
