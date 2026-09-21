"use client";

import Image from "next/image";
import { useCallback, useRef, useState, type KeyboardEvent, type MouseEvent, type TouchEvent } from "react";

import { ChevronLeft, ChevronRight, CloseIcon } from "@/components/ui/icons";
import type { GalleryImage } from "@/data/gallery";

interface GalleryGridProps {
  images: GalleryImage[];
}

/**
 * Mozaika zdjęć (kolumny CSS – każde zdjęcie zachowuje własne proporcje)
 * z lightboxem opartym o natywny <dialog>: pułapka fokusu, Esc, powrót fokusu.
 * Dodatkowo: strzałki ←/→ oraz przesunięcie palcem na telefonie.
 */
export function GalleryGrid({ images }: GalleryGridProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const touchStartX = useRef<number | null>(null);
  const [current, setCurrent] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const openAt = (index: number, trigger: HTMLButtonElement) => {
    triggerRef.current = trigger;
    setCurrent(index);
    setIsOpen(true);
    dialogRef.current?.showModal();
  };

  const close = () => dialogRef.current?.close();

  const step = useCallback(
    (delta: number) => setCurrent((index) => (index + delta + images.length) % images.length),
    [images.length],
  );

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

  const active = images[current];

  return (
    <>
      <ul className="mt-12 columns-2 gap-3 sm:gap-4 lg:mt-16 lg:columns-3 lg:gap-5" aria-label="Zdjęcia z restauracji">
        {images.map((image, index) => (
          <li key={image.src} className="mb-3 break-inside-avoid sm:mb-4 lg:mb-5">
            <button
              type="button"
              onClick={(event) => openAt(index, event.currentTarget)}
              aria-label={`Powiększ zdjęcie: ${image.alt}`}
              aria-haspopup="dialog"
              className="zoom-on-hover group relative block w-full cursor-zoom-in overflow-hidden bg-sand"
              style={{ aspectRatio: `${image.width} / ${image.height}` }}
            >
              <Image
                src={image.src}
                alt=""
                fill
                sizes="(min-width: 1024px) 30vw, 50vw"
                loading="lazy"
                className="object-cover"
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-ink/0 transition-colors duration-500 group-hover:bg-ink/10"
              />
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        aria-label="Podgląd zdjęcia"
        onClose={() => {
          setIsOpen(false);
          triggerRef.current?.focus();
        }}
        onKeyDown={onKeyDown}
        onClick={onBackdropClick}
        className="lightbox m-0 h-dvh max-h-none w-screen max-w-none bg-ink/95 p-0 text-cream"
      >
        <div className="flex h-full flex-col">
          <div className="flex shrink-0 items-center justify-between px-4 py-3 sm:px-6">
            <p className="tabular text-sm text-on-dark-mute" aria-live="polite">
              {current + 1} / {images.length}
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
            className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-16"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            onClick={onStageClick}
          >
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Poprzednie zdjęcie"
              className="absolute left-1 top-1/2 z-10 inline-flex size-12 -translate-y-1/2 items-center justify-center rounded-[3px] bg-ink/60 text-cream transition-colors hover:bg-cream hover:text-ink sm:left-4"
            >
              <ChevronLeft className="size-6" aria-hidden="true" />
            </button>

            {isOpen && active ? (
              <div className="relative h-full w-full">
                <Image
                  key={active.src}
                  src={active.src}
                  alt={active.alt}
                  fill
                  sizes="100vw"
                  quality={90}
                  className="object-contain"
                />
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Następne zdjęcie"
              className="absolute right-1 top-1/2 z-10 inline-flex size-12 -translate-y-1/2 items-center justify-center rounded-[3px] bg-ink/60 text-cream transition-colors hover:bg-cream hover:text-ink sm:right-4"
            >
              <ChevronRight className="size-6" aria-hidden="true" />
            </button>
          </div>

          <p className="shrink-0 px-6 py-4 text-center text-sm text-on-dark-mute">
            {active?.caption ?? active?.alt}
          </p>
        </div>
      </dialog>
    </>
  );
}
