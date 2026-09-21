"use client";

import Image from "next/image";
import { useCallback, useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode, type TouchEvent } from "react";

import { ChevronLeft, ChevronRight, CloseIcon } from "@/components/ui/icons";
import { galleryCategories, type GalleryCategory, type GalleryImage } from "@/data/gallery";
import { withBase } from "@/lib/base-path";
import { cx } from "@/lib/cx";

interface GalleryGridProps {
  images: GalleryImage[];
}

type Filter = "all" | GalleryCategory;

/**
 * Siatka zdjęć o jednakowych kafelkach (4:5) z filtrem „Wnętrze / Ogródek / Dania”
 * i lightboxem opartym o natywny <dialog>: pułapka fokusu, Esc, powrót fokusu.
 * W powiększeniu widać całe zdjęcie; strzałki ←/→ oraz przesunięcie palcem przełączają zdjęcia.
 */
export function GalleryGrid({ images }: GalleryGridProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const touchStartX = useRef<number | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [current, setCurrent] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const visible = filter === "all" ? images : images.filter((image) => image.category === filter);
  // Przyciski filtra tylko dla kategorii, w których są zdjęcia (i tylko gdy jest z czego wybierać).
  const categories = galleryCategories
    .map((category) => ({ ...category, count: images.filter((image) => image.category === category.id).length }))
    .filter((category) => category.count > 0);

  const openAt = (index: number, trigger: HTMLButtonElement) => {
    triggerRef.current = trigger;
    setCurrent(index);
    setIsOpen(true);
    dialogRef.current?.showModal();
  };

  const close = () => dialogRef.current?.close();

  const step = useCallback(
    (delta: number) => setCurrent((index) => (index + delta + visible.length) % visible.length),
    [visible.length],
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

  const active = visible[current];

  return (
    <>
      {categories.length > 1 ? (
        <div
          role="group"
          aria-label="Filtruj zdjęcia według kategorii"
          className="no-scrollbar mt-10 flex gap-2 overflow-x-auto pb-1 lg:mt-14"
        >
          <FilterChip pressed={filter === "all"} onClick={() => setFilter("all")}>
            Wszystkie ({images.length})
          </FilterChip>
          {categories.map((category) => (
            <FilterChip key={category.id} pressed={filter === category.id} onClick={() => setFilter(category.id)}>
              {category.label} ({category.count})
            </FilterChip>
          ))}
        </div>
      ) : null}

      <ul
        key={filter}
        className={cx(
          "menu-swap grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-5",
          categories.length > 1 ? "mt-6" : "mt-12 lg:mt-16",
        )}
        aria-label="Zdjęcia z restauracji"
      >
        {visible.map((image, index) => (
          <li key={image.src}>
            <button
              type="button"
              onClick={(event) => openAt(index, event.currentTarget)}
              aria-label={`Powiększ zdjęcie: ${image.alt}`}
              aria-haspopup="dialog"
              className="zoom-on-hover group relative block aspect-[4/5] w-full cursor-zoom-in overflow-hidden bg-sand"
            >
              <Image
                src={withBase(image.src)}
                alt=""
                fill
                sizes="(min-width: 1024px) 30vw, 50vw"
                loading="lazy"
                className="object-cover"
                style={{ objectPosition: image.focus }}
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
              {current + 1} / {visible.length}
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
                  src={withBase(active.src)}
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

function FilterChip({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cx(
        "min-h-11 shrink-0 rounded-[3px] border px-4 text-sm font-semibold tracking-[0.02em] whitespace-nowrap transition-colors duration-200",
        pressed
          ? "border-ink bg-ink text-cream"
          : "border-ink/25 bg-transparent text-ink hover:border-ink hover:bg-ink/5",
      )}
    >
      {children}
    </button>
  );
}
