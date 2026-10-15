"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

import { Lightbox } from "@/components/ui/Lightbox";
import { Photo } from "@/components/ui/Photo";
import { heroContent } from "@/data/about";
import { cx } from "@/lib/cx";
import { fetchHeroImage, HERO_SIZE_SCALE, type HeroImage } from "@/lib/hero-photo-live";

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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const whole = image.fit === "contain";

  // Proporcje pliku (całe zdjęcie) i wielkość wybrana w panelu – ułamek pełnej wielkości, liczony dopiero na komputerze
  // (od 1024 px); na telefonie i tablecie zdjęcie zawsze ma całą szerokość, żeby tekst na plakacie był czytelny.
  const style = {
    "--hero-ratio": `${image.width} / ${image.height}`,
    "--hero-scale": HERO_SIZE_SCALE[image.size],
  } as CSSProperties;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={`Powiększ zdjęcie${image.badge ? ` (${image.badge})` : ""}: ${image.alt}`}
        aria-haspopup="dialog"
        className={cx(
          "relative mx-auto block w-full cursor-zoom-in",
          whole
            ? // Całe zdjęcie (plakat): szerokość ograniczona tak, żeby zmieściło się w wysokości ekranu.
              "max-w-[calc(max(24rem,100svh-var(--header-h)-3rem)*var(--hero-ratio))] lg:max-w-[calc(max(24rem,100svh-var(--header-h)-3rem)*var(--hero-ratio)*var(--hero-scale))]"
            : "lg:max-w-[calc(100%*var(--hero-scale))]",
        )}
        style={style}
      >
        {image.badge ? (
          <span
            aria-hidden="true"
            className="absolute -left-2 -top-3 z-10 rounded-[3px] bg-accent px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-[0_8px_20px_-8px_rgb(24_21_18/0.55)] sm:-left-3 sm:text-[0.8125rem]"
          >
            {image.badge}
          </span>
        ) : null}
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

      <Lightbox
        // Pusty podpis: opis plakatu jest dla czytników ekranu i Google, pod powiększeniem byłby powtórzeniem.
        images={[{ src: image.src, alt: image.alt, caption: "", remote: true }]}
        index={isOpen ? 0 : null}
        onIndexChange={() => {}}
        onClose={() => {
          setIsOpen(false);
          triggerRef.current?.focus();
        }}
      />
    </>
  );
}
