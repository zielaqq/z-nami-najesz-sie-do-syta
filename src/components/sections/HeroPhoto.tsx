"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";

import { CloseIcon } from "@/components/ui/icons";
import { Photo } from "@/components/ui/Photo";
import { heroContent } from "@/data/about";
import { fetchHeroImage, type HeroImage } from "@/lib/hero-photo-live";

/** Ramka zdjęcia sali – i zdjęć z panelu ustawionych „na całą ramkę”. */
const FRAME_RATIO =
  "aspect-[5/4] sm:aspect-[16/11] lg:aspect-[6/7] lg:max-h-[calc(100svh-var(--header-h)-3rem)] lg:min-h-[28rem]";

interface HeroPhotoProps {
  /** Zdjęcie pobrane już na serwerze (patrz `Hero`); `null` = zdjęcie sali z kodu. */
  initial: HeroImage | null;
  /** true = baza jest skonfigurowana – przeglądarka sprawdza, czy w panelu nie wybrano w międzyczasie innego zdjęcia. */
  live: boolean;
}

/**
 * Zdjęcie główne obok nazwy restauracji. Domyślnie zdjęcie sali; w panelu (/panel → „Zdjęcie główne”) klientka może
 * w jego miejsce wstawić własne – np. plakat z aktualną ofertą. Plakaty pokazujemy w całości (bez przycinania), a
 * kliknięcie powiększa zdjęcie na cały ekran, żeby dało się przeczytać drobny tekst.
 */
export function HeroPhoto({ initial, live }: HeroPhotoProps) {
  const [image, setImage] = useState(initial);

  useEffect(() => {
    if (!live) return;
    const controller = new AbortController();
    fetchHeroImage(controller.signal)
      .then(setImage)
      .catch(() => {
        /* zostaje zdjęcie, które już jest */
      });
    return () => controller.abort();
  }, [live]);

  if (!image) {
    return (
      <Photo
        src="/images/gallery/sala-1.jpg"
        alt={heroContent.photoAlt}
        sizes="(min-width: 1024px) 58vw, 100vw"
        ratio={FRAME_RATIO}
        eager
        quality={90}
        focus="50% 62%"
      />
    );
  }

  return <PanelPhoto key={image.id} image={image} />;
}

function PanelPhoto({ image }: { image: HeroImage }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const whole = image.fit === "contain";

  const open = () => {
    setIsOpen(true);
    dialogRef.current?.showModal();
  };

  const close = () => dialogRef.current?.close();

  const onBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) close();
  };

  // Całe zdjęcie (plakat): proporcje pliku, a szerokość ograniczona tak, żeby zmieściło się w wysokości ekranu.
  const wholeStyle = {
    "--hero-ratio": `${image.width} / ${image.height}`,
    maxWidth: `calc(max(24rem, 100svh - var(--header-h) - 3rem) * ${image.width} / ${image.height})`,
  } as CSSProperties;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={open}
        aria-label={`Powiększ zdjęcie: ${image.alt}`}
        aria-haspopup="dialog"
        className={whole ? "mx-auto block w-full cursor-zoom-in" : "block w-full cursor-zoom-in"}
        style={whole ? wholeStyle : undefined}
      >
        <Photo
          src={image.src}
          remote
          alt={image.alt}
          sizes="(min-width: 1024px) 58vw, 100vw"
          ratio={whole ? "aspect-[var(--hero-ratio)]" : FRAME_RATIO}
          eager
          quality={90}
        />
      </button>

      <dialog
        ref={dialogRef}
        aria-label="Podgląd zdjęcia"
        onClose={() => {
          setIsOpen(false);
          triggerRef.current?.focus();
        }}
        onClick={onBackdropClick}
        className="lightbox m-0 h-dvh max-h-none w-screen max-w-none bg-ink/95 p-0 text-cream"
      >
        <div className="flex h-full flex-col">
          <div className="flex shrink-0 justify-end px-4 py-3 sm:px-6">
            <button
              type="button"
              onClick={close}
              aria-label="Zamknij podgląd"
              className="inline-flex size-11 items-center justify-center rounded-[3px] text-cream transition-colors hover:bg-cream/10"
            >
              <CloseIcon className="size-6" aria-hidden="true" />
            </button>
          </div>
          <div className="relative min-h-0 flex-1 px-2 pb-4 sm:px-6 sm:pb-6">
            {isOpen ? (
              <div className="relative size-full">
                <Image src={image.src} alt={image.alt} fill unoptimized sizes="100vw" className="object-contain" />
              </div>
            ) : null}
          </div>
        </div>
      </dialog>
    </>
  );
}
