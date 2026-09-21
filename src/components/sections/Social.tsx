import Link from "next/link";

import { VideoEmbed } from "@/components/sections/VideoEmbed";
import { ButtonLink } from "@/components/ui/Button";
import { FacebookIcon } from "@/components/ui/icons";
import { Section, SectionHeading, type SectionTone } from "@/components/ui/Section";
import { siteConfig } from "@/data/site";
import { getVideos } from "@/lib/content";

/**
 * „Obserwuj nas”: przycisk do profilu na Facebooku + same nagrania (odtwarzacz, bez treści postów).
 * Nagrania dodajesz w `src/data/videos.ts` (albo w panelu menu). Brak nagrań = tylko przycisk.
 */
export async function Social({ tone = "paper" }: { tone?: SectionTone }) {
  const { facebook, facebookReels } = siteConfig.links;
  const { facebookLoadOnClick } = siteConfig.embeds;
  const videos = await getVideos();
  const hasVideos = videos.length > 0;

  return (
    <Section id="social" labelledBy="social-title" tone={tone}>
      <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <div className={hasVideos ? "lg:col-span-5" : "lg:col-span-12"}>
          <SectionHeading
            id="social-title"
            eyebrow="Social media"
            title="Obserwuj nas"
            lead="Zobacz, co aktualnie dzieje się w restauracji."
            titleWidth="max-w-[12ch]"
          />
          <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-5" data-reveal>
            <ButtonLink href={facebook} external icon={<FacebookIcon />} size="lg">
              Odwiedź nas na Facebooku
            </ButtonLink>
            {hasVideos ? (
              <a
                href={facebookReels}
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline font-medium text-ink"
              >
                Wszystkie nagrania
                <span className="sr-only"> (otwiera się w nowej karcie)</span>
              </a>
            ) : null}
          </div>
          {hasVideos ? (
            <p className="mt-8 max-w-[46ch] text-xs leading-relaxed text-mute" data-reveal>
              Nagrania wyświetla odtwarzacz Facebooka (Meta Platforms), który może zapisywać na Twoim urządzeniu pliki
              cookies.
              {facebookLoadOnClick ? " Nagranie wczytamy dopiero po Twoim kliknięciu." : ""}{" "}
              <Link href="/polityka-prywatnosci" className="link-underline text-ink">
                Polityka prywatności
              </Link>
              .
            </p>
          ) : null}
        </div>

        {hasVideos ? (
          /* Telefon: przewijany rząd z „zajawką” kolejnego nagrania; od `sm`: dwie kolumny. */
          <ul
            data-reveal
            className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-3 pt-1.5 scroll-px-5 sm:mx-0 sm:grid sm:max-w-[640px] sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 sm:py-0 lg:col-span-7 lg:ml-auto lg:w-full"
          >
            {videos.map((video) => (
              <li key={video.id} className="w-[76%] max-w-[300px] shrink-0 snap-start sm:w-auto sm:max-w-none">
                <VideoEmbed video={video} loadOnClick={facebookLoadOnClick} />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </Section>
  );
}
