"use client";

import Link from "next/link";
import { useState } from "react";

import { buttonClasses } from "@/components/ui/Button";
import { FacebookIcon } from "@/components/ui/icons";

interface FacebookEmbedProps {
  pageUrl: string;
  /** true = wtyczka Facebooka ładuje się dopiero po kliknięciu (domyślnie – patrz siteConfig.embeds) */
  loadOnClick: boolean;
}

/**
 * Oficjalna wtyczka Facebooka „Page Plugin” (oś czasu strony) w iframe.
 * NIE wymaga tokenów ani zatwierdzenia aplikacji – działa dla publicznych stron.
 * Pobieranie postów przez Graph API wymagałoby uprawnień „Page Public Content Access”
 * i przeglądu aplikacji przez Meta, więc świadomie nie udajemy takiej integracji.
 *
 * Domyślnie „dwuklik”: przeglądarka nie łączy się z Facebookiem, dopóki użytkownik
 * o to nie poprosi (ochrona prywatności + szybsza strona).
 */
export function FacebookEmbed({ pageUrl, loadOnClick }: FacebookEmbedProps) {
  const [loaded, setLoaded] = useState(!loadOnClick);

  const src = `https://www.facebook.com/plugins/page.php?${new URLSearchParams({
    href: pageUrl,
    tabs: "timeline",
    width: "500",
    height: "640",
    small_header: "true",
    adapt_container_width: "true",
    hide_cover: "false",
    show_facepile: "false",
    locale: "pl_PL",
  }).toString()}`;

  if (loaded) {
    return (
      <div className="mx-auto w-full max-w-[500px] lg:mx-0 lg:ml-auto" data-reveal>
        <iframe
          src={src}
          title="Najnowsze posty restauracji na Facebooku"
          width="500"
          height="640"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          className="block h-[640px] w-full border-0 bg-white"
        />
        <p className="mt-3 text-sm text-mute">
          Nie widzisz postów?{" "}
          <a
            href={pageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="link-underline font-medium text-ink"
          >
            Otwórz nasz profil na Facebooku
            <span className="sr-only"> (otwiera się w nowej karcie)</span>
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div
      className="mx-auto w-full max-w-[500px] border border-ink/15 bg-white p-6 sm:p-8 lg:mx-0 lg:ml-auto"
      data-reveal
    >
      <div className="flex items-center gap-3">
        <FacebookIcon className="size-9 text-ink" />
        <p className="font-serif text-xl text-ink">Nasz profil na Facebooku</p>
      </div>
      <p className="mt-4 text-ink-soft">
        Najnowsze posty wczytamy dopiero po Twoim kliknięciu – nie łączymy się z Facebookiem bez Twojej wiedzy.
      </p>
      <button type="button" onClick={() => setLoaded(true)} className={buttonClasses("secondary", "md", "mt-6 w-full sm:w-auto")}>
        Załaduj posty z Facebooka
      </button>
      <p className="mt-4 text-xs leading-relaxed text-mute">
        Po załadowaniu Facebook (Meta Platforms) może zapisywać na Twoim urządzeniu pliki cookies.{" "}
        <Link href="/polityka-prywatnosci" className="link-underline text-ink">
          Polityka prywatności
        </Link>
        .
      </p>
    </div>
  );
}
