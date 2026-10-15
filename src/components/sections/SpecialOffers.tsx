"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

import { ButtonLink } from "@/components/ui/Button";
import { Phone } from "@/components/ui/icons";
import { Lightbox } from "@/components/ui/Lightbox";
import { Photo } from "@/components/ui/Photo";
import { Section, type SectionTone } from "@/components/ui/Section";
import { siteConfig } from "@/data/site";
import type { SpecialOffer } from "@/lib/special-offers-live";
import { useSpecialOffers } from "@/lib/use-special-offers";

interface LiveSpecialOffersProps {
  /** Oferty pobrane już na serwerze (patrz `page.tsx`) – widoczne w HTML od razu, zanim przeglądarka doładuje bazę. */
  initialOffers?: SpecialOffer[];
}

/**
 * Oferty specjalne (np. Komunia, Święta) – każda to osobna sekcja pod menu, ustawiana w panelu (/panel → „Oferty
 * specjalne”). Bez ofert nic się nie pokazuje. Tła na zmianę „paper”/„sand”, więc sąsiednie oferty się nie zlewają,
 * a kolor sekcji przed i po nich zostaje taki sam.
 */
export function LiveSpecialOffers({ initialOffers }: LiveSpecialOffersProps) {
  const offers = useSpecialOffers(initialOffers);
  const anchors = offers.map((offer) => offer.anchor).join(" ");

  // Oferta doładowana dopiero w przeglądarce: przeglądarka nie zdążyła przewinąć do „/#komunia”, robimy to sami.
  useEffect(() => {
    const hash = decodeURIComponent(window.location.hash.slice(1));
    if (hash && anchors.split(" ").includes(hash)) document.getElementById(hash)?.scrollIntoView();
  }, [anchors]);

  return (
    <>
      {offers.map((offer, index) => (
        <OfferSection key={offer.id} offer={offer} tone={index % 2 === 0 ? "paper" : "sand"} />
      ))}
    </>
  );
}

function OfferSection({ offer, tone }: { offer: SpecialOffer; tone: SectionTone }) {
  const headingId = `offer-${offer.id}-title`;
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const paragraphs = offer.description.split(/\n\s*\n/).filter((text) => text.trim());

  return (
    <Section id={offer.anchor} labelledBy={headingId} tone={tone}>
      <div className="max-w-3xl">
        <p className="eyebrow flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-8 bg-current" />
          {offer.eyebrow}
        </p>
        <h2 id={headingId} className="text-h2 mt-5 max-w-[20ch]">
          {offer.title}
        </h2>
        {paragraphs.length > 0 ? (
          <div className="text-lead mt-6 max-w-[58ch] space-y-4 text-ink-soft">
            {paragraphs.map((text, index) => (
              <p key={index} className="whitespace-pre-line">
                {text.trim()}
              </p>
            ))}
          </div>
        ) : null}
        <ButtonLink
          href={siteConfig.contact.phoneHref}
          icon={<Phone />}
          aria-label={`Zapytaj o ofertę „${offer.title}”: ${siteConfig.contact.phoneDisplay}`}
          className="mt-8"
        >
          Zapytaj o ofertę
        </ButtonLink>
      </div>

      {offer.photos.length > 0 ? (
        <ul className="mt-12 grid items-start gap-x-6 gap-y-10 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
          {offer.photos.map((photo, index) => (
            <li key={photo.id}>
              <button
                type="button"
                onClick={(event) => {
                  triggerRef.current = event.currentTarget;
                  setOpenIndex(index);
                }}
                aria-label={`Powiększ zdjęcie: ${photo.alt}`}
                aria-haspopup="dialog"
                className="block w-full cursor-zoom-in"
                style={{ "--photo-ratio": `${photo.width} / ${photo.height}` } as CSSProperties}
              >
                <Photo
                  src={photo.src}
                  remote
                  alt={photo.alt}
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                  ratio="aspect-[var(--photo-ratio)]"
                />
              </button>
              {photo.caption ? <p className="mt-3 font-serif text-xl leading-snug text-ink">{photo.caption}</p> : null}
            </li>
          ))}
        </ul>
      ) : null}

      <Lightbox
        images={offer.photos.map((photo) => ({ src: photo.src, alt: photo.alt, caption: photo.caption, remote: true }))}
        index={openIndex}
        onIndexChange={setOpenIndex}
        onClose={() => {
          setOpenIndex(null);
          triggerRef.current?.focus();
        }}
      />
    </Section>
  );
}
