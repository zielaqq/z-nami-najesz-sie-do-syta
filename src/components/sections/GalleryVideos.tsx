import Link from "next/link";

import { VideoEmbed } from "@/components/sections/VideoEmbed";
import { siteConfig } from "@/data/site";
import { getVideos } from "@/lib/content";

/** Nagrania z Facebooka pod zdjęciami w galerii. Brak nagrań w `src/data/videos.ts` = brak całego bloku. */
export async function GalleryVideos() {
  const videos = await getVideos();
  if (videos.length === 0) return null;

  const { loadOnClick } = siteConfig.embeds;

  return (
    <div className="mt-20 grid gap-10 lg:mt-28 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-4" data-reveal>
        <h3 className="text-h3">Nagrania z lokalu</h3>
        <p className="mt-4 max-w-[38ch] text-ink-soft">
          Krótkie filmy z naszej restauracji.
          {loadOnClick ? " Nagranie wczytamy z Facebooka dopiero po Twoim kliknięciu." : ""}
        </p>
        <p className="mt-4 max-w-[46ch] text-xs leading-relaxed text-mute">
          Facebook (Meta Platforms) może zapisywać na Twoim urządzeniu pliki cookies.{" "}
          <Link href="/polityka-prywatnosci" className="link-underline text-ink">
            Polityka prywatności
          </Link>
          .
        </p>
      </div>

      {/* Telefon: przewijany rząd z „zajawką” drugiego nagrania; od `sm`: dwie kolumny. */}
      <ul
        data-reveal
        className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-3 pt-1.5 scroll-px-5 sm:mx-0 sm:grid sm:max-w-[640px] sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 sm:py-0 lg:col-span-8"
      >
        {videos.map((video) => (
          <li key={video.id} className="w-[76%] max-w-[300px] shrink-0 snap-start sm:w-auto sm:max-w-none">
            <VideoEmbed video={video} loadOnClick={loadOnClick} />
          </li>
        ))}
      </ul>
    </div>
  );
}
