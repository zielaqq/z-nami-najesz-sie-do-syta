"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { FacebookIcon, Play } from "@/components/ui/icons";
import type { VideoItem } from "@/data/videos";
import { withBase } from "@/lib/base-path";
import { cx } from "@/lib/cx";

interface VideoEmbedProps {
  video: VideoItem;
  /** true = wideo ładuje się z Facebooka dopiero po kliknięciu (domyślnie – patrz siteConfig.embeds) */
  loadOnClick: boolean;
}

/**
 * Adres oficjalnego odtwarzacza Facebooka (wtyczka „Video Player”, bez tokenów i aplikacji Meta).
 * Szerokość musi mieścić się w przedziale 220–750 px; Reel ma proporcje 9:16.
 */
function playerUrl(facebookUrl: string, width: number, autoplay: boolean) {
  const w = Math.min(750, Math.max(220, Math.round(width)));
  return `https://www.facebook.com/plugins/video.php?${new URLSearchParams({
    href: facebookUrl,
    show_text: "false",
    width: String(w),
    height: String(Math.round((w * 16) / 9)),
    ...(autoplay ? { autoplay: "true" } : {}),
  }).toString()}`;
}

/**
 * Nagranie z Facebooka w trybie „dwuklik”: przeglądarka nie łączy się z Facebookiem,
 * dopóki użytkownik nie kliknie kafelka (ochrona prywatności + szybsza strona).
 * Pod nagraniem zawsze jest zwykły link do wideo – na wypadek, gdyby osadzenie nie działało.
 */
export function VideoEmbed({ video, loadOnClick }: VideoEmbedProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [src, setSrc] = useState<string | null>(() =>
    loadOnClick ? null : playerUrl(video.facebookUrl, 300, false),
  );
  const [clicked, setClicked] = useState(false);
  const dark = Boolean(video.poster);

  // Po kliknięciu przycisk znika – przenosimy fokus na odtwarzacz, żeby nie „uciekł” na początek strony.
  useEffect(() => {
    if (clicked) frameRef.current?.focus();
  }, [clicked]);

  const play = () => {
    // Odtwarzacz dostaje dokładną szerokość kafelka, dzięki czemu nic się nie ucina.
    setSrc(playerUrl(video.facebookUrl, boxRef.current?.clientWidth ?? 300, true));
    setClicked(true);
  };

  return (
    <figure className="w-full">
      <div
        ref={boxRef}
        className={cx(
          "relative aspect-[9/16] w-full overflow-hidden",
          // z miniaturą (zdjęcie) – ciemny kafelek; bez niej – jasny, spójny z resztą strony
          dark ? "on-dark bg-ink" : "border border-ink/15 bg-paper",
        )}
      >
        {src ? (
          <iframe
            ref={frameRef}
            src={src}
            title={`Nagranie „${video.title}” – odtwarzacz Facebooka`}
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 size-full border-0"
          />
        ) : (
          <button
            type="button"
            onClick={play}
            aria-label={`Odtwórz nagranie: ${video.title}`}
            className={cx(
              "group absolute inset-0 flex flex-col items-center justify-center gap-5 px-6 text-center",
              dark ? "text-cream" : "text-ink",
            )}
          >
            {video.poster ? (
              <Image
                src={withBase(video.poster)}
                alt=""
                fill
                sizes="(min-width: 640px) 300px, 76vw"
                className="object-cover opacity-70 transition-opacity duration-200 group-hover:opacity-90 motion-reduce:transition-none"
              />
            ) : null}
            <span
              className={cx(
                "relative grid size-16 place-items-center rounded-full transition-transform duration-200 group-hover:scale-105 motion-reduce:transition-none",
                dark ? "bg-cream text-ink" : "bg-ink text-cream",
              )}
            >
              <Play className="ml-1 size-7 fill-current" aria-hidden="true" />
            </span>
            <span className="relative font-serif text-2xl leading-tight">{video.title}</span>
            <span
              className={cx(
                "relative inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em]",
                dark ? "text-on-dark-mute" : "text-mute",
              )}
            >
              <FacebookIcon className="size-4" />
              Nagranie z Facebooka
            </span>
          </button>
        )}
      </div>
      <figcaption className="mt-3 text-sm leading-relaxed text-ink-soft">
        {video.caption}{" "}
        <a
          href={video.facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="link-underline whitespace-nowrap font-medium text-ink"
        >
          Zobacz na Facebooku
          <span className="sr-only"> (otwiera się w nowej karcie)</span>
        </a>
      </figcaption>
    </figure>
  );
}
