"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

import { ButtonLink } from "@/components/ui/Button";
import { Phone } from "@/components/ui/icons";
import { Lightbox } from "@/components/ui/Lightbox";
import { Photo } from "@/components/ui/Photo";
import { Section, SectionHeading, type SectionTone } from "@/components/ui/Section";
import { siteConfig } from "@/data/site";
import { cx } from "@/lib/cx";
import { formatDayMonth } from "@/lib/format";
import { offerGroups, type OfferGroup, type SpecialOffer, type SpecialOfferPhoto } from "@/lib/special-offers-live";
import { useSpecialOffers } from "@/lib/use-special-offers";

interface LiveSpecialOffersProps {
  /** Oferty pobrane już na serwerze (patrz `page.tsx`) – widoczne w HTML od razu, zanim przeglądarka doładuje bazę. */
  initialOffers?: SpecialOffer[];
}

/**
 * Oferty z panelu (/panel → „Oferty”) w dwóch działach pod menu: „Oferta specjalna” (tymczasowe, np. wigilijna) i
 * „Oferta” (dostępne cały czas). Dział bez ofert się nie pokazuje. Tła na zmianę „paper”/„sand”, więc działy się nie
 * zlewają, a kolor sekcji przed i po nich zostaje taki sam.
 */
export function LiveSpecialOffers({ initialOffers }: LiveSpecialOffersProps) {
  const offers = useSpecialOffers(initialOffers);
  const groups = offerGroups
    .map((group) => ({ ...group, offers: offers.filter((offer) => offer.kind === group.kind) }))
    .filter((group) => group.offers.length > 0);
  const anchors = [...groups.map((group) => group.anchor), ...offers.map((offer) => offer.anchor)].join(" ");

  // Oferta doładowana dopiero w przeglądarce: przeglądarka nie zdążyła przewinąć do „/#oferta”, robimy to sami.
  useEffect(() => {
    const hash = decodeURIComponent(window.location.hash.slice(1));
    if (hash && anchors.split(" ").includes(hash)) document.getElementById(hash)?.scrollIntoView();
  }, [anchors]);

  return (
    <>
      {groups.map((group, index) => (
        <OfferGroupSection
          key={group.kind}
          group={group}
          offers={group.offers}
          tone={index % 2 === 0 ? "paper" : "sand"}
        />
      ))}
    </>
  );
}

function OfferGroupSection({
  group,
  offers,
  tone,
}: {
  group: OfferGroup;
  offers: SpecialOffer[];
  tone: SectionTone;
}) {
  const headingId = `${group.anchor}-title`;

  return (
    <Section id={group.anchor} labelledBy={headingId} tone={tone}>
      <SectionHeading id={headingId} eyebrow={group.eyebrow} title={group.label} tone={tone} reveal={false} />

      {offers.length > 1 ? (
        <ul aria-label={`Przejdź do: ${group.label}`} className="mt-7 flex flex-wrap gap-2">
          {offers.map((offer) => (
            <li key={offer.id}>
              <a
                href={`#${offer.anchor}`}
                className="inline-flex min-h-11 items-center rounded-[3px] border border-ink/30 px-4 text-sm font-medium text-ink-soft transition-colors hover:border-ink hover:text-ink"
              >
                {offer.title}
              </a>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-12 divide-y divide-ink/15 lg:mt-14">
        {offers.map((offer) => (
          <OfferArticle key={offer.id} offer={offer} />
        ))}
      </div>
    </Section>
  );
}

/** Proporcje zdjęcia (szerokość / wysokość) – z nich układ wylicza wielkość zdjęć pionowych i poziomych. */
const ratioStyle = (photo: SpecialOfferPhoto) => ({ "--r": (photo.width / photo.height).toFixed(4) }) as CSSProperties;

/**
 * Jedna oferta. Jedno zdjęcie stoi obok tekstu (na komputerze), kilka – pod tekstem, w rzędach równej wysokości, więc
 * zdjęcia poziome same zajmują więcej miejsca niż pionowe. Nic nie jest przycinane, a kliknięcie powiększa zdjęcie.
 */
function OfferArticle({ offer }: { offer: SpecialOffer }) {
  const headingId = `offer-${offer.id}-title`;
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const paragraphs = offer.description.split(/\n\s*\n/).filter((text) => text.trim());
  const singlePhoto = offer.photos.length === 1 ? offer.photos[0] : null;

  const open = (index: number, trigger: HTMLButtonElement) => {
    triggerRef.current = trigger;
    setOpenIndex(index);
  };

  return (
    <article
      id={offer.anchor}
      aria-labelledby={headingId}
      className={cx(
        "py-12 first:pt-0 last:pb-0 lg:py-16",
        singlePhoto && "lg:grid lg:grid-cols-12 lg:items-center lg:gap-10 xl:gap-16",
      )}
    >
      <div className={singlePhoto ? "lg:col-span-5" : "max-w-3xl"}>
        {offer.until ? <p className="eyebrow mb-3">Do {formatDayMonth(offer.until)}</p> : null}
        <h3 id={headingId} className="text-[clamp(1.75rem,1.45rem+1.2vw,2.5rem)] leading-[1.1] tracking-[-0.018em]">
          {offer.title}
        </h3>
        {paragraphs.length > 0 ? (
          <div className="text-lead mt-5 max-w-[58ch] space-y-4 text-ink-soft">
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

      {singlePhoto ? (
        <div
          className="mx-auto mt-10 max-w-[calc(var(--r)*36rem)] lg:col-span-7 lg:mr-0 lg:mt-0 lg:w-full"
          style={ratioStyle(singlePhoto)}
        >
          <OfferPhotoTile photo={singlePhoto} onOpen={(trigger) => open(0, trigger)} />
        </div>
      ) : null}

      {offer.photos.length > 1 ? (
        <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-10">
          {offer.photos.map((photo, index) => (
            <li key={photo.id} className="offer-photo" style={ratioStyle(photo)}>
              <OfferPhotoTile photo={photo} onOpen={(trigger) => open(index, trigger)} />
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
    </article>
  );
}

function OfferPhotoTile({
  photo,
  onOpen,
}: {
  photo: SpecialOfferPhoto;
  onOpen: (trigger: HTMLButtonElement) => void;
}) {
  return (
    <>
      <button
        type="button"
        onClick={(event) => onOpen(event.currentTarget)}
        aria-label={`Powiększ zdjęcie: ${photo.alt}`}
        aria-haspopup="dialog"
        className="block w-full cursor-zoom-in"
      >
        <Photo src={photo.src} remote alt={photo.alt} sizes="(min-width: 1024px) 50vw, 100vw" ratio="aspect-[var(--r)]" />
      </button>
      {photo.caption ? <p className="mt-3 font-serif text-xl leading-snug text-ink">{photo.caption}</p> : null}
    </>
  );
}
