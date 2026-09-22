"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import { CloseIcon } from "@/components/ui/icons";

interface PhotoLightboxProps {
  /** null = nic do pokazania (komponent nic nie renderuje) */
  photo: { src: string; title: string } | null;
  onClose: () => void;
}

/**
 * Podgląd jednego zdjęcia na większym ekranie – po kliknięciu miniatury w „Bazie dań” albo w formularzu dania.
 * Prosty <dialog> (Esc zamyka, fokus wraca na przycisk, który go otworzył – to wszystko daje sama przeglądarka).
 */
export function PhotoLightbox({ photo, onClose }: PhotoLightboxProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = dialogRef.current;
    if (!element) return;
    if (photo && !element.open) element.showModal();
    if (!photo && element.open) element.close();
  }, [photo]);

  return (
    <dialog
      ref={dialogRef}
      aria-label={photo ? `Podgląd zdjęcia: ${photo.title}` : "Podgląd zdjęcia"}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) dialogRef.current?.close();
      }}
      className="m-auto h-[min(90dvh,900px)] w-[min(92vw,900px)] overflow-hidden rounded-[3px] bg-ink p-0 backdrop:bg-ink/70"
    >
      {photo ? (
        <div className="relative size-full">
          <Image src={photo.src} alt={photo.title} fill unoptimized sizes="900px" className="object-contain" />
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Zamknij podgląd"
            className="absolute right-2 top-2 inline-flex size-11 items-center justify-center rounded-[3px] bg-ink/60 text-cream hover:bg-ink/80"
          >
            <CloseIcon className="size-6" aria-hidden="true" />
          </button>
          <p className="absolute inset-x-0 bottom-0 bg-ink/70 px-4 py-2.5 text-center text-sm text-cream">{photo.title}</p>
        </div>
      ) : null}
    </dialog>
  );
}
