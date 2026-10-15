"use client";

import Image from "next/image";
import { useEffect, useRef, type KeyboardEvent, type MouseEvent, type TouchEvent } from "react";

import { ChevronLeft, ChevronRight, CloseIcon } from "@/components/ui/icons";
import { withBase } from "@/lib/base-path";
import { cx } from "@/lib/cx";

export interface LightboxImage {
  src: string;
  alt: string;
  /** Podpis pod zdjęciem (domyślnie `alt`; pusty tekst = bez podpisu). */
  caption?: string | null;
  /** Zdjęcie spoza folderu `public` (np. z bazy) – bez optymalizatora Next.js. */
  remote?: boolean;
}

interface LightboxProps {
  images: LightboxImage[];
  /** Które zdjęcie jest powiększone; `null` = podgląd zamknięty. */
  index: number | null;
  onIndexChange: (index: number) => void;
  /** Wywoływane po zamknięciu (Esc, przycisk, kliknięcie obok) – tu wraca się fokusem na kliknięte zdjęcie. */
  onClose: () => void;
}

/**
 * Powiększenie zdjęć na cały ekran oparte o natywny <dialog>: pułapka fokusu, Esc, kliknięcie obok zamyka.
 * Przy kilku zdjęciach: licznik, strzałki na ekranie, klawisze ←/→ i przesunięcie palcem. W powiększeniu widać całe
 * zdjęcie (np. plakat z drobnym tekstem).
 */
export function Lightbox({ images, index, onIndexChange, onClose }: LightboxProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const touchStartX = useRef<number | null>(null);
  const isOpen = index !== null;
  const many = images.length > 1;
  const active = index !== null ? images[index] : undefined;
  const caption = active ? (active.caption ?? active.alt) : null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  const close = () => dialogRef.current?.close();

  const step = (delta: number) => {
    if (index === null || !many) return;
    onIndexChange((index + delta + images.length) % images.length);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === "ArrowRight") step(1);
    if (event.key === "ArrowLeft") step(-1);
  };

  const onBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) close();
  };

  const onStageClick = (event: MouseEvent<HTMLDivElement>) => {
    // Kliknięcie w puste pole obok zdjęcia zamyka podgląd
    if (event.target === event.currentTarget) close();
  };

  const onTouchStart = (event: TouchEvent) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const onTouchEnd = (event: TouchEvent) => {
    const start = touchStartX.current;
    const end = event.changedTouches[0]?.clientX;
    touchStartX.current = null;
    if (start === null || end === undefined) return;
    const distance = end - start;
    if (Math.abs(distance) > 50) step(distance < 0 ? 1 : -1);
  };

  return (
    <dialog
      ref={dialogRef}
      aria-label="Podgląd zdjęcia"
      onClose={onClose}
      onKeyDown={onKeyDown}
      onClick={onBackdropClick}
      className="lightbox m-0 h-dvh max-h-none w-screen max-w-none bg-ink/95 p-0 text-cream"
    >
      <div className="flex h-full flex-col">
        <div className="flex shrink-0 items-center justify-between px-4 py-3 sm:px-6">
          <p className="tabular text-sm text-on-dark-mute" aria-live="polite">
            {many && index !== null ? `${index + 1} / ${images.length}` : null}
          </p>
          <button
            type="button"
            onClick={close}
            aria-label="Zamknij podgląd"
            className="inline-flex size-11 items-center justify-center rounded-[3px] text-cream transition-colors hover:bg-cream/10"
          >
            <CloseIcon className="size-6" aria-hidden="true" />
          </button>
        </div>

        <div
          className={cx(
            "relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-16",
            !caption && "pb-4 sm:pb-6",
          )}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onClick={onStageClick}
        >
          {many ? (
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Poprzednie zdjęcie"
              className="absolute left-1 top-1/2 z-10 inline-flex size-12 -translate-y-1/2 items-center justify-center rounded-[3px] bg-ink/60 text-cream transition-colors hover:bg-cream hover:text-ink sm:left-4"
            >
              <ChevronLeft className="size-6" aria-hidden="true" />
            </button>
          ) : null}

          {active ? (
            <div className="relative h-full w-full">
              <Image
                key={active.src}
                src={active.remote ? active.src : withBase(active.src)}
                unoptimized={active.remote}
                alt={active.alt}
                fill
                sizes="100vw"
                quality={90}
                className="object-contain"
              />
            </div>
          ) : null}

          {many ? (
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Następne zdjęcie"
              className="absolute right-1 top-1/2 z-10 inline-flex size-12 -translate-y-1/2 items-center justify-center rounded-[3px] bg-ink/60 text-cream transition-colors hover:bg-cream hover:text-ink sm:right-4"
            >
              <ChevronRight className="size-6" aria-hidden="true" />
            </button>
          ) : null}
        </div>

        {caption ? <p className="shrink-0 px-6 py-4 text-center text-sm text-on-dark-mute">{caption}</p> : null}
      </div>
    </dialog>
  );
}
