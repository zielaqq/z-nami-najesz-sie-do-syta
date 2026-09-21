"use client";

import Link from "next/link";
import { useState } from "react";

import { buttonClasses } from "@/components/ui/Button";
import { MapPin } from "@/components/ui/icons";

interface MapEmbedProps {
  /** Adres iframe (Maps Embed API z kluczem ze zmiennej środowiskowej albo osadzenie bez klucza) */
  src: string;
  /** Ulica */
  street: string;
  /** Kod pocztowy i miejscowość */
  locality: string;
  title: string;
  /** true = mapa ładuje się po kliknięciu (RODO, szybsza strona) */
  loadOnClick: boolean;
}

/**
 * Responsywna mapa Google. Na telefonie ma stałą, umiarkowaną wysokość (nie zajmuje
 * całego ekranu), na desktopie wypełnia wysokość kolumny. Przycisk „Wyznacz trasę”
 * jest osobno w sekcji kontaktowej i działa bez ładowania mapy.
 */
export function MapEmbed({ src, street, locality, title, loadOnClick }: MapEmbedProps) {
  const [loaded, setLoaded] = useState(!loadOnClick);

  return (
    <div className="relative h-80 overflow-hidden bg-sand sm:h-[26rem] lg:h-full lg:min-h-[34rem]" data-reveal>
      {loaded ? (
        <iframe
          src={src}
          title={title}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          className="absolute inset-0 size-full border-0"
        />
      ) : (
        <>
          <MapArt />
          <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6">
            <div className="flex w-full max-w-sm flex-col items-center bg-cream/95 px-6 py-7 text-center shadow-[0_1px_0_rgb(24_21_18/0.06)] sm:px-8">
              <span className="flex size-12 items-center justify-center rounded-full bg-accent text-white">
                <MapPin className="size-6" aria-hidden="true" />
              </span>
              <p className="mt-4 font-serif text-xl leading-snug text-ink">
                <span className="block">{street}</span>
                <span className="block whitespace-nowrap">{locality}</span>
              </p>
              <button
                type="button"
                onClick={() => setLoaded(true)}
                className={buttonClasses("primary", "md", "mt-5 w-full")}
              >
                Załaduj mapę Google
              </button>
              <p className="mt-4 text-xs leading-relaxed text-ink-soft">
                Mapa Google wczyta się po kliknięciu i może zapisać pliki cookies.{" "}
                <Link href="/polityka-prywatnosci" className="underline underline-offset-2">
                  Polityka prywatności
                </Link>
                .
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/** Dekoracyjny „plan miasta” – tło w miejscu mapy, zanim użytkownik ją załaduje. */
function MapArt() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 800 560"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 size-full"
    >
      <rect width="800" height="560" fill="#e9e0d1" />
      <path d="M0 410 C 140 380 230 470 380 440 S 640 360 800 400 V560 H0Z" fill="#dfe0cc" />
      <rect x="560" y="70" width="170" height="120" fill="#dfe0cc" />
      <g fill="none" stroke="#fbf8f2" strokeLinecap="round">
        <path d="M-20 150 C 200 120 320 230 520 200 S 760 130 830 160" strokeWidth="16" />
        <path d="M120 -20 C 150 160 100 320 190 580" strokeWidth="14" />
        <path d="M430 -20 C 410 120 470 260 430 580" strokeWidth="18" />
        <path d="M-20 330 C 220 350 420 300 830 340" strokeWidth="12" />
        <path d="M620 -20 C 640 200 700 360 690 580" strokeWidth="10" />
        <path d="M250 250 L 340 590" strokeWidth="8" />
        <path d="M0 500 C 200 470 480 520 830 470" strokeWidth="9" />
      </g>
      <g fill="none" stroke="#d6c9b3" strokeWidth="2">
        <path d="M60 60 H 220 V 110 H 60 Z" />
        <path d="M520 260 H 640 V 320 H 520 Z" />
        <path d="M250 330 H 380 V 400 H 250 Z" />
      </g>
    </svg>
  );
}
